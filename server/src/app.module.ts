import { Module } from '@nestjs/common';
import { HealthModule } from './api/v1/health/health.module';
import { DrizzleModule } from './db/drizzle.module';

@Module({
    imports: [HealthModule, DrizzleModule],
})
export class AppModule { }
