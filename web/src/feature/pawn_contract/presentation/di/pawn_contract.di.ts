import { PawnContractIndexLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_index_local_datasource';
import { PawnContractLocalDatasource } from '@feature/pawn_contract/data/datasources/pawn_contract_local_datasource';
import { PawnContractRepositoryImpl } from '@feature/pawn_contract/data/repositories/pawn_contract_repository_impl';
import { GetPawnContractAjtTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_ajt_table.usecase';
import { GetPawnContractDataUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_data.usecase';
import { GetPawnContractHistoryUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_history.usecase';
import { GetPawnContractIndexTabsUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_index_tabs.usecase';
import { GetPawnContractLocationTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_location_table.usecase';
import { GetPawnContractMaintenanceTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_maintenance_table.usecase';
import { GetPawnContractNasabahTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_nasabah_table.usecase';
import { GetPawnContractRingkasanTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_ringkasan_table.usecase';
import { GetPawnContractSettlementTableUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_settlement_table.usecase';
import { GetPawnContractSummariesUsecase } from '@feature/pawn_contract/domain/usecases/get_pawn_contract_summaries.usecase';

const pawnContractLocalDatasource = new PawnContractLocalDatasource();
const pawnContractIndexLocalDatasource = new PawnContractIndexLocalDatasource();
export const pawnContractRepository = new PawnContractRepositoryImpl(
    pawnContractLocalDatasource,
    pawnContractIndexLocalDatasource
);

export const getPawnContractDataUsecase = new GetPawnContractDataUsecase(pawnContractRepository);
export const getPawnContractHistoryUsecase = new GetPawnContractHistoryUsecase(pawnContractRepository);
export const getPawnContractSummariesUsecase = new GetPawnContractSummariesUsecase(pawnContractRepository);
export const getPawnContractNasabahTableUsecase = new GetPawnContractNasabahTableUsecase(pawnContractRepository);
export const getPawnContractRingkasanTableUsecase = new GetPawnContractRingkasanTableUsecase(pawnContractRepository);
export const getPawnContractAjtTableUsecase = new GetPawnContractAjtTableUsecase(pawnContractRepository);
export const getPawnContractSettlementTableUsecase = new GetPawnContractSettlementTableUsecase(pawnContractRepository);
export const getPawnContractLocationTableUsecase = new GetPawnContractLocationTableUsecase(pawnContractRepository);
export const getPawnContractMaintenanceTableUsecase = new GetPawnContractMaintenanceTableUsecase(pawnContractRepository);
export const getPawnContractIndexTabsUsecase = new GetPawnContractIndexTabsUsecase(pawnContractRepository);
