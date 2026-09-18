import { ref } from 'vue'
import { defineStore } from 'pinia'

import EditoraApi from '@/api/editora'

const editoraApi = new EditoraApi()

export const useEditoraStore = defineStore('editora', () => {
  const editoras = ref([])
  const meta = ref({
    page: 0,
    page_size: 0,
    total_pages: 0
  })

  const currentSearch = ref('')

  async function getEditoras(page = 1, search = '') {
    currentSearch.value = search
    const data = await editoraApi.buscarTodasAsEditoras(page, search)
    editoras.value = data.results
    meta.value.page = data.page
    meta.value.page_size = data.page_size
    meta.value.total_pages = data.total_pages
  }

  async function search(text) {
    await getEditoras(1, text)
  }

  async function excluirEditora(id) {
    await editoraApi.excluirEditora(id)
    const index = editoras.value.findIndex((editora) => editora.id === id)
    editoras.value.splice(index, 1)
  }

  async function salvarEditora(editora) {
    if (editora.id) {
      await editoraApi.atualizarEditora(editora)
      const index = editoras.value.findIndex((e) => e.id === editora.id)
      editoras.value.splice(index, 1, editora)
    } else {
      const data = await editoraApi.adicionarEditora(editora)
      editoras.value.splice(0, 0, data)
    }
  }

  async function proximaPagina() {
    await getEditoras(meta.value.page + 1, currentSearch.value)
  }

  async function paginaAnterior() {
    await getEditoras(meta.value.page - 1, currentSearch.value)
  }

  return {
    editoras,
    meta,
    getEditoras,
    search,
    salvarEditora,
    excluirEditora,
    proximaPagina,
    paginaAnterior
  }
})
