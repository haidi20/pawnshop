// vitest.global.ts

export async function teardown() {
    console.log('[global.teardown] Tearing down...');
    try {
        const dbPromise = globalThis.__pawnshopRxDatabase__;
        if (!dbPromise) {
            console.log('[global.teardown] No database instance to close.');
            return;
        }

        const db = await dbPromise.catch(() => null);
        if (db) {
            await db.close();
            console.log('[global.teardown] Database connection closed successfully.');
        }
    } catch (e) {
        console.error('[global.teardown] Error closing database:', e);
    }
    console.log('[global.teardown] Teardown complete.');
}
