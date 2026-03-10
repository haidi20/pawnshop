import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { contractPaymentsTable, type ContractPaymentsRow } from '@feature/pawn_transaction/data/db/contract_payments.table';

export class ContractPaymentsDao extends FeatureTableDao<ContractPaymentsRow> {
    constructor() {
        super(contractPaymentsTable);
    }
}

export const contractPaymentsDao = new ContractPaymentsDao();
