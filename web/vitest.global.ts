// vitest.global.ts
import { db } from './src/core/data/datasources/db/core.db';

export async function teardown() {
    console.log('[global.teardown] Tearing down...');
    try {
        await db.close();
        console.log('[global.teardown] Database connection closed successfully.');
    } catch (e) {
        console.error('[global.teardown] Error closing database:', e);
    }
    console.log('[global.teardown] Teardown complete.');
}
