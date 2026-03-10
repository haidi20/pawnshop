// src/types/rxdb.d.ts
// Define IDBDatabaseInfo used by the IndexedDB storage options
interface IDBDatabaseInfo {
    name?: string;
    version?: number;
}

declare module 'rxdb/plugins/storage-indexeddb' {
    import type { RxStorage } from 'rxdb';
    export function getRxStorageIndexedDB(options?: {
        databaseSettings?: IDBDatabaseInfo;
    }): RxStorage<any, any>;
}
