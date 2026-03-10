import type { AppModuleSummary } from '@core/domain/interfaces/app_module.interface';
import type { RolesRow, UsersRow, UserRolesRow, UserBranchAssignmentsRow, LoginSessionsRow } from '@feature/auth_access/data/db';
import { createAuthAccessDataModel, type RoleModel, type UserModel, type UserRoleModel, type UserBranchAssignmentModel, type LoginSessionModel, type AuthAccessDataModel } from '@feature/auth_access/domain/models';

export const mapRolesRowToModel = (row: RolesRow): RoleModel => ({
    id: row.id,
    roleCode: row.role_code,
    roleName: row.role_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapUsersRowToModel = (row: UsersRow): UserModel => ({
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    fullName: row.full_name,
    email: row.email,
    phoneNumber: row.phone_number,
    rememberToken: row.remember_token,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapUserRolesRowToModel = (row: UserRolesRow): UserRoleModel => ({
    userId: row.user_id,
    roleId: row.role_id,
    createdAt: row.created_at,
});

export const mapUserBranchAssignmentsRowToModel = (row: UserBranchAssignmentsRow): UserBranchAssignmentModel => ({
    id: row.id,
    userId: row.user_id,
    branchId: row.branch_id,
    isPrimary: row.is_primary === 1,
    assignedAt: row.assigned_at,
    unassignedAt: row.unassigned_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const mapLoginSessionsRowToModel = (row: LoginSessionsRow): LoginSessionModel => ({
    id: row.id,
    userId: row.user_id,
    sessionToken: row.session_token,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    loginAt: row.login_at,
    logoutAt: row.logout_at,
    sessionStatus: row.session_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const createAuthAccessDataFromRows = (params: {
    module: AppModuleSummary;
    rolesRows: RolesRow[];
    usersRows: UsersRow[];
    userRolesRows: UserRolesRow[];
    userBranchAssignmentsRows: UserBranchAssignmentsRow[];
    loginSessionsRows: LoginSessionsRow[];
}): AuthAccessDataModel =>
    createAuthAccessDataModel({
        module: params.module,
        roles: params.rolesRows.map(mapRolesRowToModel),
        users: params.usersRows.map(mapUsersRowToModel),
        userRoles: params.userRolesRows.map(mapUserRolesRowToModel),
        userBranchAssignments: params.userBranchAssignmentsRows.map(mapUserBranchAssignmentsRowToModel),
        loginSessions: params.loginSessionsRows.map(mapLoginSessionsRowToModel),
    });
