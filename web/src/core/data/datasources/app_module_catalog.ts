import type { AppModuleSummary, AppNavigationItem } from '@core/domain/interfaces/app_module.interface';
import {
    pawnContractIndexNavigationItems
} from '@feature/pawn_contract/util/pawn_contract_index_navigation';

export const appNavigationItems: AppNavigationItem[] = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        route: '/dashboard',
        icon: 'bi-grid-1x2-fill',
        caption: 'Ringkasan data & transaksi'
    },
    {
        key: 'gadai',
        label: 'Gadai',
        icon: 'bi-safe2',
        caption: 'Kelola data gadai',
        children: [
            {
                key: 'gadai-buat-data',
                label: 'Buat Data',
                route: '/pawn-contracts/create',
                icon: 'bi-pencil-square',
                caption: 'Buka formulir gadai baru'
            },
            {
                key: 'gadai-lihat-data',
                label: 'Lihat Data',
                route: '/pawn-contracts/list',
                icon: 'bi-table',
                caption: 'Lihat daftar data gadai',
                children: pawnContractIndexNavigationItems
            }
        ]
    }
];

const flattenNavigationItems = (items: AppNavigationItem[]): AppNavigationItem[] =>
    items.flatMap((item) => (item.children?.length ? [item, ...flattenNavigationItems(item.children)] : [item]));

export const appModules: AppModuleSummary[] = [
    {
        key: 'master-branch',
        title: 'Master Branch',
        shortTitle: 'Branch',
        route: '/branches',
        icon: 'bi-diagram-3-fill',
        phase: 'Fase 1',
        status: 'foundation_ready',
        summary: 'Kelola cabang operasional dan lokasi penyimpanan barang per cabang.',
        goals: [
            'Menyiapkan master data cabang sebagai fondasi semua transaksi.',
            'Menentukan lokasi penyimpanan barang yang terhubung ke cabang.',
            'Menyediakan detail cabang yang siap dipakai modul lain.'
        ],
        mainTables: ['branches', 'storage_locations'],
        childResources: ['storage_locations'],
        entities: [
            {
                key: 'branches',
                label: 'Branches',
                tableName: 'branches',
                role: 'primary',
                description: 'Data identitas cabang, kode, nomor, alamat, telepon, dan status aktif.',
                columns: ['branch_code', 'branch_number', 'branch_name', 'phone_number', 'is_active']
            },
            {
                key: 'storage_locations',
                label: 'Storage Locations',
                tableName: 'storage_locations',
                role: 'child',
                description: 'Lokasi penyimpanan barang per cabang, seperti office, warehouse, atau lokasi lain.',
                columns: ['branch_id', 'location_code', 'location_name', 'location_type', 'is_active']
            }
        ],
        nextSteps: [
            'Bangun CRUD cabang.',
            'Hubungkan lokasi penyimpanan sebagai child resource di detail cabang.',
            'Siapkan dipakai oleh modul pawn contract dan branch finance.'
        ]
    },
    {
        key: 'customer',
        title: 'Customer',
        shortTitle: 'Customer',
        route: '/customers',
        icon: 'bi-people-fill',
        phase: 'Fase 2',
        status: 'foundation_ready',
        summary: 'Kelola nasabah, dokumen identitas, dan kontak sebagai dasar transaksi gadai.',
        goals: [
            'Menyimpan master data nasabah dengan status aktif/inactive/blocked.',
            'Memisahkan dokumen dan kontak sebagai child resource.',
            'Menyiapkan lookup customer saat membuat kontrak gadai.'
        ],
        mainTables: ['customers'],
        childResources: ['customer_documents', 'customer_contacts'],
        entities: [
            {
                key: 'customers',
                label: 'Customers',
                tableName: 'customers',
                role: 'primary',
                description: 'Profil nasabah dengan kode customer, nama, gender, status, alamat, dan kota.',
                columns: ['customer_code', 'full_name', 'gender', 'birth_date', 'customer_status']
            },
            {
                key: 'customer_documents',
                label: 'Customer Documents',
                tableName: 'customer_documents',
                role: 'child',
                description: 'Dokumen identitas nasabah seperti KTP, SIM, atau dokumen pendukung lain.',
                columns: ['customer_id', 'document_type', 'document_number', 'is_primary', 'expired_date']
            },
            {
                key: 'customer_contacts',
                label: 'Customer Contacts',
                tableName: 'customer_contacts',
                role: 'child',
                description: 'Kontak nasabah seperti telepon, email, atau kontak lain.',
                columns: ['customer_id', 'contact_type', 'contact_value', 'is_primary']
            }
        ],
        nextSteps: [
            'Bangun halaman list, detail, dan form customer.',
            'Letakkan dokumen dan kontak dalam sub section di halaman detail.',
            'Siapkan picker customer untuk flow kontrak.'
        ]
    },
    {
        key: 'item-master',
        title: 'Item Master',
        shortTitle: 'Items',
        route: '/item-masters',
        icon: 'bi-gem',
        phase: 'Fase 3',
        status: 'foundation_ready',
        summary: 'Kelola kategori barang, tipe barang, dan pengaturan margin per cabang.',
        goals: [
            'Menyiapkan klasifikasi barang agar appraisal lebih konsisten.',
            'Menyimpan aturan margin dan deduction per cabang.',
            'Menjadi acuan input barang gadai di kontrak.'
        ],
        mainTables: ['item_categories', 'item_types', 'branch_item_settings'],
        childResources: ['branch_item_settings'],
        entities: [
            {
                key: 'item_categories',
                label: 'Item Categories',
                tableName: 'item_categories',
                role: 'primary',
                description: 'Kategori utama barang seperti emas, elektronik, kendaraan, dan lainnya.',
                columns: ['category_code', 'category_name']
            },
            {
                key: 'item_types',
                label: 'Item Types',
                tableName: 'item_types',
                role: 'primary',
                description: 'Tipe barang detail yang berada di bawah kategori.',
                columns: ['category_id', 'type_code', 'type_name']
            },
            {
                key: 'branch_item_settings',
                label: 'Branch Item Settings',
                tableName: 'branch_item_settings',
                role: 'child',
                description: 'Aturan margin dan deduction per tipe barang di masing-masing cabang.',
                columns: ['branch_id', 'item_type_id', 'margin_rate', 'deduction_rate', 'effective_from']
            }
        ],
        nextSteps: [
            'Bangun CRUD kategori dan tipe barang.',
            'Bangun form setting item per cabang.',
            'Hubungkan setting ini ke kalkulasi kontrak gadai.'
        ]
    },
    {
        key: 'pawn-contract',
        title: 'Pawn Contract',
        shortTitle: 'Contracts',
        route: '/pawn-contracts',
        icon: 'bi-journal-check',
        phase: 'Fase 4',
        status: 'in_progress',
        summary: 'Core business feature untuk membuat, melihat, dan mengelola kontrak gadai beserta barangnya.',
        goals: [
            'Membangun form kontrak gadai dengan relasi customer dan branch.',
            'Menyimpan item gadai, accessory, issue, dan lokasi barang.',
            'Menjadi sumber utama untuk payment, extension, dan auction.'
        ],
        mainTables: ['pawn_contracts', 'pawn_items'],
        childResources: ['pawn_item_accessories', 'pawn_item_issues', 'pawn_item_location_movements'],
        entities: [
            {
                key: 'pawn_contracts',
                label: 'Pawn Contracts',
                tableName: 'pawn_contracts',
                role: 'primary',
                description: 'Header kontrak gadai: nomor kontrak, cabang, nasabah, nilai appraisal, pencairan, dan status kontrak.',
                columns: ['contract_number', 'branch_id', 'customer_id', 'contract_date', 'contract_status']
            },
            {
                key: 'pawn_items',
                label: 'Pawn Items',
                tableName: 'pawn_items',
                role: 'primary',
                description: 'Barang yang digadaikan dalam kontrak, termasuk deskripsi, tipe, quantity, appraisal, dan lokasi.',
                columns: ['contract_id', 'item_sequence', 'item_name', 'item_type_id', 'current_location_status']
            },
            {
                key: 'pawn_item_accessories',
                label: 'Pawn Item Accessories',
                tableName: 'pawn_item_accessories',
                role: 'child',
                description: 'Daftar aksesori atau kelengkapan barang gadai.',
                columns: ['pawn_item_id', 'accessory_name', 'accessory_condition', 'sort_order']
            },
            {
                key: 'pawn_item_issues',
                label: 'Pawn Item Issues',
                tableName: 'pawn_item_issues',
                role: 'child',
                description: 'Catatan kerusakan atau issue pada barang gadai.',
                columns: ['pawn_item_id', 'issue_name', 'issue_details', 'severity_level']
            },
            {
                key: 'pawn_item_location_movements',
                label: 'Pawn Item Location Movements',
                tableName: 'pawn_item_location_movements',
                role: 'child',
                description: 'Riwayat perpindahan barang antar lokasi dan perubahan status lokasi.',
                columns: ['pawn_item_id', 'from_location_id', 'to_location_id', 'moved_at', 'to_status']
            }
        ],
        nextSteps: [
            'Bangun list dan detail kontrak.',
            'Pisahkan VM kontrak ke state/getters/setters/actions/persistence/calculations.',
            'Siapkan child form item, accessories, issues, dan movement.'
        ]
    },
    {
        key: 'pawn-transaction',
        title: 'Transaksi Gadai',
        shortTitle: 'Transactions',
        route: '/pawn-transactions',
        icon: 'bi-cash-stack',
        phase: 'Fase 5',
        status: 'planned',
        summary: 'Kelola pembayaran, perpanjangan kontrak, dan transaksi lelang.',
        goals: [
            'Menyimpan seluruh pembayaran yang terkait dengan kontrak.',
            'Mencatat perpanjangan jatuh tempo beserta biaya tambahan.',
            'Mencatat transaksi lelang dan refund jika ada.'
        ],
        mainTables: ['contract_payments', 'contract_extensions', 'auction_transactions'],
        childResources: [],
        entities: [
            {
                key: 'contract_payments',
                label: 'Contract Payments',
                tableName: 'contract_payments',
                role: 'primary',
                description: 'Catatan pembayaran per kontrak termasuk amount, tipe pembayaran, dan reference.',
                columns: ['contract_id', 'payment_type', 'payment_reference', 'amount', 'payment_date']
            },
            {
                key: 'contract_extensions',
                label: 'Contract Extensions',
                tableName: 'contract_extensions',
                role: 'primary',
                description: 'Riwayat perpanjangan kontrak, tanggal jatuh tempo lama dan baru, serta biaya extension.',
                columns: ['contract_id', 'extension_date', 'new_maturity_date', 'extension_fee_amount']
            },
            {
                key: 'auction_transactions',
                label: 'Auction Transactions',
                tableName: 'auction_transactions',
                role: 'primary',
                description: 'Transaksi lelang kontrak yang tidak ditebus, termasuk nilai lelang dan refund.',
                columns: ['contract_id', 'auction_date', 'auction_sale_amount', 'refund_amount']
            }
        ],
        nextSteps: [
            'Buat flow pembayaran dari detail kontrak.',
            'Buat form extension dan lelang terpisah.',
            'Hubungkan ke perubahan status kontrak.'
        ]
    },
    {
        key: 'branch-finance',
        title: 'Branch Finance',
        shortTitle: 'Finance',
        route: '/branch-finance',
        icon: 'bi-bank2',
        phase: 'Fase 6',
        status: 'planned',
        summary: 'Kontrol kas cabang, transaksi kas, hutang cabang, dan transfer antar cabang.',
        goals: [
            'Mengelola akun kas dan saldo cabang.',
            'Mencatat transaksi debit atau credit terkait aktivitas cabang.',
            'Mencatat hutang dan pembayaran hutang antar pihak terkait.'
        ],
        mainTables: ['branch_cash_accounts', 'branch_cash_transactions', 'branch_debts', 'inter_branch_transfers'],
        childResources: ['branch_debt_payments'],
        entities: [
            {
                key: 'branch_cash_accounts',
                label: 'Branch Cash Accounts',
                tableName: 'branch_cash_accounts',
                role: 'primary',
                description: 'Akun kas atau rekening cabang lengkap dengan saldo terkini.',
                columns: ['branch_id', 'account_code', 'account_name', 'account_type', 'current_balance']
            },
            {
                key: 'branch_cash_transactions',
                label: 'Branch Cash Transactions',
                tableName: 'branch_cash_transactions',
                role: 'primary',
                description: 'Mutasi debit atau credit kas cabang dengan referensi transaksi sumber.',
                columns: ['branch_id', 'cash_account_id', 'transaction_type_code', 'entry_direction', 'amount']
            },
            {
                key: 'branch_debts',
                label: 'Branch Debts',
                tableName: 'branch_debts',
                role: 'primary',
                description: 'Data hutang cabang beserta outstanding, due date, dan status.',
                columns: ['branch_id', 'debt_source_type', 'principal_amount', 'outstanding_amount', 'debt_status']
            },
            {
                key: 'branch_debt_payments',
                label: 'Branch Debt Payments',
                tableName: 'branch_debt_payments',
                role: 'child',
                description: 'Riwayat pembayaran hutang cabang.',
                columns: ['debt_id', 'payment_date', 'amount', 'notes']
            },
            {
                key: 'inter_branch_transfers',
                label: 'Inter Branch Transfers',
                tableName: 'inter_branch_transfers',
                role: 'primary',
                description: 'Transfer dana antar cabang lengkap dengan status draft, sent, received, atau cancelled.',
                columns: ['source_branch_id', 'target_branch_id', 'transfer_number', 'amount', 'transfer_status']
            }
        ],
        nextSteps: [
            'Bangun dashboard finansial cabang.',
            'Siapkan jurnal mutasi kas berbasis transaksi.',
            'Hubungkan debt payment dan inter-branch transfer ke akun kas.'
        ]
    },
    {
        key: 'master-investor',
        title: 'Master Investor',
        shortTitle: 'Investors',
        route: '/investors',
        icon: 'bi-pie-chart-fill',
        phase: 'Fase 7',
        status: 'planned',
        summary: 'Kelola investor, relasi kepemilikan cabang, dan mutasi modal investor.',
        goals: [
            'Menyimpan identitas investor.',
            'Mencatat porsi kepemilikan investor di cabang dalam periode tertentu.',
            'Mencatat transaksi modal investor per cabang.'
        ],
        mainTables: ['investors', 'branch_investors', 'investor_capital_transactions'],
        childResources: ['branch_investors'],
        entities: [
            {
                key: 'investors',
                label: 'Investors',
                tableName: 'investors',
                role: 'primary',
                description: 'Data investor lengkap dengan kode, nama, telepon, alamat, dan status aktif.',
                columns: ['investor_code', 'full_name', 'phone_number', 'address', 'is_active']
            },
            {
                key: 'branch_investors',
                label: 'Branch Investors',
                tableName: 'branch_investors',
                role: 'child',
                description: 'Relasi investor dengan cabang beserta ownership percentage, periode, dan flag primary.',
                columns: ['branch_id', 'investor_id', 'ownership_percentage', 'start_date', 'is_primary']
            },
            {
                key: 'investor_capital_transactions',
                label: 'Investor Capital Transactions',
                tableName: 'investor_capital_transactions',
                role: 'primary',
                description: 'Mutasi modal investor per cabang dan keterkaitannya dengan transfer cabang.',
                columns: ['investor_id', 'branch_id', 'transaction_type_code', 'transaction_date', 'amount']
            }
        ],
        nextSteps: [
            'Bangun master investor dan detail cabang investor.',
            'Tambahkan riwayat modal investor.',
            'Integrasikan dengan branch finance dan transfer.'
        ]
    },
    {
        key: 'auth-access',
        title: 'Auth Access',
        shortTitle: 'Access',
        route: '/access-control',
        icon: 'bi-shield-lock-fill',
        phase: 'Fase 8',
        status: 'planned',
        summary: 'Kelola user, role, assignment cabang, dan sesi login.',
        goals: [
            'Menyiapkan kontrol akses per user dan role.',
            'Mengelola assignment user ke cabang tertentu.',
            'Mencatat sesi login sebagai dasar audit dan keamanan.'
        ],
        mainTables: ['users', 'roles', 'user_roles', 'user_branch_assignments', 'login_sessions'],
        childResources: ['user_roles', 'user_branch_assignments', 'login_sessions'],
        entities: [
            {
                key: 'users',
                label: 'Users',
                tableName: 'users',
                role: 'primary',
                description: 'Pengguna aplikasi dengan username, hash password, email, dan status aktif.',
                columns: ['username', 'full_name', 'email', 'phone_number', 'is_active']
            },
            {
                key: 'roles',
                label: 'Roles',
                tableName: 'roles',
                role: 'primary',
                description: 'Definisi role yang dapat dipetakan ke user.',
                columns: ['role_code', 'role_name']
            },
            {
                key: 'user_roles',
                label: 'User Roles',
                tableName: 'user_roles',
                role: 'child',
                description: 'Pemetaan many-to-many user dan role.',
                columns: ['user_id', 'role_id']
            },
            {
                key: 'user_branch_assignments',
                label: 'User Branch Assignments',
                tableName: 'user_branch_assignments',
                role: 'child',
                description: 'Assignment user ke cabang tertentu dan primary branch flag.',
                columns: ['user_id', 'branch_id', 'is_primary', 'assigned_at', 'unassigned_at']
            },
            {
                key: 'login_sessions',
                label: 'Login Sessions',
                tableName: 'login_sessions',
                role: 'support',
                description: 'Riwayat sesi login lengkap dengan token, IP, user agent, dan status session.',
                columns: ['user_id', 'session_token', 'ip_address', 'login_at', 'session_status']
            }
        ],
        nextSteps: [
            'Bangun master user dan role.',
            'Tambahkan branch assignment per user.',
            'Buat screen monitoring login sessions.'
        ]
    },
    {
        key: 'support',
        title: 'Support',
        shortTitle: 'Support',
        route: '/support',
        icon: 'bi-bell-fill',
        phase: 'Fase 9',
        status: 'planned',
        summary: 'Menyediakan notifikasi sistem dan audit trail aktivitas aplikasi.',
        goals: [
            'Menyimpan notifikasi yang dapat ditandai sudah dibaca.',
            'Membangun audit log untuk perubahan entity penting.',
            'Menjadi dasar monitoring operasional dan support.'
        ],
        mainTables: ['notifications', 'audit_logs'],
        childResources: [],
        entities: [
            {
                key: 'notifications',
                label: 'Notifications',
                tableName: 'notifications',
                role: 'primary',
                description: 'Notifikasi yang dapat dikaitkan ke branch, customer, atau contract tertentu.',
                columns: ['branch_id', 'customer_id', 'contract_id', 'notification_type', 'is_read']
            },
            {
                key: 'audit_logs',
                label: 'Audit Logs',
                tableName: 'audit_logs',
                role: 'primary',
                description: 'Catatan audit perubahan entity lengkap dengan action, ip, metadata, dan user.',
                columns: ['user_id', 'entity_type', 'entity_id', 'action_type', 'action_at']
            }
        ],
        nextSteps: [
            'Bangun inbox notifikasi.',
            'Bangun halaman audit logs dengan filter entity dan action.',
            'Siapkan hook logging dari feature lain ke audit trail.'
        ]
    }
];

export const getAppModules = (): AppModuleSummary[] => appModules;

export const getAppNavigationItems = (): AppNavigationItem[] => appNavigationItems;

export const getAppModuleByKey = (key: string): AppModuleSummary => {
    const module = appModules.find((item) => item.key === key);
    if (!module) {
        throw new Error(`Unknown app module: ${key}`);
    }
    return module;
};

export const getAppModuleByRoute = (path: string): AppModuleSummary | undefined =>
    appModules.find((item) => path === item.route || path.startsWith(`${item.route}/`));

export const getAppNavigationItemByRoute = (path: string): AppNavigationItem | undefined =>
    flattenNavigationItems(appNavigationItems).find(
        (item) => item.route !== undefined && (path === item.route || path.startsWith(`${item.route}/`))
    );
