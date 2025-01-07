<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import axios from 'axios'
import ArrowRight from '@/components/svg/ArrowRight.vue'
import Message from '@/components/svg/Message.vue'
import Notice from '@/components/svg/Notice.vue'

const BASE_URL = import.meta.env.VITE_BASE_URL
const API_URL = import.meta.env.VITE_API_URL

const unreadCount = ref('')
const notices = ref([])

const formattedTime = (createdAt) => {
  if (!createdAt) return '未知時間'
  return dayjs(createdAt).format('YYYY-MM-DD')
}

const fetchNotices = async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    return null
  }

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

onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <div class="notice-wrapper">
    <div class="z-10 notice">
      <input type="checkbox" id="notice-jump" />
      <label
        for="notice-jump"
        class="inline-flex items-center p-1 text-center text-white rounded-full cursor-pointer default-transition hover:bg-zinc-800/50"
      >
        <Notice />
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 text-xs rounded-full px-1 bg-red-500 text-white pb-[2px]"
          >{{ unreadCount }}</span
        >
      </label>

      <div class="z-10 notice-grid">
        <div class="notice-grid-up">
          <h2>通知({{ unreadCount || 0 }})</h2>
        </div>
        <div class="notice-grid-down-1" v-if="notices.length > 0">
          <a
            v-for="notice in notices"
            :key="notice.id"
            @click="markAsRead(notice.id, notice.post_code)"
            :class="[
              'notice-item',
              notice.is_read ? 'read' : 'unread',
              'cursor-pointer p-4 text-white flex items-center gap-2',
            ]"
          >
            <div
              class="flex-none w-[3rem] h-[3rem] rounded-full bg-zinc-500/50 grid place-content-center"
            >
              <Message />
            </div>
            <div class="select-none">
              <h3 class="font-bold break-all line-clamp-2">
                {{ notice.title }}
              </h3>
              <p class="text-sm text-zinc-400">
                您的文章有新留言． <br />
                <span class="font-mono text-xs">{{
                  formattedTime(notice.created_at)
                }}</span>
              </p>
            </div>
            <button
              class="flex-none p-1 ml-auto text-white rounded-full bg-zinc-500/20 default-transition"
            >
              <ArrowRight />
            </button>
          </a>
        </div>
        <div class="notice-grid-down" v-else>
          <img src="@/assets/img/logo-use/no-data.png" alt="no-data" />
          <h2>沒東西</h2>
          <p>你只有一無所有的時候，才能全身心地投入機會。 - 拿破崙·波拿巴</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';

.notice-wrapper {
  display: flex;
  justify-content: flex-end;
  position: relative;
  z-index: 999;
}

.notice {
  position: relative;
  z-index: 999;
}

.notice-item.read {
  background-color: #1f1f22;
}

.notice-item.unread {
  background-color: #2d2d2d;
}

.notice-grid-down-1 {
  border-radius: 0px 0px 10px 10px;
  height: 350px;
  z-index: 999;
  overflow-y: scroll;
}

.notice-grid-down-1::-webkit-scrollbar {
  display: none;
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
}

.notice-grid-up h2 {
  color: white;
  font-weight: bolder;
  font-size: 24px;
}

.notice-grid {
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translateX(-70%);
  display: none;
  transition:
    opacity 0.3s ease,
    height 0.3s ease,
    transform 0.3s ease;
  z-index: 999;
  width: 350px;
}

#notice-jump:checked ~ .notice-grid {
  display: block;
}

#notice-jump {
  display: none;
}

.notice-grid-up {
  background-color: #27272a;
  padding: 24px 16px 8px 16px;
  border-radius: 10px 10px 0px 0px;
}

.notice-grid-down {
  background-color: #1f1f22;
  border-radius: 0px 0px 10px 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

@media screen and (max-width: 1199px) {
  .notice-wrapper {
    display: none;
  }
}
</style>
