import { Module } from '@nestjs/common';
import { HealthModule } from './api/v1/health/health.module';
import { DrizzleModule } from './db/drizzle.module';
import { UsersModule } from './api/v1/users/users.module';
import { AuthModule } from './api/v1/auth/auth.module';

@Module({
    imports: [HealthModule, DrizzleModule, UsersModule, AuthModule],
})
export class AppModule { }
