<script setup>
import { onMounted, ref } from 'vue'
import { useFavoritoStore } from '@/stores/favorito'
import { useToastStore } from '@/stores/toast'

const favoritoStore = useFavoritoStore()
const toast = useToastStore()
const editandoId = ref(null)
const editComentario = ref('')

onMounted(async () => {
  await favoritoStore.getFavoritos()
})

async function alterarNota(fav, novaNota) {
  try {
    await favoritoStore.atualizarFavorito(fav.id, { nota: novaNota })
    toast.showToast('Nota atualizada.')
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao atualizar nota.', 'error')
  }
}

function iniciarEdicao(fav) {
  editandoId.value = fav.id
  editComentario.value = fav.comentario || ''
}

function cancelarEdicao() {
  editandoId.value = null
}

async function salvarComentario(id) {
  try {
    await favoritoStore.atualizarFavorito(id, { comentario: editComentario.value })
    editandoId.value = null
    toast.showToast('Comentário atualizado.')
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao atualizar comentário.', 'error')
  }
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja remover este favorito?')) return
  try {
    await favoritoStore.excluirFavorito(id)
    toast.showToast('Favorito removido.')
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao remover favorito.', 'error')
  }
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">Meus Favoritos</h1>
    <div v-if="!favoritoStore.favoritos.length" class="empty-state">
      <p>Nenhum favorito ainda.</p>
      <router-link class="btn btn-outline" :to="{ name: 'livros' }">Ver livros</router-link>
    </div>
    <div class="favoritos-list" v-else>
      <div v-for="fav in favoritoStore.favoritos" :key="fav.id" class="card">
        <div class="fav-header">
          <strong>{{ fav.livro_titulo || `Livro #${fav.livro}` }}</strong>
          <small class="text-muted">{{ formatarData(fav.data_atualizacao) }}</small>
        </div>

        <div class="stars">
          <span
            v-for="n in 5"
            :key="n"
            class="star clickable"
            :class="{ active: n <= fav.nota }"
            @click="alterarNota(fav, n)"
          >&#9733;</span>
        </div>

        <div v-if="editandoId === fav.id">
          <textarea class="input" v-model="editComentario" placeholder="Comentário" rows="2"></textarea>
          <div class="fav-actions">
            <button class="btn btn-sm" @click="salvarComentario(fav.id)">Salvar</button>
            <button class="btn btn-outline btn-sm" @click="cancelarEdicao">Cancelar</button>
          </div>
        </div>

        <div v-else>
          <p v-if="fav.comentario" class="text-muted" style="margin-bottom: 0.5rem;">{{ fav.comentario }}</p>
          <div class="fav-actions">
            <button class="btn btn-outline btn-sm btn-icon-sm" @click="iniciarEdicao(fav)" title="Editar comentário"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="btn btn-destructive btn-sm btn-icon-sm" @click="excluir(fav.id)" title="Remover"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div>
        </div>
      </div>
    </div>
    <div class="paginator" v-if="favoritoStore.meta.total_pages > 1">
      <button class="btn btn-outline btn-sm" :disabled="favoritoStore.meta.page == 1" @click="favoritoStore.paginaAnterior">
        Anterior
      </button>
      <span>Página {{ favoritoStore.meta.page }} de {{ favoritoStore.meta.total_pages }}</span>
      <button class="btn btn-outline btn-sm" :disabled="favoritoStore.meta.page == favoritoStore.meta.total_pages" @click="favoritoStore.proximaPagina">
        Próxima
      </button>
    </div>
  </div>
</template>

<style scoped>
.favoritos-list {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.fav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.fav-actions {
  display: flex;
  gap: 0.5rem;
}
textarea.input {
  margin-bottom: 0.5rem;
}
</style>
