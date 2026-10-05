<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  title: {
    type: String,
    required: true
  },

  models: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <section class="admin-section">

    <div class="section-title">
      {{ title }}
    </div>

    <div
      v-for="model in models"
      :key="model.name"
      class="admin-row"
    >
      <span class="model-name">
        {{ model.name }}
      </span>

      <div class="model-actions">

        <RouterLink
          :to="`${model.route}/novo`"
          class="action add"
        >
          <span>＋</span>
          Adicionar
        </RouterLink>

        <RouterLink
          :to="model.route"
          class="action edit"
        >
          <span>✎</span>
          Modificar
        </RouterLink>

      </div>
    </div>

  </section>
</template>

<style scoped>
.admin-section {
  margin-bottom: 38px;
}

.section-title {
  background: #447f98;
  padding: 12px 15px;
  font-size: 16px;
  color: #fff;
}

.admin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 15px;
  border-bottom: 1px solid #292929;
}

.admin-row:nth-child(even) {
  background: #222;
}

.model-name {
  color: #55bfff;
  font-weight: 600;
}

.model-actions {
  display: flex;
  gap: 32px;
}

.action {
  text-decoration: none;
  font-size: 16px;
}

.action.add {
  color: #55bfff;
}

.action.edit {
  color: #55bfff;
}

.action.add span {
  color: #65bd22;
  font-size: 22px;
}

.action.edit span {
  color: #e3b900;
  font-size: 18px;
}
</style>