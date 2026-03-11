<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  // Mengarahkan pengguna kembali ke rute 'Home' (yang kita atur sebagai redirect ke '/dashboard')
  router.push({ name: 'Home' });
};
</script>

<template>
  <div class="not-found-container">
    <div class="error-content">
      <h1>404</h1>
      <h2>Halaman Tidak Ditemukan</h2>
      <p>
        Maaf, kami tidak dapat menemukan halaman yang Anda cari.
        Mungkin Anda salah mengetik alamat, atau halaman tersebut sudah dipindahkan.
      </p>

      <button
        class="home-button"
        @click="goHome"
      >
        Kembali ke Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped src="@core/presentation/styles/not_found.css"></style>
