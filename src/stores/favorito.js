import { ref } from 'vue'
import { defineStore } from 'pinia'

import FavoritoApi from '@/api/favorito'

const favoritoApi = new FavoritoApi()

export const useFavoritoStore = defineStore('favorito', () => {
  const favoritos = ref([])
  const meta = ref({
    page: 0,
    page_size: 0,
    total_pages: 0
  })

  async function getFavoritos(page = 1) {
    const data = await favoritoApi.buscarFavoritos(page)
    favoritos.value = data.results
    meta.value.page = data.page
    meta.value.page_size = data.page_size
    meta.value.total_pages = data.total_pages
  }

  async function atualizarFavorito(id, payload) {
    await favoritoApi.atualizarFavorito(id, payload)
    const fav = favoritos.value.find((f) => f.id === id)
    if (fav) Object.assign(fav, payload)
  }

  async function excluirFavorito(id) {
    await favoritoApi.excluirFavorito(id)
    const index = favoritos.value.findIndex((f) => f.id === id)
    if (index >= 0) favoritos.value.splice(index, 1)
  }

  async function proximaPagina() {
    await getFavoritos(meta.value.page + 1)
  }

  async function paginaAnterior() {
    await getFavoritos(meta.value.page - 1)
  }

  return {
    favoritos,
    meta,
    getFavoritos,
    atualizarFavorito,
    excluirFavorito,
    proximaPagina,
    paginaAnterior
  }
})
