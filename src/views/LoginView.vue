<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();

const email = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value);
    router.push({ name: 'home' });
  } catch (err) {
    toastStore.showToast('Email ou senha inválidos.', 'error');
  }
}
</script>

<template>
  <div class="auth-page">
    <h1 class="page-title text-center">Login</h1>
    <div class="card auth-card">
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="label" for="email">Email</label>
          <input id="email" type="email" v-model="email" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="label" for="password">Senha</label>
          <input id="password" type="password" v-model="password" autocomplete="current-password" required />
        </div>
        <button type="submit" class="btn" style="width:100%">Entrar</button>
      </form>
      <p class="text-muted text-sm" style="margin-top:16px;text-align:center">
        Não tem conta? <router-link :to="{ name: 'registro' }">Cadastre-se</router-link>
      </p>
    </div>
  </div>
</template>


