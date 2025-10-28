# Implementation Plan

- [x] 1. Install required dependencies and setup project structure

  - [x] 1.1 Organize folder structure with API versioning

    - Create server/src/api/v1/ directory for versioned API modules
    - Move existing health module to server/src/api/v1/health/
    - Update health module imports and references
    - Create server/src/common/ directory for shared utilities, guards, and decorators
    - Create server/src/config/ directory for configuration files
    - _Requirements: 3.1, 3.4_

  - [x] 1.2 Install authentication dependencies

    - Install Passport packages in server container: @nestjs/passport, passport, passport-local, @types/passport-local
    - Install JWT packages in server container: @nestjs/jwt, passport-jwt, @types/passport-jwt
    - Note: Use `docker-compose exec server npm install` or modify server/package.json and rebuild container
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 1.3 Setup global API versioning
    - Configure global prefix 'api/v1' in main.ts bootstrap function
    - Update existing health endpoint to be accessible at /api/v1/health
    - Ensure all new endpoints follow versioned structure
    - _Requirements: 3.1, 3.4_

- [x] 2. Create Users module and service

  - [x] 2.1 Generate Users module and service using NestJS CLI

    - Run `docker-compose exec server npx nest g module api/v1/users` to create UsersModule
    - Run `docker-compose exec server npx nest g service api/v1/users` to create UsersService
    - Create UsersModule with proper exports configuration in server/src/api/v1/users/
    - Implement UsersService with in-memory user store
    - Define User interface and export from module
    - _Requirements: 1.3, 3.4_

  - [x] 2.2 Implement user lookup functionality
    - Create findOne method to retrieve users by username
    - Add sample user data for testing (john/changeme, maria/guess)
    - _Requirements: 1.3_

- [x] 3. Create Auth module and core authentication service

  - [x] 3.1 Generate Auth module and service using NestJS CLI

    - Run `docker-compose exec server npx nest g module api/v1/auth` to create AuthModule
    - Run `docker-compose exec server npx nest g service api/v1/auth` to create AuthService
    - Create AuthModule with proper imports and providers in server/src/api/v1/auth/
    - Import UsersModule to access user services
    - _Requirements: 1.1, 3.1, 3.4_

  - [x] 3.2 Implement AuthService with user validation

    - Create validateUser method for credential verification
    - Implement password comparison logic (plain text for demo)
    - Return user object without password on successful validation
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 3.3 Add JWT functionality to AuthService
    - Implement login method to generate JWT tokens
    - Configure JWT payload with username and userId (sub)
    - Create constants file in server/src/config/auth.constants.ts for JWT secret management
    - _Requirements: 1.1, 1.4, 1.5_

- [x] 4. Implement Passport Local Strategy

  - [x] 4.1 Create LocalStrategy class

    - Create LocalStrategy in server/src/api/v1/auth/strategies/local.strategy.ts
    - Extend PassportStrategy with passport-local Strategy
    - Implement validate method using AuthService
    - Handle authentication failures with UnauthorizedException
    - _Requirements: 1.1, 1.2_

  - [x] 4.2 Create LocalAuthGuard

    - Create LocalAuthGuard in server/src/common/guards/local-auth.guard.ts
    - Extend AuthGuard with 'local' strategy name
    - Provide clean guard class without magic strings
    - _Requirements: 1.1, 3.3_

  - [x] 4.3 Configure AuthModule with Local Strategy
    - Add LocalStrategy as provider in AuthModule
    - Import PassportModule for strategy support
    - _Requirements: 3.1, 3.2_

- [ ] 5. Implement JWT Strategy and Guards

  - [ ] 5.1 Create JwtStrategy class

    - Create JwtStrategy in server/src/api/v1/auth/strategies/jwt.strategy.ts
    - Extend PassportStrategy with passport-jwt Strategy
    - Configure JWT extraction from Authorization Bearer header
    - Implement validate method to return user payload
    - _Requirements: 2.1, 2.3, 2.4_

  - [ ] 5.2 Create JwtAuthGuard

    - Create JwtAuthGuard in server/src/common/guards/jwt-auth.guard.ts
    - Extend AuthGuard with 'jwt' strategy name
    - Provide reusable guard for protected routes
    - _Requirements: 2.1, 2.2, 3.3_

  - [ ] 5.3 Configure AuthModule with JWT Strategy
    - Add JwtStrategy as provider in AuthModule
    - Configure JwtModule with secret and expiration options
    - Export AuthService for use in controllers
    - _Requirements: 2.4, 3.1, 3.2_

- [ ] 6. Create authentication endpoints

  - [ ] 6.1 Create AuthController for authentication endpoints

    - Run `docker-compose exec server npx nest g controller api/v1/auth` to create AuthController
    - Create POST /auth/login route with LocalAuthGuard in server/src/api/v1/auth/auth.controller.ts
    - Inject AuthService and call login method
    - Return JWT token in response
    - _Requirements: 1.1, 1.4_

  - [ ] 6.2 Create protected profile endpoint
    - Add GET /auth/profile route with JwtAuthGuard to AuthController
    - Return user information from req.user
    - Demonstrate JWT authentication working
    - Final endpoints: POST /api/v1/auth/login and GET /api/v1/auth/profile
    - _Requirements: 2.1, 2.3_

- [ ] 7. Integration and testing setup

  - [ ] 7.1 Update AppModule with authentication modules

    - Import AuthModule in main AppModule
    - Ensure proper module dependency resolution
    - _Requirements: 3.1, 3.4_

  - [ ] 7.2 Create manual testing documentation

    - Document cURL commands for testing login endpoint against server container (localhost:3000)
    - Provide examples for testing protected routes with JWT against server container
    - Include error scenario testing examples
    - Test versioned endpoints: POST localhost:3000/api/v1/auth/login and GET localhost:3000/api/v1/auth/profile
    - Verify health endpoint still works at localhost:3000/api/v1/health
    - _Requirements: 1.1, 1.2, 2.1, 2.2_

  - [ ] 7.3 Add basic unit tests for core services
    - Write tests for AuthService validateUser and login methods in server/src/api/v1/auth/
    - Create tests for UsersService findOne method in server/src/api/v1/users/
    - Test strategy validation logic
    - Run tests using `docker-compose exec server npm run test`
    - _Requirements: 1.1, 1.3, 2.3_
