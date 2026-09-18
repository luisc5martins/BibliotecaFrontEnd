import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CategoriaView from "../views/CategoriaView.vue";
import LoginView from "../views/LoginView.vue";
import LogoutView from "../views/LogoutView.vue";
import RegisterView from "../views/RegisterView.vue";
import UsuarioView from "../views/UsuarioView.vue";
import LivroView from "../views/LivroView.vue";
import EditoraView from "../views/EditoraView.vue";
import AutorView from "../views/AutorView.vue";
import CarrinhoView from "../views/CarrinhoView.vue";
import ComprasView from "../views/ComprasView.vue";
import FavoritosView from "../views/FavoritosView.vue";
import NotFoundView from "../views/NotFoundView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/categorias",
      name: "categorias",
      component: CategoriaView,
      meta: { requiresAuth: true },
    },
    {
      path: "/livros",
      name: "livros",
      component: LivroView,
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
      path: "/login",
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
      path: "/carrinho",
      name: "carrinho",
      component: CarrinhoView,
      meta: { requiresAuth: true },
    },
    {
      path: "/compras",
      name: "compras",
      component: ComprasView,
      meta: { requiresAuth: true },
    },
    {
      path: "/favoritos",
      name: "favoritos",
      component: FavoritosView,
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
    }
  ],
});

router.beforeEach((to) => {
  const loggedIn = !!localStorage.getItem('access_token');
  if (to.meta.requiresAuth && !loggedIn) {
    return { name: 'login' };
  }
});

export default router;
