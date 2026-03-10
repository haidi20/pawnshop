import type {
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxCollection,
    RxDatabase,
    RxJsonSchema,
    RxStorage
} from 'rxdb';
import { createRxDatabase } from 'rxdb/plugins/core';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';

const itemSchemaLiteral = {
    title: 'pawnshop item schema',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        nama_barang: {
            type: 'string'
        },
        harga_gadai: {
            type: 'number'
        }
    },
    required: ['id', 'nama_barang'],
    additionalProperties: false
} as const;

type ItemDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof itemSchemaLiteral>;
const itemSchema: RxJsonSchema<ItemDocType> = itemSchemaLiteral;

type PawnshopCollections = {
    items: RxCollection<ItemDocType>;
};

type PawnshopDatabase = RxDatabase<PawnshopCollections>;

declare global {
    var __pawnshopRxDatabase__: Promise<PawnshopDatabase> | undefined;
}

const isIndexedDbAvailable = (): boolean =>
    typeof indexedDB !== 'undefined' && typeof IDBKeyRange !== 'undefined';

const isLocalStorageAvailable = (): boolean =>
    typeof localStorage !== 'undefined';

const resolveStorage = (): RxStorage<any, any> => {
    if (isIndexedDbAvailable()) {
        return getRxStorageDexie();
    }

    if (isLocalStorageAvailable()) {
        return getRxStorageLocalstorage();
    }

    throw new Error(
        'No supported local database storage found. Use a browser/desktop webview runtime or inject a dedicated RxStorage.'
    );
};

const createDatabase = async (): Promise<PawnshopDatabase> => {
    const db = await createRxDatabase<PawnshopCollections>({
        name: 'pegadaiandb',
        storage: resolveStorage(),
        multiInstance: true,
        eventReduce: true,
        closeDuplicates: true
    });

    await db.addCollections({
        items: {
            schema: itemSchema
        }
    });

    return db;
};

export const initDB = async (): Promise<PawnshopDatabase> => {
    globalThis.__pawnshopRxDatabase__ ??= createDatabase();
    return globalThis.__pawnshopRxDatabase__;
};

export type { ItemDocType, PawnshopCollections, PawnshopDatabase };
export { itemSchema };
