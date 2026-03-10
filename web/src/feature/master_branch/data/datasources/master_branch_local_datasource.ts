import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import { branchesDao, storageLocationsDao } from '@feature/master_branch/data/db';
import { createMasterBranchDataFromRows } from '@feature/master_branch/data/mappers/master_branch.mapper';
import type { MasterBranchDataModel } from '@feature/master_branch/domain/models';

export class MasterBranchLocalDatasource {
    async getData(): Promise<MasterBranchDataModel> {
        const [
            branchesRows,
            storageLocationsRows
        ] = await Promise.all([
            branchesDao.getAll(),
            storageLocationsDao.getAll()
        ]);

        return createMasterBranchDataFromRows({
            module: getAppModuleByKey('master-branch'),
            branchesRows,
            storageLocationsRows,
        });
    }
}
