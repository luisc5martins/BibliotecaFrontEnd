import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

import AuthService from '@/api/auth';
const authService = new AuthService();

const TIPO_USUARIO = { CLIENTE: 1, VENDEDOR: 2, GERENTE: 3 };

export const useAuthStore = defineStore('auth', () => {
  const user = ref({});
  const loggedIn = ref(false);

  const isCliente = computed(() => user.value.tipo_usuario === TIPO_USUARIO.CLIENTE);
  const isVendedor = computed(() => user.value.tipo_usuario === TIPO_USUARIO.VENDEDOR);
  const isGerente = computed(() => user.value.tipo_usuario === TIPO_USUARIO.GERENTE);
  const isAdmin = computed(() => user.value.is_superuser || user.value.is_staff);
  const canManage = computed(() => isVendedor.value || isGerente.value || isAdmin.value);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    user.value = await authService.getUser();
    loggedIn.value = true;
  }

  async function register(email, name, password) {
    await authService.register(email, name, password);
    await login(email, password);
  }

  function logout() {
    user.value = {};
    loggedIn.value = false;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        user.value = await authService.getUser();
        loggedIn.value = true;
      } catch {
        logout();
      }
    }
  }

  async function updateProfile(data) {
    const updatedUser = await authService.updateUser(data);
    user.value = updatedUser;
    return updatedUser;
  }

  return {
    user, loggedIn,
    isCliente, isVendedor, isGerente, isAdmin, canManage,
    login, register, logout, checkAuth, updateProfile
  };
});
