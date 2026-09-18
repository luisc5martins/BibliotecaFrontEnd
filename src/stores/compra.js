import { ref } from 'vue'
import { defineStore } from 'pinia'

import CompraApi from '@/api/compra'

const compraApi = new CompraApi()

export const useCompraStore = defineStore('compra', () => {
  const compras = ref([])
  const carrinho = ref(null)
  const loading = ref(false)
  const meta = ref({
    page: 0,
    page_size: 0,
    total_pages: 0
  })

  async function getCompras(page = 1) {
    loading.value = true
    try {
      const data = await compraApi.buscarCompras(page)
      compras.value = data.results
      meta.value.page = data.page
      meta.value.page_size = data.page_size
      meta.value.total_pages = data.total_pages
    } finally {
      loading.value = false
    }
  }

  async function getCarrinho() {
    const data = await compraApi.buscarCompras(1)
    const found = data.results.find((c) => c.status === 'Carrinho')
    if (found) {
      carrinho.value = await compraApi.buscarCompra(found.id)
    } else {
      carrinho.value = null
    }
  }

  async function adicionarAoCarrinho(livroId, quantidade = 1) {
    await compraApi.adicionarAoCarrinho(livroId, quantidade)
    await getCarrinho()
  }

  async function alterarQuantidadeItem(livroId, novaQuantidade) {
    if (!carrinho.value) return
    const novosItens = carrinho.value.itens.map((item) => ({
      livro: item.livro.id,
      quantidade: item.livro.id === livroId ? novaQuantidade : item.quantidade
    }))
    await compraApi.atualizarCompra(carrinho.value.id, novosItens)
    await getCarrinho()
  }

  async function removerItemDoCarrinho(livroId) {
    if (!carrinho.value) return
    const novosItens = carrinho.value.itens
      .filter((item) => item.livro.id !== livroId)
      .map((item) => ({ livro: item.livro.id, quantidade: item.quantidade }))
    await compraApi.atualizarCompra(carrinho.value.id, novosItens)
    await getCarrinho()
  }

  async function finalizarCompra(id) {
    await compraApi.finalizarCompra(id)
    await getCarrinho()
    await getCompras(meta.value.page || 1)
  }

  async function proximaPagina() {
    await getCompras(meta.value.page + 1)
  }

  async function paginaAnterior() {
    await getCompras(meta.value.page - 1)
  }

  return {
    compras,
    carrinho,
    loading,
    meta,
    getCompras,
    getCarrinho,
    adicionarAoCarrinho,
    alterarQuantidadeItem,
    removerItemDoCarrinho,
    finalizarCompra,
    proximaPagina,
    paginaAnterior
  }
})
