import { ref } from 'vue'
import { defineStore } from 'pinia'

import LivrosApi from '@/api/livros'

const livrosApi = new LivrosApi()

export const useLivroStore = defineStore('livro', () => {
  const livros = ref([])
  const loading = ref(false)
  const meta = ref({
    page: 0,
    page_size: 0,
    total_pages: 0
  })

  const currentSearch = ref('')

  async function getLivros(page = 1, search = '') {
    currentSearch.value = search
    loading.value = true
    try {
      const data = await livrosApi.buscarTodosOsLivros(page, search)
      livros.value = data.results
      meta.value.page = data.page
      meta.value.page_size = data.page_size
      meta.value.total_pages = data.total_pages
    } finally {
      loading.value = false
    }
  }

  async function search(text) {
    await getLivros(1, text)
  }

  async function excluirLivro(id) {
    await livrosApi.excluirLivro(id)
    const index = livros.value.findIndex((livro) => livro.id === id)
    livros.value.splice(index, 1)
  }

  async function salvarLivro(livro) {
    if (livro.id) {
      const data = await livrosApi.atualizarLivro(livro)
      const index = livros.value.findIndex((l) => l.id === livro.id)
      livros.value.splice(index, 1, data)
    } else {
      const data = await livrosApi.adicionarLivro(livro)
      livros.value.splice(0, 0, data)
    }
  }

  async function proximaPagina() {
    await getLivros(meta.value.page + 1, currentSearch.value)
  }

  async function paginaAnterior() {
    await getLivros(meta.value.page - 1, currentSearch.value)
  }

  return {
    livros,
    loading,
    meta,
    getLivros,
    search,
    salvarLivro,
    excluirLivro,
    proximaPagina,
    paginaAnterior
  }
})
