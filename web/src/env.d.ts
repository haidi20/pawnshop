// src/env.d.ts

/// <reference types="vite/client" />

declare module '*.vue' {
  import { defineComponent } from 'vue';
  export default defineComponent;
}

// Hanya deklarasi tipe, JANGAN BERI NILAI DEFAULT DI SINI
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_MODE_ENV: string;
  readonly VITE_APP_TITLE: string;
  readonly MODE: 'local' | 'dev' | 'prod'; // Tambahkan tipe yang lebih spesifik jika perlu
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Blok untuk modul non-JS/TS (CSS/SCSS) agar TypeScript tidak error saat mengimpornya.
declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: any;
  export default content;
}

declare module '*.ts' {
  const ts: any;
  export default ts;
}

declare module 'bootstrap/dist/js/bootstrap.bundle' {

}
