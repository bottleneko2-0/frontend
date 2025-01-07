<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import Loading from '@/components/loading/Loading.vue'
import SideBar from '@/components/home/SidebarGrid.vue'
import Notice from '@/components/notice/Notice.vue'
import Login from '@/components/login/NavLoginBtn.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import AngleL from '@/components/svg/AngleL.vue'
import Logout from '@/components/svg/Logout.vue'
import Email from '@/components/svg/Email.vue'
import Edit from '@/components/svg/Edit.vue'
import Tick from '@/components/svg/Tick.vue'
import Close from '@/components/svg/Close.vue'
import Tag from '@/components/svg/Tag.vue'
import Ball from '@/components/svg/Ball.vue'
import Book from '@/components/svg/Book.vue'
import ArrowR from '@/components/svg/ArrowR.vue'
import Refresh from '@/components/svg/Refresh.vue'
import ProfileImg from '@/components/svg/ProfileImg.vue'

const API_URL = import.meta.env.VITE_API_URL
const router = useRouter()
const name = ref('')
const email = ref('')
const picture = ref('')
const decks = ref([])
const posts = ref([])
const fileInput = ref(null)
const isUploading = ref(false) // 是否正在上傳圖片
const isEditingName = ref(false) // 是否正在編輯名字
const originalName = ref('') // 原始名字
const isScrolled = ref(false) // 是否滾動

// 計算獲取的牌組和文章數量
const deckCount = computed(() => decks.value.length)
const postCount = computed(() => posts.value.length)

const getAccount = async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    Swal.fire({
      icon: 'error',
      title: '尚未登入',
      text: '請先登入',
      color: '#e1e1e1',
      background: '#27272a',
    })
    await nextTick()
    router.replace({ name: 'login' })
    return
  }

  try {
    const res = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    name.value = res.data.username
    email.value = res.data.email
    picture.value = res.data.picture

    await getUserDecks()
    await getUserArticles()
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire({
        icon: 'error',
        title: '已超過登入期限',
        text: '請重新登入',
        color: '#e1e1e1',
        background: '#27272a',
      })
      await nextTick()
      router.replace({ name: 'login' })
    }
  }
}

// 根據滾動位置判斷顯示 header 標題和背景色
const handleScroll = () => {
  const scrollTop = mainElement.value.scrollTop
  isScrolled.value = scrollTop > 300
}

let mainElement = ref(null)

const main = () => {
  mainElement.value = document.querySelector('.background')
  if (mainElement.value) {
    mainElement.value.addEventListener('scroll', handleScroll)
  }
}

const editName = () => {
  originalName.value = name.value // 保存原始用户名
  isEditingName.value = true
}

// 保存新的用户名
const saveName = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: '尚未登入',
      text: '請先登入',
      color: '#e1e1e1',
      background: '#27272a',
    })
    await nextTick()
    router.replace({ name: 'login' })
    return
  }

  try {
    await axios.put(
      `${API_URL}/users/update-name`,
      { name: name.value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    isEditingName.value = false // 保存成功，退出编輯模式
    Swal.fire({
      icon: 'success',
      title: '名稱更新成功',
      showConfirmButton: false,
      color: '#e1e1e1',
      background: '#27272a',
      timer: 1500,
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '更新名稱失敗',
      text: error.response?.data?.message || '請稍後重試',
      color: '#e1e1e1',
      background: '#27272a',
    })
  }
}

// 取消编辑
const cancelEdit = () => {
  name.value = originalName.value // 恢复原始用户名
  isEditingName.value = false
}

// 點擊上傳頭像
const uploadPic = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 處理上傳圖片檔案
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const token = localStorage.getItem('token')
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: '尚未登入',
      text: '請先登入',
      color: '#e1e1e1',
      background: '#27272a',
    })
    router.push({ name: 'login' })
    return
  }

  const formData = new FormData()
  formData.append('picture', file)

  isUploading.value = true // 開始上傳

  try {
    const res = await axios.post(`${API_URL}/users/upload-picture`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    // 更新圖片網址，添加時間戳，避免緩存
    picture.value = res.data.data.picture + '?' + Date.now()

    Swal.fire({
      icon: 'success',
      title: '圖片上傳成功',
      showConfirmButton: false,
      timer: 1500,
      color: '#e1e1e1',
      background: '#27272a',
    })
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '圖片上傳失敗',
      text: error.response?.data?.message || '請稍後重試',
      color: '#e1e1e1',
      background: '#27272a',
    })
  } finally {
    isUploading.value = false // 上傳結束
  }
}

// 獲取用戶的牌組
const getUserDecks = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return
  }

  try {
    const res = await axios.get(`${API_URL}/decks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    decks.value = res.data.decks
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '獲取用戶牌組失敗',
      text: error.response?.data?.message || '請稍後重試',
      color: '#e1e1e1',
      background: '#27272a',
    })
  }
}

// 獲取用戶的文章
const getUserArticles = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    return
  }

  try {
    const res = await axios.get(`${API_URL}/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    posts.value = res.data.posts
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '獲取用戶文章失敗',
      text: error.response?.data?.message || '請稍後重試',
      color: '#e1e1e1',
      background: '#27272a',
    })
  }
}

const formatDate = (datetime) => {
  const date = new Date(datetime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份從 0 開始，需要加 1
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const refreshPage = async () => {
  await getAccount() // 重新獲取用户信息、牌组和文章
}

const logout = () => {
  localStorage.removeItem('token')
  router.replace({ name: 'login' })
}

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  getAccount()
  main()
  getUserArticles()
})

onBeforeUnmount(() => {
  if (mainElement.value) {
    mainElement.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="layout">
    <SideBar />
    <header class="z-10 h-16" :class="{ scrolled: isScrolled }">
      <nav class="header-container">
        <button
          @click="handleBack"
          class="flex-none p-1 text-white rounded-full bg-black/50 default-transition hover:bg-zinc-800/50"
        >
          <AngleL />
        </button>
        <div class="justify-start w-full min-w-0 font-bold text-white">
          <h2 class="text-2xl font-bold truncate header-title">帳號管理</h2>
        </div>
        <div class="icons">
          <button class="logout" @click="logout">
            <Logout />
            <p class="logout-txt">登出</p>
          </button>
        </div>
        <Notice />
        <Login />
      </nav>
    </header>
    <div class="background scrollbar">
      <main class="main-grid">
        <div class="account-info">
          <div class="account-info-inside">
            <input
              id="uploadPic"
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept="image/*"
              class="hidden"
            />
            <label class="cursor-pointer upload group" @click.stop="uploadPic">
              <Loading v-if="isUploading" />
              <div
                class="max-w-[240px] max-h-[240px] rounded-full relative h-full w-full shadow-[0_4px_60px_rgba(0,0,0,.5)] overflow-hidden"
                style="background-color: rgb(50, 201, 255)"
              >
                <img
                  v-if="picture"
                  :src="picture"
                  alt="使用者頭像"
                  class="object-cover w-full h-full"
                />
                <img src="@/components/svg/ProfilePicture.vue" v-else />
              </div>
              <div
                class="absolute inset-0 grid text-white rounded-full opacity-0 group-hover:opacity-100 default-transition bg-black/50 place-content-center"
              >
                <ProfileImg />
              </div>
            </label>
            <div class="account-info-right-area">
              <div class="e-mail">
                <Email />
                <p>{{ email }}</p>
              </div>
              <div v-if="!isEditingName" class="edit">
                <h1>{{ name }}</h1>
                <label for="editName" @click="editName" class="cursor-pointer">
                  <Edit />
                </label>
              </div>
              <div v-else class="flex items-center gap-2">
                <div class="border-b-2 border-white/50 md:w-2/3">
                  <input
                    id="editName"
                    v-model="name"
                    class="text-white w-full p-0 text-4xl font-bold leading-relaxed break-all bg-transparent placeholder:text-zinc-500 md:mb-2 md:text-4.5xl line-clamp-2"
                    type="text"
                    placeholder="請輸入名稱"
                  />
                </div>
                <button
                  @click="saveName"
                  class="flex-none p-1 text-white rounded-full cursor-pointer btn btn-sm bg-green-400/70 hover:bg-green-400"
                >
                  <Tick />
                </button>
                <button
                  @click="cancelEdit"
                  class="flex-none p-1 text-white rounded-full cursor-pointer btn btn-sm bg-red-400/70 hover:bg-red-400"
                >
                  <Close />
                </button>
              </div>
              <div class="card-and-article">
                <div class="card">
                  <Tag class="stroke-[1.5]" />
                  <a href=""> 共有 {{ deckCount }} 副牌組 </a>
                </div>
                <div class="article">
                  <Ball />
                  <a href=""> 共有 {{ postCount }} 篇文章 </a>
                </div>
              </div>
            </div>
          </div>
          <div class="main">
            <div class="main-inside scroll-smooth">
              <section class="main-card-area">
                <h2 class="pt-6 pb-2 text-2xl font-bold main-card-area-h2">
                  <a href="">我的牌組</a>
                  <span class="text-sm font-normal text-zinc-400"
                    >一共有 {{ deckCount }} 結果</span
                  >
                </h2>
                <section class="show-card scrollbar-y">
                  <a
                    :href="'/deck/' + deck.deck_id"
                    v-if="decks"
                    v-for="deck in decks"
                    :key="deck.deck_id"
                    class="will-change-[background] transition-colors cursor-pointer min-w-[8rem] snap-center flex flex-col"
                  >
                    <div
                      class="relative grid w-full m-0 mx-auto overflow-hidden shadow-xl rounded-xl place-content-center"
                    >
                      <img
                        :src="deck.deck_cover"
                        class="object-cover object-top w-full h-full overflow-hidden shadow-lg select-none aspect-square rounded-xl"
                      />
                    </div>
                    <div class="mt-2 md:mt-4 min-h-0 md:min-h-[62px]">
                      <div class="flex gap-1 font-mono text-zinc-400">
                        <Tag class="fill-current size-4 stroke-none" />
                        <p class="text-xs truncate">{{ deck.deck_id }}</p>
                      </div>
                      <p
                        class="pb-1 text-sm md:text-base font-normal md:font-bold !text-white truncate"
                      >
                        {{ deck.deck_name }}
                      </p>
                      <p
                        class="font-mono text-xs truncate md:text-sm text-zinc-400"
                      >
                        {{ deck.build_time.substring(0, 10) }}
                      </p>
                    </div>
                  </a>
                  <a href="/deck" class="overflow-hidden transition-colors url">
                    <div class="read-more-area">
                      <div class="read-more">
                        <span
                          class="animate-ping h-[6rem] w-[6rem] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        ></span>
                        <Book />
                      </div>
                      <span>閱讀更多</span>
                      <ArrowR />
                    </div>
                  </a>
                </section>
              </section>
              <section class="main-article-area scrollbar-y">
                <h2 class="pt-6 pb-2 text-2xl font-bold main-card-area-h2">
                  <a href="">我的文章</a>
                  <span class="text-sm font-normal text-zinc-400"
                    >一共有 {{ postCount }} 結果</span
                  >
                </h2>
                <section class="show-card">
                  <a
                    :href="'/social/' + post.post_code"
                    v-if="posts"
                    v-for="post in posts"
                    :key="post.post_code"
                    class="will-change-[background] transition-colors cursor-pointer min-w-[8rem] snap-center flex flex-col"
                  >
                    <div
                      class="relative grid w-full m-0 mx-auto overflow-hidden shadow-xl rounded-xl place-content-center"
                    >
                      <img
                        :src="
                          post && post.post_picture
                            ? post.post_picture
                            : 'https://bottleneko.app/images/cover.png'
                        "
                        :alt="post && post.title ? post.title : 'Default Title'"
                        class="object-cover object-top w-full h-full overflow-hidden shadow-lg select-none aspect-square rounded-xl"
                      />
                    </div>
                    <div class="mt-2 md:mt-4 min-h-0 md:min-h-[62px]">
                      <div class="flex gap-1 font-mono text-zinc-400">
                        <Ball class="size-4 stroke-[1.5]" />
                        <p class="text-xs truncate">{{ post.post_code }}</p>
                      </div>
                      <p
                        class="pb-1 text-sm md:text-base font-normal md:font-bold !text-white truncate"
                      >
                        {{ post.title }}
                      </p>
                      <p
                        class="font-mono text-xs truncate md:text-sm text-zinc-400"
                      >
                        {{ post.created_at.substring(0, 10) }}
                      </p>
                    </div>
                  </a>
                  <a
                    href="/social/my"
                    class="overflow-hidden transition-colors url"
                  >
                    <div class="read-more-area">
                      <div class="read-more">
                        <span
                          class="animate-ping h-[6rem] w-[6rem] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        ></span>
                        <Book />
                      </div>
                      <span>閱讀更多</span>
                      <ArrowR />
                    </div>
                  </a>
                </section>
              </section>
              <section class="main-setting-area">
                <h2 class="pt-6 pb-2 text-2xl font-bold">
                  設定
                  <span class="text-xs font-normal text-zinc-400"
                    >根據喜好設定，只有您看的到</span
                  >
                </h2>
                <div class="main-setting-bar">
                  <button @click="logout">
                    <Logout />
                    <span>登出</span>
                  </button>
                  <button @click="refreshPage">
                    <Refresh />
                    <span>重新整理</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
          <MainFooter />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';
@import '@/assets/main.css';

.layout {
  display: flex;
  flex-direction: row;
}

.default-transition {
  transition-duration: 0.3s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

header {
  width: calc(100% - 270px - 0.5rem);
  position: fixed;
  top: 0;
  right: 0;
  background-color: rgba(50, 201, 255, 0);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  margin: 0.5rem 0.5rem 0 0;
  transition: background-color 0.3s ease;
}

header.scrolled {
  background-color: rgba(50, 201, 255, 1);
}

.header-container {
  height: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.header-title {
  opacity: 0;
  transform: translateY(-100%);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

header.scrolled .header-title {
  opacity: 1;
  transform: translateY(0);
}

.notice {
  position: relative;
}

.notice-icon {
  width: 24px;
  height: 24px;
  margin-right: 20px;
  cursor: pointer;
  border-radius: 50%;
  padding: 6px;
  background-color: transparent;
  transition:
    background-color 0.3s ease,
    opacity 0.3s ease;
}

.notice-icon:hover {
  background-color: #2a2727;
  opacity: 0.8;
}

.notice-grid-up h2 {
  color: white;
  font-weight: bolder;
  font-size: 24px;
}

.notice-grid {
  display: grid;
  grid-template-columns: 352px;
  grid-template-rows: 64px 416px;
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translateX(-70%);
  display: none;
  height: 0;
  transition:
    opacity 0.3s ease,
    height 0.3s ease,
    transform 0.3s ease;
  z-index: 999;
}

#notice-jump:checked ~ .notice-grid {
  display: block;
  height: 480px;
}

#notice-jump {
  display: none;
}

.notice-grid-up {
  grid-area: 1/1/2/2;
  background-color: #27272a;
  padding: 24px 16px 8px 16px;
  border-radius: 10px 10px 0px 0px;
}

.notice-grid-down {
  grid-area: 2/1/3/2;
  background-color: #1f1f22;
  border-radius: 0px 0px 10px 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.notice-grid-down img {
  width: 240px;
  height: 240px;
  margin-bottom: 30px;
}

.notice-grid-down h2 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  color: #f4f4f5;
}

.notice-grid-down p {
  color: rgb(161 161 170);
  font-size: 16px;
  text-align: center;
  margin-top: 10px;
  line-height: 20px;
}

.background {
  height: calc(100vh - 1rem);
  width: calc(100vw - 270px - 0.5rem);
  border-radius: 1rem;
  margin-top: 0.5rem;
  overflow: scroll;
  background-color: #32c9ff;
}

.content-container {
  height: calc(100vh - 1rem);
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  /* overflow: hidden; */
}

.scrollbar {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

.main-container {
  min-height: 340px;
  position: relative;
  z-index: 1;
}

.grid-container {
  margin-top: 1rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.card {
  cursor: pointer;
}

.icons {
  display: flex;
  gap: 1rem;
}

.setting,
.update,
.logout {
  border: none;
  position: relative;
  border-radius: 50%;
}

.setting:hover,
.update:hover,
.logout:hover {
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0.8;
}

.setting svg,
.update svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.logout svg {
  width: 24px;
  height: 24px;
  stroke: red;
}

.logout-txt {
  position: absolute;
  top: 30px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  width: 40px;
  line-height: 25px;
  border-radius: 10px;
  padding: 3px;
  text-align: center;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logout:hover .logout-txt {
  opacity: 1;
}

.main-grid {
  background-color: #121212;
  padding-bottom: 2rem;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  overflow: auto;
  grid-area: main-view;
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

.account-info {
  background-image: linear-gradient(transparent, rgba(0, 0, 0, 0.4) 455px);
  background-color: rgb(50, 201, 255);
  position: relative;
}

.account-info-inside {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  position: relative;
  top: 64px;
}

.account-info-right-area {
  gap: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: end;
}

.upload {
  min-width: 240px;
  min-height: 240px;
  border: none;
  border-radius: 100%;
  margin-left: 24px;
  background-color: rgb(50, 201, 255);
  position: relative;
}

.e-mail {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.e-mail svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.e-mail p {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: white;
}

.edit {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.edit h1 {
  font-size: 2.5rem;
  line-height: 1;
  font-weight: 900;
  color: white;
}

.edit button {
  width: 28px;
  height: 28px;
  padding: 0.25rem;
  border: none;
  border-radius: 100%;
  background-color: rgba(0, 0, 0, 0.1);
}

.edit svg {
  width: 20px;
  height: 20px;
  stroke: white;
}

.card-and-article {
  display: flex;
  gap: 1rem;
}

.card {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.card svg {
  width: 20px;
  height: 20px;
  stroke: white;
}

.card a {
  color: white;
  font-size: 16px;
  text-decoration: none;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;
  text-decoration-line: underline;
  letter-spacing: 1px;
}

.article {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.article a {
  color: white;
  font-size: 16px;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;
  text-decoration-line: underline;
  letter-spacing: 1px;
}

.article svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.main {
  background: linear-gradient(
      rgba(50, 201, 255, 0.44) 100px,
      transparent 500px
    ),
    #1f1f22;
  padding: 0px 24px;
  grid-area: card-view;
  margin-top: 100px;
}

.main-inside {
  display: flex;
  flex-direction: column;
}

.main-card-area-h2 a,
.main-article-area-h2 a,
.main-setting-area h2 {
  color: white;
  text-decoration: none;
  display: block;
}

.main-card-area span,
.main-article-area span,
.main-setting-area span {
  display: block;
  color: rgb(161 161 170);
  text-decoration: none;
}

.main-setting-bar {
  display: flex;
  flex-direction: column;
}

.main-setting-bar button {
  display: flex;
  width: 41.67%;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-top: 1rem;
  background-color: rgb(24 24 27);
  border: none;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;
}

.main-setting-bar svg {
  width: 24px;
  height: 24px;
}

.main-setting-bar button:nth-child(-n + 5) svg {
  stroke: white;
}

.main-setting-bar button:first-child svg {
  stroke: white;
  fill: none;
}

.main-setting-bar button:last-child svg {
  stroke: red;
}

.main-setting-bar button:nth-child(-n + 5) span {
  color: white;
  font-size: 16px;
}

.main-setting-bar button:last-child span {
  color: red;
  font-size: 16px;
}

.main-setting-bar button:hover {
  background-color: #2f2f35;
}

.main-setting-bar button:last-child {
  margin-bottom: 2rem;
}

.show-card {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x var(--tw-scroll-snap-strictness);
  scrollbar-width: none;
  -ms-overflow-style: none;
  display: flex;
  gap: 1rem;
  margin-left: -1rem;
  margin-right: -1rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.scrollbar-y {
  &::-webkit-scrollbar {
    width: 1rem;
  }
  &::-webkit-scrollbar-track {
    background-color: #121212;
    border-radius: 10px;
    margin: 20px 130px;
  }
  /* &::-webkit-scrollbar-thumb{
        border-radius: 10px;
        background-color: cyan;
    } */
}

.show-card a {
  display: block;
  max-width: calc(20% - 2rem);
  min-width: calc(20% - 2rem);
  padding: 1rem;
  border-radius: 0.75rem;
  background-color: #18181b;
}

.show-card a:hover {
  background-color: #27272a;
}

.card-text {
  margin-top: 1rem;
}

.padding-bottom {
  padding-bottom: 5px;
}

.h2-padding {
  padding-top: 30px;
  padding-bottom: 10px;
}

.color-white {
  color: white;
}

.color-a1 {
  color: #a1a1aa;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.url {
  padding: 1rem;
  display: inline-block;
  background-color: #18181b;
  border-radius: 0.75rem;
  box-sizing: border-box;
}

.url img {
  border-radius: 10%;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-size {
  height: 1rem;
  width: 1rem;
  align-self: center;
}

a {
  text-decoration: none;
}

.aa a:hover {
  background-color: #27272a;
}

.font-size20 {
  font-size: 1rem;
  line-height: 1.5rem;
}

.read-more-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
}

.read-more {
  border-radius: 100%;
  background-image: linear-gradient(to right, #06b6d4, #3b82f6);
  width: 6rem;
  height: 6rem;
  position: relative;
  margin-top: 1rem;
}

.read-more svg {
  width: 3rem;
  height: 3rem;
  stroke: white;
  stroke-width: 2;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.read-more-area > svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.read-more-area > span {
  color: white;
}

.url:last-child {
  background-color: rgba(24, 24, 27, 0.3);
}

.scroll-smooth {
  scroll-behavior: smooth;
}

.work-shop-footer {
  max-width: 100%;
  padding: 80px 32px 64px;
  box-sizing: border-box;
  background-color: #121212;
}

.work-shop-footer-flexbox {
  width: 100%;
  display: flex;
}

.work-shop-footer-flexbox-left {
  width: 100%;
  display: flex;
  gap: 1rem;
}

.work-shop-footer-flexbox-left-item {
  list-style: none;
  margin-top: 16px;
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.work-shop-footer-flexbox-left-item-title {
  width: 100%;
  color: white;
  line-height: 24px;
}

.work-shop-footer-flexbox-left-item-link {
  width: 100%;
  line-height: 24px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.work-shop-footer-flexbox-left-item-link-text {
  display: inline-block;
  width: 100%;
  text-decoration: none;
  color: #6d6d76;
}

.work-shop-footer-flexbox-left-item-link-text:hover {
  color: white;
}

.work-shop-footer-flexbox-right {
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
}

.work-shop-footer-flexbox-right-group {
  /* width: 100%; */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.work-shop-footer-flexbox-right-item {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #d4d4d8;
  text-decoration: none;
}

.work-shop-footer-flexbox-right-item:hover span {
  cursor: pointer;
  color: white;
}

.work-shop-footer-flexbox-right-item-icon {
  width: 24px;
  height: 24px;
  text-align: center;
  line-height: 24px;
  color: #d4d4d8;
  font-size: 20px;
}

.work-shop-footer-flexbox-right-item-text {
  color: #d4d4d8;
  font-size: 20px;
  line-height: 28px;
}

.work-shop-footer-flexbox-right-icon-list {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.work-shop-footer-flexbox-right-icon-list a {
  display: inline-block;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 24px;
  border-radius: 50%;
  background-color: #3f3f46;
  text-align: center;
  line-height: 40px;
}

.work-shop-footer-flexbox-right-icon-list a:hover {
  background-color: #5b5b64;
}

.work-shop-footer-hr {
  border: none;
  border-top: 1px solid #3f3f46;
  margin: 16px 0px;
}

.work-shop-footer-copyright {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-shop-footer-copyright-left {
  display: flex;
  gap: 1rem;
  list-style: none;
}

.work-shop-footer-copyright-left-item {
  width: 100%;
  text-wrap: nowrap;
}

.work-shop-footer-copyright-left-item a {
  text-decoration: none;
  color: #6d6d76;
  width: 100%;
}

.work-shop-footer-copyright-left-item a:hover {
  color: white;
  cursor: pointer;
}

.work-shop-footer-copyright-right {
  color: #6d6d76;
  font-size: 14px;
}

.work-shop-footer-copyright-right span {
  line-height: 20px;
}

.text-color-red {
  color: #941816;
}

.text-color-red:hover {
  color: red;
}

@media screen and (width < 1200px) {
  header {
    width: 100%;
    position: fixed;
    top: 0;
    right: 0;
    /* background-color: #32c9ff; */
    margin: 0;
    border-radius: 0%;
  }

  .header-container {
    margin-top: 0rem;
  }

  .show-card::-webkit-scrollbar {
    display: none;
  }

  .arrow-right {
    display: none;
  }

  .notice {
    display: none;
  }

  .login-btn {
    display: none;
  }

  .update {
    display: none;
  }

  .logout {
    display: none;
  }

  .background {
    width: 100%;
    margin: 0;
    border-radius: 0;
  }

  .content-container {
    border-radius: 0;
  }

  .account-info-inside {
    flex-direction: column;
    align-items: center;
  }

  .show-card {
    overflow: scroll;
  }

  .show-card a {
    padding: 0;
    background-color: transparent;
    display: block;
    min-width: calc(50% - 2rem);
  }

  .show-card a:hover {
    background-color: transparent;
  }

  .main-setting-bar button {
    display: flex;
    /* width: 100%; */
    padding: 1rem;
    border-radius: 0.75rem;
    margin-top: 1rem;
    background-color: rgb(24 24 27);
    border: none;
    gap: 0.5rem;
    align-items: center;
    cursor: pointer;
  }

  .work-shop-footer-flexbox {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .work-shop-footer {
    padding: 5rem 2rem 11rem;
    padding-left: -16px;
    padding-right: -16px;
  }

  .work-shop-footer-flexbox-left {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .work-shop-footer-flexbox-left-item {
    width: 100%;
  }

  .work-shop-footer-flexbox-left-item-link {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .work-shop-footer-flexbox-right {
    justify-content: center;
    margin-top: 40px;
  }

  .work-shop-footer-flexbox-right-item-text {
    font-size: 16px;
  }

  .work-shop-footer-flexbox-right-group {
    margin-top: 1rem;
  }

  .work-shop-footer-flexbox-right-icon-list {
    justify-content: center;
  }

  .work-shop-footer-copyright {
    flex-direction: column;
    gap: 0.5rem;
  }

  .work-shop-footer-copyright-right {
    display: flex;
    flex-direction: column;
  }

  .main-grid {
    margin-right: 0;
    &::-webkit-scrollbar {
      height: 0;
      width: 0;
    }
  }
}

@media screen and (width < 1200px) {
  .md\:mt-2 {
    margin-top: 0;
  }

  .md\:mr-2 {
    margin-right: 0;
  }
}
</style>
