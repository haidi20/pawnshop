import type {
    AuthPortalCompaniesRow,
    AuthPortalSessionsRow,
    AuthPortalUsersRow
} from '@feature/auth_portal/data/db';
import { hashAuthPortalPassword } from '@feature/auth_portal/data/helpers/auth_portal_password';
import { AUTH_PORTAL_DEMO_PASSWORD, authPortalDemoCompanies } from '@feature/auth_portal/util/auth_portal_demo_accounts';

export interface AuthPortalDemoSeedDataset {
    companies: AuthPortalCompaniesRow[];
    users: AuthPortalUsersRow[];
    sessions: AuthPortalSessionsRow[];
}

const DEMO_CREATED_AT = '2026-03-11T08:00:00.000Z';

export const buildAuthPortalDemoSeedDataset = (): AuthPortalDemoSeedDataset => {
    const companies: AuthPortalCompaniesRow[] = [];
    const users: AuthPortalUsersRow[] = [];
    const sessions: AuthPortalSessionsRow[] = [];

    let userId = 1;

    authPortalDemoCompanies.forEach((company, companyIndex) => {
        const companyId = companyIndex + 1;

        companies.push({
            id: companyId,
            company_id: companyId,
            name: company.companyName,
            legal_name: company.legalName,
            business_type: company.businessType,
            email: company.companyEmail,
            phone_number: company.companyPhoneNumber,
            city: company.city,
            address: company.address,
            created_at: DEMO_CREATED_AT,
            updated_at: DEMO_CREATED_AT
        });

        const registerUser = (user: typeof company.owner): void => {
            users.push({
                id: userId,
                company_id: companyId,
                role: user.role,
                assigned_branch_id: user.assignedBranchId,
                username: user.username,
                password_hash: hashAuthPortalPassword(AUTH_PORTAL_DEMO_PASSWORD),
                full_name: user.fullName,
                email: user.email,
                phone_number: user.phoneNumber,
                is_active: 1,
                created_at: DEMO_CREATED_AT,
                updated_at: DEMO_CREATED_AT
            });

            userId += 1;
        };

        registerUser(company.owner);
        company.employees.forEach((employee) => {
            registerUser(employee);
        });
    });

    return {
        companies,
        users,
        sessions
    };
};
