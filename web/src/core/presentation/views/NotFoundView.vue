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

<style scoped>
/* Styling sederhana untuk tampilan Not Found */
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  text-align: center;
  background-color: #f8f9fa; /* Warna latar belakang ringan */
}

.error-content {
  padding: 40px;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 8rem;
  color: #dc3545; /* Merah untuk menunjukkan error */
  margin-bottom: 0;
}

h2 {
  font-size: 2rem;
  color: #343a40;
  margin-top: 10px;
  margin-bottom: 20px;
}

p {
  color: #6c757d;
  margin-bottom: 30px;
}

.home-button {
  background-color: #007bff; /* Biru Primer */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.home-button:hover {
  background-color: #0056b3;
}
</style>
