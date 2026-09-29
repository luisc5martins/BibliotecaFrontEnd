<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import ModalAdicionarLivro from "../components/livros/ModalAdicionarLivro.vue";
import { useLivroStore } from "@/stores/livro";
import { useCompraStore } from "@/stores/compra";
import { useAuthStore } from "@/stores/auth";
import { useToastStore } from "@/stores/toast";
import LivrosApi from "@/api/livros";

onMounted(async () => {
  try {
    await livroStore.getLivros();

    console.log('LIVROS CARREGADOS:', livroStore.livros);
  } catch (error) {
    console.error('ERRO AO CARREGAR LIVROS:', error);
    toast.showToast('Erro ao carregar livros.', 'error');
  }
});

const livrosApi = new LivrosApi();
const livroStore = useLivroStore();
const compraStore = useCompraStore();
const authStore = useAuthStore();
const toast = useToastStore();
const canManage = computed(() => authStore.canManage);
const showModal = ref(false);
const livroParaEditar = ref(null);
const busca = ref('');
let buscaTimer = null;
const livroSinopse = ref(null);

onMounted(async () => {
  try {
    await livroStore.getLivros();
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

async function aoSalvar() {
  showModal.value = false;
  toast.showToast('Livro salvo!');
  await livroStore.getLivros(livroStore.meta.page);
}

function capUrl(livro) {
  if (livro.capa && livro.capa.url) return livro.capa.url;
  return "https://placehold.co/50x70?text=?";
}

function abrirSinopse(livro) {
  livroSinopse.value = livro;
}

function fecharSinopse() {
  livroSinopse.value = null;
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
        <div class="livro-info">
          <img :src="capUrl(livro)" alt="Capa" class="livro-capa" />

          <div>
            <strong>{{ livro.titulo }}</strong>

            <button v-if="livro.sinopse" class="btn-sinopse" @click.stop="abrirSinopse(livro)">
              Ver sinopse
            </button>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-success btn-sm btn-icon-sm" @click="adicionarAoCarrinho(livro.id)"
            title="Adicionar ao carrinho"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg></button>
          <button v-if="canManage" class="btn btn-destructive btn-sm btn-icon-sm" @click="excluir(livro.id)"
            title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg></button>
        </div>
      </li>
    </ul>

    <div class="paginator">
      <button class="btn btn-outline btn-sm" :disabled="livroStore.meta.page == 1"
        @click="livroStore.paginaAnterior">Anterior</button>
      <button class="btn btn-outline btn-sm" :disabled="livroStore.meta.page == livroStore.meta.total_pages"
        @click="livroStore.proximaPagina">Próxima</button>
      <span>Página {{ livroStore.meta.page }} de {{ livroStore.meta.total_pages }}</span>
    </div>
  </div>

  <div v-if="livroSinopse" class="sinopse-overlay" @click.self="fecharSinopse">
    <div class="sinopse-modal">

      <button class="sinopse-fechar" @click="fecharSinopse">
        &times;
      </button>

      <h2>{{ livroSinopse.titulo }}</h2>

      <img :src="capUrl(livroSinopse)" :alt="`Capa de ${livroSinopse.titulo}`" class="sinopse-capa" />

      <div class="sinopse-conteudo">
        <h3>Sinopse</h3>

        <p>
          {{ livroSinopse.sinopse }}
        </p>
      </div>

    </div>
  </div>

  <modal-adicionar-livro v-if="showModal" :livro-para-editar="livroParaEditar" @close="showModal = false"
    @salvo="aoSalvar" />
</template>

<style scoped>

:root {
    --azul: #368BB8;
    --azul-escuro: #26749F;
    --preto: #151515;
    --branco: #FFFFFF;
    --fundo: #F7F7F7;
    --cinza: #D9D9D9;
}

.livro-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.livro-info {
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
}

.livro-capa {
  width: 150px;
  height: 230px;
  object-fit: cover;
  border-radius: calc(var(--radius) - 2px);
}

.livro-info div {
  display: flex;
  flex-direction: column;
}

.livro-sinopse {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--text-muted);
}

.sinopse-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.sinopse-modal {
  position: relative;
  background: var(--background);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--radius);
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.sinopse-modal h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.sinopse-fechar {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
  color: var(--text-muted);
}

.sinopse-capa {
  width: 180px;
  height: 260px;
  object-fit: cover;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  margin-bottom: 1.5rem;
}

.sinopse-conteudo {
  text-align: left;
  margin-bottom: 1.5rem;
}

.sinopse-conteudo h3 {
  margin-bottom: 0.5rem;
}

.sinopse-conteudo p {
  line-height: 1.6;
  white-space: pre-line;
}

.btn-sinopse {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--background);
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-sinopse:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.btn-sinopse:active {
  transform: translateY(1px);
}
</style>
