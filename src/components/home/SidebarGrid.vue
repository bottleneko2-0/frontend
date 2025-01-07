<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

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
          <svg
            v-if="route.path === '/'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"
            ></path>
            <path
              d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"
            ></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            ></path>
          </svg>
          <h2 class="truncate">首頁</h2>
        </router-link>
      </li>
      <li :class="{ active: route.path === '/series' }">
        <router-link to="/series" class="w-full h-full">
          <svg
            v-if="route.path === '/series'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              d="M16.5 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3v-6A4.5 4.5 0 0 1 10.5 6h6Z"
            ></path>
            <path
              d="M18 7.5a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3v-7.5a3 3 0 0 1 3-3H18Z"
            ></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
            ></path>
          </svg>
          <h2 class="truncate">系列卡表</h2>
        </router-link>
      </li>
      <li :class="{ active: route.path === '/deck' }">
        <router-link to="/deck" class="w-full h-full">
          <svg
            v-if="route.path === '/deck'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              fill-rule="evenodd"
              d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            ></path>
          </svg>
          <h2 class="truncate">我的牌組</h2>
        </router-link>
      </li>
      <li :class="{ active: route.path === '/social' }">
        <router-link to="/social" class="w-full h-full">
          <svg
            v-if="route.path === '/social'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              d="M15.75 8.25a.75.75 0 0 1 .75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 1 1-.992-1.124A2.243 2.243 0 0 0 15 9a.75.75 0 0 1 .75-.75Z"
            ></path>
            <path
              fill-rule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM4.575 15.6a8.25 8.25 0 0 0 9.348 4.425 1.966 1.966 0 0 0-1.84-1.275.983.983 0 0 1-.97-.822l-.073-.437c-.094-.565.25-1.11.8-1.267l.99-.282c.427-.123.783-.418.982-.816l.036-.073a1.453 1.453 0 0 1 2.328-.377L16.5 15h.628a2.25 2.25 0 0 1 1.983 1.186 8.25 8.25 0 0 0-6.345-12.4c.044.262.18.503.389.676l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.575 15.6Z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 0 1-1.161.886l-.143.048a1.107 1.107 0 0 0-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 0 1-1.652.928l-.679-.906a1.125 1.125 0 0 0-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 0 0-8.862 12.872M12.75 3.031a9 9 0 0 1 6.69 14.036m0 0-.177-.529A2.25 2.25 0 0 0 17.128 15H16.5l-.324-.324a1.453 1.453 0 0 0-2.328.377l-.036.073a1.586 1.586 0 0 1-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 0 1-5.276 3.67m0 0a9 9 0 0 1-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"
            ></path>
          </svg>
          <h2 class="truncate">社群</h2>
        </router-link>
      </li>
      <li class="md-workshop" :class="{ active: route.path === '/workshop' }">
        <router-link to="/workshop" class="w-full h-full">
          <svg
            v-if="route.path === '/workshop'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z"
            ></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
            ></path>
          </svg>
          <h2 class="truncate">工作坊</h2>
        </router-link>
      </li>
      <li class="md-menu" :class="{ active: route.path === '/notification' }">
        <a href="" @click="handleNotice">
          <svg
            v-if="route.path === '/notification'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              fill-rule="evenodd"
              d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            ></path>
          </svg>
          <h2 class="truncate">通知</h2>
        </a>
      </li>
      <li
        class="md-menu"
        :class="{ active: ['/workshop', '/login'].includes(route.path) }"
      >
        <router-link to="/login" v-if="!isLoggedIn" class="w-full h-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            ></path>
          </svg>
          <h2 class="truncate">登入</h2>
        </router-link>
        <router-link to="/workshop" v-else class="w-full h-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none w-7 h-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            ></path>
          </svg>
          <h2 class="truncate">工作坊</h2>
        </router-link>
      </li>
    </ul>
    <button
      @click="changeStyle"
      class="flex items-center justify-start w-full h-10 gap-4 pl-2 mt-4 -ml-2 rounded-lg translate-btn text-zinc-400 hover:text-white"
      :class="{ active: isActive }"
    >
      <svg
        v-if="isActive"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        data-slot="icon"
        class="flex-none w-7 h-7"
      >
        <path
          d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.816ZM13.878 2.43a9.755 9.755 0 0 1 6.116 3.986 11.267 11.267 0 0 1-3.746 2.504 18.63 18.63 0 0 0-2.37-6.49ZM12 2.276a17.152 17.152 0 0 1 2.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.629 18.629 0 0 0-2.37 6.49 11.266 11.266 0 0 1-3.746-2.504 9.754 9.754 0 0 1 6.116-3.985Z"
        ></path>
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        aria-hidden="true"
        data-slot="icon"
        class="flex-none w-7 h-7"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
        ></path>
      </svg>
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
  stroke: white;
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