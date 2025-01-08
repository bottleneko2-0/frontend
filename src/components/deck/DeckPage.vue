<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useDeckMakeStore } from '@/stores/deck-make'
import { useCardSeriesStore } from '@/stores/card-series'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import RemitCard from '@/components/card/RemitCard.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import Notice from '@/components/notice/Notice.vue'
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
const API_URL = import.meta.env.VITE_API_URL

const isVisible = ref(false)
const deckData = ref({ deck: [] })
const sortBy = ref('type')
const togglePriceView = ref(false)
const toggleTableView = ref(false)

const deckMakeStore = useDeckMakeStore()
const cardSeriesStore = useCardSeriesStore()

const router = useRouter()
const route = useRoute()

const totalPrice = computed(() => {
  if (!Array.isArray(deckData.value.deck)) return 0
  return deckData.value.deck.reduce(
    (sum, card) => sum + (card.price?.number || 0),
    0
  )
})

const uniqueProductNames = computed(() => {
  const productNames = deckData.value.deck.map((card) => card.productName)
  return [...new Set(productNames)]
})

const groupedCards = computed(() => {
  let sorted = []
  if (sortBy.value === 'level') {
    sorted = [...deckData.value.deck].sort((a, b) => a.level - b.level)
  } else if (sortBy.value === 'color') {
    const colorOrder = ['red', 'yellow', 'green', 'blue']
    sorted = [...deckData.value.deck].sort(
      (a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color)
    )
  } else if (sortBy.value === 'type') {
    const typeOrder = ['キャラ', 'イベント', 'クライマックス']
    sorted = [...deckData.value.deck].sort(
      (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
    )
  } else if (sortBy.value === 'rare') {
    sorted = [...deckData.value.deck].sort((a, b) => {
      if (a.rare.length !== b.rare.length) return a.rare.length - b.rare.length
      return a.rare.localeCompare(b.rare, 'en')
    })
  } else if (sortBy.value === 'seriesCode') {
    sorted = [...deckData.value.deck].sort((a, b) =>
      a.seriesCode.localeCompare(b.seriesCode, 'en')
    )
  } else {
    sorted = [...deckData.value.deck]
  }

  const grouped = sorted.reduce((acc, card) => {
    let groupKey = card[sortBy.value]
    if (!acc[groupKey]) acc[groupKey] = []
    acc[groupKey].push(card)
    return acc
  }, {})

  const colorMap = { red: '紅色', yellow: '黃色', green: '綠色', blue: '藍色' }
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

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    router.push('/')
  }
}

const confirmClose = () => {
  Swal.fire({
    title: '確定要離開嗎？',
    text: '您的資料尚未完成，確定要離開嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '離開',
    cancelButtonText: '取消',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      isVisible.value = false
    }
  })
}

const hideModal = () => {
  isVisible.value = false
}

const toggleVisibility = () => {
  isVisible.value = !isVisible.value
}

const goToArticlePage = () => {
  const deckId = route.params.deck_id
  router.push(`/add/${deckId}`)
}

const toggleRemitCard = () => {
  isVisible.value = !isVisible.value
}

const fetchDeckData = async () => {
  const deckId = route.params.deck_id
  try {
    const response = await axios.get(`${API_URL}/api/deck-page/${deckId}`)
    deckData.value = response.data

    if (!deckData.value?.users?.username || !deckData.value.deck) {
      console.error('回傳資料格式錯誤:', deckData.value)
      Swal.fire('錯誤', '無法獲取有效的資料', 'error')
      return
    }

    if (!Array.isArray(deckData.value.deck)) {
      deckData.value.deck = []
    }
  } catch (error) {
    console.error('Error fetching deck data:', error)
    Swal.fire('錯誤', '無法獲取資料', 'error')
  }
}

const togglePriceTableView = () => {
  togglePriceView.value = !togglePriceView.value
}

const toggleViewMode = () => {
  toggleTableView.value = !toggleTableView.value
}

const countSoulCards = (cards) => {
  return cards.filter((card) => card.trigger.includes('soul')).length
}

const setSortBy = (property) => {
  sortBy.value = property
}

const copyDeck = async () => {
  deckMakeStore.selectedCards = deckData.value.deck
  deckMakeStore.saveLastDeckEdit()
  const cardCode = deckData.value.deck[0]?.seriesCode

  try {
    const response = await axios.get(`${API_URL}/api/series`)
    const seriesId = response.data.find((series) =>
      series.code.includes(cardCode)
    )?.id
    cardSeriesStore.saveLastViewSeries(seriesId)
    router.push(`/card-series/${seriesId}`)
  } catch (error) {
    console.error('Error fetching series:', error)
  }
}

const deleteDeck = async () => {
  const deck_id = route.params.deck_id
  Swal.fire({
    title: '確定要刪除牌組嗎？',
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
        await axios.delete(`${API_URL}/decks/${deck_id}`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        })

        Swal.fire({
          icon: 'success',
          title: '刪除成功',
          showConfirmButton: false,
          timer: 1500,
          color: '#e1e1e1',
          background: '#27272a',
        })

        router.push('/deck')
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: '刪除失敗',
          text: '已引用於文章,無法刪除',
          color: '#e1e1e1',
          background: '#27272a',
        })
      }
    }
  })
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
  fetchDeckData()
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
    <SidebarGrid />
    <main class="background">
      <div v-if="isVisible">
        <RemitCard v-if="isVisible" />
      </div>
      <header :class="{ scrolled: isScrolled }">
        <div class="pagebtn-area">
          <button class="page-btn" @click="goBack">
            <AngleL class="w-6 h-6" />
          </button>
          <button class="page-btn next-btn">
            <AngleR class="w-6 h-6" />
          </button>
          <h2 class="header-title">{{ deckData.deck_name }}</h2>
        </div>
        <div class="btn-area">
          <button class="social-btn-item social-btn2" @click="copyDeck">
            <Copy class="stroke-2 size-6 svg-icon" />
            <div class="description-item description2 hover-text">複製牌組</div>
          </button>
          <button class="social-btn-item social-btn3" @click="toggleRemitCard">
            <Download class="stroke-2 size-6 svg-icon" />
            <div class="description-item description7">匯出牌組</div>
          </button>
          <button class="social-btn-item social-btn3" @click="goToArticlePage">
            <ChatBox class="stroke-2 size-6 svg-icon" />
            <div class="description-item description3">發布文章</div>
          </button>
          <button class="social-btn-item social-btn3" @click="deleteDeck()">
            <Delete class="stroke-2 size-6 svg-icon red" />
            <div class="description-item description4">刪除牌組</div>
          </button>
          <Notice />
          <div class="user-btn">
            <NavLoginBtn />
          </div>
          <button class="social-btn-item social-btn5">
            <Litter class="stroke-2 size-6 svg-icon" />
          </button>
        </div>
      </header>
      <section class="carddeck-information">
        <div class="information-container">
          <div class="carddeck-img">
            <img :src="deckData.deck_cover" alt="" />
          </div>
          <div class="carddeck-data">
            <p class="user-number">
              <Ball class="flex-none size-5 md:size-6 svg-icon" />
              {{ deckData.deck_id }}
            </p>
            <div class="carddeck-name">
              <h1>{{ deckData.deck_name }}</h1>
            </div>
            <div class="data-container">
              <div
                class="user-link"
                v-if="deckData && deckData.users && deckData.users.username"
              >
                <div class="user-img" v-if="deckData.users.picture">
                  <img :src="deckData.users.picture" alt="" />
                </div>
                <span class="date-container">
                  <a href="#">{{ deckData.users.username }}</a>
                  發布於
                  <span>{{ deckData.build_time.slice(0, 10) }}</span>
                </span>
              </div>
              <span
                class="data-item"
                v-if="deckData && Array.isArray(deckData.deck)"
              >
                <Card class="flex-none size-5 md:size-6 svg-icon" />
                總數{{ deckData.deck.length }}張
              </span>
              <span class="data-item">
                <Cash class="flex-none size-5 md:size-6 svg-icon" />
                總價
                <span>{{ totalPrice }}円</span>
              </span>
              <span
                class="data-item"
                v-if="deckData.deck && deckData.deck.length > 0"
              >
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
      <section class="main-container">
        <div class="article-area">
          <div class="text-container">
            <div class="article-title">
              <ChatBox class="text-white/50 size-8" />
              <span>內容描述</span>
            </div>
            <div class="article-content">
              <p>{{ deckData.deck_description }}</p>
            </div>
          </div>
        </div>
        <div class="card-info">
          <nav class="toolbar">
            <div class="toolbar-area1">
              <button
                class="tool-btn1"
                @click="setSortBy('type')"
                :class="{ active: sortBy === 'type' }"
              >
                <TypeGroup class="flex-none stroke-2 size-6 svg-icon" />
                <span>類型</span>
              </button>
              <button
                class="tool-btn1"
                @click="setSortBy('color')"
                :class="{ active: sortBy === 'color' }"
              >
                <TypeGroup class="flex-none stroke-2 size-6 svg-icon" />
                <span>顏色</span>
              </button>
              <button
                class="tool-btn1"
                @click="setSortBy('level')"
                :class="{ active: sortBy === 'level' }"
              >
                <TypeGroup class="flex-none stroke-2 size-6 svg-icon" />
                <span>等級</span>
              </button>
              <button
                class="tool-btn1"
                style="min-width: 86px"
                @click="setSortBy('rare')"
                :class="{ active: sortBy === 'rare' }"
              >
                <TypeGroup class="flex-none stroke-2 size-6 svg-icon" />
                <span>稀有度</span>
              </button>
              <button
                class="tool-btn1"
                @click="setSortBy('seriesCode')"
                :class="{ active: sortBy === 'seriesCode' }"
              >
                <TypeGroup class="flex-none stroke-2 size-6 svg-icon" />
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
                <Cash class="size-6 svg-icon" />
                <div class="func-text func-text4">開啟價格</div>
              </button>
              <button
                class="func-btn func-btn5"
                @click="toggleTableView = true"
                :style="{ backgroundColor: toggleTableView ? '#06b6d4' : '' }"
              >
                <Table class="size-6 svg-icon" />
                <div class="func-text func-text5">表格顯示</div>
              </button>
              <button
                class="func-btn func-btn6"
                @click="toggleTableView = false"
                :style="{ backgroundColor: !toggleTableView ? '#06b6d4' : '' }"
              >
                <CardInfo class="size-6 svg-icon" />
                <div class="func-text func-text6">卡片資訊</div>
              </button>
            </div>
          </nav>
          <div
            class="row"
            v-if="groupedCards && groupedCards.length"
            v-for="group in groupedCards"
            :key="group.group"
          >
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
                {{ group.group || '角色' }} - {{ group.cards.length }}
              </h2>
              <div class="group-count">
                <img src="https://bottleneko.app/soul.gif" class="size-4" />
                <span class="flex-none font-mono">{{
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
                  <CashJP class="currency-icon" />
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
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 99;
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
  width: 100%;
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
  width: 100%;
  display: flex;
  flex-direction: column;
}

.card-image {
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
  width: 100%;
  padding: 20px;
  padding-right: 0;
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

.items-center {
  align-items: center;
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
  /* z-index: 10 !important; */
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
  height: 60vh;
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
main::-webkit-scrollbar {
  width: 0px; /* 隱藏滾動條 */
  background: transparent; /* 滾動條的背景設為透明 */
}
.sidebar-container {
  background-color: #000000;
  min-width: 270px;
  position: fixed;
}

.sidebar {
  width: 238px;
  height: 100vh;
  background-color: black;
  padding: 16px;
}

.sidebar-head {
  text-decoration: none;
  color: black;
  cursor: pointer;
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
  padding: 0px;
}

.sidebar-menu > li {
  display: flex;
  align-items: center;
  width: 238px;
  height: 40px;
  margin-bottom: 5px;
}

.w-7 {
  width: 1.75rem;
}

.h-7 {
  height: 1.75rem;
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

.sidebar-menu a:hover h2 {
  color: white;
}

.sidebar-menu a:hover svg {
  stroke: white;
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

.sidebar p {
  color: #a1a1aa;
  font-size: 16px;
  margin-top: 30px;
}

.bg-black {
  background-color: #000000;
  width: calc(100% - 278px);
  height: 72px;
  position: fixed;
  top: 0;
  z-index: 5;
  left: 270px;
}

header {
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
  white-space: nowrap; /* 強制單行顯示 */
  overflow: hidden; /* 隱藏超出部分 */
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
.social-btn-item .red {
  width: 24px !important;
  height: 24px !important;
  stroke: red;
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
  right: 320px;
}

.description2 {
  right: 240px;
}

.description3 {
  right: 160px;
}

.description4 {
  right: 120px;
}

.description5 {
  right: 95px;
}

.description7 {
  right: 200px;
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
  opacity: 1;
}

.social-btn1:hover .description1,
.social-btn2:hover .description2,
.social-btn3:hover .description3,
.social-btn3:hover .description4,
.social-btn3:hover .description5,
.social-btn3:hover .description7,
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
  /* width: 92px; */
  height: 32px;
  border: none;
  /* background-color: #121212; */
  /* opacity: 0.6; */
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

/* -- */

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
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-number {
  font-size: 12px;
  color: white;
  display: flex;
  align-items: center;
}

.user-number svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.carddeck-name {
  width: 60%;
  display: flex;
}

.carddeck-name h1 {
  /* width: 70%; */
  min-height: 138px;
  font-size: 70px;
  font-weight: bold;
  color: white;
  white-space: nowrap; /* 強制單行顯示 */
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-container {
  width: 100%;
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

.date-container a,
.data-item a {
  text-decoration: none;
  margin-left: 5px;
  pointer-events: none;
}

.data-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

span svg {
  width: 24px;
  height: 24px;
}
/* -- */

.main-container {
  background: linear-gradient(
    rgba(59, 130, 246, 0.44) 300px,
    transparent 500px
  );
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
}

.article-area {
  display: flex;
}

.text-container {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #1e2d48, #1a2232);
  margin: 32px 24px;
  border-radius: 10px;
  z-index: 2;
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
  height: 100%;
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
  width: 85%;
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
  min-width: 78px;
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

.footer-nav {
  width: 100%;
  height: 66px;
  display: flex;

  position: fixed;
  bottom: 0;
  display: none;
}

.nav-link {
  width: 16.66%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.nav-link img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.link-svg {
  width: 28px;
  height: 28px;
  stroke: #b1afaf;
}

.link-word {
  font-size: 9px;
  margin-top: 8px;
  color: #b1afaf;
}

.nav-link:hover svg {
  stroke: white;
}

.nav-link:hover span {
  color: white;
}

.social-icon svg {
  stroke: white;
}

.social-icon span {
  color: white;
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
.hover-text {
  width: 60px;
}
.svg-icon {
  stroke-width: 1.5px;
}
@media screen and (min-width: 1400px) {
  .col-Sheet,
  .col-Info {
    width: calc((100% - 10px) / 5);
  }
}

@media screen and (max-width: 1199px) {
  .social-btn1:hover .description1,
  .social-btn2:hover .description2,
  .social-btn3:hover .description3,
  .social-btn3:hover .description4,
  .social-btn3:hover .description5,
  .social-btn3:hover .description7,
  .social-btn4:hover .description4 {
    visibility: hidden;
  }
  .social-btn-item {
    width: auto;
  }
  .btn-area {
    width: auto;
    right: 0px;
  }
  .container {
    left: 0;
    top: 0;
    width: 100%;
  }
  .toolbar {
    top: 72px;
  }

  .card-info {
    margin-top: 50px;
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

  .sidebar-container {
    background: linear-gradient(to top, #000, rgba(0, 0, 0, 0.9), transparent);
  }

  .bg-container {
    margin-left: 0;
    width: 100%;
    padding-bottom: 0px !important;
  }

  main {
    border-radius: 0;
    margin-left: 0;
    margin-top: 0;
    width: 100%;
    /* scroll-behavior: smooth; */
    height: 100vh;
    overflow-y: auto;
  }

  .bg-black {
    border-radius: 0;
    position: absolute;
    top: 0;
    width: 100%;
    left: 0;
  }

  header {
    border-radius: 0;
    height: 72px;
    position: fixed;
    top: 0;
    width: 100%;
  }

  .next-btn {
    display: none;
  }

  .pagebtn-area h2 {
    display: none;
  }
  .social-btn2,
  .social-btn3,
  .social-btn4 {
    display: block;
  }

  .user-btn {
    display: none;
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

  .carddeck-name {
    width: 100%;
    height: 40px;
    overflow: visible;
  }

  .carddeck-name h1 {
    width: 100%;
    font-size: 30px;
    height: 20px;
    white-space: unset; /* 強制單行顯示 */
    overflow: visible; /* 隱藏超出部分 */
    text-overflow: unset;
  }

  .carddeck-data {
    width: 100%;
    margin: 18px 8px 0 8px;
    height: 210px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .data-container {
    width: 100%;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: start;
    font-size: 14px;
    gap: 5px;
    transform: translateY(10px);
  }

  .main-container {
    /* top: 623px; */
    height: 100%;
  }

  .article-area {
    width: 100%;
    height: 50vh;
    flex-direction: column;
  }

  .text-container {
    width: 95%;
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

  .footer-nav {
    display: flex;
  }

  .deck-container {
    display: flex;
  }

  .func-btn1 {
    display: none;
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

@media screen and (max-width: 768px) {
  .col-Sheet,
  .col-Info {
    width: calc((100% - 10px) / 2);
  }
  .container {
    all: unset !important; /* 這會取消所有屬性 */
  }
}

@media screen and (max-width: 576px) {
  .toolbar-area2 {
    display: none;
  }
}

@media screen and (max-width: 410px) {
  .carddeck-name h1 {
    white-space: nowrap; /* 強制單行顯示 */
    overflow: hidden; /* 隱藏超出部分 */
    text-overflow: ellipsis;
  }
}

@media screen and (max-width: 375px) {
  .tool-btn1 {
    min-width: 72px;
  }
}
</style>
