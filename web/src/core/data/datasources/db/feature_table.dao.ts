import type {
    FeatureDbLookupKey,
    FeatureDbRecordConstraint,
    FeatureDbScalar,
    FeatureDbTableDefinition
} from '@core/data/datasources/db/feature_db.types';

const cloneRows = <TRecord extends FeatureDbRecordConstraint<TRecord>>(rows: TRecord[]): TRecord[] =>
    JSON.parse(JSON.stringify(rows)) as TRecord[];

export class FeatureTableDao<TRecord extends FeatureDbRecordConstraint<TRecord>> {
    private memoryRows: TRecord[] | null = null;
    private seedCache: TRecord[] | null = null;

    constructor(private readonly tableDefinition: FeatureDbTableDefinition<TRecord>) {}

    getTable(): FeatureDbTableDefinition<TRecord> {
        return this.tableDefinition;
    }

    async getAll(): Promise<TRecord[]> {
        if (this.memoryRows !== null) {
            return cloneRows(this.memoryRows);
        }

        const persistedRows = this.readPersistedRows();
        if (persistedRows !== null) {
            this.memoryRows = cloneRows(persistedRows);
            return persistedRows;
        }

        this.memoryRows = [];
        return [];
    }

    async getByPrimaryKey(primaryKey: FeatureDbLookupKey<TRecord>): Promise<TRecord | null> {
        const rows = await this.getAll();
        const lookupKey = this.normalizeLookupKey(primaryKey);
        return rows.find((row) => this.buildRecordKey(row) === lookupKey) ?? null;
    }

    async replaceAll(rows: TRecord[]): Promise<TRecord[]> {
        this.persistRows(rows);
        return cloneRows(rows);
    }

    async upsert(row: TRecord): Promise<TRecord> {
        const rows = await this.getAll();
        const recordKey = this.buildRecordKey(row);
        const nextRows = rows.filter((item) => this.buildRecordKey(item) !== recordKey);
        nextRows.push(row);
        this.persistRows(nextRows);
        return cloneRows([row])[0];
    }

    async remove(primaryKey: FeatureDbLookupKey<TRecord>): Promise<boolean> {
        const rows = await this.getAll();
        const lookupKey = this.normalizeLookupKey(primaryKey);
        const nextRows = rows.filter((row) => this.buildRecordKey(row) !== lookupKey);

        if (nextRows.length === rows.length) {
            return false;
        }

        this.persistRows(nextRows);
        return true;
    }

    async reset(): Promise<TRecord[]> {
        return this.seed();
    }

    async seed(): Promise<TRecord[]> {
        const seedRows = await this.loadSeedRecords(true);
        this.persistRows(seedRows);
        return cloneRows(seedRows);
    }

    async seedIfEmpty(): Promise<boolean> {
        const rows = await this.getAll();
        if (rows.length > 0) {
            return false;
        }

        await this.seed();
        return true;
    }

    protected async loadSeedRecords(forceReload = false): Promise<TRecord[]> {
        if (!forceReload && this.seedCache) {
            return cloneRows(this.seedCache);
        }

        const seedPath = this.tableDefinition.seedPath;
        if (!seedPath || typeof fetch === 'undefined') {
            this.seedCache = [];
            return [];
        }

        const response = await fetch(seedPath);
        if (!response.ok) {
            throw new Error(`Failed to load seed data for ${this.tableDefinition.tableName} from ${seedPath}`);
        }

        const rows = (await response.json()) as TRecord[];
        this.seedCache = cloneRows(rows);
        return cloneRows(rows);
    }

    private storageKey(): string {
        return `pawnshop.localdb.${this.tableDefinition.tableName}`;
    }

    private canUseLocalStorage(): boolean {
        return typeof localStorage !== 'undefined';
    }

    private readPersistedRows(): TRecord[] | null {
        if (!this.canUseLocalStorage()) {
            return null;
        }

        const rawValue = localStorage.getItem(this.storageKey());
        if (!rawValue) {
            return null;
        }

        try {
            return JSON.parse(rawValue) as TRecord[];
        } catch (error) {
            console.warn(`[FeatureTableDao] Failed to parse persisted rows for ${this.tableDefinition.tableName}.`, error);
            return null;
        }
    }

    private persistRows(rows: TRecord[]): void {
        const nextRows = cloneRows(rows);
        this.memoryRows = nextRows;

        if (!this.canUseLocalStorage()) {
            return;
        }

        localStorage.setItem(this.storageKey(), JSON.stringify(nextRows));
    }

    private buildRecordKey(row: TRecord): string {
        const primaryKey = this.tableDefinition.primaryKey;
        if (Array.isArray(primaryKey)) {
            return primaryKey
                .map((column) => this.stringifyKeyValue(row[column] as FeatureDbScalar))
                .join('::');
        }

        return this.stringifyKeyValue(row[primaryKey] as FeatureDbScalar);
    }

    private normalizeLookupKey(primaryKey: FeatureDbLookupKey<TRecord>): string {
        const tablePrimaryKey = this.tableDefinition.primaryKey;

        if (Array.isArray(tablePrimaryKey)) {
            if (Array.isArray(primaryKey)) {
                return primaryKey.map((value) => this.stringifyKeyValue(value)).join('::');
            }

            if (typeof primaryKey === 'object' && primaryKey !== null) {
                return tablePrimaryKey
                    .map((column) => this.stringifyKeyValue(primaryKey[column] as FeatureDbScalar))
                    .join('::');
            }
        }

        if (typeof primaryKey === 'object' && primaryKey !== null && !Array.isArray(primaryKey)) {
            return this.stringifyKeyValue(primaryKey[tablePrimaryKey as string] as FeatureDbScalar);
        }

        return this.stringifyKeyValue(primaryKey as FeatureDbScalar);
    }

    private stringifyKeyValue(value: FeatureDbScalar): string {
        return String(value ?? '');
    }
}
