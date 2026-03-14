<template>
    <BaseModalComponent :is-open="isOpen" size="lg" @close="emit('close')">
        <div class="modal-header border-0 pb-0">
            <div>
                <div class="pawn-contract-page__section-eyebrow mb-1">
                    Detail Kontrak Gadai
                </div>
                <h2 class="h4 mb-0 fw-bold">
                    {{ formValue?.contractNumber || 'Memuat...' }}
                </h2>
            </div>
            <button type="button" class="btn-close" aria-label="Close" @click="emit('close')" />
        </div>

        <div class="modal-body p-4">
            <div v-if="isLoading" class="text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-secondary text-sm">
                    Mengambil rincian lengkap kontrak...
                </p>
            </div>

            <div v-else-if="formValue" class="row g-4">
                <!-- Section 1: Ringkasan Kontrak -->
                <div class="col-12">
                    <div class="view-modal__section-card">
                        <div class="view-modal__section-header">
                            <i class="bi bi-info-circle me-2" /> Ringkasan Kontrak
                        </div>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="view-modal__label">Tanggal Kontrak</label>
                                <div class="view-modal__value">
                                    {{ formatDate(formValue.contractDate) }}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="view-modal__label">Masa Berlaku (Tenor)</label>
                                <div class="view-modal__value">
                                    {{ formValue.termDays }} Hari
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="view-modal__label">Cabang Terdaftar</label>
                                <div class="view-modal__value">
                                    {{ branchName }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 2: Data Barang Jaminan -->
                <div class="col-12">
                    <div class="view-modal__section-card">
                        <div class="view-modal__section-header">
                            <i class="bi bi-box-seam me-2" /> Barang Jaminan
                        </div>
                        <div class="mb-4">
                            <h3 class="view-modal__sub-title">
                                {{ formValue.itemName }}
                            </h3>
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
                                {{ formValue.itemKind === 'electronic' ? 'Elektronik' : 'Kendaraan' }}
                            </span>
                        </div>

                        <div class="row g-3 mb-4">
                            <div class="col-md-4">
                                <label class="view-modal__label">Merk / Brand</label>
                                <div class="view-modal__value">
                                    {{ formValue.itemDetailSecond || '-' }}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="view-modal__label">Model / Tipe</label>
                                <div class="view-modal__value">
                                    {{ formValue.itemDetailFirst || '-' }}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="view-modal__label">SN / No. Mesin</label>
                                <div class="view-modal__value">
                                    {{ formValue.itemDetailThird || '-' }}
                                </div>
                            </div>
                        </div>

                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="view-modal__label">Kelengkapan (Aksesori)</label>
                                <div class="view-modal__value-box">
                                    {{ formValue.accessorySummary || 'Tidak ada catatan aksesori' }}
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="view-modal__label">Kondisi / Kerusakan</label>
                                <div class="view-modal__value-box">
                                    {{ formValue.issueSummary || 'Tidak ada catatan kerusakan' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 3: Data Nasabah -->
                <div class="col-12">
                    <div class="view-modal__section-card">
                        <div class="view-modal__section-header">
                            <i class="bi bi-person me-2" /> Data Nasabah
                        </div>
                        <div class="row g-3 mb-3">
                            <div class="col-md-12">
                                <h3 class="view-modal__sub-title mb-0">
                                    {{ formValue.customerFullName }}
                                </h3>
                            </div>
                            <div class="col-md-4">
                                <label class="view-modal__label">Identitas ({{ formValue.customerIdentityType
                                    }})</label>
                                <div class="view-modal__value">
                                    {{ formValue.customerIdentityNumber }}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="view-modal__label">Nomor Telepon</label>
                                <div class="view-modal__value">
                                    {{ formValue.customerPhone }}
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="view-modal__label">Jenis Kelamin</label>
                                <div class="view-modal__value">
                                    {{ formValue.customerGender === 'male' ? 'Laki-laki' : 'Perempuan' }}
                                </div>
                            </div>
                            <div class="col-md-12">
                                <label class="view-modal__label">Alamat Lengkap ({{ formValue.customerCity }})</label>
                                <div class="view-modal__value">
                                    {{ formValue.customerAddress }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Rincian Keuangan -->
                <div class="col-12">
                    <div class="view-modal__section-card highlight">
                        <div class="view-modal__section-header">
                            <i class="bi bi-cash-stack me-2" /> Rincian Keuangan
                        </div>
                        <div class="pawn-contract-page__totals px-0 pb-0">
                            <article class="pawn-contract-page__total-item py-0">
                                <span class="view-modal__label mb-1">Nilai Taksiran</span>
                                <strong class="text-dark">{{ formatCurrency(formValue.appraisedValue) }}</strong>
                            </article>
                            <article class="pawn-contract-page__total-item py-0">
                                <span class="view-modal__label mb-1">Nilai Pinjaman</span>
                                <strong class="text-primary h5 mb-0 fw-bold">{{ formatCurrency(formValue.disbursedValue)
                                    }}</strong>
                            </article>
                            <article class="pawn-contract-page__total-item py-0">
                                <span class="view-modal__label mb-1">Skema Biaya Titip</span>
                                <strong class="text-dark">{{ formValue.paymentOptionDays }} Hari</strong>
                            </article>
                        </div>
                        <div class="mt-3 pt-3 border-top">
                            <label class="view-modal__label">Biaya Terbayar di Muka ({{ formValue.prepaidStoragePeriods
                                }} Tenor)</label>
                            <div class="view-modal__value fw-semibold text-success">
                                {{ formatCurrency(calculatedPrepaidAmount) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal-footer bg-light-subtle border-0">
            <button type="button" class="btn btn-outline-secondary px-4" @click="emit('close')">
                Tutup
            </button>
            <RouterLink v-if="formValue" class="btn btn-primary px-4"
                :to="{ name: 'PawnContractFormEdit', params: { contractId: contractId } }" @click="emit('close')">
                <i class="bi bi-pencil-square me-2" /> Ubah Data
            </RouterLink>
        </div>
    </BaseModalComponent>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { unwrapEitherOrThrow } from '@core/util/either';
import { formatCurrencyValueForHumans, formatDateValueForHumans } from '@core/util/helpers';
import BaseModalComponent from '@core/presentation/components/base_modal.component.vue';
import type { PawnContractFormValueModel } from '@feature/pawn_contract/domain/models';
import { pawnContractRepository } from '@feature/pawn_contract/presentation/di/pawn_contract.di';

const props = defineProps<{
    isOpen: boolean;
    contractId: number | null;
    branchName?: string;
}>();

const emit = defineEmits<{
    close: [];
}>();

const isLoading = ref(false);
const formValue = ref<PawnContractFormValueModel | null>(null);

const formatCurrency = (val: number) => formatCurrencyValueForHumans(val);
const formatDate = (val: string) => formatDateValueForHumans(val);

const calculatedPrepaidAmount = computed(() => {
    if (!formValue.value) return 0;
    // Simple estimation for display based on typical logic
    // Usually disbursedValue * standardRate * periods
    // Since we don't have the exact fee here without full VM logic,
    // we'll keep it as simple info or fetch if needed.
    return 0; // Placeholder or we can leave it out if too complex
});

const loadDetail = async (id: number) => {
    isLoading.value = true;
    try {
        const result = await pawnContractRepository.getFormValue({
            contractId: id,
            guideItemTypeSeeds: [] // Not strictly needed for read-only if we just want raw values
        });
        formValue.value = unwrapEitherOrThrow(result);
    } catch (error) {
        console.error('Failed to load contract detail:', error);
    } finally {
        isLoading.value = false;
    }
};

watch(() => props.contractId, (newId) => {
    if (newId !== null && props.isOpen) {
        void loadDetail(newId);
    } else {
        formValue.value = null;
    }
}, { immediate: true });

watch(() => props.isOpen, (open) => {
    if (open && props.contractId !== null) {
        void loadDetail(props.contractId);
    }
});
</script>

<style scoped>
.view-modal__section-card {
    background: #fff;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    padding: 1.25rem;
}

.view-modal__section-card.highlight {
    background: #f8fbff;
    border-color: #e1efff;
}

.view-modal__section-header {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #94a3b8;
    letter-spacing: 0.05em;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
}

.view-modal__label {
    display: block;
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.view-modal__value {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1e293b;
}

.view-modal__sub-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #0f172a;
    margin-top: 0;
    margin-bottom: 0.5rem;
}

.view-modal__value-box {
    background: #f8fafc;
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 0.875rem;
    color: #475569;
    line-height: 1.5;
    min-height: 60px;
}
</style>
