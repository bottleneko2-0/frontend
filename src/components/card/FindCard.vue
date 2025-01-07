<script setup>
import { ref } from 'vue'
import Swal from 'sweetalert2'
import Tag from '@/components/svg/Tag.vue'
import Close from '@/components/svg/Close.vue'
import Earth from '@/components/svg/Earth.vue'
import Tick from '@/components/svg/Tick.vue'

const API_URL = import.meta.env.VITE_API_URL
const button = ref(true) // true 代表 "deck"，false 代表 "social"
const searchType = ref('') // 默認類型
const searchCode = ref('') // 用戶輸入的代碼
const error = ref(null) // 錯誤訊息
const modalSection = ref(null)

const changeBtn = (type) => {
  searchType.value = type
  button.value = type === 'deck' // true 表示 "deck"
}

const fetchAndNavigate = async () => {
  error.value = null // 清空錯誤訊息
  if (!searchCode.value.trim()) {
    error.value = '請輸入代碼！'
    return
  }

  try {
    const response = await fetch(
      `${API_URL}/api/search?${
        searchType.value === 'deck'
          ? `deckId=${searchCode.value}`
          : `post_code=${searchCode.value}`
      }`
    )
    const data = await response.json()

    if (response.ok) {
      const route =
        searchType.value === 'deck'
          ? `/deck/${data.data.deck_id}`
          : `/social/${data.data.post_code}`
      window.location.href = route // 替代 Vue Router
    } else {
      error.value = data.error || '未知錯誤'
    }
  } catch (err) {
    error.value = '伺服器連線失敗！'
  }
}
// 彈出確認框
const confirmClose = () => {
  Swal.fire({
    title: '確定要離開嗎？',
    text: '您的資料尚未完成，確定要離開嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '離開',
    cancelButtonText: '取消',
    reverseButtons: true,
    color: '#e1e1e1',
    background: '#27272a',
  }).then((result) => {
    if (result.isConfirmed) {
      // 用戶確認離開，隱藏模態框
      if (modalSection.value) {
        modalSection.value.style.display = 'none'
      }
    }
  })
}

const hideModal = () => {
  const modalElement = document.querySelector('.modal')
  if (modalElement) {
    modalElement.style.display = 'none'
  }
}
</script>

<template>
  <section
    class="fixed top-0 left-0 w-screen h-screen z-[100] grid overflow-y-auto overflow-x-hidden md:overflow-hidden backdrop-blur place-content-center"
    ref="modalSection"
  >
    <div
      class="bg-base md:rounded-xl relative h-mobile-full overflow-auto flex flex-col w-[50vw]"
    >
      <header
        class="sticky top-0 z-20 flex items-center px-4 pt-4 pb-2 border-b bg-zinc-900 border-zinc-800"
      >
        <h2 class="w-full text-white grow-1" id="title">尋找牌組</h2>
        <div class="flex justify-end flex-none gap-2">
          <button
            class="flex-none p-1 text-white rounded-full bg-black/70 hover:bg-white hover:text-black"
            @click="confirmClose"
          >
            <Close class="w-6 h-6" />
          </button>
        </div>
      </header>
      <div class="pane-content" id="content">
        <div
          class="h-full flex flex-col gap-2 pb-4 text-white divide-y divide-white/10 min-h-[20rem]"
          query="[object Object]"
        >
          <section class="mb-4">
            <h3 class="my-4 topic">
              選擇來源 <br />
              <span class="subtitle">選擇你的牌組代碼來源</span>
            </h3>
            <div class="grid grid-cols-2 gap-2 md:grid-cols-2">
              <button
                @click="changeBtn('deck')"
                :class="searchType === 'deck' ? 'active' : 'dimmed'"
                class="item default-transition active button"
              >
                <Tag class="icon size-6" />
                <span>牌組</span>
              </button>
              <button
                @click="changeBtn('social')"
                :class="searchType === 'social' ? 'active' : 'dimmed'"
                class="item default-transition button"
              >
                <Earth class="icon size-6" />
                <span>社群</span>
              </button>
            </div>
          </section>
          <section class="mb-4">
            <h3 class="my-4 topic">輸入代碼</h3>
            <div class="grid grid-cols-1 gap-2">
              <div class="item default-transition">
                <input
                  class="w-full p-0 bg-transparent custom-input placeholder:text-zinc-500"
                  type="text"
                  placeholder="代碼"
                  v-model="searchCode"
                />
              </div>
              <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
            </div>
            <div class="flex justify-center mt-8">
              <button
                class="item md:!w-[20rem] justify-center default-transition gray"
                @click="fetchAndNavigate"
              >
                <Tick class="icon size-6" />
                <span> 設定完成 </span>
              </button>
            </div>
          </section>
        </div>
      </div>
      <footer class="w-full pb-4 mt-auto"></footer>
    </div>
  </section>
</template>

<style scoped>
@import '@/assets/base.css';

#title {
  justify-content: left;
}

#content {
  justify-content: flex-start;
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}

.subtitle {
  color: rgb(161 161 170);
  display: block;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1rem;
  margin-top: 5px;
}
.custom-input:focus-visible {
  border-color: transparent !important;
  outline: none;
}

.item {
  align-items: center;
  border-radius: 0.75rem;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  border: 2px solid #27272a;
  background-color: #151516;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.item.active {
  background-color: #13aadd; /* 選中時的背景顏色 */
  color: white; /* 選中時的文字顏色 */
  border-color: white; /* 選中時的邊框顏色 */
}

.item.dimmed {
  background-color: #27272a; /* 未選中時的背景顏色 */
  color: rgb(161, 161, 170); /* 未選中時的文字顏色 */
  border-color: #27272a; /* 未選中時的邊框顏色 */
}

.gray:hover {
  background-color: #27272a;
}

.backdrop-blur {
  --tw-backdrop-blur: blur(8px);
}

.bg-base {
  background-color: #121212;
}

.card {
  background-color: #13aadd;
}
</style>
