import type { AuthPortalUserRoleModel } from '@feature/auth_portal/domain/models';

export interface AuthPortalDemoUserAccountModel {
    fullName: string;
    username: string;
    email: string;
    phoneNumber: string | null;
    role: AuthPortalUserRoleModel;
}

export interface AuthPortalDemoCompanyAccountModel {
    companyName: string;
    legalName: string | null;
    businessType: string | null;
    companyEmail: string | null;
    companyPhoneNumber: string | null;
    city: string | null;
    address: string | null;
    owner: AuthPortalDemoUserAccountModel;
    employees: AuthPortalDemoUserAccountModel[];
}

export const AUTH_PORTAL_DEMO_PASSWORD = 'gadai123';

export const authPortalDemoCompanies: AuthPortalDemoCompanyAccountModel[] = [
    {
        companyName: 'Sentra Gadai Nusantara',
        legalName: 'PT Sentra Gadai Nusantara',
        businessType: 'Perusahaan gadai',
        companyEmail: 'halo@sentragadai.id',
        companyPhoneNumber: '0541-880101',
        city: 'Samarinda',
        address: 'Jl. Pahlawan No. 18, Samarinda Kota',
        owner: {
            fullName: 'Rina Maharani',
            username: 'owner.sgn',
            email: 'owner@sentragadai.id',
            phoneNumber: '0811-5400-101',
            role: 'owner'
        },
        employees: [
            {
                fullName: 'Aldo Pratama',
                username: 'admin.sgn',
                email: 'admin@sentragadai.id',
                phoneNumber: '0811-5400-102',
                role: 'admin'
            },
            {
                fullName: 'Mita Lestari',
                username: 'staff.sgn',
                email: 'staff@sentragadai.id',
                phoneNumber: '0811-5400-103',
                role: 'staff'
            }
        ]
    },
    {
        companyName: 'Prima Jaminan Sejahtera',
        legalName: 'CV Prima Jaminan Sejahtera',
        businessType: 'Pegadaian swasta',
        companyEmail: 'kontak@primajaminan.id',
        companyPhoneNumber: '0541-880202',
        city: 'Balikpapan',
        address: 'Jl. Jenderal Sudirman No. 22, Balikpapan',
        owner: {
            fullName: 'Dimas Rahardian',
            username: 'owner.pjs',
            email: 'owner@primajaminan.id',
            phoneNumber: '0812-5200-201',
            role: 'owner'
        },
        employees: [
            {
                fullName: 'Nadia Puspita',
                username: 'admin.pjs',
                email: 'admin@primajaminan.id',
                phoneNumber: '0812-5200-202',
                role: 'admin'
            },
            {
                fullName: 'Fajar Saputra',
                username: 'staff.pjs',
                email: 'staff@primajaminan.id',
                phoneNumber: '0812-5200-203',
                role: 'staff'
            }
        ]
    }
];
