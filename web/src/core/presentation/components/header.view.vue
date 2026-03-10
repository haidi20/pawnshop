<template>
  <div class="d-flex justify-content-between align-items-center p-3">
    <div class="d-flex align-items-center">
      <div
        v-if="isBack"
        role="button"
        class="me-3"
        title="Kembali"
        @click="onGoBack"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-arrow-left"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
      </div>
      <!-- <i class="bi bi-geo-alt-fill text-danger me-2"></i>
            <span class="fw-bold">Lokasi Anda</span>
            <i class="bi bi-chevron-down ms-1"></i> -->
    </div>
    <div
      class="d-flex align-items-center cursor-pointer"
      @click="onOpenHistory"
    >
      <!-- <span class="me-3">🇬🇧 <i class="bi bi-chevron-down ms-1"></i></span> -->
      <i class="bi bi-journal-text fs-5" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { defineProps } from 'vue';

const props = defineProps({
    isBack: {
        type: Boolean,
        default: true
    }
});

const router = useRouter();

const onOpenHistory = (): void => {
    router.push({ name: 'Histories' });
};

const onGoBack = (): void => {
    router.back();
};
</script>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
</style>
