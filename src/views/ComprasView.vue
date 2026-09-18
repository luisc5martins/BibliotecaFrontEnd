<script setup>
import { onMounted } from 'vue'
import { useCompraStore } from '@/stores/compra'
import { useToastStore } from '@/stores/toast'
import { formatarPreco, formatarData } from '@/utils/formatters'

const compraStore = useCompraStore()
const toast = useToastStore()

onMounted(async () => {
  try {
    await compraStore.getCompras()
  } catch (error) {
    toast.showToast('Erro ao carregar compras.', 'error')
  }
})

function badgeClass(status) {
  const map = { carrinho: 'badge-warning', finalizado: 'badge-info', pago: 'badge-success', entregue: 'badge-muted' }
  return map[status?.toLowerCase()] || 'badge-muted'
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">Minhas Compras</h1>
    <div v-if="!compraStore.compras.length" class="empty-state">
      <p>Nenhuma compra encontrada.</p>
    </div>
    <div class="compras-list" v-else>
      <div v-for="compra in compraStore.compras" :key="compra.id" class="card">
        <div class="compra-header">
          <strong>Compra #{{ compra.id }}</strong>
          <span class="badge" :class="badgeClass(compra.status)">
            {{ compra.status }}
          </span>
        </div>
        <div class="compra-info">
          <span v-if="compra.data">{{ formatarData(compra.data) }}</span>
          <span><strong>Total:</strong> {{ formatarPreco(compra.total) }}</span>
        </div>
        <ul class="compra-itens" v-if="compra.itens">
          <li v-for="(item, idx) in compra.itens" :key="idx">
            {{ item.livro.titulo || item.livro }} — Qtd: {{ item.quantidade }} — {{ formatarPreco(item.preco) }}
          </li>
        </ul>
      </div>
    </div>
    <div class="paginator" v-if="compraStore.meta.total_pages > 1">
      <button class="btn btn-outline btn-sm" :disabled="compraStore.meta.page == 1" @click="compraStore.paginaAnterior">
        Anterior
      </button>
      <span>Página {{ compraStore.meta.page }} de {{ compraStore.meta.total_pages }}</span>
      <button class="btn btn-outline btn-sm" :disabled="compraStore.meta.page == compraStore.meta.total_pages" @click="compraStore.proximaPagina">
        Próxima
      </button>
    </div>
  </div>
</template>

<style scoped>
.compras-list {
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.compra-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.compra-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-bottom: 0.5rem;
}
.compra-itens {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid var(--border);
  padding-top: 0.5rem;
}
.compra-itens li {
  font-size: 0.85rem;
  color: var(--muted-foreground);
  padding: 0.25rem 0;
}
</style>
