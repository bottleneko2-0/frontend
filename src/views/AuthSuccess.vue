<script setup>
import { useRoute, useRouter } from 'vue-router'
import Loading from '@/components/loading/Loading.vue'

const route = useRoute()
const router = useRouter()

const token = route.query.token

if (token) {
  localStorage.setItem('token', token)
  router.push({ name: 'user' })
} else {
  router.push({ name: 'login' })
}
</script>

<template>
  <Loading />
</template>
