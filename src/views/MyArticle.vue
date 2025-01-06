<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import Notice from '@/components/notice/Notice.vue'

const articles = ref([])
const postCount = computed(() => articles.value.length)
const API_URL = import.meta.env.VITE_API_URL
const BASE_URL = import.meta.env.VITE_BASE_URL

const getUserArticles = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const response = await axios.get(`${API_URL}/api/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    articles.value = response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      Swal.fire({
        title: '請先登入',
        text: '登入後才能查看文章',
        icon: 'warning',
        confirmButtonText: '確定',
        color: '#e1e1e1',
        background: '#27272a',
      }).then(() => {
        window.location.href = `${BASE_URL}/login`
      })
    }
  }
}
const formatDate = (date) => {
  if (!date) return ''
  return date.split('T')[0]
}

onMounted(() => {
  getUserArticles()
})
</script>

<template>
  <body class="overflow-hidden bg-black root-container">
    <header class="z-10 h-16 md:mt-2 md:mr-2 header-bg md:rounded-t-2xl">
      <nav class="header-container">
        <a :href="'/user'">
          <button
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
        </a>

        <div class="w-full min-w-0 text-lg font-bold text-white md:text-2xl">
          <h2 class="text-2xl font-bold truncate">我的文章</h2>
        </div>
        <Notice />
        <div
          class="items-center gap-1 text-white rounded-full login-btn bg-black/50 default-transition hover:bg-zinc-800/50"
        >
          <NavLoginBtn />
        </div>
      </nav>
    </header>
    <SidebarGrid />

    <div class="background"></div>
    <main class="relative content-container bg-base md:my-2 z-1">
      <div class="h-full content">
        <section class="px-4 main-container md:px-6">
          <h2 class="title">
            我的文章<br />
            <span class="subtitle"> 一共有{{ postCount }}結果 </span>
          </h2>
          <section class="card-area">
            <a
              v-for="article in articles"
              :key="article.post_code"
              :href="'/social/' + article.post_code"
              class="card-link"
            >
              <div class="card-img">
                <img
                  :src="
                    article && article.post_picture
                      ? article.post_picture
                      : 'https://bottleneko.app/images/cover.png'
                  "
                  :alt="
                    article && article.title ? article.title : 'Default Title'
                  "
                />
              </div>
              <div class="card-user">
                <div class="card-user-flex">
                  <div class="card-user-img">
                    <img :src="article.users.picture" alt="" />
                  </div>
                  <div class="card-user-p">
                    <p>{{ article.users.username }}</p>
                    <div class="date-container">
                      <p class="date">{{ formatDate(article.created_at) }}</p>
                      <i class="fa-solid fa-globe"></i>
                      <p class="card-code">{{ article.post_code }}</p>
                    </div>
                  </div>
                </div>
                <div class="card-name">
                  <h2>{{ article.title }}</h2>
                  <p v-html="article.content"></p>
                </div>
              </div>
            </a>
          </section>
        </section>
        <footer class="footer">
          <MainFooter />
        </footer>
      </div>
    </main>
  </body>
</template>

<style scoped>
@import '@/assets/base.css';

img {
  max-width: none;
  height: unset;
}

.root-container {
  display: grid;
  grid-template-areas:
    'sidebar navbar '
    'sidebar main-view ';
  grid-template-columns: 270px 1fr;
  grid-template-rows: 4rem 1fr;
  height: 100vh;
}

.default-transition {
  transition-duration: 0.3s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.icon {
  width: 40px;
  height: 40px;
}

.icon-text {
  width: 85px;
  height: 35px;
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
  width: calc(100% - 0.5rem);
  border-radius: 1rem;
  background-color: rgb(18, 18, 18);
  margin: 0.5rem 0.5rem 0.5rem 0;
}

.content-container {
  display: flex;
  flex-direction: column;
  grid-area: main-view;
  border-radius: 1rem;
  overflow: hidden;
}

.content {
  overflow-y: scroll;
  scrollbar-width: none;
}

.main-container {
  padding-top: 10px;
  box-sizing: border-box;
  min-height: 340px;
  position: relative;
  z-index: 1;
}

.title {
  display: inline;
  padding: 1.5rem 0 0.5rem;
  font-size: 25px;
  font-weight: 900;
  line-height: 1.75rem;
  color: #fff;
}

.subtitle {
  color: #d4d4d8;
  font-weight: 100;
  font-size: 15px;
}

.card-area {
  padding: 20px 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(198px, 1fr));
  grid-gap: 24px;
  box-sizing: border-box;
}

.card-link {
  padding: 16px;
  display: flex;
  flex-direction: column;
  background-color: #18181b;
  border-radius: 10px;
  overflow: hidden;
}

.card-link:hover {
  background-color: #2b2b2c;
}

.card-img {
  min-width: 169px;
  display: flex;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  position: relative;
}

.card-img img {
  width: 100%;
  object-fit: cover;
  position: absolute;
}

.card-user-flex {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.card-user-img {
  border-radius: 50%;
  display: flex;
  align-items: center;
}

.card-user-img img {
  object-fit: cover;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.card-user-p {
  position: relative;
  width: 100%;
  align-content: center;
}

.card-user-p p {
  font-size: 18px;
  color: white;
}

.date-container {
  display: flex;
  gap: 4px;
  color: rgb(170, 168, 168);
}

.date-container i {
  display: flex;
  font-size: 14px;
  margin: 0 2px;
}

.chat {
  min-width: 30px;
  display: flex;
  position: absolute;
  left: 185px;
}

.date-container p {
  font-size: 12px;
}

.card-name {
  margin-top: 10px;
}

.card-name p {
  font-size: 10px;
  color: rgb(170, 168, 168);
  height: 16px;
  overflow: hidden;
}

.card-name h2 {
  font-weight: 900;
  color: white;
}

.card-name p {
  margin-top: 8px;
  font-size: 16px;
}
.footer {
  margin-right: 8px;
  overflow: hidden;
}

@media screen and (min-width: 1440px) {
  .card-area {
    grid-template-columns: repeat(5, minmax(198px, 1fr));
  }
}

@media screen and (width < 1200px) {
  body {
    background-color: #121212;
  }
  .root-container {
    display: grid;
    grid-template-areas:
      'navbar'
      'main-view';
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
    display: none;
  }

  .content-container {
    border-radius: 0;
    scrollbar-width: none;
  }
  .card-area {
    grid-template-columns: repeat(3, minmax(198px, 1fr));
  }
  .footer {
    margin-right: 0px;
  }
}
@media screen and (max-width: 768px) {
  .card-area {
    grid-template-columns: repeat(1, minmax(198px, 1fr));
  }
}
</style>
