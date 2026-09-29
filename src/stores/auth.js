import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

import AuthService from '@/api/auth';

const authService = new AuthService();

export const useAuthStore = defineStore('auth', () => {

  const user = ref({});
  const loggedIn = ref(false);

  // Verifica se o usuário pertence ao grupo Administradores
  const isAdmin = computed(() =>
    user.value.groups?.some(
      grupo => grupo.name === 'Administradores'
    ) ?? false
  );

  // Verifica se o usuário pertence ao grupo Funcionários
  const isFuncionario = computed(() =>
    user.value.groups?.some(
      grupo => grupo.name === 'Funcionarios'
    ) ?? false
  );

  const login = async (email, password) => {

    const data = await authService.login(email, password);

    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    // Busca os dados do usuário autenticado
    user.value = await authService.getUser();

    loggedIn.value = true;
  };

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
    user,
    loggedIn,

    isAdmin,
    isFuncionario,

    login,
    register,
    logout,
    checkAuth,
    updateProfile
  };
});