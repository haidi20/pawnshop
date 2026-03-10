export type FeatureDbScalar = string | number | boolean | null;

export type FeatureDbValue =
    | FeatureDbScalar
    | { [key: string]: FeatureDbValue }
    | FeatureDbValue[];

export type FeatureDbRecord = Record<string, FeatureDbValue>;

export type FeatureDbColumnType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'json';

export type FeatureDbLookupKey<TRecord extends FeatureDbRecord = FeatureDbRecord> =
    | FeatureDbScalar
    | Partial<TRecord>
    | readonly FeatureDbScalar[];

export interface FeatureDbColumnDefinition {
    name: string;
    dataType: FeatureDbColumnType;
    nullable: boolean;
    sqlType: string;
    enumValues?: readonly string[];
}

export interface FeatureDbTableDefinition<TRecord extends FeatureDbRecord = FeatureDbRecord> {
    featureKey: string;
    tableName: string;
    collectionName: string;
    primaryKey: string | readonly string[];
    seedPath?: string;
    columns: readonly FeatureDbColumnDefinition[];
}

export const createFeatureDbTable = <TRecord extends FeatureDbRecord>(
    definition: FeatureDbTableDefinition<TRecord>
): FeatureDbTableDefinition<TRecord> => definition;
