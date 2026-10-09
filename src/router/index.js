import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/auth';
import CategoriaView from "../views/CategoriaView.vue";
import LoginView from "../views/LoginView.vue";
import LogoutView from "../views/LogoutView.vue";
import RegisterView from "../views/RegisterView.vue";
import UsuarioView from "../views/UsuarioView.vue";
import LivroView from "../views/LivroView.vue";
import EditoraView from "../views/EditoraView.vue";
import AutorView from "../views/AutorView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import AdminView from "../views/AdminView.vue";
import ReservasView from "../views/ReservasView.vue";
import LivrosAdminView from "../views/LivrosAdminView.vue";
import UsuarioAdminView from "../views/UsuarioAdminView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/categorias",
      name: "categorias",
      component: CategoriaView,
      meta: { requiresAuth: true },
    },
    {
      path: "/home",
      name: "livros",
      component: LivroView,
      meta: { requiresAuth: true },
    },
    {
      path: "/livrosAdmin",
      name: "livros-admin",
      component: LivrosAdminView,
      meta: { requiresAuth: true },
    },
    {
      path: "/editoras",
      name: "editoras",
      component: EditoraView,
      meta: { requiresAuth: true },
    },
    {
      path: "/autores",
      name: "autores",
      component: AutorView,
      meta: { requiresAuth: true },
    },
    {
      path: "/",
      name: "login",
      component: LoginView,
    },
    {
      path: "/registro",
      name: "registro",
      component: RegisterView,
    },
    {
      path: "/usuario",
      name: "usuario",
      component: UsuarioView,
      meta: { requiresAuth: true },
    },
    {
      path: "/usuarioAdmin",
      name: "usuario-admin",
      component: UsuarioAdminView,
      meta: { requiresAuth: true },
    },
    {
      path: "/reservas",
      name: "reservas",
      component: ReservasView,
      meta: { requiresAuth: true },
    },
    {
      path: "/logout",
      name: "logout",
      component: LogoutView,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundView,
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminView,
      meta: {
        requiresAuth: true,
        grupo: "Administradores"
      }
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  const loggedIn = !!localStorage.getItem('access_token');

  if (to.meta.requiresAuth && !loggedIn) {
    return { name: 'login' };
  }

  if (!to.meta.grupo) {
    return true;
  }

  if (!authStore.loggedIn) {
    await authStore.checkAuth();
  }

  if (to.meta.grupo === 'Administradores') {
    if (authStore.isAdmin) {
      return true;
    }

    return { name: 'admin' };
  }

  if (to.meta.grupo === 'Funcionarios') {
    if (authStore.isFuncionario) {
      return true;
    }

    return { name: 'livros' };
  }

  return true;
});

export default router;
