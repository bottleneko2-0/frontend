<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import Notice from '@/components/notice/Notice.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import RemitCard from '@/components/card/RemitCard.vue'
import userPicture from '@/img/avatar.png'
import { useDeckMakeStore } from '@/stores/deck-make'
import { useCardSeriesStore } from '@/stores/card-series'
import { useRoute, useRouter } from 'vue-router'
import AngleL from '@/components/svg/AngleL.vue'
import AngleR from '@/components/svg/AngleR.vue'
import Copy from '@/components/svg/Copy.vue'
import Download from '@/components/svg/Download.vue'
import ChatBox from '@/components/svg/ChatBox.vue'
import Litter from '@/components/svg/Litter.vue'
import Ball from '@/components/svg/Ball.vue'
import Card from '@/components/svg/Card.vue'
import Cash from '@/components/svg/Cash.vue'
import Horn from '@/components/svg/Horn.vue'
import Delete from '@/components/svg/Delete.vue'
import TypeGroup from '@/components/svg/TypeGroup.vue'
import Table from '@/components/svg/Table.vue'
import CardInfo from '@/components/svg/CardInfo.vue'
import CashJP from '@/components/svg/CashJP.vue'
import Message from '../svg/Message.vue'
import SendMessage from '../svg/SendMessage.vue'
import Dot from '../svg/Dot.vue'
import Edit from '../svg/Edit.vue'
import Book from '../svg/Book.vue'

const BASE_URL = import.meta.env.VITE_BASE_URL
const API_URL = import.meta.env.VITE_API_URL

const router = useRouter()
const route = useRoute()
const newMessage = ref('')
const messages = ref([])
const showAllMessages = ref(false)
const cards = ref([])
const sortBy = ref('type')
const toggleTableView = ref(false)
const togglePriceView = ref(false)
const article = ref(null)
const isVisible = ref(false)
const currentUser = ref(null)
const deckData = ref({ deck: [] })
const deckMakeStore = useDeckMakeStore()
const cardSeriesStore = useCardSeriesStore()
const postCode = ref(route.params.post_code)

function getUserIdFromToken(token) {
  if (!token) {
    return null
  }
  const parts = token.split('.')
  const payload = JSON.parse(atob(parts[1]))
  return payload.userId
}

const formattedTime = computed(() => {
  return (createdAt) => {
    if (!createdAt) return '未知時間'
    return dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')
  }
})

const groupedCards = computed(() => {
  let sorted = [...cards.value]

  if (sortBy.value === 'level') {
    sorted = sorted.sort((a, b) => a.level - b.level)
  }

  if (sortBy.value === 'color') {
    const colorOrder = ['red', 'yellow', 'green', 'blue']
    sorted = sorted.sort(
      (a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
    )
  }

  if (sortBy.value === 'type') {
    const typeOrder = ['キャラ', 'イベント', 'クライマックス']
    sorted = sorted.sort(
      (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
    )
  }

  if (sortBy.value === 'rare') {
    sorted = sorted.sort((a, b) => {
      if (a.rare.length !== b.rare.length) {
        return a.rare.length - b.rare.length
      }
      return a.rare.localeCompare(b.rare, 'en')
    })
  }

  if (sortBy.value === 'seriesCode') {
    sorted = sorted.sort((a, b) =>
      a.seriesCode.localeCompare(b.seriesCode, 'en')
    )
  }

  const grouped = sorted.reduce((acc, card) => {
    const groupKey = card[sortBy.value]
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(card)
    return acc
  }, {})

  const colorMap = {
    red: '紅色',
    yellow: '黃色',
    green: '綠色',
    blue: '藍色',
  }

  const levelLabel = (level) => `${level}等`

  return Object.entries(grouped).map(([key, cards]) => ({
    group:
      sortBy.value === 'color'
        ? colorMap[key] || key
        : sortBy.value === 'level'
          ? levelLabel(key)
          : key,
    cards,
  }))
})

const toggleView = (obj) => {
  obj.value = !obj.value
}

const totalPrice = computed(() => {
  if (!Array.isArray(cards.value)) {
    return 0
  }
  return cards.value.reduce((sum, card) => {
    return sum + (card.price?.number || 0)
  }, 0)
})

const uniqueProductNames = computed(() => {
  const productNames = cards.value.map((card) => card.productName)
  return [...new Set(productNames)]
})

const toggleRemitCard = () => {
  toggleView(isVisible)
}

const togglePriceTableView = () => {
  toggleView(togglePriceView)
}

const countSoulCards = (cards) => {
  return cards.filter((card) => card.trigger.includes('soul')).length
}

const setSortBy = (property) => {
  sortBy.value = property
}

const fetchDeck = async () => {
  try {
    const postCode = route.params.post_code
    const response = await axios.get(`${API_URL}/api/deck/${postCode}`)
    const deckList = response.data[0].deck_list
    cards.value = deckList.deck
    deckData.value.deck = deckList.deck
  } catch (error) {
    console.error('Failed to fetch specific deck:', error)
  }
}

const fetchCurrentUser = async () => {
  const userToken = localStorage.getItem('token')
  if (!userToken) {
    return null
  }

  const response = await axios.get(`${API_URL}/api/currentUser`, {
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  })

  currentUser.value = response.data
}

const fetchArticles = async () => {
  const postCode = route.params.post_code
  if (!postCode) {
    console.error('Error: postCode is not available in route params')
    return
  }
  try {
    const response = await axios.get(`${API_URL}/api/article-id/${postCode}`)
    article.value = response.data
    await fetchMessages()
  } catch (error) {
    console.error('Error fetching article_id:', error)
  }
}

const fetchMessages = async () => {
  if (!article.value) {
    console.error('Error: articleId is not available for fetching messages')
    return
  }

  try {
    const userToken = localStorage.getItem('token')
    const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {}

    const response = await axios.get(
      `${API_URL}/api/comments?articleId=${article.value.article_id}`,
      {
        headers,
      }
    )

    messages.value = response.data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )

    messages.value.forEach((message) => {
      message.liked = message.isLiked
      message.hated = message.isHated
      message.likeCount = message.like_count || 0
      message.pictureUrl = message.users?.picture
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

const sendMessage = async () => {
  if (newMessage.value.trim() === '') {
    return
  }

  const messageData = {
    article_id: article.value.article_id,
    message: newMessage.value.trim(),
    like_count: 0,
    created_at: new Date().toISOString(),
  }

  const userToken = localStorage.getItem('token')
  if (!userToken) {
    Swal.fire({
      title: '請先登入',
      text: '留言功能需要登入才能使用。',
      icon: 'warning',
      confirmButtonText: '確定',
      color: '#e1e1e1',
      background: '#27272a',
    })
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/send-message`,
      { messageData },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    )

    messages.value.unshift(response.data)
    newMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const toggleMessages = () => {
  toggleView(showAllMessages)
}

const toggleMenu = (messageId) => {
  const message = messages.value.find((msg) => msg.id === messageId)

  if (message) {
    const token = localStorage.getItem('token')
    const loggedInUserId = getUserIdFromToken(token)

    if (message.user_id === loggedInUserId) {
      message.showMenu = !message.showMenu
    } else {
      console.log('無權限編輯此留言')
    }
  } else {
    console.log('Message not found')
  }
}

const toggleEdit = (message) => {
  message.isEditing = true
  message.showMenu = !message.showMenu
  message.editContent = message.message
}

const submitEdit = async (message) => {
  const userToken = localStorage.getItem('token')
  if (!userToken) {
    console.error('User token is missing')
    return
  }

  try {
    const response = await axios.put(
      `${API_URL}/api/comments/${message.id}`,
      { message: message.editContent },
      { headers: { Authorization: `Bearer ${userToken}` } }
    )

    if (response.status === 200) {
      const updatedComment = response.data
      message.message = updatedComment.message
      message.created_at = updatedComment.created_at
      message.isEditing = false
    } else {
      console.error('更新失敗', response)
      alert('更新失敗，請稍後再試！')
    }
  } catch (error) {
    console.error('更新失敗', error)
    alert('無法連接到伺服器，請稍後再試！')
  }
}

const cancelEdit = (message) => {
  message.isEditing = false
}

const deleteMessage = async (messageId) => {
  Swal.fire({
    title: '刪除留言',
    text: '確定要刪除留言嗎？將會清除目前編輯的所有資訊。',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'OK',
    color: '#e1e1e1',
    background: '#27272a',
  }).then(async (result) => {
    if (result.isConfirmed) {
      const userToken = localStorage.getItem('token')
      if (!userToken) {
        console.error('User token not found.')
        return
      }

      try {
        const response = await axios.delete(
          `${API_URL}/api/comments/${messageId}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )
        Swal.fire({
          title: '刪除成功!',
          text: '你的留言已被刪除',
          icon: 'success',
          color: '#e1e1e1',
          background: '#27272a',
        })
        messages.value = messages.value.filter((msg) => msg.id !== messageId)
      } catch (error) {
        Swal.fire({
          title: '刪除失敗',
          text: '無法刪除留言，請稍後再試！',
          icon: 'error',
          color: '#e1e1e1',
          background: '#27272a',
        })
      }
    }
  })
}

const toggleLike = async (message) => {
  try {
    const userToken = localStorage.getItem('token')
    if (!userToken) {
      Swal.fire({
        title: '請先登入',
        text: '按讚功能需要登入才能使用。',
        icon: 'warning',
        confirmButtonText: '確定',
        color: '#e1e1e1',
        background: '#27272a',
      })
    }

    const response = await axios.post(
      `${API_URL}/api/comments/${message.id}/toggleLike`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    )

    const { isLiked, isHated, likeCount } = response.data
    message.liked = isLiked
    message.hated = isHated
    message.likeCount = likeCount
  } catch (error) {
    console.error('Error toggling like:', error.response || error.message)
  }
}

const toggleHate = async (message) => {
  const userToken = localStorage.getItem('token')
  if (!userToken) {
    Swal.fire({
      title: '請先登入',
      text: '按讚功能需要登入才能使用。',
      icon: 'warning',
      confirmButtonText: '確定',
      color: '#e1e1e1',
      background: '#27272a',
    })
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/comments/${message.id}/toggleHate`,
      {},
      { headers: { Authorization: `Bearer ${userToken}` } }
    )

    const { isLiked, isHated, likeCount } = response.data
    message.hated = isHated
    message.liked = isLiked
    message.likeCount = likeCount

    if (likeCount === 0) {
      message.liked = false
    }
  } catch (error) {
    console.error('Error toggling hate:', error.response || error.message)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return date.split('T')[0]
}

const isMyArticle = () => {
  if (!article.value || article.value.user_id === 'undefined') {
    console.warn('Invalid article:', article)
    return false
  }
  const token = localStorage.getItem('token')
  const loggedInUserId = getUserIdFromToken(token)

  return article.value.user_id === loggedInUserId
}

const deleteArticle = async () => {
  const postCode = route.params.post_code
  Swal.fire({
    title: '確定要刪除文章嗎？',
    text: '刪除後將無法復原。',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確認',
    cancelButtonText: '取消',
    color: '#e1e1e1',
    background: '#27272a',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const userToken = localStorage.getItem('token')

        const response = await axios.delete(
          `${API_URL}/api/articles/${postCode}`,
          {
            headers: { Authorization: `Bearer ${userToken}` },
          }
        )

        Swal.fire({
          icon: 'success',
          title: '刪除成功',
          showConfirmButton: false,
          color: '#e1e1e1',
          background: '#27272a',
          timer: 1500,
        })

        router.push('/social')
      } catch (error) {
        if (error.response && error.response.status === 403) {
          Swal.fire({
            title: '請先登入',
            text: '登入後才能刪除文章',
            icon: 'warning',
            confirmButtonText: '確定',
          }).then(() => {
            window.location.href = `${BASE_URL}/login`
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: '刪除文章失敗',
            text: error.message,
          })
        }
      }
    }
  })
}

const goEdit = () => {
  const postCode = route.params.post_code
  router.push(`/edit/${postCode}`)
}

const copyDeck = async () => {
  deckMakeStore.selectedCards = cards.value
  deckMakeStore.saveLastDeckEdit()

  const cardCode = cards.value[0]?.seriesCode || ''
  let seriesId = ''

  try {
    const response = await axios.get(`${API_URL}/api/series`)
    const series = response.data.find((series) =>
      series.code.includes(cardCode)
    )
    if (series) {
      seriesId = series.id
    }
  } catch (error) {
    console.error('Error fetching series:', error)
    return
  }

  cardSeriesStore.saveLastViewSeries(seriesId)
  router.push(`/card-series/${seriesId}`)
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const isScrolled = ref(false)
let mainElement = ref(null)

const handleScroll = () => {
  const scrollTop = mainElement.value.scrollTop
  isScrolled.value = scrollTop > 0
}

const main = () => {
  mainElement.value = document.querySelector('.background')
  if (mainElement.value) {
    mainElement.value.addEventListener('scroll', handleScroll)
  }
}

onMounted(() => {
  fetchArticles()
  fetchCurrentUser()
  fetchDeck()
  main()
})

onBeforeUnmount(() => {
  if (mainElement.value) {
    mainElement.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="container">
    <SidebarGrid style="grid-area: sidebar" />
    <main class="background">
      <div v-if="isVisible">
        <RemitCard v-if="isVisible" />
      </div>
      <header class="header-container" :class="{ scrolled: isScrolled }">
        <div class="pagebtn-area">
          <button class="page-btn" @click="goBack">
            <AngleL />
          </button>
          <button class="page-btn next-btn">
            <AngleR />
          </button>
          <h2 class="header-title" v-if="article">{{ article.title }}</h2>
        </div>
        <div class="btn-area">
          <button
            v-if="isMyArticle()"
            @click="goEdit"
            class="social-btn-item social-btn2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="size-6 stroke-2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              ></path>
            </svg>
            <div class="description-item description2">編輯文章</div>
          </button>
          <button v-else class="social-btn-item social-btn2" @click="copyDeck">
            <Copy />
            <div class="description-item description2">複製牌組</div>
          </button>
          <button
            v-if="isMyArticle()"
            @click="deleteArticle"
            class="social-btn-item social-btn3"
          >
            <Delete />
            <div class="description-item description3">刪除文章</div>
          </button>
          <button
            v-else
            class="social-btn-item social-btn3"
            @click="toggleRemitCard"
          >
            <Download />
            <div class="description-item description3">匯出牌組</div>
          </button>
          <Notice />
          <div class="user-btn">
            <NavLoginBtn />
          </div>
          <button class="social-btn-item social-btn5">
            <Litter />
            <div class="description-item description5">複製牌組</div>
            <div class="description-item description6">匯出牌組</div>
          </button>
        </div>
      </header>
      <section class="carddeck-information" v-if="article">
        <div class="information-container">
          <div class="carddeck-img">
            <img
              :src="
                article && article.post_picture
                  ? article.post_picture
                  : 'https://bottleneko.app/images/cover.png'
              "
              :alt="article && article.title ? article.title : 'Default Title'"
            />
          </div>
          <div class="carddeck-data">
            <p class="user-number">
              <Ball />
              {{ postCode }}
            </p>
            <h1>{{ article.title }}</h1>
            <div class="data-container">
              <div class="user-link">
                <div class="user-img">
                  <img
                    :src="article.user_picture || userPicture"
                    alt="用戶頭像"
                  />
                </div>
                <span class="date-container">
                  <a href="#">{{ article.user_name }}</a>
                  發布於
                  <span>{{ formatDate(article.created_at) }}</span>
                </span>
              </div>
              <span class="data-item">
                <Card />
                總數{{ cards.length }}張
              </span>
              <span class="data-item">
                <Cash />
                總價
                <span>{{ totalPrice }}円</span>
              </span>
              <span class="data-item" v-if="cards && cards.length > 0">
                <Horn class="flex-none size-5 md:size-6 svg-icon" />
                系列包含
                <a
                  v-for="(product, index) in uniqueProductNames"
                  :key="index"
                  href="#"
                  >{{ product }}</a
                >
              </span>
            </div>
          </div>
        </div>
      </section>
      <section class="main-container" v-if="article">
        <div class="article-area">
          <div class="text-container">
            <div class="article-title">
              <ChatBox />
              <span>文章內容</span>
            </div>
            <div class="article-content">
              <p v-html="article.content"></p>
            </div>
          </div>
          <!-- 留言區域 -->
          <div class="message-area">
            <!-- 留言輸入 -->
            <div class="user-message">
              <div class="message-user-img">
                <img :src="currentUser?.picture || userPicture" alt="" />
              </div>
              <div class="message">
                <Message />
                <input
                  class="enter-message"
                  type="text"
                  placeholder="留言..."
                  v-model="newMessage"
                />
                <button @click="sendMessage">
                  <SendMessage />
                </button>
              </div>
            </div>
            <h3 class="message-count">{{ messages.length }}則留言</h3>
            <!-- 留言列表 -->
            <section class="message-section">
              <div
                class="message-list message-scroll"
                v-if="messages.length > 0"
              >
                <!-- 顯示前兩條留言 -->
                <div
                  class="message-list-info"
                  v-for="(message, id) in messages.slice(0, 2)"
                  :key="message.id"
                >
                  <section>
                    <div class="message-user-img">
                      <img :src="message.users.picture || userPicture" alt="" />
                    </div>
                  </section>
                  <div class="message-body">
                    <div class="message-header">
                      <div class="message-user-name">
                        <h4>{{ message.users.username }}</h4>
                        <div>
                          發佈於
                          <span>{{ formattedTime(message.created_at) }}</span>
                        </div>
                      </div>
                      <div class="dot">
                        <button @click="toggleMenu(message.id)">
                          <Dot />
                        </button>
                        <div
                          class="dot-menu"
                          @click.stop="toggleMenu(message.id)"
                          v-if="message.showMenu"
                        >
                          <a class="edit" @click.stop="toggleEdit(message)">
                            <Edit />
                            <span>編輯</span>
                          </a>
                          <a class="delete" @click="deleteMessage(message.id)">
                            <Delete />
                            <span>刪除</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <!-- 非編輯模式：顯示文字 -->
                    <p class="text-white" v-if="!message.isEditing">
                      {{ message.message }}
                    </p>
                    <!-- 編輯模式：顯示 textarea -->
                    <div
                      class="bg-black/30 p-1 rounded-xl"
                      v-if="message.isEditing"
                    >
                      <textarea
                        v-model="message.editContent"
                        rows="3"
                        class="w-full p-0 bg-transparent border-none focus:ring-0 placeholder:text-zinc-500 text-white"
                        placeholder=""
                      ></textarea>
                    </div>
                    <!-- 按鈕區域 -->
                    <div class="message-btn-area">
                      <button
                        v-if="message.isEditing"
                        @click="submitEdit(message)"
                        class="flex-none rounded-full py-1 pl-1 pr-2 flex items-center bg-white text-zinc-800 send-btn"
                      >
                        <AngleR />
                        <span class="text-xs text-mono leading-none font-bold"
                          >送出</span
                        >
                      </button>
                      <button
                        v-if="message.isEditing"
                        @click="cancelEdit(message)"
                        class="flex-none rounded-full py-1 pl-1 pr-2 flex items-center bg-amber-600 text-white cancel-btn"
                      >
                        <AngleR />
                        <span class="text-xs text-mono leading-none font-bold"
                          >取消</span
                        >
                      </button>
                      <button class="message-like" @click="toggleLike(message)">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                          data-slot="icon"
                          class="size-5"
                          :class="{
                            'fill-red-500':
                              message.liked || message.likeCount > 0,
                          }"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                          ></path>
                        </svg>
                        <span
                          class="text-xs text-mono leading-none font-bold"
                          >{{ message.likeCount }}</span
                        >
                      </button>
                      <button
                        class="message-bad-like"
                        @click="toggleHate(message)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                          data-slot="icon"
                          :class="{ 'bg-gray': message.hated }"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <!-- 顯示更多留言按鈕，當 messages 超過 2 條且 showAllMessages 為 false 時顯示 -->
                <button
                  class="read-more"
                  v-if="messages.length > 2 && !showAllMessages"
                  @click="toggleMessages"
                >
                  <Book />
                  <span>閱讀更多</span>
                </button>
                <!-- 顯示所有留言，當 showAllMessages 為 true 時顯示 -->
                <div v-if="showAllMessages" class="message-list">
                  <div
                    class="message-list-info"
                    v-for="(message, id) in messages.slice(2)"
                    :key="message.id"
                  >
                    <section>
                      <div class="message-user-img">
                        <img
                          :src="message.users.picture || userPicture"
                          alt=""
                        />
                      </div>
                    </section>
                    <div class="message-body">
                      <div class="message-header">
                        <div class="message-user-name">
                          <h4>{{ message.users.username }}</h4>
                          <div>
                            發佈於
                            <span>{{ formattedTime(message.created_at) }}</span>
                          </div>
                        </div>
                        <div class="dot">
                          <button @click="toggleMenu(message.id)">
                            <Dot />
                          </button>
                          <div
                            class="dot-menu"
                            @click.stop="toggleMenu(message.id)"
                            v-if="message.showMenu"
                          >
                            <a class="edit" @click="toggleEdit(message)">
                              <Edit />
                              <span>編輯</span>
                            </a>
                            <a
                              class="delete"
                              @click="deleteMessage(message.id)"
                            >
                              <Delete />
                              <span>刪除</span>
                            </a>
                          </div>
                        </div>
                      </div>
                      <!-- 非編輯模式：顯示文字 -->
                      <p class="text-white" v-if="!message.isEditing">
                        {{ message.message }}
                      </p>
                      <!-- 編輯模式：顯示 textarea -->
                      <div
                        class="bg-black/30 p-1 rounded-xl"
                        v-if="message.isEditing"
                      >
                        <textarea
                          v-model="message.editContent"
                          rows="3"
                          class="w-full p-0 bg-transparent border-none focus:ring-0 placeholder:text-zinc-500 text-white"
                          placeholder=""
                        ></textarea>
                      </div>
                      <!-- 按鈕區域 -->
                      <div class="message-btn-area">
                        <button
                          v-if="message.isEditing"
                          @click="submitEdit(message)"
                          class="flex-none rounded-full py-1 pl-1 pr-2 flex items-center bg-white text-zinc-800 send-btn"
                        >
                          <AngleR />
                          <span class="text-xs text-mono leading-none font-bold"
                            >送出</span
                          >
                        </button>
                        <button
                          v-if="message.isEditing"
                          @click="cancelEdit(message)"
                          class="flex-none rounded-full py-1 pl-1 pr-2 flex items-center bg-amber-600 text-white cancel-btn"
                        >
                          <Delete />
                          <span class="text-xs text-mono leading-none font-bold"
                            >取消</span
                          >
                        </button>
                        <button
                          class="message-like"
                          @click="toggleLike(message)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                            data-slot="icon"
                            class="size-5"
                            :class="{
                              'fill-red-500':
                                message.liked || message.likeCount > 0,
                            }"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                            ></path>
                          </svg>
                          <span
                            class="text-xs text-mono leading-none font-bold"
                            >{{ message.likeCount }}</span
                          >
                        </button>
                        <button
                          class="message-bad-like"
                          @click="toggleHate(message)"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                            data-slot="icon"
                            :class="{ 'bg-gray': message.hated }"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="card-info">
          <nav class="toolbar" v-if="groupedCards.length > 0">
            <div class="toolbar-area1">
              <button
                class="tool-btn1"
                @click="setSortBy('type')"
                :class="{ active: sortBy === 'type' }"
              >
                <TypeGroup />
                <span>類型</span>
              </button>
              <button
                class="tool-btn1"
                @click="setSortBy('color')"
                :class="{ active: sortBy === 'color' }"
              >
                <TypeGroup />
                <span>顏色</span>
              </button>
              <button
                class="tool-btn1"
                @click="setSortBy('level')"
                :class="{ active: sortBy === 'level' }"
              >
                <TypeGroup />
                <span>等級</span>
              </button>
              <button
                class="tool-btn1"
                style="min-width: 86px"
                @click="setSortBy('rare')"
                :class="{ active: sortBy === 'rare' }"
              >
                <TypeGroup />
                <span>稀有度</span>
              </button>
              <button
                class="tool-btn1"
                @click="setSortBy('seriesCode')"
                :class="{ active: sortBy === 'seriesCode' }"
              >
                <TypeGroup />
                <span>商品</span>
              </button>
            </div>
            <div class="toolbar-area2">
              <button
                class="func-btn func-btn4"
                @click="togglePriceTableView"
                :style="{
                  backgroundColor: togglePriceView ? '#060608' : '#06b6d4',
                }"
              >
                <Cash />
                <div class="func-text func-text4">開啟價格</div>
              </button>
              <button
                class="func-btn func-btn5"
                @click="toggleTableView = true"
                :style="{ backgroundColor: toggleTableView ? '#06b6d4' : '' }"
              >
                <Table />
                <div class="func-text func-text5">表格顯示</div>
              </button>
              <button
                class="func-btn func-btn6"
                @click="toggleTableView = false"
                :style="{ backgroundColor: !toggleTableView ? '#06b6d4' : '' }"
              >
                <CardInfo />
                <div class="func-text func-text6">卡片資訊</div>
              </button>
            </div>
          </nav>
          <div class="row" v-for="group in groupedCards" :key="group.group">
            <div class="card-info-header">
              <h2 v-if="group.group === 'キャラ'" class="group-title">
                角色 - {{ group.cards.length }}
              </h2>
              <h2 v-else-if="group.group === 'イベント'" class="group-title">
                事件 - {{ group.cards.length }}
              </h2>
              <h2
                v-else-if="group.group === 'クライマックス'"
                class="group-title"
              >
                名場 - {{ group.cards.length }}
              </h2>
              <h2 v-else class="group-title">
                {{ group.group || '未分類' }} - {{ group.cards.length }}
              </h2>
              <div class="group-count">
                <img src="https://bottleneko.app/soul.gif" class="size-4" />
                <span class="font-mono flex-none">{{
                  countSoulCards(group.cards)
                }}</span>
              </div>
            </div>
            <div class="card-row">
              <div
                class="col-Info"
                v-for="card in group.cards"
                :key="card.index"
              >
                <p class="price-row" v-if="!togglePriceView">
                  <CashJP />
                  <span class="price-row-text">{{ card.price.number }}</span>
                  <span class="price-row-text">{{ card.rare }}</span>
                </p>

                <div class="card-info-image">
                  <img :src="card.cover" />
                  <div class="card-inner-info">
                    <div class="card-inner-info-header">
                      <p>{{ card.id }}</p>
                      <p>{{ card.rare }}</p>
                    </div>
                    <h3>{{ card.title }}</h3>
                    <div class="details" v-if="!toggleTableView">
                      <div v-if="card.type === 'キャラ'">
                        <span>類型</span>角色
                      </div>
                      <div v-else-if="card.type === 'イベント'">
                        <span>類型</span>事件
                      </div>
                      <div v-else-if="card.type === 'クライマックス'">
                        <span>類型</span>名場
                      </div>
                      <div><span>魂傷</span>{{ card.soul }}</div>
                      <div><span>等級</span>{{ card.level }}</div>
                      <div><span>攻擊</span>{{ card.attack }}</div>
                      <div><span>費用</span>{{ card.cost }}</div>
                    </div>
                    <div class="price-download" v-if="!toggleTableView">
                      <p>${{ card.price.number }}</p>
                      <button>
                        <CashJP class="currency-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MainFooter />
      </section>
    </main>
  </div>
</template>

<style scoped>
svg {
  stroke-width: 1.5px;
}
.price-row {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  color: #c9a83d;
  gap: 0.25rem;
  margin-top: 30px;
  font-size: 16px;
}

.currency-icon {
  width: 20px;
  height: 20px;
  stroke: #c9a83d;
}

.tool-btn1.active {
  background: linear-gradient(45deg, #7dca31, #21b8c8);
}

.card-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -5px;
  box-sizing: border-box;
}

.card-info-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1rem;
  margin-top: 3rem;
}

.group-count {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: #1e1e1e;
  border-radius: 9999px;
  padding: 4px 8px;
  color: white;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  margin-left: 1rem;
}

.group-title {
  color: white;
  display: block;
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.row {
  display: flex;
  flex-direction: column;
}

.card-image {
  /* display: flex; */
  position: relative;
  object-fit: cover;
  border-radius: 10px;
  overflow: hidden;
  margin: 5px;
  box-sizing: border-box;
  cursor: pointer;
}

.col-Sheet,
.col-Info {
  width: calc((100% - 10px) / 4);
}

.card-image img {
  width: 100%;
  height: auto;
  display: block;
}

.card-image div {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: absolute;
  bottom: 0;
  gap: 5px;
  padding: 20px 5px 10px 10px;
  box-sizing: border-box;
  color: white;
  background-image: linear-gradient(transparent, #0009 40%, #000000bf);
}

.card-image div p {
  margin: 0;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    Liberation Mono,
    Courier New,
    monospace;
}

.card-image div h3 {
  margin: 0;
  font-weight: bold;
  font-size: 18px;
  white-space: nowrap;
  max-width: calc(100% - 40px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-image button {
  position: absolute;
  background: transparent;
  bottom: 10px;
  right: 5px;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.card-image:hover div {
  display: none;
}

.card-image:hover button {
  border: none;
  background: rgba(0, 0, 0, 0.697);
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* card-info */

.card-info {
  margin-top: 50px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: linear-gradient(transparent 500px, #121212);
}

.card-info-image {
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  margin: 5px;
  background-color: #121212;
  cursor: pointer;
}

.card-info-image img {
  width: 100%;
  height: auto;
  display: block;
}

.card-inner-info {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-inner-info-header,
.price-download {
  display: flex;
  justify-content: space-between;
  color: white;
  text-align: center;
}

.card-inner-info-header p,
.price-download p {
  color: #71717a;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    Liberation Mono,
    Courier New,
    monospace;
  margin: 0;
}

.card-inner-info-header p:last-child {
  color: #63ddee;
}

.card-inner-info h3 {
  margin: 0;
  color: white;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.details {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: #121212;
  color: white;
  gap: 10px;
}

.details div {
  width: calc((100% - 10px) / 2);
}

.details span {
  margin-right: 5px;
  /* background-color: #CA8A04; */
  border-radius: 7px;
  padding: 2px;
}

.bg-red {
  background-color: #ef4444;
}

.bg-blue {
  background-color: #3b82f6;
}

.bg-green {
  background-color: #22c55e;
}

.bg-yellow {
  background-color: #eab308;
}

.bg-purple {
  background-color: #a855f7;
}

.price-download {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-download p {
  color: #f59e0b;
}

.price-download button {
  width: 35px;
  height: 35px;
  background-color: #ffffff34;
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-download button:hover {
  background-color: #000000;
}

.send-btn span .cancel-btn span {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  width: 32px;
  height: 16px;
}

.send-btn svg,
.cancel-btn svg {
  width: 16px;
  height: 16px;
}

.cancel-btn {
  background-color: rgb(217 119 6);
}

.send-btn,
.cancel-btn {
  cursor: pointer;
  /* width: 60px; */
  height: 24px;
  border: none;
}

.dot-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: rgb(63, 63, 63);
  border-radius: 0.375rem;
  position: absolute;
  margin-top: 24px;
  right: 0;
  top: 0;
  --tw-ring-opacity: 0.05;
  overflow-y: auto;
  min-width: 100%;
  padding: 0.2rem;
}

.flex {
  display: flex;
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: #fff;
  background-color: rgb(255 255 255);
}

.py-1 {
  padding-bottom: 0.25rem;
  padding-top: 0.25rem;
}

pl-1 {
  padding-left: 0.25rem;
}

.pr-2 {
  padding-right: 0.5rem;
}

.text-zinc-800 {
  color: rgb(39 39 42);
}

textarea {
  color: white !important;
  text-align: left !important;
  border-color: #6b7280;
  border-radius: 0;
  border-width: 1px;
  font-size: 1rem;
  line-height: 1.5rem;
}

.w-full {
  width: 100%;
}

.border-none {
  border-style: none;
}

.bg-transparent {
  background-color: transparent;
}

.p-0 {
  padding: 0;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.bg-black\/30 {
  background-color: rgba(0, 0, 0, 0.3);
}

.p-1 {
  padding: 0.25rem;
}
.delete svg {
  stroke: red;
}

.delete span {
  color: red;
}

.edit span {
  color: rgb(212 212 216);
}

.dot-menu a {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  width: 100%;
}

.dot-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: rgb(63, 63, 63);
  border-radius: 0.375rem;
  position: absolute;
  margin-top: 24px;
  right: 0;
  top: 0;
  --tw-ring-opacity: 0.05;
  overflow-y: auto;
  min-width: 100%;
  padding: 0.2rem;
}

.bg-gray {
  padding: 0.08rem;
  background-color: rgb(113 113 122);
  border-radius: 100%;
}

.fill-red-500 {
  fill: rgb(249, 101, 101);
  stroke: rgb(249, 101, 101);
}

.message-section {
  width: 95%;
  height: 40vh;
}

.message-scroll {
  overflow-y: scroll;
  height: 100%;
}

.message-scroll::-webkit-scrollbar {
  display: none;
}

.message-count {
  color: white;
  font-weight: 700;
  text-align: right !important;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  display: block;
  width: 95%;
}

.read-more span {
  color: white;
  font-size: 16px;
}

.read-more svg {
  height: 1.5rem;
  min-height: 1.5rem;
  min-width: 1.5rem;
  width: 1.5rem;
  color: white;
}

.read-more {
  padding-bottom: 0.5rem;
  padding-top: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  background-image: linear-gradient(to right, #3b82f6, #06b6d4);
  border-radius: 0.75rem;
  gap: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
  border: none;
}

.message-bad-like svg {
  height: 1.25rem;
  min-height: 1.25rem;
  min-width: 1.25rem;
  width: 1.25rem;
  color: white;
}

.message-bad-like {
  padding: 0.25rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: transparent;
  border: none;
}

.message-like svg {
  height: 1.25rem;
  min-height: 1.25rem;
  min-width: 1.25rem;
  width: 1.25rem;
}

.message-like {
  color: white;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  margin-left: auto;
  cursor: pointer;
  background-color: transparent;
  border: none;
}

.message-btn-area {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
}

.text-white {
  color: white;
}

.dot button {
  background-color: transparent;
  border: none;
  color: hsla(0, 0%, 100%, 0.5);
}

.dot svg {
  height: 1.25rem;
  min-height: 1.25rem;
  min-width: 1.25rem;
  width: 1.25rem;
}
.dot {
  margin-left: auto;
  position: relative;
}

.message-header {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.message-user-name div {
  color: rgb(161 161 170);
  font-size: 12px;
  line-height: 1rem;
}

.message-user-name h4 {
  color: #32c9ff;
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.message-user-name {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.message-body {
  display: flex;
  flex-direction: column;
  background-color: rgba(24, 24, 27, 0.5);
  background-color: #1e2e48;
  border-radius: 10px;
  gap: 0.5rem;
  padding: 0.5rem;
  width: 95%;
  box-sizing: border-box;
}

.message-list-info {
  display: flex;
  min-width: 100%;
  margin: auto;
  gap: 8px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

a {
  text-decoration: none;
  color: #ffffff;
}

.container {
  width: 100%;
  display: flex;
  position: relative;
}

.sidebar-container {
  min-width: 270px;
  position: fixed;
  background: #000;
}

.translate-btn {
  display: flex;
  align-items: center;
  width: 238px;
  height: 40px;
  gap: 8px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(45deg, #a855f7, #ec4899);
  color: white;
  margin-top: 20px;
  cursor: pointer;
  position: relative;
}

.translate-btn::after {
  content: '';
  position: absolute;
  border-top: 1px solid #3f3f46;
  top: 50px;
  left: 0;
  right: 0;
  width: 100%;
}

.bg-black {
  background-color: #000000;
  width: calc(100% - 278px);
  height: 72px;
  position: fixed;
  top: 0;
  z-index: 1;
}

.header-container {
  background-color: rgb(59, 130, 246, 0);
  border-radius: 1rem 1rem 0 0;
  transition: 0.5s ease;
  position: fixed;
  top: 8px;
  width: calc(100% - 278px);
  height: 64px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.scrolled {
  background-color: rgb(59, 130, 246, 1);
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

.pagebtn-area {
  position: relative;
  width: 50%;
  height: 64px;
  display: flex;
  align-items: center;
  margin-left: 24px;
  gap: 8px;
}

.page-btn {
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgb(70, 67, 67);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.page-btn svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.pagebtn-area h2 {
  font-size: 24px;
  font-weight: 900;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.next-btn {
  opacity: 0.3;
}

.btn-area {
  position: absolute;
  right: 28px;
  display: flex;
  gap: 8px;
}

.social-btn-item {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.social-btn-item svg {
  width: 24px !important;
  height: 24px !important;
  stroke: white;
}

.social-btn5 {
  display: none;
}

.description-item {
  height: 25px;
  background-color: #121212;
  color: white;
  border-radius: 15px;
  font-size: 15px;
  font-weight: 900;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 8px 0 8px;
  opacity: 0;
  visibility: hidden;
  transition: ease 0.3s;
  position: absolute;
  right: 105px;
  top: 35px;
}

.description1 {
  right: 206px;
}

.description2 {
  right: 150px;
  width: 60px;
}

.description3 {
  width: 60px;
}

.user-btn {
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  gap: 8px;
  cursor: pointer;
}

.description4 {
  right: 90px;
}

.description5 {
  right: -20px;
}

.description6 {
  right: -20px;
  top: 61px;
}

.social-btn1:hover,
.social-btn2:hover,
.social-btn3:hover,
.social-btn4:hover,
.social-btn5:hover {
  background-color: #121212;
}

.social-btn1:hover .description1,
.social-btn2:hover .description2,
.social-btn3:hover .description3,
.social-btn4:hover .description4 {
  opacity: 1;
  visibility: visible;
}

.social-btn5:hover .description5,
.social-btn5:hover .description6 {
  opacity: 1;
  visibility: visible;
}

.user-btn {
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  gap: 8px;
  cursor: pointer;
}

.btn-img img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.user-btn span {
  color: white;
}

.user-btn svg {
  width: 16px;
  height: 16px;
  stroke: white;
}

main {
  width: calc(100% - 278px);
  margin-top: 8px;
  margin-left: 270px;
  position: relative;
  height: calc(100vh - 16px);
  overflow: hidden;
  overflow-y: scroll;
  scroll-behavior: smooth;
  border-radius: 1rem;
  scrollbar-width: none;
}

.carddeck-information {
  width: 100%;
  padding: 0 1.5rem 2rem;
  background: linear-gradient(to right, #daa613, #df6230);
  display: flex;
}

.information-container {
  margin-top: 170px;
  width: 100%;
  box-sizing: border-box;
  gap: 32px;
  display: flex;
}

.carddeck-img {
  min-width: 240px;
  height: 240px;
  border-radius: 10px;
  overflow: hidden;
}

.carddeck-img img {
  width: 240px;
}

.carddeck-data {
  display: flex;
  justify-content: end;
  flex-direction: column;
  gap: 8px;
}

.carddeck-data h1 {
  font-size: 72px;
  font-weight: bold;
  color: white;
}

.user-number {
  font-size: 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 7px;
}

.user-number svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.data-container {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: white;
  gap: 16px;
}

.user-link {
  display: flex;
  align-items: center;
  gap: 3px;
}

.user-img {
  width: 28px;
  height: 28px;
}

.user-img img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.date-container a {
  text-decoration: none;
}
.data-item a {
  text-decoration: none;
  cursor: none;
}

.data-item {
  display: flex;
  align-items: center;
}

.data-item:nth-of-type(3) {
  flex-wrap: wrap;
  gap: 5px;
}

span svg {
  width: 24px;
  height: 24px;
}
/* -- */

.main-container {
  background: linear-gradient(rgba(59, 130, 246, 0.44), transparent);
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
}

.main-container-bg {
  background: linear-gradient(rgba(59, 130, 246, 0.44), transparent);
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  /* z-index: -1; */
}

.article-area {
  display: flex;
}

.text-container {
  width: 60%;
  padding: 8px;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #1e2d48, #1a2232);
  margin: 32px 0 0 24px;
  border-radius: 10px;
}

.article-title {
  width: 50%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-title svg {
  width: 32px;
  height: 32px;
  color: #8f96a3;
}

.article-title span {
  font-size: 16px;
  font-weight: 900;
  color: #8f96a3;
}

.article-content {
  margin-top: 16px;
  width: 100%;
  height: 300px;
  color: white;
  font-weight: bold;
  display: block;
  white-space: normal;
  overflow-wrap: break-word;
}

.message-area {
  width: 40%;
  height: 40px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  position: relative;
  margin-top: 36px;
  margin-left: 16px;
  flex-direction: column;
}

.user-message {
  width: 100%;
  display: flex;
  gap: 8px;
  margin: auto;
}

.message {
  box-sizing: border-box;
  width: 87%;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background-color: #1e2e48;
  border-radius: 10px;
  padding: 8px;
}

.message:hover {
  background-color: black;
}

.message-user-img img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.message svg {
  width: 28px;
  height: 28px;
  stroke: white;
}

.enter-message {
  width: 100%;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  font-size: 16px;
  transform: translate(-5px, 1px);
  color: white;
}

.enter-message:focus {
  outline: none;
}

.enter-messgae::placeholder {
  color: #4f4f50;
}

.message button {
  width: 32px;
  height: 32px;
  background-color: #3f3f46;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.message button svg {
  width: 24px;
  height: 24px;
}

.toolbar {
  width: 100%;
  display: flex;
  padding: 15px 24px 15px 0;
  position: sticky;
  top: 64px;
  z-index: 10;
  backdrop-filter: blur(5px);
}

.toolbar-area1 {
  width: 50%;
  display: flex;
  gap: 20px;
  /* display: none; */
}

.tool-btn1 {
  box-sizing: border-box;
  min-width: 72px;
  height: 32px;
  display: flex;
  align-items: center;
  border: none;
  background-color: #090909;
  cursor: pointer;
  color: white;
  border-radius: 5px;
}

.tool-btn1 span {
  margin-left: 8px;
  color: white;
  font-size: 14px;
  font-weight: 900;
  width: 100%;
}

.tool-btn1:hover {
  background-color: #1c1c1e;
}

.tool-btn1 svg {
  width: 24px;
  height: 24px;
}

.func-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: #060608;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.func-btn svg {
  width: 24px;
  height: 24px;
  color: white;
}

.func-text {
  width: 70px;
  height: 25px;
  background-color: #121212;
  color: white;
  border-radius: 15px;
  font-size: 15px;
  font-weight: 900;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 8px 0 8px;
  opacity: 0;
  visibility: hidden;
  transition: ease 0.3s;
  position: absolute;
  right: 20px;
  top: 50px;
}

.toolbar-area2 {
  display: flex;
  gap: 20px;
  position: absolute;
  right: 50px;
  /* display: none; */
}

.func-text1 {
  width: 90px;
  right: -40px;
}

.func-text2 {
  right: -30px;
}

.func-text3 {
  right: -30px;
}

.func-text4 {
  right: -32px;
}

.func-text5 {
  right: -30px;
}

.func-text6 {
  right: -25px;
}

.func-btn1:hover .func-text1,
.func-btn2:hover .func-text2,
.func-btn3:hover .func-text3,
.func-btn4:hover .func-text4,
.func-btn5:hover .func-text5,
.func-btn6:hover .func-text6 {
  opacity: 1;
  visibility: visible;
}

.deck-container {
  width: 99%;
  padding-right: 8px;
  height: 56px;
  position: fixed;
  bottom: 66px;
  display: flex;
  display: none;
}

.deck-img {
  overflow: hidden;
  border-radius: 10px;
  transform: translateX(8px);
  z-index: 1;
}

.deck-img img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  display: none;
}

.deck-content {
  width: 92%;
  height: 56px;
  background-color: rgba(86, 68, 10, 0.9);
  display: flex;
  padding-left: 8px;
  border-radius: 0 10px 10px 0;
  align-items: center;
  position: relative;
  display: none;
}

.line {
  position: absolute;
  bottom: 52px;
  width: 96%;
  border-top: 4px solid;
  border-image: linear-gradient(
      to right,
      rgb(234, 179, 8) 0%,
      rgb(234, 179, 8) 89.0476%,
      rgb(34, 197, 94) 94.0476%,
      rgb(34, 197, 94) 95%
    )
    5 / 1 / 0 stretch;
}

.total-cards {
  width: 80%;
  padding-top: 8px;
  padding-left: 8px;
}

.total-cards h2 {
  font-size: 15px;
  font-weight: 00;
  color: #fff;
  margin-bottom: 2px;
}

.total-cards span {
  font-size: 13px;
  color: #dad7d7;
  font-weight: 700;
}

.deckbtn-area {
  display: flex;
  align-items: center;
  width: 20%;
  position: relative;
  padding-left: 8px;
}

.deck-btn {
  all: unset;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #f0f0f0;
  background-color: rgba(86, 68, 10, 0.9);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 120px;
  cursor: pointer;
}

.deck-btn:hover {
  background-color: #42ebeb;
}

.deck-btn i::before {
  font-size: 24px;
}

.pay-btn {
  padding-left: 5px;
  position: absolute;
  right: 8px;
  width: 86px;
  min-width: 94px;
  height: 32px;
  background-color: #daa61e;
  display: flex;
  align-items: center;
  color: #dad7d7;
  border-radius: 20px;
  cursor: pointer;
}

.pay-btn:hover {
  background-color: #e27637;
}

.pay-btn span {
  font-size: 14px;
  margin-left: 5px;
}

@media screen and (min-width: 1400px) {
  .col-Sheet,
  .col-Info {
    width: calc((100% - 10px) / 5);
  }
}

@media screen and (max-width: 1199px) {
  .sidebar-container {
    min-width: 270px;
    position: fixed;
    background: linear-gradient(to top, #000, rgba(0, 0, 0, 0.9), transparent);
  }
  .toolbar {
    margin-top: 300px;
    top: 72px;
  }
  .row {
    margin-top: 300px;
  }

  .card-info {
    margin-top: 150px;
  }

  .tool-btn1 span {
    width: 100%;
  }

  .col-Sheet,
  .col-Info {
    width: calc((100% - 10px) / 3);
  }

  textarea {
    color: white !important;
    text-align: left !important;
  }

  .message-area {
    align-items: center !important;
  }

  main {
    border-radius: 0;
    margin-left: 0;
    margin-top: 0;
    width: 100%;
    height: 100vh;
    overflow-y: auto;
  }

  .bg-black {
    border-radius: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  .header-container {
    border-radius: 0;
    height: 72px;
    position: fixed;
    top: 0;
    width: 100%;
  }

  .next-btn {
    display: none;
  }

  .user-btn {
    display: none;
  }

  .social-btn2,
  .social-btn3 {
    display: block;
  }

  .carddeck-information {
    width: 100%;
    padding: 0;
  }

  .information-container {
    margin-top: 0;
    width: 100%;
    gap: 0;
    flex-direction: column;
    padding: 5rem 0 0 0;
  }

  .carddeck-img {
    width: 288px;
    height: 288px;
    object-fit: cover;
    margin: 0 auto;
  }

  .carddeck-img img {
    width: 288px;
  }

  .carddeck-data {
    width: 100%;
    margin: 18px 8px 0 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .data-container {
    width: calc(100% - 20px);
    margin-bottom: 16px;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: start;
    font-size: 14px;
    gap: 5px;
  }

  .main-container {
    height: 100%;
  }

  .article-area {
    width: 100%;
    height: 50vh;
    flex-direction: column;
  }

  .text-container {
    width: 95%;
    height: 100%;
    margin: 16px auto;
    padding: 8px;
    margin: 1rem auto;
    border-radius: 10px;
  }

  .message-area {
    width: 100%;
    height: 40px;
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .user-message {
    width: 95%;
    display: flex;
    gap: 8px;
    margin: auto;
  }

  .message {
    width: 100%;
    height: 48px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    background-color: #1e2e48;
    border-radius: 10px;
    padding: 8px;
  }

  .message-count {
    color: white;
    font-weight: bold;
    display: block;
    width: 90%;
    text-align: right;
  }

  .deck-container {
    display: flex;
  }

  .func-btn1 {
    display: none;
  }

  .row {
    margin-top: 30px;
  }

  .description2 {
    right: 20px;
  }

  .description3 {
    right: -10px;
  }
}

@media screen and (max-width: 800px) {
  .toolbar {
    width: 100%;
  }

  .toolbar-area1 {
    gap: 8px;
  }

  .toolbar-area2 {
    gap: 8px;
  }
}

@media screen and (max-width: 576px) {
  .toolbar-area2 {
    display: none;
  }
}
@media screen and (max-width: 768px) {
  .col-Sheet,
  .col-Info {
    width: calc((100% - 10px) / 2);
  }
}

@media screen and (max-width: 450px) {
  .carddeck-information {
    height: 700px;
  }
}
@media screen and (max-width: 375px) {
  .tool-btn1 {
    min-width: 62px;
  }
  .toolbar {
    margin-left: 10px;
  }
}
</style>
