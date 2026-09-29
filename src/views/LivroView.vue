<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import ModalAdicionarLivro from "../components/livros/ModalAdicionarLivro.vue";
import { useLivroStore } from "@/stores/livro";
import { useReservaStore } from "@/stores/reserva";
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
const reservaStore = useReservaStore();
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

async function reservarLivro(livroId) {
  try {
    await reservaStore.criarReserva(livroId)

    mostrarPopup(
      'Livro reservado com sucesso!',
      'sucesso'
    )
  } catch (error) {
    const data = error.response?.data

    const mensagem = Array.isArray(data)
      ? data[0]
      : data?.detail ||
        data?.non_field_errors?.[0] ||
        data?.message ||
        'Erro ao reservar o livro.'

    mostrarPopup(mensagem, 'erro')
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

const popup = ref({
  aberto: false,
  mensagem: '',
  tipo: 'sucesso'
})

function mostrarPopup(mensagem, tipo = 'sucesso') {
  popup.value = {
    aberto: true,
    mensagem,
    tipo
  }
}

function fecharPopup() {
  popup.value.aberto = false
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
            <span class="quantidade-livro" :class="{ esgotado: livro.quantidade === 0 }">
              {{ livro.quantidade > 0
              ? `${livro.quantidade} disponíveis`
              : 'Indisponível'
              }}
            </span>
            <button v-if="livro.sinopse" class="btn-sinopse" @click.stop="abrirSinopse(livro)">Ver sinopse</button>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-reservar btn-sm btn-icon-sm" @click="reservarLivro(livro.id)" title="Reservar livro">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16v17l-8-4-8 4V4z" />
            </svg>
          </button>
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

  <div v-if="popup.aberto" class="popup-overlay" @click.self="fecharPopup">
    <div class="popup">
      <button class="popup-fechar" @click="fecharPopup">
        &times;
      </button>

      <div class="popup-icone" :class="popup.tipo">
        <span v-if="popup.tipo === 'sucesso'">✓</span>
        <span v-else>!</span>
      </div>

      <h2>{{ popup.tipo === 'sucesso' ? 'Reserva realizada!' : 'Não foi possível reservar' }}</h2>
      <p>{{ popup.mensagem }}</p>
    
      <button class="btn btn-reservar popup-btn" @click="fecharPopup">OK</button>
    </div>
  </div>
</template>

<style scoped>

.btn-reservar {
  background-color: #26749F;
  border-color: #26749F;
  color: white;
}

.btn-reservar:hover {
  background-color: #1f5f83;
  border-color: #1f5f83;
}

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

.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.popup {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--background);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: popupEntrada 0.2s ease-out;
}

.popup-fechar {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
  color: var(--text-muted);
}

.popup-icone {
  width: 50px;
  height: 50px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: bold;
}

.popup-icone.sucesso {
  background: #26749F;
  color: white;
}

.popup-icone.erro {
  background: #dc3545;
  color: white;
}

.popup h2 {
  margin: 0 0 0.75rem;
}

.popup p {
  margin: 0 0 1.5rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.popup-btn {
  min-width: 100px;
}

.quantidade-livro {
  margin-top: 4px;
  font-size: 13px;
}

.quantidade-livro.esgotado {
  color: #dc3545;
}

@keyframes popupEntrada {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
