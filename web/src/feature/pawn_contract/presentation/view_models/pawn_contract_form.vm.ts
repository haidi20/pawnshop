import { computed, watch } from 'vue';
import { defineStore } from 'pinia';

import {
    PawnContractCustomerGenderEnum,
    PawnContractFormModeEnum,
    PawnContractItemKindEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import { unwrapEitherOrThrow } from '@core/util/either';
import { showErrorMessage, showSuccessMessage } from '@core/util/alert';
import { SETTING_KEY_VEHICLE_DAILY_DISABLED } from '@core/data/datasources/setting_local_datasource';
import {
    buildPawnContractPrepaidStorageLabel,
    calculatePawnContractMaturityDate,
    calculatePawnContractPrepaidStorageAmount,
    calculatePawnContractStorageFee,
    convertNumberToIndonesianCurrencyWords,
    formatCurrencyForHumans,
    formatDateForHumans,
    getAvailablePawnContractPaymentOptions,
    getPawnContractPrepaidStorageOptions
} from '@core/util/pawn-contract-form';
import router from '@core/presentation/routes';
import type {
    PawnContractCustomerLookupModel,
    PawnContractFormReferenceModel,
    PawnContractFormValueModel
} from '@feature/pawn_contract/domain/models';
import type {
    PawnContractFormFieldName,
    PawnContractFormFieldUpdater
} from '@feature/pawn_contract/presentation/models/pawn_contract_form_ui.model';
import {
    validatePawnContractForm,
    validatePawnContractSavePayload
} from '@feature/pawn_contract/presentation/validations/pawn_contract_form.validation';
import { pawnContractRepository } from '@feature/pawn_contract/presentation/di/pawn_contract.di';
import {
    createPawnContractCustomerLookupKey,
    createInitialPawnContractFormFieldErrors,
    createInitialPawnContractTouchedFields,
    createPawnContractFormState,
    guideItemTypeSeeds,
    itemPresetMeta
} from '@feature/pawn_contract/presentation/view_models/pawn_contract_form.state';
import {
    buildPawnContractCustomerSuggestions,
    buildPawnContractFinalConfirmation,
    buildPawnContractSummaryConfirmation,
    buildSaveFailureMessage,
    buildSavePawnContractPayload,
    buildSaveSuccessMessage,
    buildStepOneValidationErrors,
    buildStepTwoValidationErrors,
    createCustomerLookupFormPatch,
    createDefaultPawnContractFormValue,
    createErrorMessage,
    createPawnContractItemDetailPlaceholders,
    createStepOneAutoInsertPatch,
    createStepOneAutoInsertSnapshot,
    createStepTwoAutoInsertPatch,
    createStepTwoAutoInsertSnapshot,
    createPawnContractRouteContext,
    findMatchedPawnContractCustomer,
    PawnContractCustomerLookupFieldEnum,
    pawnContractStepOneAutoInsertFieldNames,
    pawnContractStepOneFieldNames,
    pawnContractStepTwoAutoInsertFieldNames,
    pawnContractStepTwoFieldNames,
    resolveValidItemDetailType,
    resolveValidPaymentOptionDays,
    resolveValidPrepaidStoragePeriods
} from '@feature/pawn_contract/presentation/view_models/pawn_contract_form.vm.utils';

export const pawnContractFormViewModel = defineStore('pawnContractFormStore', () => {
    /**
     * State utama formulir yang berisi data kontrak, nasabah, dan status UI.
     * Diinisialisasi menggunakan createPawnContractFormState.
     */
    const state = createPawnContractFormState();

    /**
     * Memformat angka nominal ke format mata uang Rupiah (misal: Rp 1.000.000).
     */
    const formatCurrency = (value: number): string => formatCurrencyForHumans(value);

    /**
     * Memformat string tanggal YYYY-MM-DD ke format Indonesia (misal: 14 Maret 2026).
     */
    const formatDate = (value: string): string => formatDateForHumans(value);

    /**
     * Menentukan apakah formulir sedang dalam mode Ubah (Edit) atau Buat Baru (Create).
     */
    const isEditMode = computed(() => state.mode.value === PawnContractFormModeEnum.Edit);

    /**
     * Label indikator proses pemuatan data (Loading) berdasarkan mode.
     */
    const loadingTitle = computed(() => (isEditMode.value ? 'Menyiapkan formulir gadai' : 'Menyiapkan formulir gadai baru'));

    /**
     * Teks kecil di atas judul (Eyebrow) halaman.
     */
    const pageEyebrow = computed(() => (isEditMode.value ? 'Ubah data gadai' : 'Buat data gadai'));

    /**
     * Judul utama halaman formulir.
     */
    const pageTitle = computed(() =>
        isEditMode.value ? 'Form gadai yang siap diperbarui' : 'Form gadai baru yang ringkas dan jelas'
    );

    /**
     * Penjelasan singkat di bawah judul utama halaman.
     */
    const pageSubtitle = computed(() =>
        isEditMode.value
            ? 'Perbarui data gadai, cek kembali hitungan biaya, lalu simpan perubahan setelah konfirmasi.'
            : 'Isi data gadai, cek hitungan biaya secara otomatis, lalu simpan kontrak setelah konfirmasi.'
    );

    /**
     * Label pada tombol submit utama yang berubah statur saat sedang proses menyimpan.
     */
    const submitButtonLabel = computed(() => {
        if (state.isSubmitting.value) {
            return isEditMode.value ? 'Menyimpan perubahan data gadai...' : 'Menyimpan data gadai...';
        }

        return isEditMode.value ? 'Simpan perubahan data gadai' : 'Proses dan simpan data gadai';
    });

    /**
     * Daftar preset barang yang tersedia (Elektronik & Kendaraan) dari metadata.
     */
    const itemPresetList = computed(() =>
        state.referenceData.value
            ? [
                state.referenceData.value.itemPresets[PawnContractItemKindEnum.Electronic],
                state.referenceData.value.itemPresets[PawnContractItemKindEnum.Vehicle]
            ]
            : []
    );

    /**
     * Mengambil konfigurasi preset (biaya admin, margin) berdasarkan itemKind yang dipilih.
     */
    const currentPreset = computed(() => state.referenceData.value?.itemPresets[state.form.itemKind] ?? null);

    /**
     * Detail opsi barang spesifik (misal: Smartphone, Laptop) berdasarkan itemDetailType.
     */
    const selectedDetailOption = computed(
        () => currentPreset.value?.detailOptions.find((option) => option.value === state.form.itemDetailType) ?? null
    );

    /**
     * Daftar placeholder teks bantuan untuk input detail barang.
     */
    const itemDetailPlaceholders = computed(() =>
        createPawnContractItemDetailPlaceholders({
            itemKind: state.form.itemKind,
            itemDetailType: state.form.itemDetailType,
            detailLabels: currentPreset.value?.detailLabels ?? null
        })
    );
    /**
     * Mengambil data cabang yang terpilih berdasarkan branchId di form.
     */
    const selectedBranch = computed(
        () => state.referenceData.value?.branches.find((branch) => branch.id === state.form.branchId) ?? null
    );
    /**
     * Mencari data nasabah lama berdasarkan Nama Lengkap yang sedang diketik.
     */
    const matchedCustomerByName = computed(() =>
        state.referenceData.value
            ? findMatchedPawnContractCustomer({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerFullName,
                field: PawnContractCustomerLookupFieldEnum.FullName
            })
            : null
    );
    /**
     * Mencari data nasabah lama berdasarkan Nomor Telepon yang sedang diketik.
     */
    const matchedCustomerByPhone = computed(() =>
        state.referenceData.value
            ? findMatchedPawnContractCustomer({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerPhone,
                field: PawnContractCustomerLookupFieldEnum.PhoneNumber
            })
            : null
    );
    /**
     * Mencari data nasabah lama berdasarkan Nomor Identitas (KTP/SIM) yang sedang diketik.
     */
    const matchedCustomerByIdentityNumber = computed(() =>
        state.referenceData.value
            ? findMatchedPawnContractCustomer({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerIdentityNumber,
                field: PawnContractCustomerLookupFieldEnum.IdentityNumber
            })
            : null
    );
    /**
     * Menggabungkan hasil pencarian nasabah. Prioritas: Identitas > Telepon > Nama.
     */
    const matchedCustomer = computed(
        () => matchedCustomerByIdentityNumber.value ?? matchedCustomerByPhone.value ?? matchedCustomerByName.value
    );
    /**
     * Memberikan saran nama nasabah yang mirip saat petugas mengetik.
     */
    const customerNameSuggestions = computed(() =>
        state.referenceData.value
            ? buildPawnContractCustomerSuggestions({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerFullName,
                field: PawnContractCustomerLookupFieldEnum.FullName
            })
            : []
    );
    /**
     * Memberikan saran nomor telepon yang mirip saat petugas mengetik.
     */
    const customerPhoneSuggestions = computed(() =>
        state.referenceData.value
            ? buildPawnContractCustomerSuggestions({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerPhone,
                field: PawnContractCustomerLookupFieldEnum.PhoneNumber
            })
            : []
    );
    /**
     * Memberikan saran nomor identitas yang mirip saat petugas mengetik.
     */
    const customerIdentityNumberSuggestions = computed(() =>
        state.referenceData.value
            ? buildPawnContractCustomerSuggestions({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerIdentityNumber,
                field: PawnContractCustomerLookupFieldEnum.IdentityNumber
            })
            : []
    );
    /**
     * Pesan bantuan di UI berdasarkan status temuan data nasabah lama.
     */
    const customerLookupMessage = computed(() =>
        matchedCustomer.value
            ? 'Data nasabah lama ditemukan dan seluruh formulir akan dipakai otomatis.'
            : customerNameSuggestions.value.length > 0 ||
                customerPhoneSuggestions.value.length > 0 ||
                customerIdentityNumberSuggestions.value.length > 0
                ? 'Pilih salah satu saran nama, telepon, atau identitas untuk memuat data nasabah lama.'
                : 'Jika data belum ada, sistem akan membuat data nasabah baru.'
    );
    /**
     * Opsi skema pembayaran (Harian, 7 hari, 15 hari) yang tersedia untuk tenor & jenis barang saat ini.
     */
    const availablePaymentOptions = computed(() =>
        getAvailablePawnContractPaymentOptions(state.form.termDays, state.isVehicleDailyDisabled.value ? state.form.itemKind : undefined)
    );
    /**
     * Menghitung tanggal jatuh tempo (Maturity Date) berdasarkan tanggal mulai dan tenor.
     */
    const maturityDate = computed(() => calculatePawnContractMaturityDate(state.form.contractDate, state.form.termDays));
    /**
     * Nominal biaya admin tetap berdasarkan jenis barang (misal: 10rb / 50rb).
     */
    const administrationFeeAmount = computed(() => currentPreset.value?.administrationFeeAmount ?? 0);
    /**
     * RUMUS UTAMA: Menghitung nominal biaya titip per-periode secara otomatis.
     */
    const storageFeeAmount = computed(() =>
        calculatePawnContractStorageFee({
            disbursedValue: state.form.disbursedValue,
            marginRate: selectedDetailOption.value?.marginRate ?? 0,
            deductionRate: selectedDetailOption.value?.deductionRate ?? 0,
            paymentOptionDays: state.form.paymentOptionDays
        })
    );
    /**
     * Berapa kali periode yang boleh dibayar di muka berdasarkan tenor dan skema.
     */
    const prepaidStorageOptions = computed(() =>
        getPawnContractPrepaidStorageOptions(state.form.termDays, state.form.paymentOptionDays)
    );
    /**
     * Opsi skema pembayaran yang sedang dipilih aktif.
     */
    const selectedPaymentOption = computed(
        () => availablePaymentOptions.value.find((option) => option.value === state.form.paymentOptionDays) ?? null
    );
    /**
     * Total nominal yang harus dibayar di muka (Biaya Titip * Jumlah Periode).
     */
    const prepaidStorageAmount = computed(() =>
        calculatePawnContractPrepaidStorageAmount(storageFeeAmount.value, state.form.prepaidStoragePeriods)
    );
    /**
     * Label rentang periode (misal: "0 - 4") untuk ditampilkan di ringkasan.
     */
    const prepaidStoragePeriodLabel = computed(() =>
        buildPawnContractPrepaidStorageLabel(state.form.prepaidStoragePeriods)
    );
    /**
     * JUMLAH BERSIH: Nominal yang akhirnya diterima nasabah (Pencairan - Admin - Titip di muka).
     */
    const customerReceivedAmount = computed(() =>
        Math.max(0, state.form.disbursedValue - prepaidStorageAmount.value - administrationFeeAmount.value)
    );
    /**
     * Mengubah nominal pencairan ke dalam teks terbilang bahasa Indonesia.
     */
    const amountInWords = computed(() => convertNumberToIndonesianCurrencyWords(state.form.disbursedValue));
    /**
     * Mengubah nilai taksiran ke dalam teks terbilang bahasa Indonesia.
     */
    const appraisedValueInWords = computed(() => convertNumberToIndonesianCurrencyWords(state.form.appraisedValue));
    /**
     * Label jenis kelamin nasabah untuk konfirmasi.
     */
    const customerGenderLabel = computed(() =>
        state.form.customerGender === PawnContractCustomerGenderEnum.Female ? 'Perempuan' : 'Laki-laki'
    );
    /**
     * Estimasi sisa saldo cabang setelah uang pencairan dikeluarkan.
     */
    const projectedRemainingBalance = computed(
        () => (selectedBranch.value?.availableBalance ?? 0) - state.form.disbursedValue
    );
    /**
     * Membangun struktur data untuk modal konfirmasi ringkasan (Step 1).
     */
    const stepConfirmationData = computed(() =>
        buildPawnContractSummaryConfirmation({
            form: state.form,
            selectedBranchName: selectedBranch.value?.branchName ?? null,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null,
            maturityDate: maturityDate.value,
            currentPresetLabel: currentPreset.value?.label ?? null,
            currentPresetDetailLabels: currentPreset.value?.detailLabels ?? null,
            selectedDetailOptionLabel: selectedDetailOption.value?.label ?? null,
            selectedDetailMarginRate: selectedDetailOption.value?.marginRate ?? null,
            selectedDetailDeductionRate: selectedDetailOption.value?.deductionRate ?? null,
            selectedPaymentOptionLabel: selectedPaymentOption.value?.label ?? null,
            selectedPaymentOptionHelper: selectedPaymentOption.value?.helper ?? null,
            storageFeeAmount: storageFeeAmount.value,
            prepaidStorageAmount: prepaidStorageAmount.value,
            prepaidStoragePeriodLabel: prepaidStoragePeriodLabel.value,
            administrationFeeAmount: administrationFeeAmount.value,
            customerReceivedAmount: customerReceivedAmount.value,
            amountInWords: amountInWords.value,
            projectedRemainingBalance: projectedRemainingBalance.value,
            formatCurrency,
            formatDate
        })
    );

    /**
     * Membangun struktur data untuk modal konfirmasi akhir sebelum simpan (Step 2).
     */
    const submitConfirmationData = computed(() =>
        buildPawnContractFinalConfirmation({
            form: state.form,
            selectedBranchName: selectedBranch.value?.branchName ?? null,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null,
            maturityDate: maturityDate.value,
            currentPresetLabel: currentPreset.value?.label ?? null,
            currentPresetDetailLabels: currentPreset.value?.detailLabels ?? null,
            selectedDetailOptionLabel: selectedDetailOption.value?.label ?? null,
            selectedDetailMarginRate: selectedDetailOption.value?.marginRate ?? null,
            selectedDetailDeductionRate: selectedDetailOption.value?.deductionRate ?? null,
            selectedPaymentOptionLabel: selectedPaymentOption.value?.label ?? null,
            selectedPaymentOptionHelper: selectedPaymentOption.value?.helper ?? null,
            storageFeeAmount: storageFeeAmount.value,
            prepaidStorageAmount: prepaidStorageAmount.value,
            prepaidStoragePeriodLabel: prepaidStoragePeriodLabel.value,
            administrationFeeAmount: administrationFeeAmount.value,
            customerReceivedAmount: customerReceivedAmount.value,
            amountInWords: amountInWords.value,
            projectedRemainingBalance: projectedRemainingBalance.value,
            formatCurrency,
            formatDate,
            customerLookupMessage: customerLookupMessage.value,
            customerGenderLabel: customerGenderLabel.value,
            hasEnoughBalance: hasEnoughBalance.value
        })
    );

    /**
     * Cek apakah saldo cabang mencukupi untuk nominal pencairan yang diminta.
     */
    const hasEnoughBalance = computed(() => projectedRemainingBalance.value >= 0);

    /**
     * Validasi: Dana pencairan tidak boleh melebihi nilai taksiran barang.
     */
    const hasDisbursedValueExceedingAppraisedValue = computed(
        () => state.form.appraisedValue > 0 && state.form.disbursedValue > state.form.appraisedValue
    );

    /**
     * Validasi: Cek apakah input dana pencairan valid terhadap saldo cabang.
     */
    const hasInsufficientBranchBalance = computed(
        () => state.form.branchId > 0 && state.form.disbursedValue > 0 && !hasEnoughBalance.value
    );

    /**
     * Menentukan apakah proses simpan harus diblokir karena ada masalah saldo atau nilai.
     */
    const isProcessingBlocked = computed(
        () => hasDisbursedValueExceedingAppraisedValue.value || hasInsufficientBranchBalance.value
    );

    /**
     * Mengatur pesan error tingkat tinggi untuk halaman.
     */
    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    /**
     * Mengatur pesan error spesifik saat proses submit gagal.
     */
    const setSubmitError = (message: string | null): void => {
        state.submitError.value = message;
    };

    /**
     * Mengembalikan daftar semua nama field yang ada di form (untuk iterasi validasi).
     */
    const getAllFieldNames = (): PawnContractFormFieldName[] =>
        Object.keys(state.fieldErrors) as PawnContractFormFieldName[];

    /**
     * Mereset seluruh status validasi (error & touched) kembali ke kondisi awal.
     */
    const resetValidationState = (): void => {
        Object.assign(state.fieldErrors, createInitialPawnContractFormFieldErrors());
        Object.assign(state.touchedFields, createInitialPawnContractTouchedFields());
    };

    /**
     * Mereset status fitur Auto-Insert (Step 1) kembali ke awal.
     */
    const resetStepOneAutoInsertState = (): void => {
        state.isStepOneAutoInsertEnabled.value = false;
        state.stepOneAutoInsertSnapshot.value = null;
    };

    /**
     * Mereset status fitur Auto-Insert (Step 2) kembali ke awal.
     */
    const resetStepTwoAutoInsertState = (): void => {
        state.isStepTwoAutoInsertEnabled.value = false;
        state.stepTwoAutoInsertSnapshot.value = null;
    };

    /**
     * Melakukan validasi internal terhadap seluruh isi form saat ini.
     */
    const getCurrentFormValidationResult = () =>
        validatePawnContractForm({
            form: state.form,
            currentPreset: currentPreset.value,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null
        });

    /**
     * Melakukan refresh tampilan pesan error berdasarkan field yang sudah pernah disentuh (touched).
     */
    const refreshDisplayedValidation = (): void => {
        const validationResult = getCurrentFormValidationResult();

        for (const field of getAllFieldNames()) {
            state.fieldErrors[field] = state.touchedFields[field] ? validationResult.fieldErrors[field] ?? null : null;
        }
    };

    /**
     * Menandai field tertentu sebagai 'sudah disentuh/diisi' agar validasinya muncul.
     */
    const markFieldsAsTouched = (fields: PawnContractFormFieldName[]): void => {
        for (const field of fields) {
            state.touchedFields[field] = true;
        }

        refreshDisplayedValidation();
    };

    /**
     * Membaca parameter rute (ID Kontrak) dan menentukan mode formulir (Ubah/Baru).
     */
    const applyRouteContext = (contractId?: unknown): void => {
        const routeContext = createPawnContractRouteContext(contractId ?? router.currentRoute.value.params.contractId);
        state.mode.value = routeContext.mode;
        state.currentContractId.value = routeContext.contractId;
    };

    /**
     * Membersihkan status navigasi dan modal (dikembalikan ke langkah 1).
     */
    const resetProgressState = (): void => {
        state.activeStep.value = 1;
        state.lastAutofilledCustomerId.value = null;
        state.isValidationModalOpen.value = false;
        state.validationErrorMessages.value = [];
        state.isStepConfirmationModalOpen.value = false;
        state.isSubmitConfirmationModalOpen.value = false;
    };

    /**
     * Menerapkan data referensi (cabang, nasabah, dll) ke dalam form sebagai nilai awal.
     */
    const applyReferenceDefaults = (referenceData: PawnContractFormReferenceModel): void => {
        Object.assign(
            state.form,
            createDefaultPawnContractFormValue({
                referenceData,
                createCustomerLookupKey: createPawnContractCustomerLookupKey
            })
        );
        resetProgressState();
        resetValidationState();
        resetStepOneAutoInsertState();
        resetStepTwoAutoInsertState();
    };

    /**
     * Memasukkan data mentah hasil load dari database ke dalam state form.
     */
    const applyLoadedFormValue = (formValue: PawnContractFormValueModel): void => {
        Object.assign(state.form, formValue);
        resetProgressState();
        resetValidationState();
        resetStepOneAutoInsertState();
        resetStepTwoAutoInsertState();
    };

    /**
     * Mengisi detail data nasabah ke form berdasarkan hasil pencarian nasabah lama.
     */
    const applyCustomerLookup = (customer: PawnContractCustomerLookupModel): void => {
        Object.assign(state.form, createCustomerLookupFormPatch(customer));
        refreshDisplayedValidation();
    };

    /**
     * Fungsi utama untuk memperbarui nilai satu field di form sekaligus memicu validasi.
     */
    const updateFormField: PawnContractFormFieldUpdater = (field, value): void => {
        state.form[field] = value;
        state.touchedFields[field] = true;
        refreshDisplayedValidation();
    };

    /**
     * Mengaktifkan atau menonaktifkan fitur Auto-Insert (Step 1).
     * Jika diaktifkan, field yang relevan akan diisi secara otomatis untuk membantu petugas.
     * Jika dimatikan, nilai akan dikembalikan ke kondisi sebelum Auto-Insert aktif.
     */
    const setStepOneAutoInsertEnabled = (enabled: boolean): void => {
        if (!state.referenceData.value || enabled === state.isStepOneAutoInsertEnabled.value) {
            return;
        }

        if (enabled) {
            // Simpan snapshot data saat ini sebelum ditimpa oleh auto-insert
            state.stepOneAutoInsertSnapshot.value = createStepOneAutoInsertSnapshot({
                form: state.form,
                touchedFields: state.touchedFields
            });

            // Terapkan perubahan auto-insert
            Object.assign(
                state.form,
                createStepOneAutoInsertPatch({
                    form: state.form,
                    referenceData: state.referenceData.value,
                    currentPreset: currentPreset.value,
                    itemDetailPlaceholders: itemDetailPlaceholders.value,
                    availablePaymentOptions: availablePaymentOptions.value,
                    prepaidStorageOptions: prepaidStorageOptions.value
                })
            );

            markFieldsAsTouched(pawnContractStepOneAutoInsertFieldNames);
            state.isStepOneAutoInsertEnabled.value = true;
            return;
        }

        // Kembalikan ke snapshot semula
        if (state.stepOneAutoInsertSnapshot.value) {
            Object.assign(state.form, state.stepOneAutoInsertSnapshot.value.values);
            Object.assign(state.touchedFields, state.stepOneAutoInsertSnapshot.value.touchedFields);
        }

        state.isStepOneAutoInsertEnabled.value = false;
        state.stepOneAutoInsertSnapshot.value = null;
        refreshDisplayedValidation();
    };

    /**
     * Mengatur apakah skema Harian untuk Kendaraan di-disable atau tidak.
     */
    const setVehicleDailyDisabled = (disabled: boolean): void => {
        state.isVehicleDailyDisabled.value = disabled;

        // Persist ke local DB via repository
        void pawnContractRepository.setSettingBoolean(SETTING_KEY_VEHICLE_DAILY_DISABLED, disabled);

        // Jika baru di-enable dan pilihan saat ini adalah Harian sedangkan barangnya Kendaraan, maka harus di-reset.
        if (disabled && state.form.itemKind === PawnContractItemKindEnum.Vehicle) {
            state.form.paymentOptionDays = resolveValidPaymentOptionDays({
                availableOptions: availablePaymentOptions.value,
                currentValue: state.form.paymentOptionDays
            });
            refreshDisplayedValidation();
        }
    };

    /**
     * Mengaktifkan atau menonaktifkan fitur Auto-Insert (Step 2 - Data Finansial).
     */
    const setStepTwoAutoInsertEnabled = (enabled: boolean): void => {
        if (!state.referenceData.value || enabled === state.isStepTwoAutoInsertEnabled.value) {
            return;
        }

        if (enabled) {
            state.stepTwoAutoInsertSnapshot.value = createStepTwoAutoInsertSnapshot({
                form: state.form,
                touchedFields: state.touchedFields
            });

            Object.assign(
                state.form,
                createStepTwoAutoInsertPatch({
                    referenceData: state.referenceData.value
                })
            );

            markFieldsAsTouched(pawnContractStepTwoAutoInsertFieldNames);
            state.isStepTwoAutoInsertEnabled.value = true;
            return;
        }

        if (state.stepTwoAutoInsertSnapshot.value) {
            Object.assign(state.form, state.stepTwoAutoInsertSnapshot.value.values);
            Object.assign(state.touchedFields, state.stepTwoAutoInsertSnapshot.value.touchedFields);
        }

        state.isStepTwoAutoInsertEnabled.value = false;
        state.stepTwoAutoInsertSnapshot.value = null;
        refreshDisplayedValidation();
    };

    /**
     * Membuka modal yang menampilkan daftar kesalahan validasi (jika ada).
     */
    const showValidationErrors = (errors: string[], title = 'Masih ada data yang perlu dilengkapi'): void => {
        state.validationModalTitle.value = title;
        state.validationErrorMessages.value = Array.from(new Set(errors));
        state.isValidationModalOpen.value = true;
    };

    /**
     * Menutup modal validasi.
     */
    const closeValidationModal = (): void => {
        state.isValidationModalOpen.value = false;
    };

    /**
     * Menutup modal konfirmasi langkah (Step 1).
     */
    const closeStepConfirmationModal = (): void => {
        state.isStepConfirmationModalOpen.value = false;
    };

    /**
     * Menyetujui ringkasan Step 1 dan lanjut ke Step 2 (Data Finansial).
     */
    const confirmCustomerStep = (): void => {
        closeStepConfirmationModal();
        state.activeStep.value = 2;
    };

    /**
     * Menutup modal konfirmasi persetujuan akhir sebelum simpan.
     */
    const closeSubmitConfirmationModal = (): void => {
        if (state.isSubmitting.value) {
            return;
        }

        state.isSubmitConfirmationModalOpen.value = false;
    };

    /**
     * Membuka modal informasi rumus dan simulasi.
     */
    const openFormulaModal = (): void => {
        state.isFormulaModalOpen.value = true;
    };

    /**
     * Menutup modal informasi rumus dan simulasi.
     */
    const closeFormulaModal = (): void => {
        state.isFormulaModalOpen.value = false;
    };

    /**
     * Menganalisis form dan membangun daftar pesan kesalahan untuk Langkah 1.
     */
    const getStepOneValidationErrors = (): string[] =>
        buildStepOneValidationErrors({
            form: state.form,
            currentPreset: currentPreset.value,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null
        });

    /**
     * Menganalisis form dan membangun daftar pesan kesalahan untuk Langkah 2.
     */
    const getStepTwoValidationErrors = (): string[] =>
        buildStepTwoValidationErrors({
            form: state.form,
            currentPreset: currentPreset.value,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null
        });

    /**
     * Membangun payload data final yang akan dikirim ke server untuk penyimpanan.
     */
    const createSavePayload = () =>
        buildSavePawnContractPayload({
            contractId: state.currentContractId.value,
            form: state.form,
            maturityDate: maturityDate.value,
            storageFeeAmount: storageFeeAmount.value,
            prepaidStorageAmount: prepaidStorageAmount.value,
            prepaidStoragePeriodLabel: prepaidStoragePeriodLabel.value,
            administrationFeeAmount: administrationFeeAmount.value,
            amountInWords: amountInWords.value
        });

    /**
     * Memanggil API untuk mengambil data referensi (branches, presets, customers).
     * Jika dalam mode Edit, juga mengambil data asli kontrak tersebut.
     */
    const loadReferenceData = async (): Promise<void> => {
        state.isLoading.value = true;
        setError(null);

        try {
            const referenceData = unwrapEitherOrThrow(
                await pawnContractRepository.getFormReferenceData({
                    guideItemTypeSeeds,
                    itemPresetMeta
                })
            );
            state.referenceData.value = referenceData;

            if (isEditMode.value && state.currentContractId.value !== null) {
                const formValue = unwrapEitherOrThrow(
                    await pawnContractRepository.getFormValue({
                        contractId: state.currentContractId.value,
                        guideItemTypeSeeds
                    })
                );
                applyLoadedFormValue(formValue);
                return;
            }

            applyReferenceDefaults(referenceData);
        } catch (error) {
            setError(createErrorMessage(error));
        } finally {
            state.isLoading.value = false;
        }
    };

    /**
     * Titik masuk utama untuk memulai/reset ViewModel.
     * Mengatur rute dan memuat data yang diperlukan.
     */
    const initialize = async (contractId?: unknown): Promise<void> => {
        applyRouteContext(contractId);

        // Load persisted settings
        state.isVehicleDailyDisabled.value = await pawnContractRepository.getSettingBoolean(SETTING_KEY_VEHICLE_DAILY_DISABLED, true);

        await loadReferenceData();
    };

    /**
     * Menerapkan data nasabah terpilih dan menyimpan ID-nya sebagai penanda 'terakhir diisi'.
     */
    const applyResolvedCustomerLookup = (customer: PawnContractCustomerLookupModel | null): void => {
        if (!customer) {
            return;
        }

        applyCustomerLookup(customer);
        state.lastAutofilledCustomerId.value = customer.id;
    };

    /**
     * Shorthand: Terapkan pencarian nasabah berdasarkan Nama.
     */
    const applyCustomerLookupFromName = (): void => {
        applyResolvedCustomerLookup(matchedCustomerByName.value);
    };

    /**
     * Shorthand: Terapkan pencarian nasabah berdasarkan Telepon.
     */
    const applyCustomerLookupFromPhone = (): void => {
        applyResolvedCustomerLookup(matchedCustomerByPhone.value);
    };

    /**
     * Shorthand: Terapkan pencarian nasabah berdasarkan Identitas.
     */
    const applyCustomerLookupFromIdentityNumber = (): void => {
        applyResolvedCustomerLookup(matchedCustomerByIdentityNumber.value);
    };

    /**
     * Menangani peralihan dari Step 1 ke Step 2.
     * Melakukan validasi menyeluruh untuk Step 1 sebelum menampilkan modal konfirmasi.
     */
    const goToCustomerStep = async (): Promise<void> => {
        markFieldsAsTouched(pawnContractStepOneFieldNames);
        const errors = getStepOneValidationErrors();
        if (errors.length > 0) {
            showValidationErrors(errors);
            return;
        }

        state.isStepConfirmationModalOpen.value = true;
    };

    /**
     * Navigasi kembali ke daftar data gadai.
     */
    const goToList = async (): Promise<void> => {
        // Redirection to the actual list section default route
        await router.push('/pawn-contracts/list/nasabah-gadai');
    };

    /**
     * ALUR SIMPAN UTAMA: Mengirim data ke server dan menangani feedback (Success/Failure).
     * Berhasil: Pindah ke list. Gagal: Tampilkan error.
     */
    const persistContract = async (): Promise<void> => {
        state.isSubmitting.value = true;
        setSubmitError(null);

        try {
            const savePayload = createSavePayload();
            const result = unwrapEitherOrThrow(
                await pawnContractRepository.saveContract({
                    payload: savePayload,
                    guideItemTypeSeeds
                })
            );
            state.lastSavedResult.value = result;

            const successMessage = buildSaveSuccessMessage({
                isEditMode: isEditMode.value,
                result
            });

            // Trigger non-blocking toast and immediately go back to list
            void showSuccessMessage(successMessage.title, successMessage.message, { 
                timer: 2000,
                position: 'top-end'
            });
            
            await goToList();
        } catch (error) {
            const failureMessage = buildSaveFailureMessage({
                isEditMode: isEditMode.value,
                error
            });

            setSubmitError(failureMessage.rawMessage);
            await showErrorMessage(failureMessage.title, failureMessage.message);
        } finally {
            state.isSubmitting.value = false;
        }
    };

    /**
     * Memulai alur simpan data (final).
     * Melakukan validasi total (Step 1 & 2), cek saldo, dan modal konfirmasi akhir.
     */
    const submitContract = async (): Promise<void> => {
        markFieldsAsTouched([...pawnContractStepOneFieldNames, ...pawnContractStepTwoFieldNames]);
        const errors = [...getStepOneValidationErrors(), ...getStepTwoValidationErrors()];
        if (errors.length > 0) {
            showValidationErrors(errors);
            return;
        }

        // Cek saldo cabang sebelum lanjut
        if (hasInsufficientBranchBalance.value) {
            await showErrorMessage(
                'Saldo cabang tidak cukup',
                'Kurangi dana pencairan atau pilih cabang dengan saldo yang mencukupi.'
            );
            return;
        }

        const savePayload = createSavePayload();
        const savePayloadErrors = validatePawnContractSavePayload({
            payload: savePayload,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null
        });

        if (savePayloadErrors.length > 0) {
            showValidationErrors(savePayloadErrors, 'Data simpan masih perlu diperiksa');
            return;
        }

        state.isSubmitConfirmationModalOpen.value = true;
    };

    /**
     * Perintah final setelah user klik "Ya, Simpan" di modal konfirmasi.
     */
    const confirmSubmitContract = async (): Promise<void> => {
        if (state.isSubmitting.value) {
            return;
        }

        closeSubmitConfirmationModal();
        await persistContract();
    };

    /**
     * WATCHER: Menjaga validitas skema pembayaran jika tenor (termDays) berubah.
     */
    watch(
        () => state.form.termDays,
        () => {
            state.form.paymentOptionDays = resolveValidPaymentOptionDays({
                availableOptions: availablePaymentOptions.value,
                currentValue: state.form.paymentOptionDays
            });
            refreshDisplayedValidation();
        }
    );

    /**
     * WATCHER: Menjaga validitas jumlah periode bayar di muka jika skema pembayaran berubah.
     */
    watch(
        () => state.form.paymentOptionDays,
        () => {
            state.form.prepaidStoragePeriods = resolveValidPrepaidStoragePeriods({
                availableOptions: prepaidStorageOptions.value,
                currentValue: state.form.prepaidStoragePeriods
            });
            refreshDisplayedValidation();
        }
    );

    /**
     * WATCHER: Menjaga validitas skema pembayaran jika jenis barang (itemKind) berubah.
     * Khusus Kendaraan, skema "Harian" akan otomatis diubah ke skema valid lainnya.
     */
    watch(
        () => state.form.itemKind,
        () => {
            state.form.paymentOptionDays = resolveValidPaymentOptionDays({
                availableOptions: availablePaymentOptions.value,
                currentValue: state.form.paymentOptionDays
            });
            refreshDisplayedValidation();
        }
    );

    /**
     * WATCHER: Menyesuaikan detail tipe barang dan skema bayar jika kategori (itemKind) berubah.
     */
    watch(
        () => state.form.itemKind,
        () => {
            state.form.itemDetailType = resolveValidItemDetailType({
                currentPreset: currentPreset.value,
                currentValue: state.form.itemDetailType
            });
            state.form.paymentOptionDays = resolveValidPaymentOptionDays({
                availableOptions: availablePaymentOptions.value,
                currentValue: state.form.paymentOptionDays
            });
            refreshDisplayedValidation();
        }
    );

    /**
     * WATCHER: Reset ID nasabah terakhir jika input nama/telepon/ktp dihapus manual oleh user.
     */
    watch(
        () => [state.form.customerFullName, state.form.customerPhone, state.form.customerIdentityNumber],
        () => {
            if (!matchedCustomer.value) {
                state.lastAutofilledCustomerId.value = null;
            }
        }
    );

    return {
        ...state,
        customerGenderEnum: PawnContractCustomerGenderEnum,
        formatCurrency,
        formatDate,
        isEditMode,
        loadingTitle,
        pageEyebrow,
        pageTitle,
        pageSubtitle,
        submitButtonLabel,
        itemPresetList,
        currentPreset,
        selectedDetailOption,
        itemDetailPlaceholders,
        selectedBranch,
        matchedCustomerByName,
        matchedCustomerByPhone,
        matchedCustomerByIdentityNumber,
        matchedCustomer,
        customerNameSuggestions,
        customerPhoneSuggestions,
        customerIdentityNumberSuggestions,
        customerLookupMessage,
        availablePaymentOptions,
        maturityDate,
        administrationFeeAmount,
        storageFeeAmount,
        prepaidStorageOptions,
        prepaidStorageAmount,
        prepaidStoragePeriodLabel,
        amountInWords,
        appraisedValueInWords,
        stepConfirmationData,
        submitConfirmationData,
        projectedRemainingBalance,
        hasEnoughBalance,
        hasDisbursedValueExceedingAppraisedValue,
        hasInsufficientBranchBalance,
        isProcessingBlocked,
        setError,
        setSubmitError,
        applyRouteContext,
        resetProgressState,
        applyReferenceDefaults,
        applyLoadedFormValue,
        applyCustomerLookup,
        updateFormField,
        setVehicleDailyDisabled,
        setStepOneAutoInsertEnabled,
        setStepTwoAutoInsertEnabled,
        closeStepConfirmationModal,
        confirmCustomerStep,
        closeValidationModal,
        closeSubmitConfirmationModal,
        confirmSubmitContract,
        openFormulaModal,
        closeFormulaModal,
        resetValidationState,
        initialize,
        loadReferenceData,
        applyCustomerLookupFromName,
        applyCustomerLookupFromPhone,
        applyCustomerLookupFromIdentityNumber,
        goToCustomerStep,
        goToList,
        submitContract
    };
});
