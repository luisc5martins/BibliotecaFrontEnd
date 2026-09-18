<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router'
const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  authStore.logout()
  router.push({ name: 'home' })
})
</script>

<template>
  <div class="page">
    <p class="text-muted text-center">Saindo...</p>
  </div>
</template>
