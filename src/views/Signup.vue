<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import GoogleLogin from '@/components/login/GoogleLogin.vue'
import Notice from '@/components/notice/Notice.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'

const BASE_URL = import.meta.env.VITE_BASE_URL
const API_URL = import.meta.env.VITE_API_URL

const email = ref('')
const password = ref('')
const agreeService = ref(false)
const agreePolicy = ref(false)
const isValid = ref(false)

const state = reactive({
  isServiceButtonGreen: false,
  isServiceIconShown: false,
  isPolicyButtonGreen: false,
  isPolicyIconShown: false,
})

const router = useRouter()

const validateForm = () => {
  isValid.value =
    email.value.trim() !== '' &&
    password.value.trim() !== '' &&
    state.isServiceButtonGreen &&
    state.isPolicyButtonGreen
}

watch(
  [
    email,
    password,
    () => state.isServiceButtonGreen,
    () => state.isPolicyButtonGreen,
  ],
  validateForm
)

const goBack = () => {
  router.go(-1)
}

const goAhead = () => {
  router.go(1)
}

const toggleServiceButton = () => {
  state.isServiceButtonGreen = !state.isServiceButtonGreen
  state.isServiceIconShown = state.isServiceButtonGreen
}

const togglePolicyButton = () => {
  state.isPolicyButtonGreen = !state.isPolicyButtonGreen
  state.isPolicyIconShown = state.isPolicyButtonGreen
}

const clearForm = () => {
  email.value = ''
  password.value = ''
  agreeService.value = false
  agreePolicy.value = false
}

const goLogin = () => {
  window.location.href = `${BASE_URL}/login`
}

const goMainPage = () => {
  window.location.href = `${BASE_URL}/`
}

const signup = async () => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const errors = {}

  if (email.value.trim() === '' || password.value.trim() === '') {
    errors.general = '請填寫完整資料'
  } else {
    if (!emailRegex.test(email.value.trim())) {
      errors.email = '電子郵件格式錯誤'
    }

    if (password.value.trim().length < 6) {
      errors.password = '密碼至少需要6個字元'
    }
  }

  if (Object.keys(errors).length > 0) {
    clearForm()
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: Object.values(errors).join('\n'),
      color: '#e1e1e1',
      background: '#27272a',
    })
  } else {
    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        {
          username: 'User',
          email: email.value,
          password: password.value,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: '註冊成功',
          color: '#e1e1e1',
          background: '#27272a',
        })
        clearForm()
        router.push('/login')
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status
        const message = error.response.data.message

        Swal.fire({
          icon: 'error',
          title: '註冊失敗',
          text:
            status === 409
              ? message || '此 email 已註冊過'
              : message || '發生未知錯誤，請稍後再試',
            color: '#e1e1e1',
            background: '#27272a',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: '註冊失敗',
          text: '無法連接到伺服器，請檢查網路連線',
          color: '#e1e1e1',
          background: '#27272a',
        })
      } 
      clearForm()
    }
  }
}
</script>

<template>
  <div class="w-full h-full overflow-hidden bg-black root-container">
    <SidebarGrid />
    <div>
      <header class="z-10 h-16 md:mt-2 md:mr-2 header-bg md:rounded-t-2xl">
        <nav class="header-container">
          <button
            @click="goBack"
            class="flex-none p-1 text-white rounded-full bg-black/50 default-transition hover:bg-zinc-800/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              ></path>
            </svg>
          </button>
          <button
            @click="goAhead"
            class="flex-none hidden p-1 text-white rounded-full md:block bg-black/50 default-transition hover:bg-zinc-800/50 disabled:opacity-30"
            disabled
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              ></path>
            </svg>
          </button>
          <div class="w-full min-w-0 text-lg font-bold text-white md:text-2xl">
            <h2 class="invisible text-2xl font-bold truncate">
              每日卡歷史回顧
            </h2>
          </div>
          <Notice />
          <NavLoginBtn />
        </nav>
      </header>
      <div class="background">
        <main class="relative content-container bg-base md:my-2 md:mr-2 z-1">
          <div class="h-full px-4 content scroll-smooth scrollbar md:px-6">
            <section class="grid w-full place-content-center">
              <div
                class="flex flex-col items-center gap-4 p-4 overflow-auto shadow-lg rounded-xl justify-evenly scrollbar"
              >
                <div class="flex items-center gap-2">
                  <img
                    src="@/img/capie-icon.png"
                    alt=""
                    class="h-[5rem] w-[5rem] rounded-full"
                  />
                </div>
                <h3 class="text-2xl font-bold text-white">會員註冊</h3>
                <div
                  class="flex items-center w-full gap-2 p-2 rounded-2xl bg-input"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    class="flex-none size-7 text-zinc-300"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    ></path>
                  </svg>
                  <input
                    type="email"
                    class="w-full p-0 bg-transparent outline-none focus:ring-0 placeholder:text-zinc-500"
                    placeholder="信箱"
                    v-model="email"
                  />
                </div>
                <div
                  class="flex items-center w-full gap-2 p-2 rounded-2xl bg-input"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    class="flex-none size-7 text-zinc-300"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                    ></path>
                  </svg>
                  <input
                    type="password"
                    class="w-full p-0 bg-transparent outline-none focus:ring-0 placeholder:text-zinc-500"
                    placeholder="密碼"
                    v-model="password"
                  />
                </div>
                <div class="flex items-center w-full gap-2">
                  <button
                    class="flex items-center w-full gap-2 p-2 rounded-2xl bg-input default-transition"
                    :style="{
                      backgroundColor: state.isServiceButtonGreen
                        ? '#203b2a'
                        : '',
                    }"
                    @click="toggleServiceButton"
                  >
                    <div
                      v-if="!state.isServiceIconShown"
                      class="flex-none m-1 rounded-full size-5 bg-zinc-300/10"
                      :class="{
                        '!bg-green-500': state.isServiceButtonGreen,
                        'bg-zinc-300/10': !state.isServiceButtonGreen,
                      }"
                    ></div>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      class="flex-none text-green-400 size-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      ></path>
                    </svg>
                    <p>同意服務條款</p>
                  </button>
                  <a
                    href="https://bottleneko.app/eula"
                    class="grid flex-none p-2 rounded-full place-content-center bg-input"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      class="flex-none size-7 text-zinc-300"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      ></path>
                    </svg>
                  </a>
                </div>
                <div class="flex items-center w-full gap-2">
                  <button
                    class="flex items-center w-full gap-2 p-2 rounded-2xl bg-input default-transition"
                    :style="{
                      backgroundColor: state.isPolicyButtonGreen
                        ? '#203b2a'
                        : '',
                    }"
                    @click="togglePolicyButton"
                  >
                    <div
                      v-if="!state.isPolicyIconShown"
                      class="flex-none m-1 rounded-full size-5 bg-zinc-300/10"
                      :class="{
                        'bg-green-500': state.isPolicyButtonGreen,
                        'bg-zinc-300/10': !state.isPolicyButtonGreen,
                      }"
                    ></div>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      class="flex-none text-green-400 size-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      ></path>
                    </svg>
                    <p>同意隱私權政策</p>
                  </button>
                  <a
                    href="https://bottleneko.app/policy"
                    class="grid flex-none p-2 rounded-full place-content-center bg-input"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      class="flex-none size-7 text-zinc-300"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      ></path>
                    </svg>
                  </a>
                </div>
                <div class="flex flex-col w-full gap-2">
                  <button
                    class="flex items-center justify-center w-full gap-2 p-2 text-white rounded-2xl ring ring-white/50 hover:bg-white/90 hover:text-zinc-900"
                    @click.prevent="signup"
                    :disabled="!isValid"
                  >
                    註冊
                  </button>
                  <button
                    class="flex items-center justify-center w-full gap-2 p-2 rounded-2xl text-cyan-500/50 hover:text-cyan-500"
                    @click="goLogin"
                  >
                    已經有帳號？前往登入
                  </button>
                </div>
                <hr class="w-full my-4 border border-zinc-700/50" />
                <span class="text-zinc-300">請先同意服務條款與隱私權政策</span>
                <GoogleLogin />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';

.root-container {
  display: grid;
  grid-template-columns: 270px 1fr;
  grid-template-rows: 4rem 1fr;
  grid-template-areas:
    'sidebar main'
    'sidebar main';
}

header {
  width: calc(100% - 270px);
  position: fixed;
  top: 0;
  right: 0;
}

.header-container {
  grid-area: navbar;
  height: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.background {
  height: calc(100vh - 1rem);
  width: calc(100vw - 0.5rem - 270px);
  border-radius: 1rem;
  background-color: rgb(18, 18, 18);
  margin: 0.5rem 0.5rem 0.5rem 0;
}

.content-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  grid-area: main-view;
  /* padding-top: 10px; */
  /* overflow: hidden; */
}

.content {
  overflow: auto;
}

.scrollbar {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

section {
  height: 100%;
}

section > div {
  width: 500px;
  background-color: rgb(24, 24, 27);
}

.bg-input {
  background-color: rgb(39, 39, 42);
  color: #fff;
}

.bg-input:focus-within {
  background-color: rgb(63, 63, 70);
}

@media screen and (width < 1200px) {
  .root-container {
    display: grid;
    grid-template-areas:
      'main'
      'main';
    grid-template-columns: 1fr;
    grid-template-rows: 4rem 1fr;
    height: 100vh;
  }

  header {
    width: 100%;
    position: fixed;
    top: 0;
    right: 0;
  }

  .background {
    width: 100%;
    margin: 0;
    border-radius: 0;
    background-color: #121212;
  }

  .content-container {
    padding-top: 0;
    height: 100vh;
  }

  section {
    height: 100vh;
    margin: auto;
  }

  section > div {
    height: 90%;
  }
}

@media screen and (width < 768px) {
  body {
    background-color: #121212;
  }

  .content-container {
    padding-top: 0;
  }

  section > div {
    width: 100%;
    height: calc(100% - 70.5px);
    background-color: #121212;
    padding: 0 1rem;
  }
}
</style>
