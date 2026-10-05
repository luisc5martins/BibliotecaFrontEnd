<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useLivroStore } from '@/stores/livro'
import { useToastStore } from '@/stores/toast'

const livroStore = useLivroStore()
const toast = useToastStore()

const API_URL = 'http://localhost:8000'

const defaultLivro = {
  id: null,
  nome: '',
  capa: '',
  isbn: '',
  categoria: '',
  autor: '',
  editora: ''
}

const livro = reactive({ ...defaultLivro })
const busca = ref('')
let buscaTimer = null


function capaUrl(capa) {
  return capa?.url || ''
}

onMounted(async () => {
  await livroStore.getLivros()
})

onUnmounted(() => {
  clearTimeout(buscaTimer)
})

function onBusca() {
  clearTimeout(buscaTimer)

  buscaTimer = setTimeout(() => {
    livroStore.getLivros(1, busca.value)
  }, 400)
}

function limpar() {
  Object.assign(livro, { ...defaultLivro })
}

async function salvar() {
  try {
    await livroStore.salvarLivro({ ...livro })

    toast.showToast(
      livro.id ? 'Livro atualizado!' : 'Livro criado!'
    )

    limpar()
  } catch (error) {
    toast.showToast(
      error.response?.data?.detail || 'Erro ao salvar livro.',
      'error'
    )
  }
}

function editar(l) {
  Object.assign(livro, l)

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

</script>

<template>
  <div class="page">

    <h1 class="page-title">Livros</h1>

    <div class="form-row">

      <div class="form-group">
        <label class="label" for="livro-nome">Nome</label>
        <input
          id="livro-nome"
          type="text"
          v-model="livro.nome"
        />
      </div>

      <div class="form-group">
        <label class="label">Capa</label>
          
        <img
          v-if="livro.capa"
          :src="capaUrl(livro.capa)"
          alt="Capa do livro"
          class="livro-capa-preview"
        />
      </div>

      <div class="form-group">
        <label class="label" for="livro-isbn">ISBN</label>
        <input
          id="livro-isbn"
          type="text"
          v-model="livro.isbn"
        />
      </div>

      <div class="form-group">
        <label class="label" for="livro-categoria">Categoria</label>
        <input
          id="livro-categoria"
          type="text"
          v-model="livro.categoria"
        />
      </div>

      <div class="form-group">
        <label class="label" for="livro-autor">Autor</label>
        <input
          id="livro-autor"
          type="text"
          v-model="livro.autor"
        />
      </div>

      <div class="form-group">
        <label class="label" for="livro-editora">Editora</label>
        <input
          id="livro-editora"
          type="text"
          v-model="livro.editora"
        />
      </div>

      <button class="btn" @click="salvar">
        {{ livro.id ? 'Atualizar' : 'Salvar' }}
      </button>

      <button class="btn btn-outline" @click="limpar">
        Limpar
      </button>

    </div>

    <div class="search-wrapper">
      <input
        class="search-input"
        type="text"
        v-model="busca"
        @input="onBusca"
        placeholder="Buscar livros..."
      />

      <button
        v-if="busca"
        class="search-clear"
        @click="busca = ''; onBusca()"
      >
        &times;
      </button>
    </div>

    <div
      v-if="!livroStore.livros.length"
      class="empty-state"
    >
      Nenhum livro cadastrado.
    </div>

    <ul class="list" v-else>

      <li
  class="list-item"
  v-for="l in livroStore.livros"
  :key="l.id"
>
  <img
    v-if="l.capa"
    :src="capaUrl(l.capa)"
    alt="Capa"
    class="livro-capa-lista"
  />

  <span>
    ({{ l.id }}) — {{ l.titulo }}
  </span>

  <div class="list-item-actions">
    <button
      class="btn btn-outline btn-sm btn-icon-sm"
      @click="editar(l)"
      title="Editar"
    >
      ✎
    </button>
  </div>
</li>

    </ul>

    <div class="paginator">

      <button
        class="btn btn-outline btn-sm"
        :disabled="livroStore.meta.page == 1"
        @click="livroStore.paginaAnterior"
      >
        Anterior
      </button>

      <button
        class="btn btn-outline btn-sm"
        :disabled="livroStore.meta.page == livroStore.meta.total_pages"
        @click="livroStore.proximaPagina"
      >
        Próxima
      </button>

      <span>
        Página {{ livroStore.meta.page }}
        de
        {{ livroStore.meta.total_pages }}
      </span>

    </div>

  </div>
</template>
<style scoped>
.livro-capa-preview {
  width: 120px;
  height: 170px;
  object-fit: cover;
  border-radius: 6px;
}

.livro-capa-lista {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
</style>