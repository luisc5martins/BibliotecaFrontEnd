<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useCategoriaStore } from '@/stores/categoria'
import { useToastStore } from '@/stores/toast'

const categoriaStore = useCategoriaStore()
const toast = useToastStore()

const defaultCategoria = { id: null, descricao: '' }
const categoria = reactive({ ...defaultCategoria })
const busca = ref('')
let buscaTimer = null

onMounted(async () => {
  await categoriaStore.getCategorias()
})

onUnmounted(() => {
  clearTimeout(buscaTimer)
})

function onBusca() {
  clearTimeout(buscaTimer)
  buscaTimer = setTimeout(() => {
    categoriaStore.getCategorias(1, busca.value)
  }, 400)
}

function limpar() {
  Object.assign(categoria, { ...defaultCategoria })
}

async function salvar() {
  try {
    await categoriaStore.salvarCategoria({ ...categoria })
    toast.showToast(categoria.id ? 'Categoria atualizada!' : 'Categoria criada!')
    limpar()
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao salvar categoria.', 'error')
  }
}

function editar(cat) {
  Object.assign(categoria, cat)
}

async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
  try {
    await categoriaStore.excluirCategoria(id)
    toast.showToast('Categoria excluída!')
    limpar()
  } catch (error) {
    toast.showToast(error.response?.data?.detail || 'Erro ao excluir. Verifique se não há registros vinculados.', 'error')
  }
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">Categorias</h1>
    <div class="form-row">
      <div class="form-group">
        <label class="label" for="cat-desc">Descrição</label>
        <input id="cat-desc" type="text" v-model="categoria.descricao" />
      </div>
      <button class="btn" @click="salvar">Salvar</button>
      <button class="btn btn-outline" @click="limpar">Limpar</button>
    </div>

    <div class="search-wrapper">
      <input class="search-input" type="text" v-model="busca" @input="onBusca" placeholder="Buscar categorias..." />
      <button v-if="busca" class="search-clear" @click="busca = ''; onBusca()">&times;</button>
    </div>

    <div v-if="!categoriaStore.categorias.length" class="empty-state">
      Nenhuma categoria cadastrada.
    </div>
    <ul class="list" v-else>
      <li class="list-item" v-for="cat in categoriaStore.categorias" :key="cat.id">
        <span>({{ cat.id }}) — {{ cat.descricao }}</span>
        <div class="list-item-actions">
          <button class="btn btn-outline btn-sm btn-icon-sm" @click="editar(cat)" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="btn btn-destructive btn-sm btn-icon-sm" @click="excluir(cat.id)" title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </li>
    </ul>

    <div class="paginator">
      <button class="btn btn-outline btn-sm" :disabled="categoriaStore.meta.page == 1" @click="categoriaStore.paginaAnterior">Anterior</button>
      <button class="btn btn-outline btn-sm" :disabled="categoriaStore.meta.page == categoriaStore.meta.total_pages" @click="categoriaStore.proximaPagina">Próxima</button>
      <span>Página {{ categoriaStore.meta.page }} de {{ categoriaStore.meta.total_pages }}</span>
    </div>
  </div>
</template>
