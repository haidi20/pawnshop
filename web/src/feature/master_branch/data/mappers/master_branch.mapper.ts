import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { BranchesRow, StorageLocationsRow } from '@feature/master_branch/data/db';
import { createMasterBranchDataModel, type BranchModel, type StorageLocationModel, type MasterBranchDataModel } from '@feature/master_branch/domain/models';

export const mapBranchesRowToModel = (row: BranchesRow): BranchModel => ({
    id: row.id,
    branchCode: row.branch_code,
    branchNumber: row.branch_number,
    branchName: row.branch_name,
    phoneNumber: row.phone_number,
    address: row.address,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapStorageLocationsRowToModel = (row: StorageLocationsRow): StorageLocationModel => ({
    id: row.id,
    branchId: row.branch_id,
    locationCode: row.location_code,
    locationName: row.location_name,
    locationType: row.location_type,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const createMasterBranchDataFromRows = (params: {
    module: AppModuleSummary;
    branchesRows: BranchesRow[];
    storageLocationsRows: StorageLocationsRow[];
}): MasterBranchDataModel =>
    createMasterBranchDataModel({
        module: params.module,
        branches: params.branchesRows.map(mapBranchesRowToModel),
        storageLocations: params.storageLocationsRows.map(mapStorageLocationsRowToModel),
    });
