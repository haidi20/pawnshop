import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { contractExtensionsTable, type ContractExtensionsRow } from '@feature/pawn_transaction/data/db/contract_extensions.table';

export class ContractExtensionsDao extends FeatureTableDao<ContractExtensionsRow> {
    constructor() {
        super(contractExtensionsTable);
    }
}

export const contractExtensionsDao = new ContractExtensionsDao();
