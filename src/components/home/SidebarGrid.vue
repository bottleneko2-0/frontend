<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import Global from '@/components/svg/Global.vue'
import Home from '@/components/svg/Home.vue'
import Card from '@/components/svg/Card.vue'
import Deck from '@/components/svg/Deck.vue'
import Earth from '@/components/svg/Earth.vue'
import Cube from '@/components/svg/Cube.vue'
import Notice from '@/components/svg/Notice.vue'
import Human from '@/components/svg/Human.vue'

const sidebarStore = useSidebarStore()
const { isActive } = storeToRefs(sidebarStore)
const { locale } = useI18n()

const route = useRoute()
const router = useRouter()
const changeStyle = () => {
  isActive.value = !isActive.value
  if (isActive.value === false) {
    locale.value = 'jp'
  } else if (isActive.value === true) {
    locale.value = 'zh'
  }
}

const isLoggedIn = ref(false)

const checkStatus = () => {
  if (localStorage.getItem('token')) {
    isLoggedIn.value = true
  }
}

const handleNotice = () => {
  router.push({ name: 'notification' })
}

onMounted(() => {
  checkStatus()
})
</script>

<template>
  <nav class="sidebar-container">
    <router-link to="/" class="sidebar-head">
      <img src="@/img/capie-icon.png" alt="" class="icon" />
      <img src="@/img/capie-text.png" alt="" class="icon-text" />
      <h1 class="hidden">Capie</h1>
    </router-link>
    <ul class="sidebar-menu">
      <li :class="{ active: route.path === '/' }">
        <router-link to="/" class="w-full h-full">
          <Home v-if="route.path === '/'" />
          <Home style="fill: #a1a1aa;" v-else />
          <h2 class="truncate">首頁</h2>
        </router-link>
      </li>
      <li :class="{ active: route.path === '/series' }">
        <router-link to="/series" class="w-full h-full">
          <Card style="width: 28px; height: 28px; stroke: white;" v-if="route.path === '/series'" />
          <Card style="width: 28px; height: 28px;" v-else/>
          <h2 class="truncate">系列卡表</h2>
        </router-link>
      </li>
      <li :class="{ active: route.path === '/deck' }">
        <router-link to="/deck" class="w-full h-full">
          <Deck style="width: 28px; height: 28px; stroke: white;" v-if="route.path === '/deck'" />
          <Deck style="width: 28px; height: 28px;" v-else/>
          <h2 class="truncate">我的牌組</h2>
        </router-link>
      </li>
      <li :class="{ active: route.path === '/social' }">
        <router-link to="/social" class="w-full h-full">
          <Earth style="width: 28px; height: 28px; stroke: white;" v-if="route.path === '/social'" />
          <Earth style="width: 28px; height: 28px;"  v-else />
          <h2 class="truncate">社群</h2>
        </router-link>
      </li>
      <li class="md-workshop" :class="{ active: route.path === '/workshop' }">
        <router-link to="/workshop" class="w-full h-full">
          <Cube style="width: 28px; height: 28px; stroke: white;" v-if="route.path === '/workshop'" />
          <Cube style="width: 28px; height: 28px; stroke: #a1a1aa;" v-else />
          <h2 class="truncate">工作坊</h2>
        </router-link>
      </li>
      <li class="md-menu" :class="{ active: route.path === '/notification' }">
        <a href="" @click="handleNotice">
          <Notice style="width: 28px; height: 28px; stroke: white;" v-if="route.path === '/notification'" />
          <Notice style="width: 28px; height: 28px; stroke: #a1a1aa;" v-else />
          <h2 class="truncate">通知</h2>
        </a>
      </li>
      <li
        class="md-menu"
        :class="{ active: ['/workshop', '/login'].includes(route.path) }"
      >
        <router-link to="/login" v-if="!isLoggedIn" class="w-full h-full">
          <Human style="width: 28px; height: 28px; stroke: white;" v-if="route.path === '/login'" />
          <Human style="width: 28px; height: 28px; stroke: #a1a1aa;" v-else />
          <h2 class="truncate">登入</h2>
        </router-link>
        <router-link to="/workshop" v-else class="w-full h-full">
          <Human style="width: 28px; height: 28px; stroke: white;" v-if="route.path === '/workshop'" />
          <Human style="width: 28px; height: 28px; stroke: #a1a1aa;" v-else />
          <h2 class="truncate">工作坊</h2>
        </router-link>
      </li>
    </ul>
    <button
      @click="changeStyle"
      class="flex items-center justify-start w-full h-10 gap-4 pl-2 mt-4 -ml-2 rounded-lg translate-btn text-zinc-400 hover:text-white"
      :class="{ active: isActive }"
    >
      <Global v-if="isActive" />
      <Global v-else />
      <h2 class="-ml-2 font-bold">原文翻譯</h2>
    </button>
    <hr class="my-2 border-zinc-700" />
  </nav>
</template>

<style scoped>
@import '@/assets/base.css';

.sidebar-container {
  width: 270px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  grid-area: sidebar;
  min-height: 0;
  padding: 1rem;
}

.icon {
  width: 40px;
  height: 40px;
}

.icon-text {
  width: 85px;
  height: 35px;
}

.sidebar-menu {
  margin-top: 20px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.sidebar-head {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-menu > li {
  display: flex;
  align-items: center;
  width: 238px;
  height: 40px;
  margin-bottom: 5px;
  cursor: pointer;
}

.sidebar-menu > .md-menu {
  display: none;
}

.sidebar-menu li h2 {
  color: #a1a1aa;
  font-weight: 700;
  font-size: 16px;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #a1a1aa;
  gap: 10px;
}

.sidebar-menu li:hover a h2 {
  color: white;
}

.sidebar-menu li:hover a svg {
  stroke: white !important;
}

.sidebar-menu li.active h2 {
  color: white;
}

.translate-btn.active {
  color: white;
  background: linear-gradient(45deg, #a855f7, #ec4899);
}

@media screen and (width < 1200px) {
  .root-container {
    display: grid;
    grid-template-areas:
      'navbar'
      'main-view';
    grid-template-columns: 1fr;
    grid-template-rows: 4rem 1fr;
    height: 100vh;
  }

  .sidebar-container {
    width: 100%;
    max-height: 65.5px;
    position: fixed;
    bottom: 0;
    z-index: 999;
    display: unset;
    padding: 0;
  }

  .sidebar-container::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: -32px;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, #000, rgba(0, 0, 0, 0.9), transparent);
  }
  .sidebar-head {
    display: none;
  }

  .sidebar-menu {
    display: flex;
    width: 100%;
    margin: 0px;
    top: 2.5rem;
  }

  .sidebar-menu > li {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .sidebar-menu > .md-menu {
    display: block;
  }

  .sidebar-menu li h2 {
    font-size: 9px;
  }

  .sidebar-menu a {
    width: 100%;
    height: 100%;
    flex-direction: column;
    gap: 0.25rem;
    justify-content: space-between;
    padding: 8px 12px 12px;
    box-sizing: border-box;
  }

  .sidebar-menu .md-workshop {
    display: none;
  }

  .md-menu:last-of-type.active svg {
    stroke: white;
  }

  .translate-btn {
    display: none;
  }

  .translate-btn + p {
    display: none;
  }
}
</style>
