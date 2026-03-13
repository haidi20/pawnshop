import {
    PawnContractCustomerGenderEnum,
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum,
    PawnContractPaymentOptionDaysEnum,
    PawnContractTermDaysEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import {
    buildPawnContractPrepaidStorageLabel,
    calculatePawnContractPrepaidStorageAmount,
    calculatePawnContractStorageFee,
    convertNumberToIndonesianCurrencyWords,
    getTodayDateValue
} from '@core/util/pawn-contract-form';
import type { PawnContractStatusModel, PawnItemLocationStatusModel } from '@core/util/helpers';
import {
    branchCashAccountsDao,
    branchCashTransactionsDao,
    type BranchCashAccountsRow,
    type BranchCashTransactionsRow
} from '@feature/branch_finance/data/db';
import {
    customerContactsDao,
    customerDocumentsDao,
    customersDao,
    type CustomerContactsRow,
    type CustomerDocumentsRow,
    type CustomersRow
} from '@feature/customer/data/db';
import { branchesDao, type BranchesRow } from '@feature/master_branch/data/db';
import {
    pawnContractsDao,
    pawnItemAccessoriesDao,
    pawnItemIssuesDao,
    pawnItemLocationMovementsDao,
    pawnItemsDao,
    type PawnContractsRow,
    type PawnItemAccessoriesRow,
    type PawnItemIssuesRow,
    type PawnItemLocationMovementsRow,
    type PawnItemsRow
} from '@feature/pawn_contract/data/db';
import {
    getFeatureStorageScope,
    isCurrentAuthPortalDemoCompany,
    readAuthPortalStoredSession
} from '@feature/auth_portal/util/auth_portal_session';

export const PAWN_CONTRACT_DEMO_DATASET_VERSION = 'pawn-contract-demo-500-v2';
export const PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT = 500;

export const DEMO_SEED_STORAGE_KEY = 'pawnshop.demo_seed.pawn_contract.version';
const ELECTRONIC_CATEGORY_ID = 2;
const LAPTOP_ITEM_TYPE_ID = 2;
const BRANCH_STARTING_BALANCE = 90_000_000;

type DemoBranchSeed = Pick<
    BranchesRow,
    'branch_code' | 'branch_number' | 'branch_name' | 'phone_number' | 'address'
>;

type DemoCompanySeedProfile = {
    companyId: number;
    companyCode: string;
    referenceDateOffsetDays: number;
    customerNameOffset: number;
    customerPhonePrefix: string;
    identityAreaCode: string;
    templateOffset: number;
    branchPattern: readonly number[];
    branches: DemoBranchSeed[];
};

type DemoItemCatalog = {
    itemKind: PawnContractItemKindEnum;
    detailType: string;
    itemName: string;
    brandName: string;
    modelName: string;
    categoryId: number | null;
    itemTypeId: number | null;
    marginRate: number;
    deductionRate: number;
};

type DemoContractTemplate = {
    key: string;
    status: PawnContractStatusModel;
    termDays: PawnContractTermDaysEnum;
    paymentOptionDays: PawnContractPaymentOptionDaysEnum;
    contractDateStrategy:
        | { kind: 'today' }
        | { kind: 'days_ago'; value: number }
        | { kind: 'month_offset'; monthOffset: number; dayOfMonth: number };
    daysToMaturity: number;
    locationStatus: PawnItemLocationStatusModel;
    maintenanceRequired: boolean;
    preferredItemKind: PawnContractItemKindEnum | 'mixed';
    updatedAtStrategy:
        | { kind: 'contract_date'; dayOffset: number }
        | { kind: 'today'; dayOffset: number };
};

type DemoItemBlueprint = {
    catalog: DemoItemCatalog;
    appraisedValue: number;
    disbursedValue: number;
};

export interface PawnContractDemoSeedDataset {
    branches: BranchesRow[];
    branchCashAccounts: BranchCashAccountsRow[];
    branchCashTransactions: BranchCashTransactionsRow[];
    customers: CustomersRow[];
    customerContacts: CustomerContactsRow[];
    customerDocuments: CustomerDocumentsRow[];
    contracts: PawnContractsRow[];
    items: PawnItemsRow[];
    accessories: PawnItemAccessoriesRow[];
    issues: PawnItemIssuesRow[];
    locationMovements: PawnItemLocationMovementsRow[];
}

const DEMO_BRANCHES: DemoBranchSeed[] = [
    {
        branch_code: 'BR-SMD-001',
        branch_number: '001',
        branch_name: 'Pawnshop Samarinda Kota',
        phone_number: '0541-810001',
        address: 'Jl. Gajah Mada No. 1, Samarinda Kota, Samarinda'
    },
    {
        branch_code: 'BR-SMD-002',
        branch_number: '002',
        branch_name: 'Pawnshop Samarinda Ilir',
        phone_number: '0541-810002',
        address: 'Jl. Otto Iskandardinata No. 12, Samarinda Ilir, Samarinda'
    },
    {
        branch_code: 'BR-SMD-003',
        branch_number: '003',
        branch_name: 'Pawnshop Samarinda Seberang',
        phone_number: '0541-810003',
        address: 'Jl. Bung Tomo No. 8, Samarinda Seberang, Samarinda'
    },
    {
        branch_code: 'BR-SMD-004',
        branch_number: '004',
        branch_name: 'Pawnshop Samarinda Ulu',
        phone_number: '0541-810004',
        address: 'Jl. Juanda No. 18, Samarinda Ulu, Samarinda'
    },
    {
        branch_code: 'BR-SMD-005',
        branch_number: '005',
        branch_name: 'Pawnshop Samarinda Utara',
        phone_number: '0541-810005',
        address: 'Jl. PM Noor No. 20, Samarinda Utara, Samarinda'
    },
    {
        branch_code: 'BR-SMD-006',
        branch_number: '006',
        branch_name: 'Pawnshop Sungai Kunjang',
        phone_number: '0541-810006',
        address: 'Jl. Jakarta No. 7, Sungai Kunjang, Samarinda'
    },
    {
        branch_code: 'BR-SMD-007',
        branch_number: '007',
        branch_name: 'Pawnshop Sungai Pinang',
        phone_number: '0541-810007',
        address: 'Jl. DI Panjaitan No. 23, Sungai Pinang, Samarinda'
    },
    {
        branch_code: 'BR-SMD-008',
        branch_number: '008',
        branch_name: 'Pawnshop Sambutan',
        phone_number: '0541-810008',
        address: 'Jl. Sultan Sulaiman No. 11, Sambutan, Samarinda'
    },
    {
        branch_code: 'BR-SMD-009',
        branch_number: '009',
        branch_name: 'Pawnshop Palaran',
        phone_number: '0541-810009',
        address: 'Jl. Trikora No. 9, Palaran, Samarinda'
    },
    {
        branch_code: 'BR-SMD-010',
        branch_number: '010',
        branch_name: 'Pawnshop Loa Janan Ilir',
        phone_number: '0541-810010',
        address: 'Jl. Cipto Mangunkusumo No. 14, Loa Janan Ilir, Samarinda'
    }
];

const DEMO_BRANCHES_BALIKPAPAN: DemoBranchSeed[] = [
    {
        branch_code: 'BR-BPN-001',
        branch_number: '001',
        branch_name: 'Pawnshop Balikpapan Kota',
        phone_number: '0542-820001',
        address: 'Jl. Jenderal Sudirman No. 5, Balikpapan Kota, Balikpapan'
    },
    {
        branch_code: 'BR-BPN-002',
        branch_number: '002',
        branch_name: 'Pawnshop Balikpapan Selatan',
        phone_number: '0542-820002',
        address: 'Jl. MT Haryono No. 17, Balikpapan Selatan, Balikpapan'
    },
    {
        branch_code: 'BR-BPN-003',
        branch_number: '003',
        branch_name: 'Pawnshop Balikpapan Tengah',
        phone_number: '0542-820003',
        address: 'Jl. Ahmad Yani No. 21, Balikpapan Tengah, Balikpapan'
    },
    {
        branch_code: 'BR-BPN-004',
        branch_number: '004',
        branch_name: 'Pawnshop Balikpapan Utara',
        phone_number: '0542-820004',
        address: 'Jl. Soekarno Hatta Km. 6, Balikpapan Utara, Balikpapan'
    },
    {
        branch_code: 'BR-BPN-005',
        branch_number: '005',
        branch_name: 'Pawnshop Balikpapan Timur',
        phone_number: '0542-820005',
        address: 'Jl. Mulawarman No. 14, Balikpapan Timur, Balikpapan'
    },
    {
        branch_code: 'BR-BPN-006',
        branch_number: '006',
        branch_name: 'Pawnshop Balikpapan Barat',
        phone_number: '0542-820006',
        address: 'Jl. Letjen Suprapto No. 9, Balikpapan Barat, Balikpapan'
    },
    {
        branch_code: 'BR-BPN-007',
        branch_number: '007',
        branch_name: 'Pawnshop Damai',
        phone_number: '0542-820007',
        address: 'Jl. Damai Bahagia No. 12, Balikpapan Selatan, Balikpapan'
    },
    {
        branch_code: 'BR-BPN-008',
        branch_number: '008',
        branch_name: 'Pawnshop Gunung Bahagia',
        phone_number: '0542-820008',
        address: 'Jl. Ruhui Rahayu No. 11, Gunung Bahagia, Balikpapan'
    },
    {
        branch_code: 'BR-BPN-009',
        branch_number: '009',
        branch_name: 'Pawnshop Lamaru',
        phone_number: '0542-820009',
        address: 'Jl. Mulawarman No. 66, Lamaru, Balikpapan Timur'
    },
    {
        branch_code: 'BR-BPN-010',
        branch_number: '010',
        branch_name: 'Pawnshop Kariangau',
        phone_number: '0542-820010',
        address: 'Jl. Kariangau Km. 5, Balikpapan Barat, Balikpapan'
    }
];

const DEMO_COMPANY_SEED_PROFILES: DemoCompanySeedProfile[] = [
    {
        companyId: 1,
        companyCode: 'SGN',
        referenceDateOffsetDays: 0,
        customerNameOffset: 0,
        customerPhonePrefix: '0812987',
        identityAreaCode: '6471',
        templateOffset: 0,
        branchPattern: [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        branches: DEMO_BRANCHES
    },
    {
        companyId: 2,
        companyCode: 'PJS',
        referenceDateOffsetDays: -21,
        customerNameOffset: 7,
        customerPhonePrefix: '0813520',
        identityAreaCode: '6472',
        templateOffset: 5,
        branchPattern: [0, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        branches: DEMO_BRANCHES_BALIKPAPAN
    }
];

const FIRST_NAMES = [
    'Andi',
    'Siti',
    'Rizky',
    'Nabila',
    'Aulia',
    'Dewi',
    'Fikri',
    'Putri',
    'Hendra',
    'Mutia',
    'Rahmat',
    'Indah'
] as const;

const LAST_NAMES = [
    'Pratama',
    'Aisyah',
    'Saputra',
    'Lestari',
    'Ramadhan',
    'Maharani',
    'Wibowo',
    'Permata',
    'Firmansyah',
    'Utami',
    'Anugrah',
    'Salsabila'
] as const;

const ELECTRONIC_ITEM_CATALOGS: DemoItemCatalog[] = [
    {
        itemKind: PawnContractItemKindEnum.Electronic,
        detailType: 'smartphone',
        itemName: 'Samsung Galaxy A55',
        brandName: 'Samsung',
        modelName: 'Galaxy A55',
        categoryId: ELECTRONIC_CATEGORY_ID,
        itemTypeId: null,
        marginRate: 12,
        deductionRate: 2
    },
    {
        itemKind: PawnContractItemKindEnum.Electronic,
        detailType: 'smartphone',
        itemName: 'iPhone 13 128 GB',
        brandName: 'Apple',
        modelName: 'iPhone 13',
        categoryId: ELECTRONIC_CATEGORY_ID,
        itemTypeId: null,
        marginRate: 12,
        deductionRate: 2
    },
    {
        itemKind: PawnContractItemKindEnum.Electronic,
        detailType: 'laptop',
        itemName: 'ASUS Vivobook 14',
        brandName: 'ASUS',
        modelName: 'Vivobook 14',
        categoryId: ELECTRONIC_CATEGORY_ID,
        itemTypeId: LAPTOP_ITEM_TYPE_ID,
        marginRate: 11,
        deductionRate: 2
    },
    {
        itemKind: PawnContractItemKindEnum.Electronic,
        detailType: 'laptop',
        itemName: 'Acer Swift 3',
        brandName: 'Acer',
        modelName: 'Swift 3',
        categoryId: ELECTRONIC_CATEGORY_ID,
        itemTypeId: LAPTOP_ITEM_TYPE_ID,
        marginRate: 11,
        deductionRate: 2
    },
    {
        itemKind: PawnContractItemKindEnum.Electronic,
        detailType: 'kamera',
        itemName: 'Canon EOS M50',
        brandName: 'Canon',
        modelName: 'EOS M50',
        categoryId: ELECTRONIC_CATEGORY_ID,
        itemTypeId: null,
        marginRate: 10,
        deductionRate: 2
    },
    {
        itemKind: PawnContractItemKindEnum.Electronic,
        detailType: 'tv',
        itemName: 'LG Smart TV 43 Inch',
        brandName: 'LG',
        modelName: '43LM5750',
        categoryId: ELECTRONIC_CATEGORY_ID,
        itemTypeId: null,
        marginRate: 9,
        deductionRate: 1
    },
    {
        itemKind: PawnContractItemKindEnum.Electronic,
        detailType: 'lain_lain',
        itemName: 'Nintendo Switch OLED',
        brandName: 'Nintendo',
        modelName: 'Switch OLED',
        categoryId: ELECTRONIC_CATEGORY_ID,
        itemTypeId: null,
        marginRate: 8,
        deductionRate: 1
    }
];

const VEHICLE_ITEM_CATALOGS: DemoItemCatalog[] = [
    {
        itemKind: PawnContractItemKindEnum.Vehicle,
        detailType: 'motor',
        itemName: 'Honda Beat CBS',
        brandName: 'Honda',
        modelName: 'Beat CBS',
        categoryId: null,
        itemTypeId: null,
        marginRate: 14,
        deductionRate: 4
    },
    {
        itemKind: PawnContractItemKindEnum.Vehicle,
        detailType: 'motor',
        itemName: 'Yamaha NMAX',
        brandName: 'Yamaha',
        modelName: 'NMAX',
        categoryId: null,
        itemTypeId: null,
        marginRate: 14,
        deductionRate: 4
    },
    {
        itemKind: PawnContractItemKindEnum.Vehicle,
        detailType: 'mobil',
        itemName: 'Toyota Avanza',
        brandName: 'Toyota',
        modelName: 'Avanza',
        categoryId: null,
        itemTypeId: null,
        marginRate: 13,
        deductionRate: 3
    },
    {
        itemKind: PawnContractItemKindEnum.Vehicle,
        detailType: 'mobil',
        itemName: 'Daihatsu Sigra',
        brandName: 'Daihatsu',
        modelName: 'Sigra',
        categoryId: null,
        itemTypeId: null,
        marginRate: 13,
        deductionRate: 3
    }
];

const DEMO_CONTRACT_TEMPLATES: DemoContractTemplate[] = [
    {
        key: 'active-today-daily-30',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Daily,
        contractDateStrategy: { kind: 'today' },
        daysToMaturity: 5,
        locationStatus: 'in_office',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'contract_date', dayOffset: 0 }
    },
    {
        key: 'active-today-weekly-7',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Seven,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'today' },
        daysToMaturity: 3,
        locationStatus: 'in_warehouse',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'contract_date', dayOffset: 0 }
    },
    {
        key: 'active-today-fifteen',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Fifteen,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
        contractDateStrategy: { kind: 'today' },
        daysToMaturity: 6,
        locationStatus: 'returned',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'contract_date', dayOffset: 0 }
    },
    {
        key: 'active-prev-month-sixty',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Sixty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 1, dayOfMonth: 5 },
        daysToMaturity: 4,
        locationStatus: 'in_warehouse',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Vehicle,
        updatedAtStrategy: { kind: 'contract_date', dayOffset: 2 }
    },
    {
        key: 'active-two-month-overdue',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Daily,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 2, dayOfMonth: 7 },
        daysToMaturity: -2,
        locationStatus: 'in_office',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: -1 }
    },
    {
        key: 'extended-recent-overdue',
        status: 'extended',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 1, dayOfMonth: 9 },
        daysToMaturity: -5,
        locationStatus: 'in_warehouse',
        maintenanceRequired: true,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: 0 }
    },
    {
        key: 'active-deep-overdue',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Fifteen,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 4, dayOfMonth: 11 },
        daysToMaturity: -10,
        locationStatus: 'other',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: -3 }
    },
    {
        key: 'extended-deep-overdue',
        status: 'extended',
        termDays: PawnContractTermDaysEnum.Sixty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 4, dayOfMonth: 13 },
        daysToMaturity: -12,
        locationStatus: 'returned',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Vehicle,
        updatedAtStrategy: { kind: 'today', dayOffset: -4 }
    },
    {
        key: 'maintenance-warning',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'days_ago', value: 20 },
        daysToMaturity: 10,
        locationStatus: 'in_office',
        maintenanceRequired: true,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: -2 }
    },
    {
        key: 'maintenance-safe',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
        contractDateStrategy: { kind: 'days_ago', value: 18 },
        daysToMaturity: 12,
        locationStatus: 'in_warehouse',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: -2 }
    },
    {
        key: 'redeemed',
        status: 'redeemed',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'days_ago', value: 25 },
        daysToMaturity: -1,
        locationStatus: 'released',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: -2 }
    },
    {
        key: 'closed',
        status: 'closed',
        termDays: PawnContractTermDaysEnum.Sixty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
        contractDateStrategy: { kind: 'days_ago', value: 40 },
        daysToMaturity: -3,
        locationStatus: 'returned',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Vehicle,
        updatedAtStrategy: { kind: 'today', dayOffset: -3 }
    },
    {
        key: 'auctioned',
        status: 'auctioned',
        termDays: PawnContractTermDaysEnum.Sixty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
        contractDateStrategy: { kind: 'days_ago', value: 50 },
        daysToMaturity: -8,
        locationStatus: 'auctioned',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Vehicle,
        updatedAtStrategy: { kind: 'today', dayOffset: -1 }
    },
    {
        key: 'cancelled',
        status: 'cancelled',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'days_ago', value: 8 },
        daysToMaturity: 22,
        locationStatus: 'returned',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: -2 }
    },
    {
        key: 'draft',
        status: 'draft',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'days_ago', value: 1 },
        daysToMaturity: 29,
        locationStatus: 'in_office',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'contract_date', dayOffset: 0 }
    },
    {
        key: 'active-sixty-due-soon',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Sixty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 1, dayOfMonth: 18 },
        daysToMaturity: 2,
        locationStatus: 'in_warehouse',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Vehicle,
        updatedAtStrategy: { kind: 'today', dayOffset: -1 }
    },
    {
        key: 'active-fifteen-due-soon',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Fifteen,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.FifteenDays,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 1, dayOfMonth: 20 },
        daysToMaturity: 1,
        locationStatus: 'in_office',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: -1 }
    },
    {
        key: 'active-seven-due-today',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Seven,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Daily,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 1, dayOfMonth: 22 },
        daysToMaturity: 0,
        locationStatus: 'in_office',
        maintenanceRequired: false,
        preferredItemKind: PawnContractItemKindEnum.Electronic,
        updatedAtStrategy: { kind: 'today', dayOffset: 0 }
    },
    {
        key: 'active-thirty-due-today',
        status: 'active',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 1, dayOfMonth: 24 },
        daysToMaturity: 0,
        locationStatus: 'other',
        maintenanceRequired: false,
        preferredItemKind: 'mixed',
        updatedAtStrategy: { kind: 'today', dayOffset: 0 }
    },
    {
        key: 'extended-auction-window',
        status: 'extended',
        termDays: PawnContractTermDaysEnum.Thirty,
        paymentOptionDays: PawnContractPaymentOptionDaysEnum.Weekly,
        contractDateStrategy: { kind: 'month_offset', monthOffset: 1, dayOfMonth: 26 },
        daysToMaturity: -15,
        locationStatus: 'other',
        maintenanceRequired: true,
        preferredItemKind: 'mixed',
        updatedAtStrategy: { kind: 'today', dayOffset: 0 }
    }
];

const canUseLocalStorage = (): boolean => typeof localStorage !== 'undefined';

const padNumber = (value: number, size = 4): string => String(value).padStart(size, '0');

const createDateOnlyValue = (value: string): Date => new Date(`${value}T00:00:00Z`);

const formatDateValue = (dateValue: Date): string => dateValue.toISOString().slice(0, 10);

const addDays = (value: string, days: number): string => {
    const result = createDateOnlyValue(value);
    result.setUTCDate(result.getUTCDate() + days);
    return formatDateValue(result);
};

const addYears = (value: string, years: number): string => {
    const result = createDateOnlyValue(value);
    result.setUTCFullYear(result.getUTCFullYear() + years);
    return formatDateValue(result);
};

const buildMonthOffsetDate = (
    referenceDate: string,
    monthOffset: number,
    dayOfMonth: number,
    variant: number
): string => {
    const result = createDateOnlyValue(referenceDate);
    result.setUTCDate(1);
    result.setUTCMonth(result.getUTCMonth() - monthOffset);

    const lastDayOfMonth = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
    result.setUTCDate(Math.min(lastDayOfMonth, dayOfMonth + (variant % 4)));

    return formatDateValue(result);
};

const buildTimestamp = (dateValue: string, seed: number, baseHour = 8): string => {
    const result = createDateOnlyValue(dateValue);
    result.setUTCHours(baseHour + (seed % 7), (seed * 13) % 60, 0, 0);
    return result.toISOString().slice(0, 19).replace('T', ' ');
};

const resolveContractDate = (
    template: DemoContractTemplate,
    referenceDate: string,
    cycleIndex: number
): string => {
    switch (template.contractDateStrategy.kind) {
        case 'today':
            return referenceDate;
        case 'days_ago':
            return addDays(referenceDate, -(template.contractDateStrategy.value + (cycleIndex % 3)));
        case 'month_offset':
            return buildMonthOffsetDate(
                referenceDate,
                template.contractDateStrategy.monthOffset,
                template.contractDateStrategy.dayOfMonth,
                cycleIndex
            );
        default:
            return referenceDate;
    }
};

const resolveUpdatedAt = (
    template: DemoContractTemplate,
    contractDate: string,
    referenceDate: string,
    seed: number
): string => {
    switch (template.updatedAtStrategy.kind) {
        case 'today':
            return buildTimestamp(addDays(referenceDate, template.updatedAtStrategy.dayOffset), seed, 13);
        case 'contract_date':
            return buildTimestamp(addDays(contractDate, template.updatedAtStrategy.dayOffset), seed, 10);
        default:
            return buildTimestamp(contractDate, seed, 10);
    }
};

const resolveBranchLocationId = (status: PawnItemLocationStatusModel): number | null => {
    switch (status) {
        case 'in_office':
            return 1;
        case 'in_warehouse':
            return 2;
        default:
            return null;
    }
};

const resolveItemCatalog = (
    contractIndex: number,
    itemSequence: number,
    preferredItemKind: DemoContractTemplate['preferredItemKind']
): DemoItemCatalog => {
    if (preferredItemKind === 'mixed') {
        const targetCollection =
            itemSequence % 2 === 0 ? VEHICLE_ITEM_CATALOGS : ELECTRONIC_ITEM_CATALOGS;
        return targetCollection[(contractIndex + itemSequence) % targetCollection.length];
    }

    const targetCollection =
        preferredItemKind === PawnContractItemKindEnum.Vehicle
            ? VEHICLE_ITEM_CATALOGS
            : ELECTRONIC_ITEM_CATALOGS;
    return targetCollection[(contractIndex + itemSequence) % targetCollection.length];
};

const resolveDemoCompanySeedProfile = (companyId: number | null = null): DemoCompanySeedProfile => {
    const currentCompanyId = companyId ?? readAuthPortalStoredSession()?.company.id ?? 1;
    return DEMO_COMPANY_SEED_PROFILES.find((profile) => profile.companyId === currentCompanyId) ??
        DEMO_COMPANY_SEED_PROFILES[0];
};

const resolveDemoBranch = (
    branches: BranchesRow[],
    contractIndex: number,
    profile: DemoCompanySeedProfile
): BranchesRow => {
    const patternIndex = profile.branchPattern[contractIndex % profile.branchPattern.length];
    return branches[patternIndex] ?? branches[contractIndex % branches.length] ?? branches[0];
};

const buildCustomerName = (customerId: number, profile: DemoCompanySeedProfile): string => {
    const nameIndex = customerId - 1 + profile.customerNameOffset;
    const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor(nameIndex / FIRST_NAMES.length) % LAST_NAMES.length];
    return `${firstName} ${lastName} ${profile.companyCode}-${padNumber(customerId, 3)}`;
};

const buildIdentityNumber = (
    identityType: PawnContractIdentityTypeEnum,
    customerId: number,
    profile: DemoCompanySeedProfile
): string => {
    switch (identityType) {
        case PawnContractIdentityTypeEnum.Sim:
            return `SIM-${profile.companyCode}-${padNumber(customerId, 6)}`;
        case PawnContractIdentityTypeEnum.Kk:
            return `KK-${profile.companyCode}-${padNumber(customerId, 6)}`;
        default:
            return `${profile.identityAreaCode}${padNumber(customerId, 8)}`;
    }
};

const buildItemBlueprints = (
    contractIndex: number,
    template: DemoContractTemplate
): DemoItemBlueprint[] => {
    const itemCount = contractIndex % 4 === 0 ? 2 : 1;

    return Array.from({ length: itemCount }, (_, itemIndex) => {
        const itemSequence = itemIndex + 1;
        const catalog = resolveItemCatalog(contractIndex, itemSequence, template.preferredItemKind);
        const baseValue =
            catalog.itemKind === PawnContractItemKindEnum.Vehicle
                ? 8_500_000 + ((contractIndex + itemSequence) % 7) * 1_250_000
                : 1_250_000 + ((contractIndex + itemSequence) % 9) * 350_000;
        const appraisedValue = baseValue + itemSequence * 125_000;
        const disbursedRatio = catalog.itemKind === PawnContractItemKindEnum.Vehicle ? 0.8 : 0.76;

        return {
            catalog,
            appraisedValue,
            disbursedValue: Math.round((appraisedValue * disbursedRatio) / 50_000) * 50_000
        };
    });
};

const buildElectronicDetailValues = (
    catalog: DemoItemCatalog,
    contractId: number,
    itemSequence: number
): { first: string; second: string; third: string } => ({
    first: catalog.modelName,
    second: catalog.brandName,
    third: `${catalog.detailType.toUpperCase()}-${padNumber(contractId, 4)}-${itemSequence}`
});

const buildVehicleDetailValues = (
    catalog: DemoItemCatalog,
    contractIndex: number
): { first: string; second: string; third: string } => {
    const plateNumber = `KT ${3100 + (contractIndex % 500)} ${String.fromCharCode(65 + (contractIndex % 20))}${
        String.fromCharCode(65 + ((contractIndex + 7) % 20))
    }`;
    const colors = ['Hitam', 'Putih', 'Silver', 'Merah', 'Biru'];

    return {
        first: plateNumber,
        second: colors[contractIndex % colors.length],
        third: `${catalog.brandName.slice(0, 3).toUpperCase()}-${padNumber(contractIndex + 1, 6)}`
    };
};

const buildIssueDetails = (params: {
    currentLocationStatus: PawnItemLocationStatusModel;
    itemSequence: number;
    maintenanceRequired: boolean;
}): string | null => {
    if (params.currentLocationStatus === 'auctioned') {
        return 'Barang sudah masuk proses lelang dan perlu audit dokumen akhir.';
    }

    if (params.currentLocationStatus === 'returned') {
        return 'Barang perlu verifikasi ulang kelengkapan sebelum kembali ke kantor.';
    }

    if (params.currentLocationStatus === 'other') {
        return 'Status lokasi khusus masih menunggu update dari petugas lapangan.';
    }

    if (params.itemSequence > 1) {
        return 'Aksesori tambahan belum lengkap dan perlu dicatat ulang.';
    }

    if (params.maintenanceRequired) {
        return 'Barang perlu inspeksi berkala sebelum tindak lanjut berikutnya.';
    }

    return null;
};

const buildContractNotes = (params: {
    template: DemoContractTemplate;
    branchName: string;
    daysToMaturity: number;
}): string => {
    if (params.template.status === 'draft') {
        return `Pengajuan masih di-review oleh tim ${params.branchName}.`;
    }

    if (params.template.status === 'extended') {
        return `Kontrak hasil perpanjangan dan perlu follow up ${Math.abs(params.daysToMaturity)} hari dari sekarang.`;
    }

    if (params.template.status === 'auctioned') {
        return 'Barang sudah melewati jatuh tempo dan masuk agenda lelang.';
    }

    if (params.template.status === 'cancelled') {
        return 'Pengajuan dibatalkan setelah verifikasi akhir nasabah.';
    }

    return `Monitoring operasional aktif untuk cabang ${params.branchName}.`;
};

export const createPawnContractDemoSeedDataset = (
    referenceDate = getTodayDateValue(),
    companyId: number | null = null
): PawnContractDemoSeedDataset => {
    const profile = resolveDemoCompanySeedProfile(companyId);
    const effectiveReferenceDate = addDays(referenceDate, profile.referenceDateOffsetDays);
    const branches: BranchesRow[] = profile.branches.map((branch, index) => ({
        id: index + 1,
        ...branch,
        is_active: 1,
        created_at: buildTimestamp(addDays(effectiveReferenceDate, -30), index, 9),
        updated_at: buildTimestamp(addDays(effectiveReferenceDate, -30), index, 9)
    }));

    const customers: CustomersRow[] = [];
    const customerContacts: CustomerContactsRow[] = [];
    const customerDocuments: CustomerDocumentsRow[] = [];
    const contracts: PawnContractsRow[] = [];
    const items: PawnItemsRow[] = [];
    const accessories: PawnItemAccessoriesRow[] = [];
    const issues: PawnItemIssuesRow[] = [];
    const locationMovements: PawnItemLocationMovementsRow[] = [];
    const pendingCashTransactions: Array<Omit<BranchCashTransactionsRow, 'id'>> = [];
    const totalDisbursedByBranch = new Map<number, number>(branches.map((branch) => [branch.id, 0]));

    let nextItemId = 1;
    let nextAccessoryId = 1;
    let nextIssueId = 1;
    let nextMovementId = 1;

    for (let contractIndex = 0; contractIndex < PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT; contractIndex += 1) {
        const contractId = contractIndex + 1;
        const customerId = contractId;
        const branch = resolveDemoBranch(branches, contractIndex, profile);
        const templateIndex =
            (contractIndex + profile.templateOffset + (branch.id - 1)) % DEMO_CONTRACT_TEMPLATES.length;
        const template = DEMO_CONTRACT_TEMPLATES[templateIndex];
        const cycleIndex = Math.floor((contractIndex + profile.templateOffset) / DEMO_CONTRACT_TEMPLATES.length);
        const contractDate = resolveContractDate(template, effectiveReferenceDate, cycleIndex);
        const maturityDate = addDays(effectiveReferenceDate, template.daysToMaturity);
        const createdAt = buildTimestamp(contractDate, contractIndex, 8);
        const updatedAt = resolveUpdatedAt(template, contractDate, effectiveReferenceDate, contractIndex);
        const itemBlueprints = buildItemBlueprints(contractIndex, template);
        const appraisedValue = itemBlueprints.reduce((total, item) => total + item.appraisedValue, 0);
        const disbursedValue = itemBlueprints.reduce((total, item) => total + item.disbursedValue, 0);
        const storageFeeAmount = calculatePawnContractStorageFee({
            disbursedValue,
            marginRate: itemBlueprints[0].catalog.marginRate,
            deductionRate: itemBlueprints[0].catalog.deductionRate,
            paymentOptionDays: template.paymentOptionDays
        });
        const prepaidStoragePeriods =
            template.paymentOptionDays === PawnContractPaymentOptionDaysEnum.Daily ? 3 : 1;
        const prepaidStorageLabel = buildPawnContractPrepaidStorageLabel(prepaidStoragePeriods);
        const prepaidStorageAmount = calculatePawnContractPrepaidStorageAmount(
            storageFeeAmount,
            prepaidStoragePeriods
        );
        const administrationFeeAmount = itemBlueprints.some(
            (item) => item.catalog.itemKind === PawnContractItemKindEnum.Vehicle
        )
            ? 50_000
            : 10_000;
        const maintenanceRequired = template.maintenanceRequired ? 1 : 0;
        const customerGender =
            contractIndex % 2 === 0
                ? PawnContractCustomerGenderEnum.Male
                : PawnContractCustomerGenderEnum.Female;
        const identityTypeValues = [
            PawnContractIdentityTypeEnum.Ktp,
            PawnContractIdentityTypeEnum.Sim,
            PawnContractIdentityTypeEnum.Kk
        ];
        const identityType = identityTypeValues[contractIndex % identityTypeValues.length];
        const customerBirthDate = addDays(effectiveReferenceDate, -(9_000 + contractIndex));
        const customerCreatedAt = buildTimestamp(addDays(contractDate, -2), contractIndex, 9);

        customers.push({
            id: customerId,
            customer_code: `CUST-${profile.companyCode}-${padNumber(customerId, 4)}`,
            full_name: buildCustomerName(customerId, profile),
            gender: customerGender,
            birth_date: customerBirthDate,
            city: branch.branch_name.replace('Pawnshop ', ''),
            address: `Alamat demo nasabah ${customerId}, area ${branch.branch_name}.`,
            customer_status: 'active',
            created_at: customerCreatedAt,
            updated_at: updatedAt
        });

        customerContacts.push({
            id: customerId,
            customer_id: customerId,
            contact_type: 'phone',
            contact_value: `${profile.customerPhonePrefix}${padNumber(customerId, 6)}`,
            is_primary: 1,
            created_at: customerCreatedAt,
            updated_at: updatedAt
        });

        customerDocuments.push({
            id: customerId,
            customer_id: customerId,
            document_type: identityType,
            document_number: buildIdentityNumber(identityType, customerId, profile),
            is_primary: 1,
            issued_date: addYears(customerBirthDate, 18),
            expired_date:
                identityType === PawnContractIdentityTypeEnum.Kk
                    ? null
                    : addYears(
                          addYears(customerBirthDate, 18),
                          identityType === PawnContractIdentityTypeEnum.Sim ? 5 : 10
                      ),
            created_at: customerCreatedAt,
            updated_at: updatedAt
        });

        contracts.push({
            id: contractId,
            contract_number: `CNTR-${contractDate.slice(0, 7).replace('-', '')}-${padNumber(contractId, 4)}`,
            branch_id: branch.id,
            customer_id: customerId,
            contract_date: contractDate,
            maturity_date: maturityDate,
            term_days: template.termDays,
            appraised_value: appraisedValue,
            disbursed_value: disbursedValue,
            storage_fee_amount: storageFeeAmount,
            administration_fee_amount: administrationFeeAmount,
            payment_option_days: template.paymentOptionDays,
            amount_in_words: convertNumberToIndonesianCurrencyWords(disbursedValue),
            contract_status: template.status,
            maintenance_required: maintenanceRequired,
            maintenance_report:
                maintenanceRequired === 1
                    ? 'Perlu pemeriksaan fisik berkala dan verifikasi aksesori sebelum tindak lanjut berikutnya.'
                    : null,
            notes: buildContractNotes({
                template,
                branchName: branch.branch_name,
                daysToMaturity: template.daysToMaturity
            }),
            created_by_user_id: 1 + (branch.id % 3),
            created_at: createdAt,
            updated_at: updatedAt
        });

        totalDisbursedByBranch.set(
            branch.id,
            (totalDisbursedByBranch.get(branch.id) ?? 0) + disbursedValue
        );

        pendingCashTransactions.push({
            branch_id: branch.id,
            cash_account_id: branch.id,
            transaction_type_code: 'PAWN_DISBURSEMENT',
            reference_table: 'pawn_contracts',
            reference_id: contractId,
            entry_direction: 'credit',
            amount: disbursedValue,
            transaction_date: createdAt,
            description: `Pencairan demo ${contractId} untuk ${buildCustomerName(customerId, profile)}.`,
            created_by_user_id: 1 + (branch.id % 3),
            created_at: createdAt,
            updated_at: updatedAt
        });

        itemBlueprints.forEach((blueprint, itemIndex) => {
            const itemId = nextItemId;
            const itemSequence = itemIndex + 1;
            const detailValues =
                blueprint.catalog.itemKind === PawnContractItemKindEnum.Vehicle
                    ? buildVehicleDetailValues(blueprint.catalog, contractIndex + itemSequence)
                    : buildElectronicDetailValues(blueprint.catalog, contractId, itemSequence);
            const issueDetails = buildIssueDetails({
                currentLocationStatus: template.locationStatus,
                itemSequence,
                maintenanceRequired: maintenanceRequired === 1
            });
            const itemCreatedAt = buildTimestamp(contractDate, contractIndex + itemSequence, 9);

            items.push({
                id: itemId,
                contract_id: contractId,
                item_sequence: itemSequence,
                item_name: blueprint.catalog.itemName,
                category_id: blueprint.catalog.categoryId,
                item_type_id: blueprint.catalog.itemTypeId,
                brand_name: blueprint.catalog.brandName,
                model_name: blueprint.catalog.modelName,
                serial_number: detailValues.third,
                item_description: `Barang demo ${blueprint.catalog.itemName} untuk kontrak ${contractId}.`,
                quantity: 1,
                appraised_value: blueprint.appraisedValue,
                disbursed_value: blueprint.disbursedValue,
                condition_notes:
                    blueprint.catalog.itemKind === PawnContractItemKindEnum.Vehicle
                        ? 'Dokumen kendaraan tersedia dan kondisi fisik masih layak.'
                        : 'Unit menyala normal dan kondisi fisik masih baik.',
                missing_notes: issueDetails,
                specification_json: {
                    customer_lookup_key: `rahin-${customerId}`,
                    item_kind: blueprint.catalog.itemKind,
                    item_detail_type: blueprint.catalog.detailType,
                    item_detail_values: detailValues,
                    prepaid_storage_periods: prepaidStoragePeriods,
                    prepaid_storage_amount: prepaidStorageAmount,
                    prepaid_storage_label: prepaidStorageLabel,
                    branch_margin_rate: blueprint.catalog.marginRate,
                    branch_deduction_rate: blueprint.catalog.deductionRate
                },
                current_location_id: resolveBranchLocationId(template.locationStatus),
                current_location_status: template.locationStatus,
                created_at: itemCreatedAt,
                updated_at: updatedAt
            });

            accessories.push({
                id: nextAccessoryId,
                pawn_item_id: itemId,
                accessory_name:
                    blueprint.catalog.itemKind === PawnContractItemKindEnum.Vehicle
                        ? 'Dokumen dan kunci kendaraan'
                        : 'Kelengkapan perangkat',
                accessory_condition: itemSequence % 2 === 0 ? 'Cukup' : 'Baik',
                notes:
                    blueprint.catalog.itemKind === PawnContractItemKindEnum.Vehicle
                        ? 'STNK, kunci utama, dan fotokopi identitas tersimpan.'
                        : 'Charger atau aksesori utama tersimpan sesuai checklist petugas.',
                sort_order: 1,
                created_at: itemCreatedAt,
                updated_at: updatedAt
            });

            if (issueDetails) {
                issues.push({
                    id: nextIssueId,
                    pawn_item_id: itemId,
                    issue_name: 'Catatan inspeksi',
                    issue_details: issueDetails,
                    severity_level:
                        template.locationStatus === 'auctioned' || maintenanceRequired === 1
                            ? 'high'
                            : 'medium',
                    created_at: itemCreatedAt,
                    updated_at: updatedAt
                });
                nextIssueId += 1;
            }

            locationMovements.push({
                id: nextMovementId,
                pawn_item_id: itemId,
                from_location_id: template.locationStatus === 'in_office' ? null : 1,
                to_location_id: resolveBranchLocationId(template.locationStatus),
                from_status: template.locationStatus === 'in_office' ? null : 'in_office',
                to_status: template.locationStatus,
                moved_at: updatedAt,
                moved_by_user_id: 1 + (branch.id % 3),
                notes: `Mutasi lokasi demo untuk ${blueprint.catalog.itemName}.`,
                created_at: itemCreatedAt,
                updated_at: updatedAt
            });

            nextItemId += 1;
            nextAccessoryId += 1;
            nextMovementId += 1;
        });
    }

    const branchCashAccounts: BranchCashAccountsRow[] = branches.map((branch, index) => ({
        id: branch.id,
        branch_id: branch.id,
        account_code: `BRACASACC-${padNumber(branch.id, 3)}`,
        account_name: `Kas Operasional ${branch.branch_name.replace('Pawnshop ', '')}`,
        account_type: 'cash',
        current_balance:
            BRANCH_STARTING_BALANCE + (totalDisbursedByBranch.get(branch.id) ?? 0) + index * 2_500_000,
        is_active: 1,
        created_at: buildTimestamp(addDays(effectiveReferenceDate, -45), index, 8),
        updated_at: buildTimestamp(addDays(effectiveReferenceDate, -1), index, 9)
    }));

    const branchCashTransactions: BranchCashTransactionsRow[] = [
        ...branchCashAccounts.map((account, index) => ({
            id: index + 1,
            branch_id: account.branch_id,
            cash_account_id: account.id,
            transaction_type_code: 'CAPITAL_IN',
            reference_table: 'branches',
            reference_id: account.branch_id,
            entry_direction: 'debit',
            amount: account.current_balance + (totalDisbursedByBranch.get(account.branch_id) ?? 0),
            transaction_date: buildTimestamp(addDays(effectiveReferenceDate, -60), index, 8),
            description: `Modal awal demo untuk ${branches[index]?.branch_name ?? 'cabang'}.`,
            created_by_user_id: 1,
            created_at: buildTimestamp(addDays(effectiveReferenceDate, -60), index, 8),
            updated_at: buildTimestamp(addDays(effectiveReferenceDate, -60), index, 8)
        })),
        ...pendingCashTransactions.map((transaction, index) => ({
            id: branchCashAccounts.length + index + 1,
            ...transaction
        }))
    ];

    return {
        branches,
        branchCashAccounts,
        branchCashTransactions,
        customers,
        customerContacts,
        customerDocuments,
        contracts,
        items,
        accessories,
        issues,
        locationMovements
    };
};

const readStoredSeedVersion = (): string | null => {
    if (!canUseLocalStorage()) {
        return null;
    }

    return localStorage.getItem(`${DEMO_SEED_STORAGE_KEY}.${getFeatureStorageScope('pawn-contract')}`);
};

const writeStoredSeedVersion = (version = PAWN_CONTRACT_DEMO_DATASET_VERSION): void => {
    if (!canUseLocalStorage()) {
        return;
    }

    localStorage.setItem(
        `${DEMO_SEED_STORAGE_KEY}.${getFeatureStorageScope('pawn-contract')}`,
        version
    );
};

export const setManualSeedVersion = () => writeStoredSeedVersion('manual');
export const clearSeedVersion = () => {
    if (!canUseLocalStorage()) return;
    localStorage.removeItem(`${DEMO_SEED_STORAGE_KEY}.${getFeatureStorageScope('pawn-contract')}`);
};

export const ensurePawnContractDemoDataSeed = async (forceReseed = false): Promise<void> => {
    const currentSession = readAuthPortalStoredSession();
    if (currentSession && !isCurrentAuthPortalDemoCompany()) {
        return;
    }

    const contractRows = await pawnContractsDao.getAll();
    const storedSeedVersion = readStoredSeedVersion();

    if (storedSeedVersion === 'manual') {
        return;
    }

    const shouldReseed =
        forceReseed ||
        contractRows.length < PAWN_CONTRACT_DEMO_MIN_CONTRACT_COUNT ||
        storedSeedVersion !== PAWN_CONTRACT_DEMO_DATASET_VERSION;

    if (!shouldReseed) {
        return;
    }

    const dataset = createPawnContractDemoSeedDataset();

    await Promise.all([
        branchesDao.replaceAll(dataset.branches),
        branchCashAccountsDao.replaceAll(dataset.branchCashAccounts),
        branchCashTransactionsDao.replaceAll(dataset.branchCashTransactions),
        customersDao.replaceAll(dataset.customers),
        customerContactsDao.replaceAll(dataset.customerContacts),
        customerDocumentsDao.replaceAll(dataset.customerDocuments),
        pawnContractsDao.replaceAll(dataset.contracts),
        pawnItemsDao.replaceAll(dataset.items),
        pawnItemAccessoriesDao.replaceAll(dataset.accessories),
        pawnItemIssuesDao.replaceAll(dataset.issues),
        pawnItemLocationMovementsDao.replaceAll(dataset.locationMovements)
    ]);

    writeStoredSeedVersion();
    console.info(
        `[PawnContractDemoSeed] Seeded ${dataset.contracts.length} contracts for filter and pagination testing.`
    );
};
