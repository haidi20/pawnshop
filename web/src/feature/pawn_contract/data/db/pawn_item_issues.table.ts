import { createFeatureDbTable } from '@core/data/datasources/db/feature_db.types';

export interface PawnItemIssuesRow {
    id: number;
    pawn_item_id: number;
    issue_name: string;
    issue_details: string | null;
    severity_level: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export const pawnItemIssuesTable = createFeatureDbTable<PawnItemIssuesRow>({
    featureKey: 'pawn-contract',
    tableName: 'pawn_item_issues',
    collectionName: 'pawn_item_issues',
    primaryKey: 'id',
    seedPath: '/dummies/pawn_item_issues.dummy.json',
    columns: [
        { name: 'id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'pawn_item_id', dataType: 'number', nullable: false, sqlType: 'BIGINT UNSIGNED' },
        { name: 'issue_name', dataType: 'string', nullable: false, sqlType: 'VARCHAR(255)' },
        { name: 'issue_details', dataType: 'string', nullable: true, sqlType: 'TEXT' },
        { name: 'severity_level', dataType: 'string', nullable: true, sqlType: 'VARCHAR(50)' },
        { name: 'created_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
        { name: 'updated_at', dataType: 'datetime', nullable: true, sqlType: 'TIMESTAMP' },
    ]
});
