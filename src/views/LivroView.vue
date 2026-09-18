<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import ModalAdicionarLivro from "../components/livros/ModalAdicionarLivro.vue";
import { useLivroStore } from "@/stores/livro";
import { useCompraStore } from "@/stores/compra";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import { useFavoritoStore } from "@/stores/favorito";
import LivrosApi from "@/api/livros";
import { formatarPreco } from "@/utils/formatters";

const livrosApi = new LivrosApi();
const livroStore = useLivroStore();
const compraStore = useCompraStore();
const authStore = useAuthStore();
const toast = useToastStore();
const favoritoStore = useFavoritoStore();
const canManage = computed(() => authStore.canManage);
const showModal = ref(false);
const livroParaEditar = ref(null);
const busca = ref('');
let buscaTimer = null;

onMounted(async () => {
  try {
    await livroStore.getLivros();
    await favoritoStore.getFavoritos();
  } catch (error) {
    toast.showToast('Erro ao carregar livros.', 'error');
  }
});

onUnmounted(() => {
  clearTimeout(buscaTimer);
});

function onBusca() {
  clearTimeout(buscaTimer);
  buscaTimer = setTimeout(() => {
    livroStore.getLivros(1, busca.value);
  }, 400);
}

function editar(livro) {
  livroParaEditar.value = { ...livro };
  showModal.value = true;
}

function abrirModal() {
  livroParaEditar.value = null;
  showModal.value = true;
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir este livro?')) return;
  try {
    await livroStore.excluirLivro(id);
    toast.showToast('Livro excluído!');
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao excluir. Verifique se não há registros vinculados.', 'error');
  }
}

async function adicionarAoCarrinho(livroId) {
  try {
    await compraStore.adicionarAoCarrinho(livroId);
    toast.showToast('Adicionado ao carrinho!');
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao adicionar ao carrinho.', 'error');
  }
}

async function favoritar(livroId) {
  const favoritoExistente = buscarFavoritoPorLivro(livroId);

  try {
    if (favoritoExistente) {
      await favoritoStore.excluirFavorito(favoritoExistente.id);
      toast.showToast('Removido dos favoritos!');
      return;
    }

    await livrosApi.favoritar(livroId, {});
    await favoritoStore.getFavoritos();
    toast.showToast('Adicionado aos favoritos!');
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao favoritar livro.', 'error');
  }
}

function buscarFavoritoPorLivro(livroId) {
  return favoritoStore.favoritos.find((f) => f.livro?.id === livroId || f.livro === livroId);
}

function estaFavoritado(livroId) {
  return Boolean(buscarFavoritoPorLivro(livroId));
}

async function aoSalvar() {
  showModal.value = false;
  toast.showToast('Livro salvo!');
  await livroStore.getLivros(livroStore.meta.page);
}

function capUrl(livro) {
  if (livro.capa && livro.capa.url) return livro.capa.url;
  return "https://placehold.co/50x70?text=?";
}

</script>

<template>
  <div class="page">
    <div class="livro-header">
      <h1 class="page-title">Livros</h1>
      <button v-if="canManage" class="btn btn-icon" @click="abrirModal">+</button>
    </div>

    <div class="search-wrapper">
      <input class="search-input" type="text" v-model="busca" @input="onBusca" placeholder="Buscar livros..." />
      <button v-if="busca" class="search-clear" @click="busca = ''; onBusca()">&times;</button>
    </div>

    <p v-if="livroStore.loading" class="text-muted">Carregando...</p>
    <div v-else-if="!livroStore.livros.length" class="empty-state">Nenhum livro cadastrado.</div>
    <ul class="list" v-else>
      <li class="list-item" v-for="livro in livroStore.livros" :key="livro.id">
        <div class="livro-info" @click="editar(livro)">
          <img :src="capUrl(livro)" alt="Capa" class="livro-capa" />
          <div>
            <strong>{{ livro.titulo }}</strong>
            <span class="text-muted text-sm">{{ formatarPreco(livro.preco) }}</span>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-ghost btn-sm btn-fav" @click="favoritar(livro.id)" title="Favoritar"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="estaFavoritado(livro.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
          <button class="btn btn-success btn-sm btn-icon-sm" @click="adicionarAoCarrinho(livro.id)" title="Adicionar ao carrinho"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></button>
          <button v-if="canManage" class="btn btn-destructive btn-sm btn-icon-sm" @click="excluir(livro.id)" title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </li>
    </ul>

    <div class="paginator">
      <button class="btn btn-outline btn-sm" :disabled="livroStore.meta.page == 1" @click="livroStore.paginaAnterior">Anterior</button>
      <button class="btn btn-outline btn-sm" :disabled="livroStore.meta.page == livroStore.meta.total_pages" @click="livroStore.proximaPagina">Próxima</button>
      <span>Página {{ livroStore.meta.page }} de {{ livroStore.meta.total_pages }}</span>
    </div>
  </div>

  <modal-adicionar-livro
    v-if="showModal"
    :livro-para-editar="livroParaEditar"
    @close="showModal = false"
    @salvo="aoSalvar"
  />
</template>

<style scoped>
.livro-header { display: flex; justify-content: space-between; align-items: center; }
.livro-info { display: flex; gap: 12px; align-items: center; cursor: pointer; }
.livro-capa { width: 48px; height: 64px; object-fit: cover; border-radius: calc(var(--radius) - 2px); }
.livro-info div { display: flex; flex-direction: column; }
</style>
