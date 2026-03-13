import { defineStore, storeToRefs } from 'pinia';
import { computed, reactive } from 'vue';
import { authPortalViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal.vm';
import { showErrorMessage, showSuccessMessage } from '@core/util/alert';

export const companyViewModel = defineStore('companyViewModel', () => {
    const authVm = authPortalViewModel();
    const { currentSession, isSubmitting } = storeToRefs(authVm);

    const form = reactive({
        name: '',
        legalName: '',
        businessType: '',
        email: '',
        phoneNumber: '',
        city: '',
        address: '',
    });

    const canEditCompany = computed<boolean>(() => currentSession.value?.user.role === 'owner');

    const syncForm = (): void => {
        const company = currentSession.value?.company;
        if (!company) return;

        form.name = company.name;
        form.legalName = company.legalName ?? '';
        form.businessType = company.businessType ?? '';
        form.email = company.email ?? '';
        form.phoneNumber = company.phoneNumber ?? '';
        form.city = company.city ?? '';
        form.address = company.address ?? '';
    };

    const updateCompany = async (): Promise<void> => {
        if (!canEditCompany.value) return;

        try {
            await authVm.updateCompany({
                name: form.name,
                legalName: form.legalName,
                businessType: form.businessType,
                email: form.email,
                phoneNumber: form.phoneNumber,
                city: form.city,
                address: form.address,
            });

            await showSuccessMessage('Perusahaan diperbarui', 'Data profil perusahaan aktif telah berhasil disimpan.', {
                toast: true,
                timer: 2000,
                position: 'top-end',
            });
        } catch (error) {
            await showErrorMessage(
                'Gagal memperbarui perusahaan',
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    return {
        form,
        isSubmitting,
        currentSession,
        canEditCompany,
        syncForm,
        updateCompany,
    };
});
