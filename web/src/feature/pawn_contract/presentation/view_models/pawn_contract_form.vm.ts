import { computed, watch } from 'vue';
import { defineStore } from 'pinia';

import {
    PawnContractCustomerGenderEnum,
    PawnContractFormModeEnum,
    PawnContractItemKindEnum
} from '@core/domain/models/pawn-contract-form-enum.model';
import { unwrapEitherOrThrow } from '@core/util/either';
import { showErrorMessage, showSuccessMessage } from '@core/util/alert';
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
    const state = createPawnContractFormState();

    const formatCurrency = (value: number): string => formatCurrencyForHumans(value);
    const formatDate = (value: string): string => formatDateForHumans(value);

    const isEditMode = computed(() => state.mode.value === PawnContractFormModeEnum.Edit);
    const loadingTitle = computed(() => (isEditMode.value ? 'Menyiapkan formulir gadai' : 'Menyiapkan formulir gadai baru'));
    const pageEyebrow = computed(() => (isEditMode.value ? 'Ubah data gadai' : 'Buat data gadai'));
    const pageTitle = computed(() =>
        isEditMode.value ? 'Form gadai yang siap diperbarui' : 'Form gadai baru yang ringkas dan jelas'
    );
    const pageSubtitle = computed(() =>
        isEditMode.value
            ? 'Perbarui data gadai, cek kembali hitungan biaya, lalu simpan perubahan setelah konfirmasi.'
            : 'Isi data gadai, cek hitungan biaya secara otomatis, lalu simpan kontrak setelah konfirmasi.'
    );
    const submitButtonLabel = computed(() => {
        if (state.isSubmitting.value) {
            return isEditMode.value ? 'Menyimpan perubahan data gadai...' : 'Menyimpan data gadai...';
        }

        return isEditMode.value ? 'Simpan perubahan data gadai' : 'Proses dan simpan data gadai';
    });
    const itemPresetList = computed(() =>
        state.referenceData.value
            ? [
                state.referenceData.value.itemPresets[PawnContractItemKindEnum.Electronic],
                state.referenceData.value.itemPresets[PawnContractItemKindEnum.Vehicle]
            ]
            : []
    );
    const currentPreset = computed(() => state.referenceData.value?.itemPresets[state.form.itemKind] ?? null);
    const selectedDetailOption = computed(
        () => currentPreset.value?.detailOptions.find((option) => option.value === state.form.itemDetailType) ?? null
    );
    const itemDetailPlaceholders = computed(() =>
        createPawnContractItemDetailPlaceholders({
            itemKind: state.form.itemKind,
            itemDetailType: state.form.itemDetailType,
            detailLabels: currentPreset.value?.detailLabels ?? null
        })
    );
    const selectedBranch = computed(
        () => state.referenceData.value?.branches.find((branch) => branch.id === state.form.branchId) ?? null
    );
    const matchedCustomerByName = computed(() =>
        state.referenceData.value
            ? findMatchedPawnContractCustomer({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerFullName,
                field: PawnContractCustomerLookupFieldEnum.FullName
            })
            : null
    );
    const matchedCustomerByPhone = computed(() =>
        state.referenceData.value
            ? findMatchedPawnContractCustomer({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerPhone,
                field: PawnContractCustomerLookupFieldEnum.PhoneNumber
            })
            : null
    );
    const matchedCustomerByIdentityNumber = computed(() =>
        state.referenceData.value
            ? findMatchedPawnContractCustomer({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerIdentityNumber,
                field: PawnContractCustomerLookupFieldEnum.IdentityNumber
            })
            : null
    );
    const matchedCustomer = computed(
        () => matchedCustomerByIdentityNumber.value ?? matchedCustomerByPhone.value ?? matchedCustomerByName.value
    );
    const customerNameSuggestions = computed(() =>
        state.referenceData.value
            ? buildPawnContractCustomerSuggestions({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerFullName,
                field: PawnContractCustomerLookupFieldEnum.FullName
            })
            : []
    );
    const customerPhoneSuggestions = computed(() =>
        state.referenceData.value
            ? buildPawnContractCustomerSuggestions({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerPhone,
                field: PawnContractCustomerLookupFieldEnum.PhoneNumber
            })
            : []
    );
    const customerIdentityNumberSuggestions = computed(() =>
        state.referenceData.value
            ? buildPawnContractCustomerSuggestions({
                customers: state.referenceData.value.customers,
                keyword: state.form.customerIdentityNumber,
                field: PawnContractCustomerLookupFieldEnum.IdentityNumber
            })
            : []
    );
    const customerLookupMessage = computed(() =>
        matchedCustomer.value
            ? 'Data nasabah lama ditemukan dan seluruh formulir akan dipakai otomatis.'
            : customerNameSuggestions.value.length > 0 ||
                customerPhoneSuggestions.value.length > 0 ||
                customerIdentityNumberSuggestions.value.length > 0
                ? 'Pilih salah satu saran nama, telepon, atau identitas untuk memuat data nasabah lama.'
                : 'Jika data belum ada, sistem akan membuat data nasabah baru.'
    );
    const availablePaymentOptions = computed(() => getAvailablePawnContractPaymentOptions(state.form.termDays));
    const maturityDate = computed(() => calculatePawnContractMaturityDate(state.form.contractDate, state.form.termDays));
    const administrationFeeAmount = computed(() => currentPreset.value?.administrationFeeAmount ?? 0);
    const storageFeeAmount = computed(() =>
        calculatePawnContractStorageFee({
            disbursedValue: state.form.disbursedValue,
            marginRate: selectedDetailOption.value?.marginRate ?? 0,
            deductionRate: selectedDetailOption.value?.deductionRate ?? 0,
            paymentOptionDays: state.form.paymentOptionDays
        })
    );
    const prepaidStorageOptions = computed(() =>
        getPawnContractPrepaidStorageOptions(state.form.termDays, state.form.paymentOptionDays)
    );
    const selectedPaymentOption = computed(
        () => availablePaymentOptions.value.find((option) => option.value === state.form.paymentOptionDays) ?? null
    );
    const prepaidStorageAmount = computed(() =>
        calculatePawnContractPrepaidStorageAmount(storageFeeAmount.value, state.form.prepaidStoragePeriods)
    );
    const prepaidStoragePeriodLabel = computed(() =>
        buildPawnContractPrepaidStorageLabel(state.form.prepaidStoragePeriods)
    );
    const customerReceivedAmount = computed(() =>
        Math.max(0, state.form.disbursedValue - prepaidStorageAmount.value - administrationFeeAmount.value)
    );
    const amountInWords = computed(() => convertNumberToIndonesianCurrencyWords(state.form.disbursedValue));
    const customerGenderLabel = computed(() =>
        state.form.customerGender === PawnContractCustomerGenderEnum.Female ? 'Perempuan' : 'Laki-laki'
    );
    const projectedRemainingBalance = computed(
        () => (selectedBranch.value?.availableBalance ?? 0) - state.form.disbursedValue
    );
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
    const hasEnoughBalance = computed(() => projectedRemainingBalance.value >= 0);
    const hasDisbursedValueExceedingAppraisedValue = computed(
        () => state.form.appraisedValue > 0 && state.form.disbursedValue > state.form.appraisedValue
    );
    const hasInsufficientBranchBalance = computed(
        () => state.form.branchId > 0 && state.form.disbursedValue > 0 && !hasEnoughBalance.value
    );
    const isProcessingBlocked = computed(
        () => hasDisbursedValueExceedingAppraisedValue.value || hasInsufficientBranchBalance.value
    );

    const setError = (message: string | null): void => {
        state.error.value = message;
    };

    const setSubmitError = (message: string | null): void => {
        state.submitError.value = message;
    };

    const getAllFieldNames = (): PawnContractFormFieldName[] =>
        Object.keys(state.fieldErrors) as PawnContractFormFieldName[];

    const resetValidationState = (): void => {
        Object.assign(state.fieldErrors, createInitialPawnContractFormFieldErrors());
        Object.assign(state.touchedFields, createInitialPawnContractTouchedFields());
    };

    const resetStepOneAutoInsertState = (): void => {
        state.isStepOneAutoInsertEnabled.value = false;
        state.stepOneAutoInsertSnapshot.value = null;
    };

    const resetStepTwoAutoInsertState = (): void => {
        state.isStepTwoAutoInsertEnabled.value = false;
        state.stepTwoAutoInsertSnapshot.value = null;
    };

    const getCurrentFormValidationResult = () =>
        validatePawnContractForm({
            form: state.form,
            currentPreset: currentPreset.value,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null
        });

    const refreshDisplayedValidation = (): void => {
        const validationResult = getCurrentFormValidationResult();

        for (const field of getAllFieldNames()) {
            state.fieldErrors[field] = state.touchedFields[field] ? validationResult.fieldErrors[field] ?? null : null;
        }
    };

    const markFieldsAsTouched = (fields: PawnContractFormFieldName[]): void => {
        for (const field of fields) {
            state.touchedFields[field] = true;
        }

        refreshDisplayedValidation();
    };

    const applyRouteContext = (): void => {
        const routeContext = createPawnContractRouteContext(router.currentRoute.value.params.contractId);
        state.mode.value = routeContext.mode;
        state.currentContractId.value = routeContext.contractId;
    };

    const resetProgressState = (): void => {
        state.activeStep.value = 1;
        state.lastAutofilledCustomerId.value = null;
        state.isValidationModalOpen.value = false;
        state.validationErrorMessages.value = [];
        state.isStepConfirmationModalOpen.value = false;
        state.isSubmitConfirmationModalOpen.value = false;
    };

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

    const applyLoadedFormValue = (formValue: PawnContractFormValueModel): void => {
        Object.assign(state.form, formValue);
        resetProgressState();
        resetValidationState();
        resetStepOneAutoInsertState();
        resetStepTwoAutoInsertState();
    };

    const applyCustomerLookup = (customer: PawnContractCustomerLookupModel): void => {
        Object.assign(state.form, createCustomerLookupFormPatch(customer));
        refreshDisplayedValidation();
    };

    const updateFormField: PawnContractFormFieldUpdater = (field, value): void => {
        state.form[field] = value;
        state.touchedFields[field] = true;
        refreshDisplayedValidation();
    };

    const setStepOneAutoInsertEnabled = (enabled: boolean): void => {
        if (!state.referenceData.value || enabled === state.isStepOneAutoInsertEnabled.value) {
            return;
        }

        if (enabled) {
            state.stepOneAutoInsertSnapshot.value = createStepOneAutoInsertSnapshot({
                form: state.form,
                touchedFields: state.touchedFields
            });

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

        if (state.stepOneAutoInsertSnapshot.value) {
            Object.assign(state.form, state.stepOneAutoInsertSnapshot.value.values);
            Object.assign(state.touchedFields, state.stepOneAutoInsertSnapshot.value.touchedFields);
        }

        state.isStepOneAutoInsertEnabled.value = false;
        state.stepOneAutoInsertSnapshot.value = null;
        refreshDisplayedValidation();
    };

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

    const showValidationErrors = (errors: string[], title = 'Masih ada data yang perlu dilengkapi'): void => {
        state.validationModalTitle.value = title;
        state.validationErrorMessages.value = Array.from(new Set(errors));
        state.isValidationModalOpen.value = true;
    };

    const closeValidationModal = (): void => {
        state.isValidationModalOpen.value = false;
    };

    const closeStepConfirmationModal = (): void => {
        state.isStepConfirmationModalOpen.value = false;
    };

    const confirmCustomerStep = (): void => {
        closeStepConfirmationModal();
        state.activeStep.value = 2;
    };

    const closeSubmitConfirmationModal = (): void => {
        if (state.isSubmitting.value) {
            return;
        }

        state.isSubmitConfirmationModalOpen.value = false;
    };

    const getStepOneValidationErrors = (): string[] =>
        buildStepOneValidationErrors({
            form: state.form,
            currentPreset: currentPreset.value,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null
        });

    const getStepTwoValidationErrors = (): string[] =>
        buildStepTwoValidationErrors({
            form: state.form,
            currentPreset: currentPreset.value,
            selectedBranchAvailableBalance: selectedBranch.value?.availableBalance ?? null
        });

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

    const initialize = async (): Promise<void> => {
        applyRouteContext();
        await loadReferenceData();
    };

    const applyResolvedCustomerLookup = (customer: PawnContractCustomerLookupModel | null): void => {
        if (!customer) {
            return;
        }

        applyCustomerLookup(customer);
        state.lastAutofilledCustomerId.value = customer.id;
    };

    const applyCustomerLookupFromName = (): void => {
        applyResolvedCustomerLookup(matchedCustomerByName.value);
    };

    const applyCustomerLookupFromPhone = (): void => {
        applyResolvedCustomerLookup(matchedCustomerByPhone.value);
    };

    const applyCustomerLookupFromIdentityNumber = (): void => {
        applyResolvedCustomerLookup(matchedCustomerByIdentityNumber.value);
    };

    const goToCustomerStep = async (): Promise<void> => {
        markFieldsAsTouched(pawnContractStepOneFieldNames);
        const errors = getStepOneValidationErrors();
        if (errors.length > 0) {
            showValidationErrors(errors);
            return;
        }

        state.isStepConfirmationModalOpen.value = true;
    };

    const goToList = async (): Promise<void> => {
        await router.push('/pawn-contracts/list');
    };

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

            await showSuccessMessage(successMessage.title, successMessage.message);
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

    const submitContract = async (): Promise<void> => {
        markFieldsAsTouched([...pawnContractStepOneFieldNames, ...pawnContractStepTwoFieldNames]);
        const errors = [...getStepOneValidationErrors(), ...getStepTwoValidationErrors()];
        if (errors.length > 0) {
            showValidationErrors(errors);
            return;
        }

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

    const confirmSubmitContract = async (): Promise<void> => {
        if (state.isSubmitting.value) {
            return;
        }

        closeSubmitConfirmationModal();
        await persistContract();
    };

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

    watch(
        () => state.form.itemKind,
        () => {
            state.form.itemDetailType = resolveValidItemDetailType({
                currentPreset: currentPreset.value,
                currentValue: state.form.itemDetailType
            });
            refreshDisplayedValidation();
        }
    );

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
        setStepOneAutoInsertEnabled,
        setStepTwoAutoInsertEnabled,
        closeStepConfirmationModal,
        confirmCustomerStep,
        closeValidationModal,
        closeSubmitConfirmationModal,
        confirmSubmitContract,
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
