<template>
  <footer class="text-center">
    <div class="py-3 bg-white border-t border-gray-200 text-gray-700 text-sm">
      &copy; {{ currentYear.value }} Pawnshop Web
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped></style>
