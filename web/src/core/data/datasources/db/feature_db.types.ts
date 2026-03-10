export type FeatureDbScalar = string | number | boolean | null;

export type FeatureDbValue =
    | FeatureDbScalar
    | { [key: string]: FeatureDbValue }
    | FeatureDbValue[];

export type FeatureDbRecord = Record<string, FeatureDbValue>;

export type FeatureDbColumnName<TRecord extends object> = Extract<keyof TRecord, string>;

export type FeatureDbScalarColumnName<TRecord extends object> = Extract<
    {
        [TKey in keyof TRecord]-?: TRecord[TKey] extends FeatureDbScalar ? TKey : never;
    }[keyof TRecord],
    string
>;

export type FeatureDbRecordConstraint<TRecord extends object> = Record<FeatureDbColumnName<TRecord>, FeatureDbValue>;

export type FeatureDbColumnType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'date'
    | 'datetime'
    | 'json';

export type FeatureDbLookupKey<TRecord extends FeatureDbRecordConstraint<TRecord> = FeatureDbRecord> =
    | FeatureDbScalar
    | Partial<Pick<TRecord, FeatureDbScalarColumnName<TRecord>>>
    | readonly FeatureDbScalar[];

export interface FeatureDbColumnDefinition<TRecord extends FeatureDbRecordConstraint<TRecord> = FeatureDbRecord> {
    name: FeatureDbColumnName<TRecord>;
    dataType: FeatureDbColumnType;
    nullable: boolean;
    sqlType: string;
    enumValues?: readonly string[];
}

export interface FeatureDbTableDefinition<TRecord extends FeatureDbRecordConstraint<TRecord> = FeatureDbRecord> {
    featureKey: string;
    tableName: string;
    collectionName: string;
    primaryKey: FeatureDbScalarColumnName<TRecord> | readonly FeatureDbScalarColumnName<TRecord>[];
    seedPath?: string;
    columns: readonly FeatureDbColumnDefinition<TRecord>[];
}

export const createFeatureDbTable = <TRecord extends FeatureDbRecordConstraint<TRecord>>(
    definition: FeatureDbTableDefinition<TRecord>
): FeatureDbTableDefinition<TRecord> => definition;
