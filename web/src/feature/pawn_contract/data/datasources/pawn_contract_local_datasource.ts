import { getAppModuleByKey } from '@core/data/datasources/app_module_catalog';
import {
    PawnContractIdentityTypeEnum,
    PawnContractItemKindEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import {
    getTodayDateValue,
    normalizePawnContractCustomerName,
    pawnContractIdentityOptions,
    pawnContractPaymentOptions,
    pawnContractTermOptions
} from '@core/util/pawn-contract-form';
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
import {
    branchItemSettingsDao,
    itemCategoriesDao,
    itemTypesDao,
    type BranchItemSettingsRow,
    type ItemCategoriesRow,
    type ItemTypesRow
} from '@feature/item_master/data/db';
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
import { createPawnContractDataFromRows } from '@feature/pawn_contract/data/mappers/pawn_contract.mapper';
import type {
    PawnContractDataModel,
    PawnContractBranchReferenceModel,
    PawnContractCustomerLookupModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel,
    PawnContractIdentityTypeModel,
    PawnContractItemKindModel,
    PawnContractItemPresetModel,
    PawnItemSpecificationModel,
    PawnContractItemTypeOptionModel,
    SavePawnContractPayloadModel,
    SavePawnContractResultModel
} from '@feature/pawn_contract/domain/models';
import {
    PawnContractCustomerGenderEnum as PawnContractCustomerGender
} from '@feature/pawn_contract/domain/models';

type GuideItemTypeSeed = {
    kind: PawnContractItemKindModel;
    value: string;
    label: string;
    categoryCode: string;
    categoryName: string;
    typeCode: string;
    typeName: string;
    marginRate: number;
    deductionRate: number;
};

type PawnContractFormCollections = {
    branchRows: BranchesRow[];
    cashAccountRows: BranchCashAccountsRow[];
    cashTransactionRows: BranchCashTransactionsRow[];
    customerRows: CustomersRow[];
    contactRows: CustomerContactsRow[];
    documentRows: CustomerDocumentsRow[];
    contractRows: PawnContractsRow[];
    itemRows: PawnItemsRow[];
    accessoryRows: PawnItemAccessoriesRow[];
    issueRows: PawnItemIssuesRow[];
    locationMovementRows: PawnItemLocationMovementsRow[];
    itemTypeRows: ItemTypesRow[];
    itemSettingRows: BranchItemSettingsRow[];
};

type NormalizedPawnItemSpecification = {
    customerLookupKey: string;
    itemKind: PawnContractItemKindModel | null;
    itemDetailType: string;
    itemDetailValues: {
        first: string;
        second: string;
        third: string;
    };
    prepaidStoragePeriods: number;
};

type PawnContractPersistenceResult =
    | PawnContractsRow
    | PawnItemsRow
    | PawnItemAccessoriesRow
    | PawnItemIssuesRow
    | PawnItemLocationMovementsRow
    | BranchCashAccountsRow
    | BranchCashTransactionsRow;

const createTimestamp = (): string => new Date().toISOString().slice(0, 19).replace('T', ' ');

const getNextId = <TRow extends { id: number }>(rows: TRow[]): number =>
    rows.reduce((maxValue, row) => Math.max(maxValue, row.id), 0) + 1;

const formatContractSequence = (value: number): string => String(value).padStart(4, '0');

const guideItemTypeSeeds: GuideItemTypeSeed[] = [
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'smartphone',
        label: 'Smartphone',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-SMARTPHONE',
        typeName: 'Smartphone',
        marginRate: 12,
        deductionRate: 2
    },
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'laptop',
        label: 'Laptop',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-LAPTOP',
        typeName: 'Laptop',
        marginRate: 11,
        deductionRate: 2
    },
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'kamera',
        label: 'Kamera',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-CAMERA',
        typeName: 'Kamera',
        marginRate: 10,
        deductionRate: 2
    },
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'tv',
        label: 'Televisi',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-TV',
        typeName: 'Televisi',
        marginRate: 9,
        deductionRate: 1
    },
    {
        kind: PawnContractItemKindEnum.Electronic,
        value: 'lain_lain',
        label: 'Elektronik lain',
        categoryCode: 'ELEC',
        categoryName: 'Elektronik',
        typeCode: 'ELEC-OTHER',
        typeName: 'Elektronik Lain',
        marginRate: 8,
        deductionRate: 1
    },
    {
        kind: PawnContractItemKindEnum.Vehicle,
        value: 'motor',
        label: 'Motor',
        categoryCode: 'VEH',
        categoryName: 'Kendaraan',
        typeCode: 'VEH-MOTOR',
        typeName: 'Motor',
        marginRate: 14,
        deductionRate: 4
    },
    {
        kind: PawnContractItemKindEnum.Vehicle,
        value: 'mobil',
        label: 'Mobil',
        categoryCode: 'VEH',
        categoryName: 'Kendaraan',
        typeCode: 'VEH-CAR',
        typeName: 'Mobil',
        marginRate: 13,
        deductionRate: 3
    }
];

const itemPresetMeta: Record<
    PawnContractItemKindModel,
    Pick<PawnContractItemPresetModel, 'label' | 'description' | 'administrationFeeAmount' | 'detailLabels'>
> = {
    [PawnContractItemKindEnum.Electronic]: {
        label: 'Elektronik',
        description: 'Gunakan untuk smartphone, laptop, kamera, TV, dan barang elektronik sejenis.',
        administrationFeeAmount: 10_000,
        detailLabels: {
            first: 'Tipe / seri',
            second: 'Merek',
            third: 'IMEI / nomor serial'
        }
    },
    [PawnContractItemKindEnum.Vehicle]: {
        label: 'Kendaraan',
        description: 'Gunakan untuk motor atau mobil dengan identitas kendaraan yang jelas.',
        administrationFeeAmount: 50_000,
        detailLabels: {
            first: 'Nomor polisi',
            second: 'Warna kendaraan',
            third: 'Nomor rangka'
        }
    }
};

const supportedIdentityTypes = new Set<PawnContractIdentityTypeModel>([
    PawnContractIdentityTypeEnum.Ktp,
    PawnContractIdentityTypeEnum.Sim,
    PawnContractIdentityTypeEnum.Kk
]);

export class PawnContractLocalDatasource {
    async getData(): Promise<PawnContractDataModel> {
        const [contractRows, itemRows, accessoryRows, issueRows, locationMovementRows] =
            await Promise.all([
                pawnContractsDao.getAll(),
                pawnItemsDao.getAll(),
                pawnItemAccessoriesDao.getAll(),
                pawnItemIssuesDao.getAll(),
                pawnItemLocationMovementsDao.getAll()
            ]);

        return createPawnContractDataFromRows({
            module: getAppModuleByKey('pawn-contract'),
            contractRows,
            itemRows,
            accessoryRows,
            issueRows,
            locationMovementRows
        });
    }

    async getFormReferenceData(): Promise<PawnContractFormReferenceModel> {
        await this.ensureGuideReferenceData();

        const { branchRows, cashAccountRows, customerRows, contactRows, documentRows, contractRows, itemTypeRows, itemSettingRows } =
            await this.getFormCollections();

        const activeBranchRows = branchRows.filter((row) => row.is_active === 1);
        const branches = this.buildBranchReferences(activeBranchRows, cashAccountRows);
        const defaultBranchId = branches[0]?.id ?? null;
        const customers = this.buildCustomerReferences(customerRows, contactRows, documentRows);
        const itemPresets = this.buildItemPresets(itemTypeRows, itemSettingRows, defaultBranchId);

        const defaultContractDate = getTodayDateValue();

        return {
            nextContractNumber: this.createGeneratedContractNumber(contractRows, defaultContractDate),
            defaultBranchId,
            defaultContractDate,
            termOptions: pawnContractTermOptions,
            paymentOptions: pawnContractPaymentOptions,
            identityOptions: pawnContractIdentityOptions,
            branches,
            customers,
            itemPresets
        };
    }

    async getFormValue(contractId: number): Promise<PawnContractFormValueModel> {
        await this.ensureGuideReferenceData();

        const { contractRows, itemRows, accessoryRows, issueRows, customerRows, contactRows, documentRows, itemTypeRows } =
            await this.getFormCollections();

        const contractRow = contractRows.find((row) => row.id === contractId) ?? null;
        if (!contractRow) {
            throw new Error('Data gadai yang akan diubah tidak ditemukan.');
        }

        const itemRow = itemRows.find((row) => row.contract_id === contractId) ?? null;
        if (!itemRow) {
            throw new Error('Barang jaminan untuk data gadai ini tidak ditemukan.');
        }

        const accessoryRow =
            accessoryRows.find((row) => row.pawn_item_id === itemRow.id && row.sort_order === 1) ??
            accessoryRows.find((row) => row.pawn_item_id === itemRow.id) ??
            null;
        const issueRow = issueRows.find((row) => row.pawn_item_id === itemRow.id) ?? null;
        const customerRow = customerRows.find((row) => row.id === contractRow.customer_id) ?? null;
        if (!customerRow) {
            throw new Error('Data nasabah untuk gadai ini tidak ditemukan.');
        }

        const phoneContact = this.findPhoneContactForCustomer(contactRows, customerRow.id);
        const primaryDocument = this.findPrimaryDocumentForCustomer(documentRows, customerRow.id);
        const itemSpecification = this.readItemSpecification(itemRow.specification_json);
        const guideItemType =
            this.resolveGuideItemType(itemSpecification.itemDetailType, itemSpecification.itemKind) ??
            this.resolveGuideItemTypeByItemTypeId(itemRow.item_type_id, itemTypeRows);
        const itemKind = guideItemType?.kind ?? itemSpecification.itemKind ?? PawnContractItemKindEnum.Electronic;

        return {
            contractNumber: contractRow.contract_number,
            branchId: contractRow.branch_id,
            contractDate: contractRow.contract_date,
            termDays: contractRow.term_days,
            itemName: itemRow.item_name,
            itemKind,
            itemDetailType: guideItemType?.value ?? itemSpecification.itemDetailType ?? '',
            itemDetailFirst: itemSpecification.itemDetailValues.first || itemRow.model_name || '',
            itemDetailSecond: itemSpecification.itemDetailValues.second || itemRow.brand_name || '',
            itemDetailThird: itemSpecification.itemDetailValues.third || itemRow.serial_number || '',
            accessorySummary: accessoryRow?.notes ?? itemRow.item_description ?? itemRow.condition_notes ?? '',
            issueSummary: issueRow?.issue_details ?? itemRow.missing_notes ?? contractRow.maintenance_report ?? '',
            appraisedValue: contractRow.appraised_value,
            disbursedValue: contractRow.disbursed_value,
            paymentOptionDays: contractRow.payment_option_days ?? pawnContractPaymentOptions[0].value,
            prepaidStoragePeriods: itemSpecification.prepaidStoragePeriods,
            customerLookupKey: itemSpecification.customerLookupKey || `rahin-${customerRow.id}`,
            customerFullName: customerRow.full_name,
            customerGender:
                customerRow.gender === PawnContractCustomerGender.Female
                    ? PawnContractCustomerGender.Female
                    : PawnContractCustomerGender.Male,
            customerAddress: customerRow.address ?? '',
            customerCity: customerRow.city ?? '',
            customerPhone: phoneContact?.contact_value ?? '',
            customerIdentityType:
                (primaryDocument?.document_type as PawnContractFormValueModel['customerIdentityType'] | undefined) ??
                PawnContractIdentityTypeEnum.Ktp,
            customerIdentityNumber: primaryDocument?.document_number ?? '',
            customerBirthDate: customerRow.birth_date ?? '2000-01-01'
        };
    }

    async saveContract(payload: SavePawnContractPayloadModel): Promise<SavePawnContractResultModel> {
        await this.ensureGuideReferenceData();

        const {
            branchRows,
            cashAccountRows,
            cashTransactionRows,
            customerRows,
            contactRows,
            documentRows,
            contractRows,
            itemRows,
            accessoryRows,
            issueRows,
            locationMovementRows,
            itemTypeRows,
            itemSettingRows
        } = await this.getFormCollections();

        const timestamp = createTimestamp();
        const existingContract = payload.contractId
            ? contractRows.find((row) => row.id === payload.contractId) ?? null
            : null;

        if (payload.contractId && !existingContract) {
            throw new Error('Data gadai yang akan diperbarui tidak ditemukan.');
        }

        const targetBranch = branchRows.find((row) => row.id === payload.branchId && row.is_active === 1) ?? null;
        if (!targetBranch) {
            throw new Error('Cabang aktif untuk data gadai ini tidak ditemukan.');
        }

        const targetCashAccount = this.findBranchCashAccount(cashAccountRows, payload.branchId);
        if (!targetCashAccount) {
            throw new Error('Saldo cabang tidak bisa dicek karena akun kas aktif belum tersedia.');
        }

        const previousCashAccount =
            existingContract && existingContract.branch_id !== payload.branchId
                ? this.findBranchCashAccount(cashAccountRows, existingContract.branch_id)
                : null;

        if (existingContract && existingContract.branch_id !== payload.branchId && !previousCashAccount) {
            throw new Error('Akun kas lama untuk data gadai ini tidak ditemukan.');
        }

        const previousDisbursedValue = existingContract?.disbursed_value ?? 0;
        const sameBranch = existingContract?.branch_id === payload.branchId;
        const requiredBalance = sameBranch
            ? Math.max(0, payload.disbursedValue - previousDisbursedValue)
            : payload.disbursedValue;

        if (targetCashAccount.current_balance < requiredBalance) {
            throw new Error('Saldo cabang tidak mencukupi untuk pencairan data gadai ini.');
        }

        const normalizedCustomerName = normalizePawnContractCustomerName(payload.customerFullName);
        const currentCustomer = existingContract
            ? customerRows.find((row) => row.id === existingContract.customer_id) ?? null
            : null;
        const matchedCustomer =
            customerRows.find((row) => normalizePawnContractCustomerName(row.full_name) === normalizedCustomerName) ?? null;

        let customerId = currentCustomer?.id ?? matchedCustomer?.id ?? 0;
        let usedExistingCustomer = currentCustomer !== null || matchedCustomer !== null;

        if (currentCustomer && (!matchedCustomer || matchedCustomer.id === currentCustomer.id)) {
            const updatedCustomer: CustomersRow = {
                ...currentCustomer,
                full_name: payload.customerFullName.trim(),
                gender: payload.customerGender,
                birth_date: payload.customerBirthDate,
                city: payload.customerCity.trim(),
                address: payload.customerAddress.trim(),
                updated_at: timestamp
            };

            const currentContact = this.findPhoneContactForCustomer(contactRows, currentCustomer.id);
            const currentDocument = this.findPrimaryDocumentForCustomer(documentRows, currentCustomer.id);

            const updatedContact: CustomerContactsRow = {
                id: currentContact?.id ?? getNextId(contactRows),
                customer_id: currentCustomer.id,
                contact_type: 'phone',
                contact_value: payload.customerPhone.trim(),
                is_primary: 1,
                created_at: currentContact?.created_at ?? timestamp,
                updated_at: timestamp
            };

            const updatedDocument: CustomerDocumentsRow = {
                id: currentDocument?.id ?? getNextId(documentRows),
                customer_id: currentCustomer.id,
                document_type: payload.customerIdentityType,
                document_number: payload.customerIdentityNumber.trim(),
                is_primary: 1,
                issued_date: currentDocument?.issued_date ?? payload.contractDate,
                expired_date: currentDocument?.expired_date ?? null,
                created_at: currentDocument?.created_at ?? timestamp,
                updated_at: timestamp
            };

            customerId = currentCustomer.id;

            await Promise.all([
                customersDao.upsert(updatedCustomer),
                customerContactsDao.upsert(updatedContact),
                customerDocumentsDao.upsert(updatedDocument)
            ]);
        } else if (matchedCustomer) {
            customerId = matchedCustomer.id;
        } else {
            const nextCustomerId = getNextId(customerRows);
            const newCustomer: CustomersRow = {
                id: nextCustomerId,
                customer_code: `CUST-${String(nextCustomerId).padStart(4, '0')}`,
                full_name: payload.customerFullName.trim(),
                gender: payload.customerGender,
                birth_date: payload.customerBirthDate,
                city: payload.customerCity.trim(),
                address: payload.customerAddress.trim(),
                customer_status: 'active',
                created_at: timestamp,
                updated_at: timestamp
            };

            const newContact: CustomerContactsRow = {
                id: getNextId(contactRows),
                customer_id: nextCustomerId,
                contact_type: 'phone',
                contact_value: payload.customerPhone.trim(),
                is_primary: 1,
                created_at: timestamp,
                updated_at: timestamp
            };

            const newDocument: CustomerDocumentsRow = {
                id: getNextId(documentRows),
                customer_id: nextCustomerId,
                document_type: payload.customerIdentityType,
                document_number: payload.customerIdentityNumber.trim(),
                is_primary: 1,
                issued_date: payload.contractDate,
                expired_date: null,
                created_at: timestamp,
                updated_at: timestamp
            };

            customerId = nextCustomerId;
            usedExistingCustomer = false;

            await Promise.all([
                customersDao.upsert(newCustomer),
                customerContactsDao.upsert(newContact),
                customerDocumentsDao.upsert(newDocument)
            ]);
        }

        const selectedGuideType = this.resolveGuideItemType(payload.itemDetailType, payload.itemKind);
        const selectedTypeRow = selectedGuideType
            ? itemTypeRows.find((row) => row.type_code === selectedGuideType.typeCode) ?? null
            : null;
        const selectedSettingRow = selectedTypeRow
            ? itemSettingRows.find((row) => row.branch_id === payload.branchId && row.item_type_id === selectedTypeRow.id) ?? null
            : null;

        const contractId = existingContract?.id ?? getNextId(contractRows);
        const existingItem = itemRows.find((row) => row.contract_id === contractId) ?? null;
        const existingAccessory =
            existingItem
                ? accessoryRows.find((row) => row.pawn_item_id === existingItem.id && row.sort_order === 1) ??
                  accessoryRows.find((row) => row.pawn_item_id === existingItem.id) ??
                  null
                : null;
        const existingIssue = existingItem ? issueRows.find((row) => row.pawn_item_id === existingItem.id) ?? null : null;
        const existingLocationMovement = existingItem
            ? locationMovementRows.find((row) => row.pawn_item_id === existingItem.id) ?? null
            : null;
        const existingCashTransaction = this.findContractCashTransaction(cashTransactionRows, contractId);

        const contractRow: PawnContractsRow = {
            id: contractId,
            contract_number: payload.contractNumber,
            branch_id: payload.branchId,
            customer_id: customerId,
            contract_date: payload.contractDate,
            maturity_date: payload.maturityDate,
            term_days: payload.termDays,
            appraised_value: payload.appraisedValue,
            disbursed_value: payload.disbursedValue,
            storage_fee_amount: payload.storageFeeAmount,
            administration_fee_amount: payload.administrationFeeAmount,
            payment_option_days: payload.paymentOptionDays,
            amount_in_words: payload.amountInWords,
            contract_status: existingContract?.contract_status ?? 'active',
            maintenance_required: payload.issueSummary.trim() ? 1 : 0,
            maintenance_report: payload.issueSummary.trim(),
            notes: this.buildContractNote(payload),
            created_by_user_id: existingContract?.created_by_user_id ?? 1,
            created_at: existingContract?.created_at ?? timestamp,
            updated_at: timestamp
        };

        const itemId = existingItem?.id ?? getNextId(itemRows);
        const itemRow: PawnItemsRow = {
            id: itemId,
            contract_id: contractId,
            item_sequence: existingItem?.item_sequence ?? 1,
            item_name: payload.itemName.trim(),
            category_id: selectedTypeRow?.category_id ?? null,
            item_type_id: selectedTypeRow?.id ?? null,
            brand_name: payload.itemDetailSecond.trim(),
            model_name: payload.itemDetailFirst.trim(),
            serial_number: payload.itemDetailThird.trim(),
            item_description: payload.accessorySummary.trim(),
            quantity: existingItem?.quantity ?? 1,
            appraised_value: payload.appraisedValue,
            disbursed_value: payload.disbursedValue,
            condition_notes: payload.accessorySummary.trim(),
            missing_notes: payload.issueSummary.trim(),
            specification_json: {
                customer_lookup_key: payload.customerLookupKey,
                item_kind: payload.itemKind,
                item_detail_type: payload.itemDetailType,
                item_detail_values: {
                    first: payload.itemDetailFirst.trim(),
                    second: payload.itemDetailSecond.trim(),
                    third: payload.itemDetailThird.trim()
                },
                prepaid_storage_periods: payload.prepaidStoragePeriods,
                prepaid_storage_amount: payload.prepaidStorageAmount,
                prepaid_storage_label: payload.prepaidStoragePeriodLabel,
                branch_margin_rate: selectedSettingRow?.margin_rate ?? selectedGuideType?.marginRate ?? null,
                branch_deduction_rate: selectedSettingRow?.deduction_rate ?? selectedGuideType?.deductionRate ?? null
            },
            current_location_id: existingItem?.current_location_id ?? null,
            current_location_status: existingItem?.current_location_status ?? 'in_office',
            created_at: existingItem?.created_at ?? timestamp,
            updated_at: timestamp
        };

        const accessoryRow: PawnItemAccessoriesRow = {
            id: existingAccessory?.id ?? getNextId(accessoryRows),
            pawn_item_id: itemId,
            accessory_name: existingAccessory?.accessory_name ?? 'Ringkasan kelengkapan',
            accessory_condition: existingAccessory?.accessory_condition ?? 'Sesuai keterangan petugas',
            notes: payload.accessorySummary.trim(),
            sort_order: existingAccessory?.sort_order ?? 1,
            created_at: existingAccessory?.created_at ?? timestamp,
            updated_at: timestamp
        };

        const issueRow: PawnItemIssuesRow = {
            id: existingIssue?.id ?? getNextId(issueRows),
            pawn_item_id: itemId,
            issue_name: existingIssue?.issue_name ?? 'Catatan kekurangan barang',
            issue_details: payload.issueSummary.trim(),
            severity_level: payload.issueSummary.trim().length > 120 ? 'high' : 'medium',
            created_at: existingIssue?.created_at ?? timestamp,
            updated_at: timestamp
        };

        const locationMovementRow: PawnItemLocationMovementsRow = existingLocationMovement ?? {
            id: getNextId(locationMovementRows),
            pawn_item_id: itemId,
            from_location_id: null,
            to_location_id: null,
            from_status: null,
            to_status: 'in_office',
            moved_at: timestamp,
            moved_by_user_id: 1,
            notes: 'Barang langsung tercatat berada di kantor saat data gadai dibuat.',
            created_at: timestamp,
            updated_at: timestamp
        };

        const updatedTargetCashAccount: BranchCashAccountsRow = {
            ...targetCashAccount,
            current_balance: sameBranch
                ? targetCashAccount.current_balance - (payload.disbursedValue - previousDisbursedValue)
                : targetCashAccount.current_balance - payload.disbursedValue,
            updated_at: timestamp
        };

        const updatedPreviousCashAccount =
            previousCashAccount && existingContract
                ? {
                      ...previousCashAccount,
                      current_balance: previousCashAccount.current_balance + existingContract.disbursed_value,
                      updated_at: timestamp
                  }
                : null;

        const cashTransactionRow: BranchCashTransactionsRow = {
            id: existingCashTransaction?.id ?? getNextId(cashTransactionRows),
            branch_id: payload.branchId,
            cash_account_id: targetCashAccount.id,
            transaction_type_code: existingCashTransaction?.transaction_type_code ?? 'PAWN_DISBURSEMENT',
            reference_table: 'pawn_contracts',
            reference_id: contractId,
            entry_direction: 'credit',
            amount: payload.disbursedValue,
            transaction_date: timestamp,
            description: `Pencairan gadai ${payload.contractNumber} untuk ${payload.customerFullName.trim()}.`,
            created_by_user_id: existingCashTransaction?.created_by_user_id ?? 1,
            created_at: existingCashTransaction?.created_at ?? timestamp,
            updated_at: timestamp
        };

        const operations: Array<Promise<PawnContractPersistenceResult>> = [
            pawnContractsDao.upsert(contractRow),
            pawnItemsDao.upsert(itemRow),
            pawnItemAccessoriesDao.upsert(accessoryRow),
            pawnItemIssuesDao.upsert(issueRow),
            branchCashAccountsDao.upsert(updatedTargetCashAccount),
            branchCashTransactionsDao.upsert(cashTransactionRow)
        ];

        if (!existingLocationMovement) {
            operations.push(pawnItemLocationMovementsDao.upsert(locationMovementRow));
        }

        if (updatedPreviousCashAccount) {
            operations.push(branchCashAccountsDao.upsert(updatedPreviousCashAccount));
        }

        await Promise.all(operations);

        return {
            contractId,
            contractNumber: contractRow.contract_number,
            customerId,
            customerName: payload.customerFullName.trim(),
            branchId: targetBranch.id,
            branchName: targetBranch.branch_name,
            disbursedValue: payload.disbursedValue,
            remainingBalance: updatedTargetCashAccount.current_balance,
            usedExistingCustomer
        };
    }

    private async getFormCollections(): Promise<PawnContractFormCollections> {
        const [
            branchRows,
            cashAccountRows,
            cashTransactionRows,
            customerRows,
            contactRows,
            documentRows,
            contractRows,
            itemRows,
            accessoryRows,
            issueRows,
            locationMovementRows,
            itemTypeRows,
            itemSettingRows
        ] = await Promise.all([
            branchesDao.getAll(),
            branchCashAccountsDao.getAll(),
            branchCashTransactionsDao.getAll(),
            customersDao.getAll(),
            customerContactsDao.getAll(),
            customerDocumentsDao.getAll(),
            pawnContractsDao.getAll(),
            pawnItemsDao.getAll(),
            pawnItemAccessoriesDao.getAll(),
            pawnItemIssuesDao.getAll(),
            pawnItemLocationMovementsDao.getAll(),
            itemTypesDao.getAll(),
            branchItemSettingsDao.getAll()
        ]);

        return {
            branchRows,
            cashAccountRows,
            cashTransactionRows,
            customerRows,
            contactRows,
            documentRows,
            contractRows,
            itemRows,
            accessoryRows,
            issueRows,
            locationMovementRows,
            itemTypeRows,
            itemSettingRows
        };
    }

    private findBranchCashAccount(
        cashAccountRows: BranchCashAccountsRow[],
        branchId: number
    ): BranchCashAccountsRow | null {
        return cashAccountRows.find((row) => row.branch_id === branchId && row.is_active === 1) ?? null;
    }

    private findContractCashTransaction(
        cashTransactionRows: BranchCashTransactionsRow[],
        contractId: number
    ): BranchCashTransactionsRow | null {
        return (
            cashTransactionRows.find(
                (row) =>
                    row.reference_table === 'pawn_contracts' &&
                    row.reference_id === contractId &&
                    row.transaction_type_code === 'PAWN_DISBURSEMENT'
            ) ?? null
        );
    }

    private findPhoneContactForCustomer(
        contactRows: CustomerContactsRow[],
        customerId: number
    ): CustomerContactsRow | null {
        return (
            contactRows.find((row) => row.customer_id === customerId && row.contact_type === 'phone' && row.is_primary === 1) ??
            contactRows.find((row) => row.customer_id === customerId && row.contact_type === 'phone') ??
            null
        );
    }

    private findPrimaryDocumentForCustomer(
        documentRows: CustomerDocumentsRow[],
        customerId: number
    ): CustomerDocumentsRow | null {
        return (
            documentRows.find(
                (row) =>
                    row.customer_id === customerId &&
                    supportedIdentityTypes.has(row.document_type as PawnContractIdentityTypeModel) &&
                    row.is_primary === 1
            ) ??
            documentRows.find(
                (row) =>
                    row.customer_id === customerId &&
                    supportedIdentityTypes.has(row.document_type as PawnContractIdentityTypeModel)
            ) ??
            null
        );
    }

    private resolveGuideItemType(
        itemDetailType: string,
        itemKind: PawnContractItemKindModel | null
    ): GuideItemTypeSeed | null {
        if (!itemDetailType || !itemKind) {
            return null;
        }

        return guideItemTypeSeeds.find((item) => item.value === itemDetailType && item.kind === itemKind) ?? null;
    }

    private resolveGuideItemTypeByItemTypeId(
        itemTypeId: number | null,
        itemTypeRows: ItemTypesRow[]
    ): GuideItemTypeSeed | null {
        if (itemTypeId === null) {
            return null;
        }

        const itemTypeRow = itemTypeRows.find((row) => row.id === itemTypeId) ?? null;
        if (!itemTypeRow) {
            return null;
        }

        return guideItemTypeSeeds.find((seed) => seed.typeCode === itemTypeRow.type_code) ?? null;
    }

    private readItemSpecification(specification: PawnItemSpecificationModel | null): NormalizedPawnItemSpecification {
        const itemDetailValues = specification?.item_detail_values;
        const rawItemKind = specification?.item_kind;

        return {
            customerLookupKey: typeof specification?.customer_lookup_key === 'string' ? specification.customer_lookup_key : '',
            itemKind:
                rawItemKind === PawnContractItemKindEnum.Electronic || rawItemKind === PawnContractItemKindEnum.Vehicle
                    ? rawItemKind
                    : null,
            itemDetailType: typeof specification?.item_detail_type === 'string' ? specification.item_detail_type : '',
            itemDetailValues: {
                first: typeof itemDetailValues?.first === 'string' ? itemDetailValues.first : '',
                second: typeof itemDetailValues?.second === 'string' ? itemDetailValues.second : '',
                third: typeof itemDetailValues?.third === 'string' ? itemDetailValues.third : ''
            },
            prepaidStoragePeriods:
                typeof specification?.prepaid_storage_periods === 'number' && Number.isFinite(specification.prepaid_storage_periods)
                    ? specification.prepaid_storage_periods
                    : 0
        };
    }

    private buildBranchReferences(
        branchRows: BranchesRow[],
        cashAccountRows: BranchCashAccountsRow[]
    ): PawnContractBranchReferenceModel[] {
        const references: PawnContractBranchReferenceModel[] = [];

        branchRows.forEach((branchRow) => {
            const primaryCashAccount =
                cashAccountRows.find((row) => row.branch_id === branchRow.id && row.is_active === 1) ?? null;

            if (!primaryCashAccount) {
                return;
            }

            references.push({
                id: branchRow.id,
                branchCode: branchRow.branch_code,
                branchName: branchRow.branch_name,
                branchPhoneNumber: branchRow.phone_number,
                availableBalance: primaryCashAccount.current_balance,
                primaryCashAccountId: primaryCashAccount.id
            });
        });

        return references;
    }

    private buildCustomerReferences(
        customerRows: CustomersRow[],
        contactRows: CustomerContactsRow[],
        documentRows: CustomerDocumentsRow[]
    ): PawnContractCustomerLookupModel[] {
        return customerRows.map((customerRow) => {
            const phoneContact = this.findPhoneContactForCustomer(contactRows, customerRow.id);
            const primaryDocument = this.findPrimaryDocumentForCustomer(documentRows, customerRow.id);

            return {
                id: customerRow.id,
                customerCode: customerRow.customer_code,
                fullName: customerRow.full_name,
                gender:
                    customerRow.gender === PawnContractCustomerGender.Female
                        ? PawnContractCustomerGender.Female
                        : PawnContractCustomerGender.Male,
                birthDate: customerRow.birth_date,
                city: customerRow.city ?? '',
                address: customerRow.address ?? '',
                phoneNumber: phoneContact?.contact_value ?? '',
                identityType: (primaryDocument?.document_type as PawnContractIdentityTypeModel | undefined) ?? null,
                identityNumber: primaryDocument?.document_number ?? null
            };
        });
    }

    private buildItemPresets(
        itemTypeRows: ItemTypesRow[],
        itemSettingRows: BranchItemSettingsRow[],
        defaultBranchId: number | null
    ): Record<PawnContractItemKindModel, PawnContractItemPresetModel> {
        const result = {
            [PawnContractItemKindEnum.Electronic]: {
                kind: PawnContractItemKindEnum.Electronic,
                ...itemPresetMeta[PawnContractItemKindEnum.Electronic],
                defaultDetailValue: 'smartphone',
                detailOptions: [] as PawnContractItemTypeOptionModel[]
            },
            [PawnContractItemKindEnum.Vehicle]: {
                kind: PawnContractItemKindEnum.Vehicle,
                ...itemPresetMeta[PawnContractItemKindEnum.Vehicle],
                defaultDetailValue: 'motor',
                detailOptions: [] as PawnContractItemTypeOptionModel[]
            }
        } satisfies Record<PawnContractItemKindModel, PawnContractItemPresetModel>;

        guideItemTypeSeeds.forEach((seed) => {
            const itemTypeRow = itemTypeRows.find((row) => row.type_code === seed.typeCode) ?? null;
            const itemSettingRow =
                defaultBranchId !== null && itemTypeRow
                    ? itemSettingRows.find((row) => row.branch_id === defaultBranchId && row.item_type_id === itemTypeRow.id) ?? null
                    : null;

            result[seed.kind].detailOptions.push({
                value: seed.value,
                label: seed.label,
                categoryId: itemTypeRow?.category_id ?? null,
                itemTypeId: itemTypeRow?.id ?? null,
                marginRate: itemSettingRow?.margin_rate ?? seed.marginRate,
                deductionRate: itemSettingRow?.deduction_rate ?? seed.deductionRate
            });
        });

        return result;
    }

    private createGeneratedContractNumber(contractRows: PawnContractsRow[], currentDate: string): string {
        const prefix = `CNTR-${currentDate.slice(0, 7).replace('-', '')}-`;
        const maxSequence = contractRows
            .filter((row) => row.contract_number.startsWith(prefix))
            .map((row) => Number(row.contract_number.slice(prefix.length)))
            .filter((value) => Number.isFinite(value))
            .reduce((maxValue, value) => Math.max(maxValue, value), 0);

        return `${prefix}${formatContractSequence(maxSequence + 1)}`;
    }

    private buildContractNote(payload: SavePawnContractPayloadModel): string {
        return [
            `Biaya titip dibayar di muka: ${payload.prepaidStoragePeriods} periode.`,
            `Rentang periode: ${payload.prepaidStoragePeriodLabel}.`,
            `Total biaya titip dibayar di muka: ${payload.prepaidStorageAmount}.`,
            `Key nasabah lokal: ${payload.customerLookupKey}.`
        ].join(' ');
    }

    private async ensureGuideReferenceData(): Promise<void> {
        const timestamp = createTimestamp();
        const [branchRows, categoryRows, itemTypeRows, itemSettingRows] = await Promise.all([
            branchesDao.getAll(),
            itemCategoriesDao.getAll(),
            itemTypesDao.getAll(),
            branchItemSettingsDao.getAll()
        ]);

        const activeBranchIds = branchRows.filter((row) => row.is_active === 1).map((row) => row.id);
        let nextCategoryId = getNextId(categoryRows);
        let nextItemTypeId = getNextId(itemTypeRows);
        let nextSettingId = getNextId(itemSettingRows);

        const categoryMap = new Map<string, ItemCategoriesRow>();
        categoryRows.forEach((row) => categoryMap.set(row.category_code, row));

        for (const seed of guideItemTypeSeeds) {
            let categoryRow = categoryMap.get(seed.categoryCode) ?? null;
            if (!categoryRow) {
                categoryRow = {
                    id: nextCategoryId++,
                    category_code: seed.categoryCode,
                    category_name: seed.categoryName,
                    created_at: timestamp,
                    updated_at: timestamp
                };
                categoryRows.push(categoryRow);
                categoryMap.set(seed.categoryCode, categoryRow);
                await itemCategoriesDao.upsert(categoryRow);
            }

            let itemTypeRow = itemTypeRows.find((row) => row.type_code === seed.typeCode) ?? null;
            if (!itemTypeRow) {
                itemTypeRow = {
                    id: nextItemTypeId++,
                    category_id: categoryRow.id,
                    type_code: seed.typeCode,
                    type_name: seed.typeName,
                    created_at: timestamp,
                    updated_at: timestamp
                };
                itemTypeRows.push(itemTypeRow);
                await itemTypesDao.upsert(itemTypeRow);
            }

            for (const branchId of activeBranchIds) {
                const existingSetting = itemSettingRows.find(
                    (row) => row.branch_id === branchId && row.item_type_id === itemTypeRow?.id
                );
                if (existingSetting) {
                    continue;
                }

                const newSetting: BranchItemSettingsRow = {
                    id: nextSettingId++,
                    branch_id: branchId,
                    item_type_id: itemTypeRow.id,
                    margin_rate: seed.marginRate,
                    deduction_rate: seed.deductionRate,
                    effective_from: getTodayDateValue(),
                    effective_until: null,
                    created_at: timestamp,
                    updated_at: timestamp
                };
                itemSettingRows.push(newSetting);
                await branchItemSettingsDao.upsert(newSetting);
            }
        }
    }
}
