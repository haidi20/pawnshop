import { FeatureTableDao } from '@core/data/datasources/db/feature_table.dao';
import { userBranchAssignmentsTable, type UserBranchAssignmentsRow } from '@feature/auth_access/data/db/user_branch_assignments.table';

export class UserBranchAssignmentsDao extends FeatureTableDao<UserBranchAssignmentsRow> {
    constructor() {
        super(userBranchAssignmentsTable);
    }
}

export const userBranchAssignmentsDao = new UserBranchAssignmentsDao();
