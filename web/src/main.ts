// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';

// 🔹 Styling
import 'bootstrap/dist/css/bootstrap.css';
import './core/presentation/styles/base.css';
import 'bootstrap/dist/js/bootstrap.bundle';
import './core/presentation/styles/main.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';

// 🔹 App & plugins
import App from './App.vue';
import router from './core/util/router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// 🔹 Error handler global
app.config.errorHandler = (err, instance, info) => {
    console.error('[Vue Global Error]', { err, info });
};

try {
    app.mount('#app');
} catch (err) {
    console.error('Failed to mount app:', err);
}
