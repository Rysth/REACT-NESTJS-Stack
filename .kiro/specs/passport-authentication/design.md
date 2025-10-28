# Design Document

## Overview

The Passport authentication system will be implemented as a modular NestJS solution using the `@nestjs/passport` package. The design follows the standard Passport.js pattern with local strategy for login and JWT strategy for API protection. The system will integrate with the existing NestJS application structure and provide secure, stateless authentication.

## Architecture

The authentication system consists of four main modules:

1. **AuthModule**: Central authentication module that orchestrates all auth-related functionality
2. **UsersModule**: User data management and retrieval services
3. **Passport Strategies**: Local and JWT strategy implementations
4. **Guards**: Route protection mechanisms using Passport strategies

### Module Dependencies

```
AuthModule
├── UsersModule (imported)
├── PassportModule (imported)
├── JwtModule (imported)
├── AuthService (provider)
├── LocalStrategy (provider)
└── JwtStrategy (provider)

UsersModule
└── UsersService (exported)
```

## Components and Interfaces

### Core Services

#### AuthService

- **Purpose**: Handles authentication logic and JWT operations
- **Key Methods**:
  - `validateUser(username: string, password: string)`: Validates user credentials
  - `login(user: any)`: Generates JWT token for authenticated user
- **Dependencies**: UsersService, JwtService

#### UsersService

- **Purpose**: Manages user data and provides user lookup functionality
- **Key Methods**:
  - `findOne(username: string)`: Retrieves user by username
- **Data**: In-memory user store (for development/demo purposes)

### Passport Strategies

#### LocalStrategy

- **Purpose**: Implements username/password authentication
- **Configuration**: Uses default username/password field names
- **Validation**: Delegates to AuthService.validateUser()
- **Output**: Returns user object on successful authentication

#### JwtStrategy

- **Purpose**: Validates JWT tokens for protected routes
- **Configuration**:
  - Extract JWT from Authorization Bearer header
  - Use symmetric secret for token verification
  - Reject expired tokens
- **Validation**: Returns user payload from valid JWT

### Guards

#### LocalAuthGuard

- **Purpose**: Protects login route and triggers local strategy
- **Usage**: Applied to `/auth/login` POST endpoint
- **Behavior**: Invokes passport-local strategy validation

#### JwtAuthGuard

- **Purpose**: Protects API routes requiring authentication
- **Usage**: Applied to protected endpoints
- **Behavior**: Validates JWT tokens and populates req.user

## Data Models

### User Interface

```typescript
interface User {
  userId: number;
  username: string;
  password: string; // Note: In production, this should be hashed
}
```

### JWT Payload

```typescript
interface JwtPayload {
  username: string;
  sub: number; // userId
  iat?: number; // issued at
  exp?: number; // expiration
}
```

### Authentication Response

```typescript
interface AuthResponse {
  access_token: string;
}
```

## Error Handling

### Authentication Errors

- **Invalid Credentials**: Return 401 Unauthorized with generic error message
- **Missing Token**: Return 401 Unauthorized when JWT is not provided
- **Invalid Token**: Return 401 Unauthorized for malformed or expired JWTs
- **Strategy Errors**: Let Passport handle strategy-specific error responses

### Error Response Format

```typescript
{
  statusCode: 401,
  message: "Unauthorized"
}
```

## Security Considerations

### JWT Configuration

- **Secret Management**: Use environment variables for JWT secrets (not hardcoded)
- **Token Expiration**: Set reasonable expiration times (e.g., 1 hour for access tokens)
- **Algorithm**: Use HS256 for symmetric key signing

### Password Security

- **Note**: Current implementation uses plain text passwords for demo purposes
- **Production Recommendation**: Implement bcrypt hashing for password storage
- **Validation**: Ensure password complexity requirements in production

### Route Protection

- **Default Behavior**: Routes are unprotected by default
- **Explicit Protection**: Use guards to protect specific routes
- **Public Routes**: Clearly identify and document public endpoints

## API Endpoints

### Authentication Endpoints

#### POST /auth/login

- **Purpose**: Authenticate user and return JWT
- **Guard**: LocalAuthGuard
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "jwt_token_string"
  }
  ```

#### GET /profile

- **Purpose**: Demo protected route returning user info
- **Guard**: JwtAuthGuard
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**:
  ```json
  {
    "userId": 1,
    "username": "john"
  }
  ```

## Testing Strategy

### Unit Testing

- **AuthService**: Test credential validation and JWT generation
- **UsersService**: Test user lookup functionality
- **Strategies**: Test validation logic for both local and JWT strategies

### Integration Testing

- **Login Flow**: Test complete authentication flow from credentials to JWT
- **Protected Routes**: Test route protection with valid and invalid tokens
- **Error Scenarios**: Test various authentication failure cases

### Manual Testing

- **cURL Commands**: Provide example cURL commands for testing endpoints
- **Token Validation**: Test token expiration and refresh scenarios
- **Security Testing**: Verify protection against common authentication attacks

## Configuration

### Environment Variables

```
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=3600s
NODE_ENV=development
```

### Module Configuration

- **JWT Module**: Configure secret and expiration options
- **Passport Module**: Register with default session settings
- **Strategy Registration**: Ensure all strategies are properly registered as providers

## Migration Considerations

### From Current State

- **Existing Routes**: Current health endpoint remains unaffected
- **Database Integration**: Future integration with actual user database
- **Password Hashing**: Migration from plain text to hashed passwords

### Future Enhancements

- **Refresh Tokens**: Implement refresh token mechanism
- **Role-Based Access**: Add role-based authorization
- **OAuth Integration**: Support for third-party authentication providers
- **Session Management**: Optional session-based authentication for web clients
