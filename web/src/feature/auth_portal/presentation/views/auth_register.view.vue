<template>
  <section class="auth-portal">
    <aside class="auth-portal__aside">
      <div class="auth-portal__brand">
        <div class="auth-portal__brand-mark">
          PS
        </div>
        <p class="auth-portal__eyebrow">
          Registrasi Perusahaan
        </p>
        <h1 class="auth-portal__headline">
          Daftarkan akun, perusahaan, dan tim kerja dalam satu alur.
        </h1>
        <p class="auth-portal__lead">
          Setelah registrasi selesai, akun owner langsung bisa login dan mengelola user karyawan yang ikut memakai sistem.
        </p>
      </div>

      <ul class="auth-portal__feature-list">
        <li class="auth-portal__feature-item">
          <div class="auth-portal__feature-icon">
            <i class="bi bi-person-badge" />
          </div>
          <div class="auth-portal__feature-copy">
            <strong>Akun owner</strong>
            <span>Digunakan untuk login pertama sekaligus sebagai penanggung jawab perusahaan.</span>
          </div>
        </li>
        <li class="auth-portal__feature-item">
          <div class="auth-portal__feature-icon">
            <i class="bi bi-buildings" />
          </div>
          <div class="auth-portal__feature-copy">
            <strong>Data perusahaan</strong>
            <span>Simpan identitas usaha agar workspace dan akses tim terkelola rapi.</span>
          </div>
        </li>
        <li class="auth-portal__feature-item">
          <div class="auth-portal__feature-icon">
            <i class="bi bi-person-lines-fill" />
          </div>
          <div class="auth-portal__feature-copy">
            <strong>User karyawan</strong>
            <span>Tambahkan admin atau staff yang akan memakai aplikasi sejak awal.</span>
          </div>
        </li>
      </ul>
    </aside>

    <main class="auth-portal__main">
      <div class="auth-portal__panel">
        <div class="auth-portal__panel-head">
          <p class="auth-portal__eyebrow auth-portal__eyebrow--panel mb-0">
            Buat Workspace Baru
          </p>
          <h2 class="auth-portal__title">
            Register perusahaan
          </h2>
          <p class="auth-portal__subtitle">
            Isi akun utama, profil perusahaan, lalu tambahkan user karyawan yang akan menggunakan sistem.
          </p>
        </div>

        <div
          v-if="error"
          class="auth-portal__error"
        >
          <i class="bi bi-exclamation-circle" />
          <div>{{ error }}</div>
        </div>

        <form
          class="auth-portal__form"
          @submit.prevent="submitRegister"
        >
          <section class="auth-portal__section">
            <div class="auth-portal__section-head">
              <div>
                <h2>Akun owner</h2>
                <p>Akun ini dipakai untuk login pertama dan mengelola setup perusahaan.</p>
              </div>
            </div>

            <div class="auth-portal__field-grid">
              <div class="auth-portal__field">
                <label for="owner-full-name">Nama lengkap</label>
                <input
                  id="owner-full-name"
                  v-model.trim="form.ownerFullName"
                  type="text"
                  class="ps-field form-control"
                  placeholder="Nama owner"
                  autocomplete="name"
                >
              </div>

              <div class="auth-portal__field">
                <label for="owner-username">Username</label>
                <input
                  id="owner-username"
                  v-model.trim="form.ownerUsername"
                  type="text"
                  class="ps-field form-control"
                  placeholder="username owner"
                  autocomplete="username"
                >
              </div>

              <div class="auth-portal__field">
                <label for="owner-email">Email</label>
                <input
                  id="owner-email"
                  v-model.trim="form.ownerEmail"
                  type="email"
                  class="ps-field form-control"
                  placeholder="owner@perusahaan.com"
                  autocomplete="email"
                >
              </div>

              <div class="auth-portal__field">
                <label for="owner-phone">No. telepon</label>
                <input
                  id="owner-phone"
                  v-model.trim="form.ownerPhoneNumber"
                  type="text"
                  class="ps-field form-control"
                  placeholder="08xxxxxxxxxx"
                  autocomplete="tel"
                >
              </div>

              <div class="auth-portal__field">
                <label for="owner-password">Password</label>
                <input
                  id="owner-password"
                  v-model="form.password"
                  type="password"
                  class="ps-field form-control"
                  placeholder="Minimal 6 karakter"
                  autocomplete="new-password"
                >
              </div>

              <div class="auth-portal__field">
                <label for="owner-confirm-password">Konfirmasi password</label>
                <input
                  id="owner-confirm-password"
                  v-model="form.confirmPassword"
                  type="password"
                  class="ps-field form-control"
                  placeholder="Ulangi password"
                  autocomplete="new-password"
                >
              </div>
            </div>
          </section>

          <section class="auth-portal__section">
            <div class="auth-portal__section-head">
              <div>
                <h2>Data perusahaan</h2>
                <p>Informasi ini akan dipakai sebagai identitas workspace Anda.</p>
              </div>
            </div>

            <div class="auth-portal__field-grid">
              <div class="auth-portal__field">
                <label for="company-name">Nama perusahaan</label>
                <input
                  id="company-name"
                  v-model.trim="form.companyName"
                  type="text"
                  class="ps-field form-control"
                  placeholder="Nama usaha / perusahaan"
                >
              </div>

              <div class="auth-portal__field">
                <label for="company-legal-name">Nama legal</label>
                <input
                  id="company-legal-name"
                  v-model.trim="form.legalName"
                  type="text"
                  class="ps-field form-control"
                  placeholder="PT/CV/Nama resmi"
                >
              </div>

              <div class="auth-portal__field">
                <label for="company-business-type">Jenis usaha</label>
                <input
                  id="company-business-type"
                  v-model.trim="form.businessType"
                  type="text"
                  class="ps-field form-control"
                  placeholder="Pegadaian, pembiayaan, dsb."
                >
              </div>

              <div class="auth-portal__field">
                <label for="company-city">Kota</label>
                <input
                  id="company-city"
                  v-model.trim="form.city"
                  type="text"
                  class="ps-field form-control"
                  placeholder="Kota perusahaan"
                >
              </div>

              <div class="auth-portal__field">
                <label for="company-email">Email perusahaan</label>
                <input
                  id="company-email"
                  v-model.trim="form.companyEmail"
                  type="email"
                  class="ps-field form-control"
                  placeholder="kontak@perusahaan.com"
                >
              </div>

              <div class="auth-portal__field">
                <label for="company-phone">No. telepon perusahaan</label>
                <input
                  id="company-phone"
                  v-model.trim="form.companyPhoneNumber"
                  type="text"
                  class="ps-field form-control"
                  placeholder="Telepon kantor"
                >
              </div>

              <div class="auth-portal__field auth-portal__field--full">
                <label for="company-address">Alamat</label>
                <textarea
                  id="company-address"
                  v-model.trim="form.address"
                  rows="3"
                  class="ps-field form-control"
                  placeholder="Alamat lengkap perusahaan"
                />
              </div>
            </div>
          </section>

          <section class="auth-portal__section">
            <div class="auth-portal__section-head">
              <div>
                <h2>User karyawan</h2>
                <p>Tambahkan akun admin atau staff yang akan ikut menggunakan aplikasi.</p>
              </div>

              <button
                class="auth-portal__button-secondary"
                type="button"
                @click="addEmployee"
              >
                <i class="bi bi-plus-lg" />
                <span>Tambah user</span>
              </button>
            </div>

            <div
              v-if="form.employees.length === 0"
              class="auth-portal__empty-users"
            >
              Belum ada user karyawan. Anda tetap bisa lanjut dan menambahkannya nanti dengan membuat akun baru lewat halaman registrasi berikutnya.
            </div>

            <div class="auth-portal__user-list">
              <article
                v-for="(employee, index) in form.employees"
                :key="index"
                class="auth-portal__user-card"
              >
                <div class="auth-portal__user-card-head">
                  <h3 class="auth-portal__user-card-title">
                    User Karyawan {{ index + 1 }}
                  </h3>

                  <button
                    class="auth-portal__button-danger"
                    type="button"
                    @click="removeEmployee(index)"
                  >
                    <i class="bi bi-trash3" />
                    <span>Hapus</span>
                  </button>
                </div>

                <div class="auth-portal__field-grid">
                  <div class="auth-portal__field">
                    <label :for="`employee-name-${index}`">Nama lengkap</label>
                    <input
                      :id="`employee-name-${index}`"
                      v-model.trim="employee.fullName"
                      type="text"
                      class="ps-field form-control"
                      placeholder="Nama karyawan"
                    >
                  </div>

                  <div class="auth-portal__field">
                    <label :for="`employee-role-${index}`">Peran</label>
                    <select
                      :id="`employee-role-${index}`"
                      v-model="employee.role"
                      class="ps-field form-select"
                    >
                      <option value="admin">
                        Admin
                      </option>
                      <option value="staff">
                        Staff
                      </option>
                    </select>
                  </div>

                  <div class="auth-portal__field">
                    <label :for="`employee-username-${index}`">Username</label>
                    <input
                      :id="`employee-username-${index}`"
                      v-model.trim="employee.username"
                      type="text"
                      class="ps-field form-control"
                      placeholder="username karyawan"
                    >
                  </div>

                  <div class="auth-portal__field">
                    <label :for="`employee-email-${index}`">Email</label>
                    <input
                      :id="`employee-email-${index}`"
                      v-model.trim="employee.email"
                      type="email"
                      class="ps-field form-control"
                      placeholder="opsional"
                    >
                  </div>

                  <div class="auth-portal__field">
                    <label :for="`employee-phone-${index}`">No. telepon</label>
                    <input
                      :id="`employee-phone-${index}`"
                      v-model.trim="employee.phoneNumber"
                      type="text"
                      class="ps-field form-control"
                      placeholder="opsional"
                    >
                  </div>

                  <div class="auth-portal__field">
                    <label :for="`employee-password-${index}`">Password</label>
                    <input
                      :id="`employee-password-${index}`"
                      v-model="employee.password"
                      type="password"
                      class="ps-field form-control"
                      placeholder="Password login karyawan"
                    >
                  </div>
                </div>
              </article>
            </div>
          </section>

          <div class="auth-portal__actions">
            <div class="auth-portal__switch">
              Sudah punya akun?
              <RouterLink to="/login">
                Kembali ke login
              </RouterLink>
            </div>

            <div class="auth-portal__button-row">
              <button
                class="auth-portal__button"
                type="submit"
                :disabled="isSubmitting"
              >
                <span
                  v-if="isSubmitting"
                  class="spinner-border spinner-border-sm"
                  aria-hidden="true"
                />
                <i
                  v-else
                  class="bi bi-person-check"
                />
                <span>{{ isSubmitting ? 'Menyimpan...' : 'Daftarkan perusahaan' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { showSuccessMessage } from '@core/util/alert';
import type {
    AuthPortalRegisterEmployeePayloadModel,
    AuthPortalRegisterPayloadModel
} from '@feature/auth_portal/domain/models';
import '@feature/auth_portal/presentation/styles/auth_portal.scss';
import { authPortalViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal.vm';

type RegisterFormModel = Omit<AuthPortalRegisterPayloadModel, 'employees'> & {
    confirmPassword: string;
    employees: AuthPortalRegisterEmployeePayloadModel[];
};

const createEmployee = (): AuthPortalRegisterEmployeePayloadModel => ({
    fullName: '',
    username: '',
    email: null,
    phoneNumber: null,
    role: 'staff',
    password: ''
});

const router = useRouter();
const route = useRoute();
const vm = authPortalViewModel();
const { error, isSubmitting } = storeToRefs(vm);

const form = reactive<RegisterFormModel>({
    ownerFullName: '',
    ownerUsername: '',
    ownerEmail: '',
    ownerPhoneNumber: null,
    password: '',
    confirmPassword: '',
    companyName: '',
    legalName: null,
    businessType: null,
    companyEmail: null,
    companyPhoneNumber: null,
    city: null,
    address: null,
    employees: []
});

const toOptionalValue = (value: string | null | undefined): string | null => {
    const trimmedValue = value?.trim() ?? '';
    return trimmedValue.length > 0 ? trimmedValue : null;
};

const resolveRedirectTarget = (): string => {
    const redirect = route.query.redirect;
    return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard';
};

const validateRegisterForm = (): string | null => {
    if (form.password.length < 6) {
        return 'Password owner minimal 6 karakter.';
    }

    if (form.password !== form.confirmPassword) {
        return 'Konfirmasi password owner belum sama.';
    }

    const invalidEmployeeIndex = form.employees.findIndex((employee) => employee.password.trim().length > 0 && employee.password.trim().length < 6);
    if (invalidEmployeeIndex >= 0) {
        return `Password user karyawan ${invalidEmployeeIndex + 1} minimal 6 karakter.`;
    }

    return null;
};

const addEmployee = (): void => {
    form.employees.push(createEmployee());
};

const removeEmployee = (index: number): void => {
    form.employees.splice(index, 1);
};

const buildRegisterPayload = (): AuthPortalRegisterPayloadModel => ({
    ownerFullName: form.ownerFullName.trim(),
    ownerUsername: form.ownerUsername.trim(),
    ownerEmail: form.ownerEmail.trim(),
    ownerPhoneNumber: toOptionalValue(form.ownerPhoneNumber),
    password: form.password,
    companyName: form.companyName.trim(),
    legalName: toOptionalValue(form.legalName),
    businessType: toOptionalValue(form.businessType),
    companyEmail: toOptionalValue(form.companyEmail),
    companyPhoneNumber: toOptionalValue(form.companyPhoneNumber),
    city: toOptionalValue(form.city),
    address: toOptionalValue(form.address),
    employees: form.employees.map((employee) => ({
        fullName: employee.fullName.trim(),
        username: employee.username.trim(),
        email: toOptionalValue(employee.email),
        phoneNumber: toOptionalValue(employee.phoneNumber),
        role: employee.role,
        password: employee.password
    }))
});

const submitRegister = async (): Promise<void> => {
    const validationMessage = validateRegisterForm();
    if (validationMessage) {
        vm.setError(validationMessage);
        return;
    }

    try {
        await vm.register(buildRegisterPayload());

        await showSuccessMessage('Registrasi berhasil', 'Perusahaan dan akun awal sudah dibuat.', {
            toast: true,
            timer: 1800,
            position: 'top-end'
        });

        await router.replace(resolveRedirectTarget());
    } catch {
        // Error state is handled in the store for inline rendering.
    }
};

onMounted(() => {
    vm.setError(null);
});
</script>
