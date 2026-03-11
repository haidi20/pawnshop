import type {
    FeatureDbLookupKey,
    FeatureDbRecordConstraint,
    FeatureDbScalar,
    FeatureDbScalarColumnName,
    FeatureDbTableDefinition
} from '@core/data/datasources/db/feature_db.types';
import {
    getCurrentAuthPortalCompanyId,
    getFeatureStorageScope
} from '@feature/auth_portal/util/auth_portal_session';

const cloneRows = <TRecord extends FeatureDbRecordConstraint<TRecord>>(rows: TRecord[]): TRecord[] =>
    JSON.parse(JSON.stringify(rows)) as TRecord[];

export class FeatureTableDao<TRecord extends FeatureDbRecordConstraint<TRecord>> {
    private memoryRows: TRecord[] | null = null;
    private memoryStorageKey: string | null = null;
    private seedCache: TRecord[] | null = null;

    constructor(private readonly tableDefinition: FeatureDbTableDefinition<TRecord>) {}

    getTable(): FeatureDbTableDefinition<TRecord> {
        return this.tableDefinition;
    }

    async getAll(): Promise<TRecord[]> {
        const currentStorageKey = this.storageKey();

        if (this.memoryStorageKey !== currentStorageKey) {
            this.memoryRows = null;
            this.memoryStorageKey = currentStorageKey;
        }

        if (this.memoryRows !== null) {
            return cloneRows(this.memoryRows);
        }

        const persistedRows = this.readPersistedRows(currentStorageKey);
        if (persistedRows !== null) {
            const normalizedPersistedRows = this.normalizeCompanyScopedRows(cloneRows(persistedRows));
            this.memoryRows = cloneRows(normalizedPersistedRows);

            if (this.canUseLocalStorage() && JSON.stringify(normalizedPersistedRows) !== JSON.stringify(persistedRows)) {
                localStorage.setItem(currentStorageKey, JSON.stringify(normalizedPersistedRows));
            }

            return normalizedPersistedRows;
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
        return `pawnshop.localdb.${getFeatureStorageScope(this.tableDefinition.featureKey)}.${this.tableDefinition.tableName}`;
    }

    private canUseLocalStorage(): boolean {
        return typeof localStorage !== 'undefined';
    }

    private readPersistedRows(storageKey: string): TRecord[] | null {
        if (!this.canUseLocalStorage()) {
            return null;
        }

        const rawValue = localStorage.getItem(storageKey);
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
        const storageKey = this.storageKey();
        const nextRows = this.normalizeCompanyScopedRows(cloneRows(rows));
        this.memoryRows = nextRows;
        this.memoryStorageKey = storageKey;

        if (!this.canUseLocalStorage()) {
            return;
        }

        localStorage.setItem(storageKey, JSON.stringify(nextRows));
    }

    private normalizeCompanyScopedRows(rows: TRecord[]): TRecord[] {
        const hasCompanyIdColumn = this.tableDefinition.columns.some((column) => column.name === 'company_id');
        if (!hasCompanyIdColumn) {
            return rows;
        }

        const currentCompanyId = getCurrentAuthPortalCompanyId();

        return rows.map((row) => {
            const rowWithCompanyId = row as TRecord & { company_id?: number | null };
            if (rowWithCompanyId.company_id !== undefined && rowWithCompanyId.company_id !== null) {
                return row;
            }

            if (this.tableDefinition.tableName === 'auth_portal_companies') {
                const rowWithId = row as TRecord & { id?: number };
                if (typeof rowWithId.id === 'number') {
                    return {
                        ...row,
                        company_id: rowWithId.id
                    } as TRecord;
                }
            }

            if (currentCompanyId === null) {
                return row;
            }

            return {
                ...row,
                company_id: currentCompanyId
            } as TRecord;
        });
    }

    private buildRecordKey(row: TRecord): string {
        const primaryKey = this.tableDefinition.primaryKey;
        if (this.isCompositePrimaryKey(primaryKey)) {
            return primaryKey
                .map((column) => this.stringifyKeyValue(this.readRecordValue(row, column)))
                .join('::');
        }

        return this.stringifyKeyValue(this.readRecordValue(row, primaryKey));
    }

    private normalizeLookupKey(primaryKey: FeatureDbLookupKey<TRecord>): string {
        const tablePrimaryKey = this.tableDefinition.primaryKey;

        if (this.isCompositePrimaryKey(tablePrimaryKey)) {
            if (Array.isArray(primaryKey)) {
                return primaryKey.map((value) => this.stringifyKeyValue(value)).join('::');
            }

            if (this.isLookupKeyObject(primaryKey)) {
                return tablePrimaryKey
                    .map((column) => this.stringifyKeyValue(this.readLookupObjectValue(primaryKey, column)))
                    .join('::');
            }
        }

        if (this.isLookupKeyObject(primaryKey)) {
            return this.stringifyKeyValue(this.readLookupObjectValue(primaryKey, tablePrimaryKey));
        }

        return this.stringifyKeyValue(primaryKey as FeatureDbScalar);
    }

    private isCompositePrimaryKey(
        primaryKey: FeatureDbTableDefinition<TRecord>['primaryKey']
    ): primaryKey is readonly FeatureDbScalarColumnName<TRecord>[] {
        return Array.isArray(primaryKey);
    }

    private isLookupKeyObject(
        primaryKey: FeatureDbLookupKey<TRecord>
    ): primaryKey is Partial<Pick<TRecord, FeatureDbScalarColumnName<TRecord>>> {
        return typeof primaryKey === 'object' && primaryKey !== null && !Array.isArray(primaryKey);
    }

    private readRecordValue(row: TRecord, column: FeatureDbScalarColumnName<TRecord>): FeatureDbScalar {
        const scalarRecord = row as Record<FeatureDbScalarColumnName<TRecord>, FeatureDbScalar>;
        return scalarRecord[column] ?? null;
    }

    private readLookupObjectValue(
        primaryKey: Partial<Pick<TRecord, FeatureDbScalarColumnName<TRecord>>>,
        column: FeatureDbScalarColumnName<TRecord>
    ): FeatureDbScalar {
        return (primaryKey[column] ?? null) as FeatureDbScalar;
    }

    private stringifyKeyValue(value: FeatureDbScalar): string {
        return String(value ?? '');
    }
}
