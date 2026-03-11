<template>
  <section class="auth-portal">
    <aside class="auth-portal__aside">
      <div class="auth-portal__brand">
        <div class="auth-portal__brand-mark">
          PS
        </div>
        <p class="auth-portal__eyebrow">
          Login Sistem
        </p>
        <h1 class="auth-portal__headline">
          Masuk untuk kelola operasional gadai perusahaan Anda.
        </h1>
        <p class="auth-portal__lead">
          Gunakan akun owner atau user karyawan yang sudah didaftarkan di perusahaan Anda.
        </p>
      </div>

      <ul class="auth-portal__feature-list">
        <li class="auth-portal__feature-item">
          <div class="auth-portal__feature-icon">
            <i class="bi bi-building" />
          </div>
          <div class="auth-portal__feature-copy">
            <strong>Multi perusahaan</strong>
            <span>Setiap akun terhubung ke data perusahaan dan tim kerja masing-masing.</span>
          </div>
        </li>
        <li class="auth-portal__feature-item">
          <div class="auth-portal__feature-icon">
            <i class="bi bi-people" />
          </div>
          <div class="auth-portal__feature-copy">
            <strong>User owner dan karyawan</strong>
            <span>Owner dapat mendaftarkan user admin atau staff yang akan memakai aplikasi.</span>
          </div>
        </li>
      </ul>

      <p class="auth-portal__note">
        Klik ikon informasi untuk melihat seluruh akun demo yang tersedia. Tombol masuk akan langsung memakai user demo pertama.
      </p>
    </aside>

    <main class="auth-portal__main">
      <div class="auth-portal__panel auth-portal__panel--login">
        <div class="auth-portal__panel-head">
          <div class="auth-portal__title-row">
            <div>
              <p class="auth-portal__eyebrow auth-portal__eyebrow--panel mb-0">
                Selamat Datang
              </p>
              <h2 class="auth-portal__title">
                Login
              </h2>
            </div>

            <button
              class="auth-portal__info-toggle"
              type="button"
              :aria-expanded="isDemoInfoModalOpen"
              title="Lihat akun demo"
              @click="openDemoInfoModal"
            >
              <i class="bi bi-info-lg" />
            </button>
          </div>

          <p class="auth-portal__subtitle">
            Untuk demo app ini, tombol login langsung memakai user demo pertama. Ikon info menampilkan semua username dan password yang bisa dipakai.
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
          @submit.prevent="submitLogin"
        >
          <div class="auth-portal__field-grid auth-portal__field-grid--single">
            <div class="auth-portal__field">
              <label for="login-credential">Username atau email</label>
              <input
                id="login-credential"
                v-model.trim="form.credential"
                type="text"
                class="ps-field form-control"
                placeholder="Username demo"
                autocomplete="username"
              >
              <small>User default demo pertama: {{ defaultDemoCredential }}</small>
            </div>

            <div class="auth-portal__field">
              <label for="login-password">Password</label>
              <input
                id="login-password"
                v-model="form.password"
                type="password"
                class="ps-field form-control"
                placeholder="Password demo"
                autocomplete="current-password"
              >
              <small>Password default demo: {{ demoPassword }}</small>
            </div>
          </div>

          <div class="auth-portal__actions">
            <div class="auth-portal__switch">
              Belum punya akun?
              <RouterLink to="/register">
                Daftar perusahaan
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
                  class="bi bi-box-arrow-in-right"
                />
                <span>{{ isSubmitting ? 'Memproses...' : 'Masuk' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>

    <div
      v-if="isDemoInfoModalOpen"
      class="auth-portal__modal-backdrop"
      @click.self="closeDemoInfoModal"
    >
      <section class="auth-portal__modal">
        <div class="auth-portal__modal-head">
          <div>
            <p class="auth-portal__eyebrow auth-portal__eyebrow--panel mb-0">
              Akun Demo
            </p>
            <h3 class="auth-portal__modal-title">
              Username dan password yang bisa login
            </h3>
          </div>

          <button
            class="auth-portal__modal-close"
            type="button"
            title="Tutup"
            @click="closeDemoInfoModal"
          >
            <i class="bi bi-x-lg" />
          </button>
        </div>

        <div class="auth-portal__info-panel auth-portal__info-panel--modal">
          <div class="auth-portal__info-head">
            <strong>Akun demo aktif</strong>
            <span>Password semua akun: {{ demoPassword }}</span>
          </div>

          <div class="auth-portal__info-list">
            <article
              v-for="company in demoCompanies"
              :key="`demo-info-${company.companyName}`"
              class="auth-portal__info-item"
            >
              <strong>{{ company.companyName }}</strong>
              <span>{{ company.city }} | {{ company.businessType }}</span>

              <div class="auth-portal__info-user-list">
                <div class="auth-portal__info-user">
                  <div>
                    <strong>Owner | {{ company.owner.username }}</strong>
                    <span>{{ company.owner.fullName }} | {{ company.owner.email }}</span>
                  </div>

                  <button
                    class="auth-portal__button-secondary auth-portal__button-secondary--compact"
                    type="button"
                    @click="useDemoAccount(company.owner.username)"
                  >
                    Use
                  </button>
                </div>

                <div
                  v-for="employee in company.employees"
                  :key="employee.username"
                  class="auth-portal__info-user"
                >
                  <div>
                    <strong>{{ employee.role }} | {{ employee.username }}</strong>
                    <span>{{ employee.fullName }} | {{ employee.email }}</span>
                  </div>

                  <button
                    class="auth-portal__button-secondary auth-portal__button-secondary--compact"
                    type="button"
                    @click="useDemoAccount(employee.username)"
                  >
                    Use
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import '@feature/auth_portal/presentation/styles/auth_portal.scss';
import { authPortalViewModel } from '@feature/auth_portal/presentation/view_models/auth_portal.vm';
import { AUTH_PORTAL_DEMO_PASSWORD, authPortalDemoCompanies } from '@feature/auth_portal/util/auth_portal_demo_accounts';

const router = useRouter();
const route = useRoute();
const vm = authPortalViewModel();
const { error, isSubmitting } = storeToRefs(vm);
const demoCompanies = authPortalDemoCompanies;
const demoPassword = AUTH_PORTAL_DEMO_PASSWORD;
const defaultDemoCredential = authPortalDemoCompanies[0]?.owner.username ?? '';
const isDemoInfoModalOpen = ref(false);

const form = reactive({
    credential: defaultDemoCredential,
    password: demoPassword
});

const resolveRedirectTarget = (): string => {
    const redirect = route.query.redirect;
    return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard';
};

const openDemoInfoModal = (): void => {
    isDemoInfoModalOpen.value = true;
};

const closeDemoInfoModal = (): void => {
    isDemoInfoModalOpen.value = false;
};

const useDemoAccount = (credential: string): void => {
    form.credential = credential;
    form.password = demoPassword;
    closeDemoInfoModal();
};

const submitLogin = async (): Promise<void> => {
    try {
        await vm.login({
            credential: form.credential.trim() || defaultDemoCredential,
            password: form.password || demoPassword
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
