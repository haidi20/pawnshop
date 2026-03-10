import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { InvestorsRow, BranchInvestorsRow, InvestorCapitalTransactionsRow } from '@feature/master_investor/data/db';
import { createMasterInvestorDataModel, type InvestorModel, type BranchInvestorModel, type InvestorCapitalTransactionModel, type MasterInvestorDataModel } from '@feature/master_investor/domain/models';

export const mapInvestorsRowToModel = (row: InvestorsRow): InvestorModel => ({
    id: row.id,
    investorCode: row.investor_code,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    address: row.address,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapBranchInvestorsRowToModel = (row: BranchInvestorsRow): BranchInvestorModel => ({
    id: row.id,
    branchId: row.branch_id,
    investorId: row.investor_id,
    ownershipPercentage: row.ownership_percentage,
    startDate: row.start_date,
    endDate: row.end_date,
    isPrimary: row.is_primary === 1,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapInvestorCapitalTransactionsRowToModel = (row: InvestorCapitalTransactionsRow): InvestorCapitalTransactionModel => ({
    id: row.id,
    investorId: row.investor_id,
    branchId: row.branch_id,
    transferId: row.transfer_id,
    transactionTypeCode: row.transaction_type_code,
    transactionDate: row.transaction_date,
    amount: row.amount,
    description: row.description,
    createdByUserId: row.created_by_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const createMasterInvestorDataFromRows = (params: {
    module: AppModuleSummary;
    investorsRows: InvestorsRow[];
    branchInvestorsRows: BranchInvestorsRow[];
    investorCapitalTransactionsRows: InvestorCapitalTransactionsRow[];
}): MasterInvestorDataModel =>
    createMasterInvestorDataModel({
        module: params.module,
        investors: params.investorsRows.map(mapInvestorsRowToModel),
        branchInvestors: params.branchInvestorsRows.map(mapBranchInvestorsRowToModel),
        investorCapitalTransactions: params.investorCapitalTransactionsRows.map(mapInvestorCapitalTransactionsRowToModel),
    });
