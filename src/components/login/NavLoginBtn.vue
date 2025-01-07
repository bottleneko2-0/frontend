<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import AngleD from '@/components/svg/AngleD.vue'
import Human from '@/components/svg/Human.vue'

const API_URL = import.meta.env.VITE_API_URL
const router = useRouter()
const name = ref('')
const email = ref('')
const picture = ref('')

// 從 localStorage 取得 token
const token = localStorage.getItem('token')

// 檢查是否已登入
const isloggedIn = computed(() => !!token)

const getAccount = async () => {
  if (!isloggedIn.value) return

  try {
    const res = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    name.value = res.data.username
    email.value = res.data.email
    picture.value = res.data.picture
  } catch (error) {
    console.error('獲取用戶資料失敗：', error)
  }
}

const gotoLink = () => {
  if (isloggedIn.value) {
    router.push({ name: 'user' })
  } else {
    router.push({ name: 'login' })
  }
}

onMounted(() => {
  getAccount()
})
</script>

<template>
  <div
    @click="gotoLink"
    class="flex items-center gap-1 text-white rounded-full cursor-pointer bg-black/50 default-transition hover:bg-zinc-800/50"
  >
    <div class="flex flex-col items-center gap-1 p-1 rounded-full">
      <div class="flex-none overflow-hidden rounded-full size-6 bg-black/70">
        <img v-if="picture" :src="picture" alt="使用者頭像" />
        <Human v-else class="stroke-[1.5] size-4 m-1 text-zinc-200" />
      </div>
    </div>
    <span v-if="isloggedIn" class="text-sm flex-none max-w-[8rem] truncate">{{
      name
    }}</span>
    <span v-else class="text-sm flex-none max-w-[8rem] truncate">登入</span>
    <div class="p-1 rounded-full">
      <AngleD class="flex-none w-4 h-4 stroke-[1.5]" />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';
</style>
