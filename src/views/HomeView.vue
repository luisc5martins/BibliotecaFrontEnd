<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.loggedIn);
const user = computed(() => authStore.user);
</script>

<template>
  <div class="page" style="text-align:center;padding-top:60px">
    <div v-if="isLoggedIn">
      <h1 class="page-title">Bem-vindo, {{ user.name || user.email }}!</h1>
      <p class="text-muted">Use o menu acima para navegar pelo sistema.</p>
    </div>
    <div v-else>
      <h1 class="page-title">Bem-vindo à Livraria</h1>
      <p class="text-muted">
        Faça <router-link :to="{ name: 'login' }">login</router-link> para acessar o sistema.
      </p>
    </div>
  </div>
</template>
