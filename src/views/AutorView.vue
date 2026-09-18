<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAutorStore } from '@/stores/autor'
import { useToastStore } from '@/stores/toast'

const autorStore = useAutorStore()
const toast = useToastStore()

const defaultAutor = { id: null, nome: '', email: '' }
const autor = reactive({ ...defaultAutor })
const busca = ref('')
let buscaTimer = null

onMounted(async () => {
  await autorStore.getAutores()
})

onUnmounted(() => {
  clearTimeout(buscaTimer)
})

function onBusca() {
  clearTimeout(buscaTimer)
  buscaTimer = setTimeout(() => {
    autorStore.getAutores(1, busca.value)
  }, 400)
}

function limpar() {
  Object.assign(autor, { ...defaultAutor })
}

async function salvar() {
  try {
    await autorStore.salvarAutor({ ...autor })
    toast.showToast(autor.id ? 'Autor atualizado!' : 'Autor criado!')
    limpar()
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao salvar autor.', 'error')
  }
}

function editar(a) {
  Object.assign(autor, a)
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir este autor?')) return
  try {
    await autorStore.excluirAutor(id)
    toast.showToast('Autor excluído!')
    limpar()
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao excluir. Verifique se não há registros vinculados.', 'error')
  }
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">Autores</h1>
    <div class="form-row">
      <div class="form-group">
        <label class="label" for="aut-nome">Nome</label>
        <input id="aut-nome" type="text" v-model="autor.nome" />
      </div>
      <div class="form-group">
        <label class="label" for="aut-email">Email</label>
        <input id="aut-email" type="text" v-model="autor.email" />
      </div>
      <button class="btn" @click="salvar">Salvar</button>
      <button class="btn btn-outline" @click="limpar">Limpar</button>
    </div>

    <div class="search-wrapper">
      <input class="search-input" type="text" v-model="busca" @input="onBusca" placeholder="Buscar autores..." />
      <button v-if="busca" class="search-clear" @click="busca = ''; onBusca()">&times;</button>
    </div>

    <div v-if="!autorStore.autores.length" class="empty-state">Nenhum autor cadastrado.</div>
    <ul class="list" v-else>
      <li class="list-item" v-for="a in autorStore.autores" :key="a.id">
        <span>({{ a.id }}) — {{ a.nome }} <span class="text-muted text-sm" v-if="a.email">— {{ a.email }}</span></span>
        <div class="list-item-actions">
          <button class="btn btn-outline btn-sm btn-icon-sm" @click="editar(a)" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="btn btn-destructive btn-sm btn-icon-sm" @click="excluir(a.id)" title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </li>
    </ul>

    <div class="paginator">
      <button class="btn btn-outline btn-sm" :disabled="autorStore.meta.page == 1" @click="autorStore.paginaAnterior">Anterior</button>
      <button class="btn btn-outline btn-sm" :disabled="autorStore.meta.page == autorStore.meta.total_pages" @click="autorStore.proximaPagina">Próxima</button>
      <span>Página {{ autorStore.meta.page }} de {{ autorStore.meta.total_pages }}</span>
    </div>
  </div>
</template>
