<template>
  <Navbar />
  <main>
    <RouterView />
  </main>
  <ToastMessage v-if="toastStore.hasToasts" />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import Navbar from '@/views/NavBar.vue';
import ToastMessage from './components/ToastMessage.vue';

const authStore = useAuthStore();
const toastStore = useToastStore();

onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<style>
main {
  padding-top: 8px;
}
</style>
