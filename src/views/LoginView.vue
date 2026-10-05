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

      if (authStore.isAdmin) {
        router.push({ name: 'admin' });
      } else if (authStore.isFuncionario) {
        router.push({ name: 'livros' });
      } else {
        router.push({ name: 'livros' });
      }
  } catch (err) {
    toastStore.showToast('Email ou senha inválidos.', 'error');
  }
}
</script>

<template>
  <div class="auth-page">
    <img class="page-logo text-center" src="@/assets/logoHorizontal.png" alt="Login"/>
    <div class="card auth-card">
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="label" for="email">Email</label>
          <input class="input" id="email" type="email" v-model="email" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="label" for="password">Senha</label>
          <input class="input" id="password" type="password" v-model="password" autocomplete="current-password" required />
        </div>
        <button type="submit" class="button" style="width:100%">Entrar</button>
      </form>
      <p class="text-muted text-sm" style="margin-top:16px;text-align:center">
        Não tem conta? <router-link :to="{ name: 'registro' }">Cadastre-se</router-link>
      </p>
    </div>
  </div>
</template>
<style scoped>

.page-logo.text-center{
  display: block;
  margin: 0 auto;
  width: 250px;
  height: auto;
  margin-bottom: 80px;
}

.button {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 16px; font-size: 0.875rem; font-weight: 500; font-family: inherit;
  border: 1px; border-radius: calc(var(--radius) - 2px);
  cursor: pointer; transition: background-color 0.15s, opacity 0.15s;
  background: white; color: black;
  margin-top: 10px;
}
.button:hover { opacity: 0.9; }
.button:disabled { opacity: 0.5; cursor: not-allowed; }

.label{
  color: white;
}

.input{
  color: white;
}

.text-muted.text-sm{
  color: white;
}

:global(html),
:global(body) {
  margin: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.auth-page {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;

  background-image: url('@/assets/imagemBackground.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 0px;
}

</style>