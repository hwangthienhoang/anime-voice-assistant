import { createApp } from 'vue';
import App from '@/app/App.vue';
import { router } from '@/app/router/index.js';
import '@/assets/styles/index.css';

createApp(App).use(router).mount('#app');
