<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import axios from 'axios'
import SideBar from '@/components/home/SidebarGrid.vue'
import Notice from '@/components/notice/Notice.vue'
import Footer from '@/components/home/MainFooter.vue'
import Login from '@/components/login/NavLoginBtn.vue'
import ArrowLeft from '@/components/svg/ArrowLeft.vue'
import ArrowRight from '@/components/svg/ArrowRight.vue'
import Message from '@/components/svg/Message.vue'

const BASE_URL = import.meta.env.VITE_BASE_URL
const API_URL = import.meta.env.VITE_API_URL
const router = useRouter()

const unreadCount = ref('')
const notices = ref([])

const formattedTime = (createdAt) => {
  if (!createdAt) return '未知時間'
  return dayjs(createdAt).format('YYYY-MM-DD')
}

const fetchNotices = async () => {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`${API_URL}/api/notices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await response.json()
    notices.value = (data.notices || []).sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at)
    })

    unreadCount.value = data.unreadCount || 0
  } catch (error) {
    console.error('Error fetching notices:', error)
  }
}

const markAsRead = async (noticeId, postCode) => {
  try {
    const notice = notices.value.find((n) => n.id === noticeId)

    if (notice && notice.is_read) {
      goToPost(postCode)
      return
    }

    const response = await axios.post(
      `${API_URL}/api/mark-as-read`,
      { noticeId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    )

    if (response.data.is_read) {
      if (notice) {
        notice.is_read = true
      }

      unreadCount.value -= 1

      goToPost(postCode)
    }
  } catch (error) {
    console.error('Error marking as read:', error)
  }
}

const goToPost = (postCode) => {
  window.location.href = `${BASE_URL}/social/${postCode}`
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <div class="layout">
    <SideBar class="sidebar-container" />
    <header class="h-16 z-10">
      <nav class="header-container">
        <button @click="goBack"
          class="flex-none p-1 rounded-full bg-black/50 text-white default-transition hover:bg-zinc-800/50"
        >
        <ArrowLeft />
        </button>
        <div class="w-full min-w-0 font-bold text-white justify-start">
          <h2 class="header-title truncate text-2xl font-bold">通知</h2>
        </div>

        <Notice class="notice-mobile-hidden" />
        <Login class="login-mobile-hidden" />
      </nav>
    </header>
    <div class="background scrollbar">
      <main class="main-grid">
        <section
          class="flex flex-col divide-y divide-white/10"
          v-if="notices.length > 0"
        >
          <a
            v-for="notice in notices"
            :key="notice.id"
            @click="markAsRead(notice.id, notice.post_code)"
            :class="[
              'notice-item',
              notice.is_read ? 'read' : 'unread',
              'cursor-pointer p-4 text-white flex items-center gap-2 hover:bg-zinc-500/20',
            ]"
          >
            <div
              class="flex-none w-[3rem] h-[3rem] rounded-full bg-zinc-500/50 grid place-content-center"
            >
            <Message/>
            </div>
            <div>
              <h3 class="font-bold line-clamp-2 break-all">
                {{ notice.title }}
              </h3>
              <p class="text-sm text-zinc-400 line-clamp-2 break-all">
                您的文章有新留言．
                <span class="font-mono text-xs">{{
                  formattedTime(notice.created_at)
                }}</span>
              </p>
            </div>
            <button
              class="flex-none text-white ml-auto rounded-full p-1 bg-zinc-500/20 default-transition"
            >
            <ArrowRight/>
            </button>
          </a>
        </section>
        <section class="notice-grid-down" v-else>
          <img src="@/assets/img/logo-use/no-data.png" alt="no-data" />
          <h2>沒東西</h2>
          <p>你只有一無所有的時候，才能全身心地投入機會。 - 拿破崙·波拿巴</p>
        </section>
        <Footer />
      </main>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';

.notice-mobile-hidden {
  z-index: 999;
}

.scrollbar {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

.notice-item.read {
  background-color: #1f1f22;
}

.notice-item.unread {
  background-color: #2d2d2d;
}

.layout {
  display: flex;
  flex-direction: row;
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
}

.header-container {
  height: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  position: relative;
  margin-top: 0.5rem;
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
  background-color: #1e1e1e;
  border-radius: 0px 0px 10px 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 700px;
}

.notice-grid-down img {
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
  height: calc(100vh - 5rem);
  width: calc(100vw - 270px - 0.5rem);
  border-radius: 1rem;
  background-color: #121212;
  margin-top: 5rem;
  overflow-y: scroll;
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

@media screen and (width < 1200px) {
  .login-mobile-hidden {
    display: none;
  }

  .notice-mobile-hidden {
    display: none;
  }

  header {
    width: 100%;
    position: fixed;
    top: 0;
    right: 0;
    margin: 0;
    border-radius: 0%;
  }

  .header-container {
    background-color: #000000;
    margin-top: 0rem;
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

  .background {
    width: 100%;
    border-radius: 0;
    margin-top: 5rem;
  }

  .md\:mt-2 {
    margin-top: 0;
  }

  .md\:mr-2 {
    margin-right: 0;
  }
}
</style>
