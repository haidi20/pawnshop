import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { FeatureModuleDataModel, FeatureTableCountModel } from '@core/domain/models/feature-module-data.model';
import type { RoleModel } from '@feature/auth_access/domain/models/role.model';
import type { UserModel } from '@feature/auth_access/domain/models/user.model';
import type { UserRoleModel } from '@feature/auth_access/domain/models/user-role.model';
import type { UserBranchAssignmentModel } from '@feature/auth_access/domain/models/user-branch-assignment.model';
import type { LoginSessionModel } from '@feature/auth_access/domain/models/login-session.model';

export interface AuthAccessDataModel extends FeatureModuleDataModel {
    roles: RoleModel[];
    users: UserModel[];
    userRoles: UserRoleModel[];
    userBranchAssignments: UserBranchAssignmentModel[];
    loginSessions: LoginSessionModel[];
}

export const createAuthAccessDataModel = (params: {
    module: AppModuleSummary;
    roles: RoleModel[];
    users: UserModel[];
    userRoles: UserRoleModel[];
    userBranchAssignments: UserBranchAssignmentModel[];
    loginSessions: LoginSessionModel[];
}): AuthAccessDataModel => {
    const tableCounts: FeatureTableCountModel[] = [
        { key: 'roles', label: 'Roles', count: params.roles.length },
        { key: 'users', label: 'Users', count: params.users.length },
        { key: 'user_roles', label: 'User Roles', count: params.userRoles.length },
        { key: 'user_branch_assignments', label: 'User Branch Assignments', count: params.userBranchAssignments.length },
        { key: 'login_sessions', label: 'Login Sessions', count: params.loginSessions.length },
    ];

    return {
        ...params,
        tableCounts,
        totalRows: tableCounts.reduce((total, item) => total + item.count, 0)
    };
};
