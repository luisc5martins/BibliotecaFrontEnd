```vue
<script setup>
import { onMounted } from 'vue'
import { useReservaStore } from '@/stores/reserva'
import { useToastStore } from '@/stores/toast'
import { formatarData } from '@/utils/formatters'

const reservaStore = useReservaStore()
const toast = useToastStore()

onMounted(async () => {
  try {
    await reservaStore.getReservas()
  } catch (error) {
    toast.showToast('Erro ao carregar reservas.', 'error')
  }
})

function badgeClass(status) {
  const map = {
    pendente: 'badge-warning',
    reservada: 'badge-info',
    confirmado: 'badge-info',
    retirada: 'badge-success',
    retirado: 'badge-success',
    devolvida: 'badge-muted',
    devolvido: 'badge-muted',
    cancelada: 'badge-muted',
    cancelado: 'badge-muted'
  }

  return map[status?.toLowerCase()] || 'badge-muted'
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">Minhas Reservas</h1>

    <div v-if="!reservaStore.reservas.length" class="empty-state">
      <p>Nenhuma reserva encontrada.</p>
    </div>

    <div class="reservas-list" v-else>
      <div v-for="reserva in reservaStore.reservas" :key="reserva.id" class="card">
        <div class="reserva-header">
          <strong>Reserva #{{ reserva.id }}</strong>

          <span class="badge" :class="badgeClass(reserva.status)">
            {{ reserva.status }}
          </span>
        </div>

        <div class="reserva-info">
          <span v-if="reserva.data_criacao">
            {{ formatarData(reserva.data_criacao) }}
          </span>
        </div>

        <ul class="reserva-itens" v-if="reserva.itens?.length">
          <li v-for="(item, idx) in reserva.itens" :key="item.id || idx">
            {{ item.livro.titulo || item.livro }}
          </li>
        </ul>
      </div>
    </div>

    <div class="paginator" v-if="reservaStore.meta.total_pages > 1">
      <button class="btn btn-outline btn-sm" :disabled="reservaStore.meta.page == 1"
        @click="reservaStore.paginaAnterior">
        Anterior
      </button>

      <span>
        Página {{ reservaStore.meta.page }}
        de {{ reservaStore.meta.total_pages }}
      </span>

      <button class="btn btn-outline btn-sm" :disabled="reservaStore.meta.page == reservaStore.meta.total_pages
        " @click="reservaStore.proximaPagina">
        Próxima
      </button>
    </div>
  </div>
</template>

<style scoped>
.reservas-list {
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reserva-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reserva-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--muted-foreground);
  margin-bottom: 0.5rem;
  color: white;
}

.reserva-itens {
  list-style: none;
  padding: 0;
  margin: 0;
  border-top: 1px solid white;
  padding-top: 0.5rem;
  color: white;
}

.reserva-itens li {
  font-size: 0.85rem;
  padding: 0.25rem 0;
}

.card{
  background-color: var(--primary);
}
</style>