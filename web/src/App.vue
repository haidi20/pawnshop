<template>
  <div
    id="app"
    class="min-h-screen bg-gray-50 font-sans antialiased flex flex-col"
  >
    <div class="flex-1 flex items-center justify-center">
      <div class="container">
        <div class="row justify-content-center ">
          <div class="col-12 col-md-5">
            <RouterView />

            <div class="footer text-center">
              {{ copyRight }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';

const copyRight = ref<string>("");

onMounted(async () => {
  await getCopyRight();
});

const getCopyRight = async (): Promise<void> => {
  const year = new Date().getFullYear();
  await new Promise(resolve => setTimeout(resolve, 500));

  copyRight.value = `© ${year} web.`;
};
</script>

<style>
/* CSS Reset Global */
html,
body {
  margin: 0;
  padding: 0;

}

.hight-max {
  height: 90vh;
}
</style>
