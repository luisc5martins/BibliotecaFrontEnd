<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useAutorStore } from '@/stores/autor'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const autorStore = useAutorStore()
const toast = useToastStore()
const authStore = useAuthStore()
const defaultAutor = { id: null, nome: '' }
const autor = reactive({ ...defaultAutor })
const busca = ref('')
let buscaTimer = null
const router = useRouter()

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

function voltarInicio() {
  if (authStore.isAdmin) {
    router.push({ name: 'admin' });
  } else {
    router.push({ name: 'livros' });
  }
}

</script>

<template>
  
<div class="page">

  <div class="page-header">
    <button class="btn-voltar" @click="voltarInicio" title="Voltar">
      &lt;
    </button>

    <h1 class="page-title">Autores</h1>
  </div>
    <div class="form-row">
      <div class="form-group">
        <label class="label" for="aut-nome">Nome</label>
        <input class="input-name" id="aut-nome" type="text" v-model="autor.nome" />
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
        <span>({{ a.id }}) — {{ a.nome }}</span>
        <div class="list-item-actions">
          <button class="btn btn-outline btn-sm btn-icon-sm" @click="editar(a)" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
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
<style scoped>

.btn-voltar {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.btn-voltar:hover {
  transform: translateX(-3px);
  opacity: 0.85;
}

.page-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
}

.btn.btn-outline.btn-sm {
  border: 1px solid var(--secondary);
  cursor: pointer;
}

.btn.btn-outline.btn-sm:disabled {
  cursor: not-allowed;
}

.list-item {
  border-bottom: 1px solid var(--secondary);
}

.btn.btn-outline {
  border: 1px solid var(--secondary);
}

.input-name {
  border: 1px solid var(--secondary);
}
</style>