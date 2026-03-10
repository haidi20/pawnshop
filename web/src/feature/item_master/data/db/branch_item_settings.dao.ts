import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { branchItemSettingsTable, type BranchItemSettingsRow } from '@feature/item_master/data/db/branch_item_settings.table';

export class BranchItemSettingsDao extends FeatureTableDao<BranchItemSettingsRow> {
    constructor() {
        super(branchItemSettingsTable);
    }
}

export const branchItemSettingsDao = new BranchItemSettingsDao();
