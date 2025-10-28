import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
    private pool: Pool;
    public db = drizzle({} as any); // initialized in constructor

    constructor() {
        const connectionString = process.env.DATABASE_URL as string;
        this.pool = new Pool({ connectionString });
        this.db = drizzle(this.pool);
    }

    async onModuleDestroy() {
        await this.pool.end();
    }
}
