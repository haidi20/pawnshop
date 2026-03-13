import { defineStore, storeToRefs } from 'pinia';
import { onMounted, reactive } from 'vue';
import { authPortalViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal.vm';
import { showErrorMessage, showSuccessMessage } from '@core/util/alert';

export const profileViewModel = defineStore('profileViewModel', () => {
    const authVm = authPortalViewModel();
    const { currentSession, isSubmitting } = storeToRefs(authVm);

    const form = reactive({
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
    });

    const syncForm = (): void => {
        const user = currentSession.value?.user;
        if (!user) return;

        form.fullName = user.fullName;
        form.username = user.username;
        form.email = user.email ?? '';
        form.phoneNumber = user.phoneNumber ?? '';
    };

    const updateProfile = async (): Promise<void> => {
        try {
            await authVm.updateProfile({
                fullName: form.fullName,
                username: form.username,
                email: form.email,
                phoneNumber: form.phoneNumber,
            });

            await showSuccessMessage('Profil diperbarui', 'Profil Anda telah berhasil disimpan.', {
                toast: true,
                timer: 2000,
                position: 'top-end',
            });
        } catch (error) {
            await showErrorMessage(
                'Gagal memperbarui profil',
                error instanceof Error ? error.message : String(error)
            );
        }
    };

    return {
        form,
        isSubmitting,
        currentSession,
        syncForm,
        updateProfile,
    };
});
