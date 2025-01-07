<script setup>
import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import MainFooter from '@/components/home/MainFooter.vue'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import Notice from '@/components/notice/Notice.vue'
import RemitCard from '@/components/card/RemitCard.vue'
import FindCard from '@/components/card/FindCard.vue'
import Magnifier from '@/components/svg/Magnifier.vue'
import Close from '@/components/svg/Close.vue'
import TwoSquare from '@/components/svg/TwoSquare.vue'
import Box from '@/components/svg/Box.vue'
import TrashCan from '@/components/svg/TrashCan.vue'
import Tag from '@/components/svg/Tag.vue'

const API_URL = import.meta.env.VITE_API_URL

const firstVisible = ref(false)
const secondVisible = ref(false)
const toggleRemitCard = () => {
  firstVisible.value = !firstVisible.value
}
const toggleFindCard = () => {
  secondVisible.value = !secondVisible.value
}
// 日期晚>早排序
const dateSort = (a, b) => {
  const dateA = a.build_time ? new Date(a.build_time) : null
  const dateB = b.build_time ? new Date(b.build_time) : null
  if (!dateA && !dateB) return 0
  if (!dateA) return 1
  if (!dateB) return -1

  return dateB - dateA
}

// 日期早>晚排序
const dateSortReverse = (a, b) => {
  const dateA = a.build_time ? new Date(a.build_time) : null
  const dateB = b.build_time ? new Date(b.build_time) : null
  if (!dateA && !dateB) return 0
  if (!dateA) return -1
  if (!dateB) return 1

  return dateA - dateB
}

const token = ref(localStorage.getItem('token'))
const isScrolled = ref(false) // 是否滾動
const cardDecks = ref([])
const originalDecks = ref([])
const error = ref('')
const sortState = ref(0)
const dateIsSorted = ref(false)
const dateIsSelected = ref(true)
const nameIsSorted = ref(false)
const nameIsSelected = ref(false)
const seriesIsSelected = ref(false)
const searchQuery = ref('')

// 獲取我的牌組資料
const fetchMyDecks = async () => {
  try {
    const response = await axios.get(`${API_URL}/decks`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })
    originalDecks.value = response.data.decks
    cardDecks.value = [...originalDecks.value].sort(dateSort)
    sortState.value = 0
    dateIsSorted.value = false
    dateIsSelected.value = true
    nameIsSorted.value = false
    nameIsSelected.value = false
  } catch (err) {
    error.value = '獲取我的牌組資料失敗' + err.message
  }
}

// 獲取系列卡表資料
const originalSeries = ref([])
const fetchCardSeries = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/series`)
    originalSeries.value = response.data
  } catch (err) {
    error.value = '獲取系列卡表資料失敗' + err.message
  }
}

// A-Z>50音排序
const nameSort = (a, b) => {
  const nameA = a.deck_name
  const nameB = b.deck_name

  const len = Math.min(nameA.length, nameB.length)
  for (let i = 0; i < len; i++) {
    const charA = nameA[i]
    const charB = nameB[i]

    if (/[A-Z]/.test(charA) && !/[A-Z]/.test(charB)) return -1
    if (!/[A-Z]/.test(charA) && /[A-Z]/.test(charB)) return 1

    if (/[a-z]/.test(charA) && !/[a-z]/.test(charB)) return -1
    if (!/[a-z]/.test(charA) && /[a-z]/.test(charB)) return 1

    const EnglishCompare = charA.localeCompare(charB)
    if (EnglishCompare !== 0) return EnglishCompare

    const japaneseOrder =
      'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'
    const aJapaneseIndex = japaneseOrder.indexOf(charA)
    const bJapaneseIndex = japaneseOrder.indexOf(charB)
    if (aJapaneseIndex !== -1 && bJapaneseIndex !== -1) {
      const japaneseCompare = aJapaneseIndex - bJapaneseIndex
      if (japaneseCompare !== 0) return japaneseCompare
    }
  }

  return nameA.length - nameB.length
}

const nameSortReverse = (a, b) => {
  const nameA = a.deck_name
  const nameB = b.deck_name

  const len = Math.min(nameA.length, nameB.length)
  for (let i = 0; i < len; i++) {
    const charA = nameA[i]
    const charB = nameB[i]

    if (/[A-Z]/.test(charA) && !/[A-Z]/.test(charB)) return 1
    if (!/[A-Z]/.test(charA) && /[A-Z]/.test(charB)) return -1

    if (/[a-z]/.test(charA) && !/[a-z]/.test(charB)) return 1
    if (!/[a-z]/.test(charA) && /[a-z]/.test(charB)) return -1

    const EnglishCompare = charA.localeCompare(charB)
    if (EnglishCompare !== 0) return -EnglishCompare

    const japaneseOrder =
      'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'
    const aJapaneseIndex = japaneseOrder.indexOf(charA)
    const bJapaneseIndex = japaneseOrder.indexOf(charB)
    if (aJapaneseIndex !== -1 && bJapaneseIndex !== -1) {
      const japaneseCompare = bJapaneseIndex - aJapaneseIndex
      if (japaneseCompare !== 0) return japaneseCompare
    }
  }

  return nameB.length - nameA.length
}

// 獲取我的牌組的seriesCode
const seriesCodes = ref([])
const fetchSeriesCode = async () => {
  try {
    const response = await axios.get(`${API_URL}/decks`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    const decks = response.data.decks
    seriesCodes.value = []

    decks.forEach((decksItem) => {
      decksItem.deck.forEach((card) => {
        if (card.seriesCode && !seriesCodes.value.includes(card.seriesCode)) {
          seriesCodes.value.push(card.seriesCode)
        }
      })
    })
  } catch (err) {
    error.value = '獲取我的牌組資料失敗: ' + err.message
  }
}

// 比對seriesCode及code並回傳系列名稱
const matchedNames = ref([])
const findSeriesNames = () => {
  matchedNames.value = []
  seriesCodes.value.forEach((code) => {
    for (let i = 0; i < originalSeries.value.length; i++) {
      originalSeries.value[i].code.forEach((item) => {
        if (item == code) {
          const nameToAdd =
            originalSeries.value[i].i18n.zh.name || originalSeries.value[i].name
          if (!matchedNames.value.includes(nameToAdd)) {
            matchedNames.value.push(nameToAdd)
          }
        }
      })
    }
  })
}

// 比對seriesCode及code是否相同並新增至matchedCode
const matchedCodes = ref([])
const findMatchedCode = () => {
  matchedCodes.value = []

  seriesCodes.value.forEach((code) => {
    for (let i = 0; i < originalSeries.value.length; i++) {
      originalSeries.value[i].code.forEach((item) => {
        if (item == code) {
          if (!matchedCodes.value.includes(originalSeries.value[i].code)) {
            matchedCodes.value.push(originalSeries.value[i].code)
          }
        }
      })
    }
  })
}

// 系列按鈕的數字計算
const counts = computed(() => {
  const result = matchedCodes.value.map(() => 0)

  originalDecks.value.forEach((deckItem) => {
    const uniqueSeriesCodes = Array.from(
      new Set(
        deckItem.deck.map((card) => String(card.seriesCode).toUpperCase())
      )
    )

    matchedCodes.value.forEach((codeArray, index) => {
      // 檢查這個牌組的 uniqueSeriesCodes 是否包含 codeArray 中的任一代碼
      const hasMatch = codeArray.some((matchCode) =>
        uniqueSeriesCodes.includes(String(matchCode).toUpperCase())
      )

      if (hasMatch) {
        result[index]++
      }
    })
  })
  return result
})

// 系列按鈕的排序功能
const sortedStates = ref({})
const toggleSeriesSort = (codes, index) => {
  // 恢復牌組排序狀態
  if (sortedStates.value[index]) {
    cardDecks.value = [...originalDecks.value]

    if (dateIsSelected.value) {
      cardDecks.value.sort(dateIsSorted.value ? dateSortReverse : dateSort)
    } else if (nameIsSelected.value) {
      cardDecks.value.sort(nameIsSorted.value ? nameSort : nameSortReverse)
    }

    sortedStates.value[index] = false
    seriesIsSelected.value = false
    return
  }

  let sortedDecks = originalDecks.value.filter((decksItem) =>
    decksItem.deck.some(
      (card) => card.seriesCode && codes.includes(card.seriesCode)
    )
  )

  if (dateIsSelected.value) {
    sortedDecks.sort(dateIsSorted.value ? dateSortReverse : dateSort)
  } else if (nameIsSelected.value) {
    sortedDecks.sort(nameIsSorted.value ? nameSort : nameSortReverse)
  }

  cardDecks.value = sortedDecks

  // 把其他牌組改成未點擊狀態
  Object.keys(sortedStates.value).forEach((key) => {
    sortedStates.value[key] = false
  })
  sortedStates.value[index] = true
  seriesIsSelected.value = true
}

const toggleDateSort = () => {
  const decksToSort = [...cardDecks.value]
  dateIsSorted.value = !dateIsSorted.value
  sortState.value = dateIsSorted.value ? 1 : 0

  cardDecks.value = decksToSort.sort(
    dateIsSorted.value ? dateSortReverse : dateSort
  )

  dateIsSelected.value = true
  nameIsSorted.value = false
  nameIsSelected.value = false
}

const toggleNameSort = () => {
  const decksToSort = [...cardDecks.value]
  nameIsSorted.value = !nameIsSorted.value

  cardDecks.value = decksToSort.sort(
    nameIsSorted.value ? nameSort : nameSortReverse
  )

  nameIsSelected.value = true
  dateIsSorted.value = false
  dateIsSelected.value = false
}

const initData = async () => {
  await fetchCardSeries()
  await fetchSeriesCode()
  findSeriesNames()
  findMatchedCode()
}

// 日期格式化函數
const formaDate = (time) => {
  const date = new Date(time)
  return date.toLocaleDateString('en-CA')
}

// 根據滾動位置判斷顯示 header 標題和背景色
let mainElement = ref(null)
const handleScroll = () => {
  const scrollTop = mainElement.value.scrollTop
  isScrolled.value = scrollTop > 300
}

const main = () => {
  mainElement.value = document.querySelector('.background')
  if (mainElement.value) {
    mainElement.value.addEventListener('scroll', handleScroll)
  }
}

const searchDecks = () => {
  if (!searchQuery.value.trim()) {
    cardDecks.value = originalDecks.value
  } else {
    const query = searchQuery.value.toLowerCase()
    cardDecks.value = originalDecks.value.filter((cardDeck) => {
      const deckName = cardDeck.deck_name?.toLowerCase() || ''
      const deckId = cardDeck.deck_id?.toLowerCase() || ''
      const deckSeriesCode = cardDeck.deck.some((card) => {
        const seriesCode = card.seriesCode?.toLowerCase() || ''
        return seriesCode.includes(query)
      })

      return (
        deckName.includes(query) || deckId.includes(query) || deckSeriesCode
      )
    })
  }

  if (dateIsSelected.value) {
    cardDecks.value.sort(dateIsSorted.value ? dateSortReverse : dateSort)
  } else if (nameIsSelected.value) {
    cardDecks.value.sort(nameIsSorted.value ? nameSort : nameSortReverse)
  }
}
const clearSearch = () => {
  searchQuery.value = ''
  cardDecks.value = originalDecks.value
  if (dateIsSelected.value) {
    cardDecks.value.sort(dateIsSorted.value ? dateSortReverse : dateSort)
  } else if (nameIsSelected.value) {
    cardDecks.value.sort(nameIsSorted.value ? nameSort : nameSortReverse)
  }
}

const deleteDeck = async (deck_id) => {
  Swal.fire({
    title: '確定要刪除牌組嗎？',
    text: '刪除後將無法復原。',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確認刪除',
    cancelButtonText: '取消',
    color: '#e1e1e1',
    background: '#27272a',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${API_URL}/decks/${deck_id}`, {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        })

        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: '刪除成功',
            showConfirmButton: false,
            timer: 1000,
            color: '#e1e1e1',
            background: '#27272a',
          }).then(() => {
            fetchMyDecks()
          })
        }
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
onMounted(() => {
  fetchMyDecks()
  fetchCardSeries()
  fetchSeriesCode()
  initData()
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
    <div class="main-container background">
      <div v-if="firstVisible">
        <RemitCard v-if="firstVisible" />
      </div>
      <div v-if="secondVisible">
        <FindCard v-if="secondVisible" />
      </div>
      <header class="header-container" :class="{ scrolled: isScrolled }">
        <div class="search-container">
          <Magnifier stroke-width="1.5" class="w-8 h-8 text-black" />
          <input
            v-model="searchQuery"
            @keyup="searchDecks"
            class="header-input"
            type="text"
            placeholder="找我的牌組？"
          />
          <button @click="clearSearch" class="clear-btn">
            <Close stroke-width="1.5" class="w-6 h-6 text-black" />
          </button>
        </div>
        <div class="sort-button">
          <button
            class="active1"
            :class="{ selected: nameIsSelected }"
            :style="{
              background: nameIsSelected
                ? 'linear-gradient(to right, #5eead4, #93c5fd)'
                : 'white',
            }"
            @click="toggleNameSort"
          >
            <i
              class="fa-solid fa-arrow-up"
              :class="{ rotate180: nameIsSorted }"
            ></i>
            名稱
          </button>
          <button
            class="active2"
            :class="{ selected: dateIsSelected }"
            :style="{
              background: dateIsSelected
                ? 'linear-gradient(to right, #5eead4, #93c5fd)'
                : 'white',
            }"
            @click="toggleDateSort"
          >
            <i
              class="fa-solid fa-arrow-up"
              :class="{ rotate180: dateIsSorted }"
            ></i>
            日期
          </button>
        </div>
        <div class="notice-area">
          <Notice />
          <NavLoginBtn />
        </div>
      </header>
      <main class="work-shop-main">
        <div class="display-area">
          <div
            class="display-card"
            style="transform: translate3d(0px, 0px, 0px)"
          >
            <div class="card-area">
              <button
                v-for="(name, index) in matchedNames"
                :key="index"
                @click="toggleSeriesSort(matchedCodes[index], index)"
                :class="{ selectedGray: sortedStates[index] }"
                class="relative hover:bg-[rgb(39,39,42)] overflow-hidden rounded-lg border border-zinc-800 flex items-center gap-2 px-1 md:p-2 bac-1818 w-full-col"
              >
                <div class="w-full min-w-0 text-left grow-1 w-full-col">
                  <span
                    class="flex items-center gap-1 font-mono text-xs truncate text-zinc-400"
                  >
                    <TwoSquare stroke-width="1.5" class="w-6 h-6" />
                    {{ matchedCodes[index].join(',') }}
                  </span>
                  <p
                    class="hidden truncate md:block text-zinc-200 div-text card-name"
                  >
                    {{ name }}
                  </p>
                </div>
                <span class="absolute text-xl font-bold text-white right-2">{{
                  counts[index]
                }}</span>
              </button>
            </div>
          </div>
        </div>
        <div class="work-shop-title">
          <h2>實用工具</h2>
          <section class="show-container">
            <button
              class="button a-button"
              type="button"
              id="#looking"
              @click="toggleFindCard"
            >
              <div
                class="shadow out-div"
                style="
                  background-image: url(https://bottleneko.app/images/workshop/find.png);
                "
              >
                <div class="in-div">
                  <p class="in-div in-div-text">
                    <Box stroke-width="1.5" class="w-6 h-6" />
                    <span>尋找牌組</span>
                  </p>
                </div>
              </div>
            </button>

            <button
              @click="toggleRemitCard"
              class="button a-button"
              type="button"
              data-bs-toggle="modal"
              data-bs-target="#remit"
            >
              <div
                class="shadow out-div"
                style="
                  background-image: url(https://bottleneko.app/images/workshop/report.png);
                "
              >
                <div class="in-div">
                  <p class="in-div in-div-text">
                    <Box stroke-width="1.5" class="w-6 h-6" />
                    <span>匯出牌組</span>
                  </p>
                </div>
              </div>
            </button>
          </section>
        </div>
        <div class="work-shop-title">
          <h2>我的牌組</h2>
          <p>一共有{{ cardDecks.length }}結果</p>
        </div>

        <section
          v-if="cardDecks.length === 0"
          class="flex items-center justify-center mx-auto"
          style="
            width: calc(100% - 16px);
            height: 500px;
            border-radius: 0.5rem;
            background-color: #151517;
          "
        >
          <div>
            <img
              style="width: 300px; height: 400px"
              src="@/img/no-data.png"
              alt="no-data"
            />
          </div>
        </section>

        <section class="show-card grid-card">
          <a
            v-for="cardDeck in cardDecks"
            :href="`deck/${cardDeck.deck_id}`"
            class="hover:bg-[rgb(39,39,42)] url gap15 transition-colors"
          >
            <div class="img-btn">
              <img
                :src="
                  cardDeck.deck_cover ||
                  'https://bottleneko.app/images/cover.png'
                "
                class="object-cover object-top aspect-square"
                alt=""
              />
              <button
                @click.prevent="deleteDeck(cardDeck.deck_id)"
                class="bottom-0 right-0 p-1 m-1 text-white rounded-full bg-zinc-800"
              >
                <TrashCan class="w-6 h-6 text-white stroke-2" />
              </button>
            </div>
            <div class="card-text">
              <div class="flex">
                <Tag class="w-6 h-6 stroke-2" />
                <p class="card-div-text">{{ cardDeck.deck_id }}</p>
              </div>
              <p class="card-name">{{ cardDeck.deck_name }}</p>
              <p class="color-a1">{{ formaDate(cardDeck.build_time) }}</p>
            </div>
          </a>
        </section>
      </main>
      <MainFooter />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';

::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.container {
  background-color: black;
  max-width: 100%;
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
}

.main-container {
  width: calc(100% - 8px);
  height: calc(100vh - 16px);
  margin-top: 8px;
  color: white;
  border-radius: 1rem;
  background-color: #121212;
  overflow: auto;
}

header.scrolled {
  background-color: #000000;
}

.work-shop-main {
  width: 100%;
  padding: 0 24px;
  box-sizing: border-box;
}

.work-shop-title {
  width: 100%;
  padding: 24px 0px 8px;
}

.work-shop-title h2 {
  font-size: 24px;
  font-weight: 700;
  line-height: 29px;
}

.work-shop-title p {
  margin-top: 5px;
  font-size: 14px;
  line-height: 20px;
  color: #e6e6e6;
}

.header-container {
  width: calc(100% - 270px);
  display: flex;
  padding: 16px;
  height: 64px;
  position: fixed;
  top: 0;
  z-index: 5;
  background-color: rgba(0, 0, 0, 0);
  gap: 0.5rem;
  transition: 0.05s ease;
}

.Top-bar {
  gap: 0.5rem;
}

.notice-area {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.w-full {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.search-container {
  max-width: 270px;
  height: 36px;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 20px;
  background-color: white;
  gap: 5px;
}

.page-control-container {
  width: 100%;
  position: relative;
  padding: 0 24px;
  box-sizing: border-box;
}

.page-control {
  width: calc(100% - 326px);
  padding: 16px 0px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  position: fixed;
  z-index: 100;
}

.page-control-left {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.page-control-up-btn {
  width: 32px;
  height: 32px;
  color: white;
  border: none;
  border-radius: 50%;
  margin-right: 10px;
  background-color: rgb(9, 9, 9, 0.8);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease-in-out;
}

.page-control-up-btn:hover {
  cursor: pointer;
  background-color: rgba(40, 40, 40, 0.6);
  transition: background-color 0.2s ease-in-out;
}

.page-control-down-btn {
  width: 32px;
  height: 32px;
  color: white;
  border: none;
  border-radius: 50%;
  margin-right: 10px;
  background-color: rgb(9, 9, 9, 0.8);
  font-size: 18px;
  transform: rotateZ(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease-in-out;
}

.page-control-down-btn:hover {
  cursor: pointer;
  background-color: rgba(40, 40, 40, 0.6);
  transition: background-color 0.2s ease-in-out;
}

.page-control-right {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.page-control-message-btn {
  width: 32px;
  height: 32px;
  color: white;
  border: none;
  border-radius: 50%;
  margin-right: 10px;
  background-color: transparent;
  font-size: 18px;
  box-sizing: border-box;
  transition: background-color 0.2s ease-in-out;
}

.page-control-message-btn:hover {
  cursor: pointer;
  background-color: rgb(18, 18, 18, 0.5);
  transition: background-color 0.2s ease-in-out;
}

.page-control-status-btn:hover {
  background-color: rgba(40, 40, 40, 0.6);
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.page-control-status-btn-user-icon {
  width: 24px;
  height: 24px;
  text-align: center;
  line-height: 24px;
  font-size: 14px;
  background-color: black;
  border-radius: 50%;
  color: white;
}

.page-control-status-btn-text {
  min-width: 24px;
  text-align: center;
  font-size: 14px;
  color: white;
}

.page-control-status-btn-arrow-icon {
  width: 24px;
  height: 24px;
  transform: rotateZ(-90deg);
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  color: white;
}

.page-control-space {
  width: 100%;
}

.sort-button {
  display: flex;
  gap: 0.5rem;
}

.sort-button button {
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  color: black;
  font-weight: 700;
  padding: 8px 15px;
  white-space: nowrap;
  font-size: 0.875rem;
  background-size: 200% 100%;
  background-position: 0% 0%;
}

.sort-button button i {
  transition: 0.3s ease;
}

.active1 {
  width: 72px;
  height: 36px;
  background: white;
}

.active2 {
  width: 72px;
  height: 36px;
  background: linear-gradient(to right, #5eead4, #93c5fd);
}

.selected {
  background: linear-gradient(to right, #5eead4, #93c5fd);
}

.rotate180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease-in;
}

.icon {
  color: #666;
  width: 15px;
}

.arrow {
  color: #000000;
  margin-right: 5px;
  transition: transform 0.3s ease;
  transform-origin: center;
}

.header-button:nth-child(3) {
  background: linear-gradient(90deg, #5eead4, #93c5fd);
}

.header-button span {
  font-size: 14px;
  color: #000000;
  font-weight: 700;
}

.clear-btn {
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
}

.clear-icon {
  color: #666;
  width: 20px;
  height: 20px;
}

.header-input {
  width: 100%;
  outline: none;
  font-size: 15px;
  color: black;
  background-color: transparent;
  display: flex;
  align-items: center;
  background-color: white;
  border: none;
  gap: 4px;
  padding: 0;
  height: 22px;
}

.button {
  display: block;
  width: 160px;
  overflow: hidden;
  border-radius: 18px;
  aspect-ratio: 4/3;
}

.show-container {
  display: flex;
  margin-top: 10px;
  padding: 1rem 2rem;
  gap: 1.5rem;
  margin-left: -1.5rem;
  margin-right: -1.5rem;
}

.out-div {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: none;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  gap: 1rem;
  transform-origin: center;
  position: relative;
  transition: all 0.2s;
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(24, 24, 27, 0.8)
  );
}

.shadow {
  position: relative;
}

.shadow:before {
  content: '';
  position: absolute;
  width: 100%;
  height: 30%;
  bottom: 0;
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgba(24, 24, 27, 0.8)
  );
}

.in-div {
  bottom: 0;
  background-color: transparent;
  width: 100%;
  padding: 32px 8px 0 8px;
  border-radius: 12px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 0.5rem;
}

.in-div-text {
  position: absolute;
  left: 0;
  bottom: 0;
  font-weight: 700;
  color: #b6b4b4;
  align-items: center;
  padding-bottom: 0.5rem;
  bottom: 0;
}

.in-div-text:hover {
  position: absolute;
  left: 0;
  bottom: 0;
  font-weight: 700;
  color: #ffffff;
  transition: all 0.2s;
}

.in-div svg {
  width: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.in-div svg:hover {
  color: #ffffff;
  transition: all 0.2s;
  font-weight: 700;
  stroke: white;
}

.in-div span {
  font-size: 20px;
}

.flex-none {
  flex: none;
}

.button:hover .out-div {
  transition: all 0.2s ease-out;
  transform: scale(1.05);
}

.modal-content {
  background-color: rgb(18, 18, 18);
}

.modal-title {
  color: white;
  font-size: 16px;
}

.topic {
  --tw-text-opacity: 1;
  color: rgb(228 228 231 / var(--tw-text-opacity));
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.75rem;
  margin-right: auto;
}

.my-4 {
  display: grid;
  word-break: break-all;
}

.subtitle {
  color: #a1a1aa;
  font-size: 14px;
}

.button-remit:not(:focus) {
  align-items: center;
  border-radius: 0.75rem;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  white-space: nowrap;
  width: 200px;
  height: 64px;
  color: rgb(255, 255, 255);
  background-color: #18181b80;
  align-items: center;
}

.button-remit:focus {
  background: linear-gradient(to right, #3b82f6, #0ea5e980, #06b6d4);
  --tw-gradient-from: #3b82f6 var(--tw-gradient-from-position);
  color: rgb(255 255 255 / var(--tw-text-opacity));
  --tw-shadow-color: rgba(14, 165, 233, 0.5);
  color: white;
  width: 200px;
  height: 64px;
  display: flex;
  align-items: center;
  border-radius: 0.75rem;
  white-space: nowrap;
}

.font-mono {
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

.input-button {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  box-sizing: content-box;
}

.input-item {
  position: relative;
  display: flex;
  align-items: center;
}

.input-item svg {
  color: #000000;
  background: transparent;
}

.input-remit {
  align-items: center;
  border-radius: 0.75rem;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  background-color: transparent;
  color: white;
}

.input-item button svg {
  width: 20px;
  height: 20px;
  color: #111111;
}

.enter-code {
  display: grid;
}

.show-card {
  display: flex;
  gap: 1.5rem;
}

.grid-card {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 1.5rem;
  margin: 10px 0 20px;
  box-sizing: border-box;
}

.card-text {
  padding: 5px;
}

.card-div-text {
  text-align: left;
  flex-grow: 1;
  font-size: 12px;
  display: grid;
  justify-content: left;
  align-items: center;
  width: 90%;
  gap: 1rem;
  padding: 8px;
  border: none;
  padding-bottom: 5px;
}

.color-a1 {
  color: #a1a1aa;
  font-size: 12px;
}

.card-name {
  color: white;
  padding-bottom: 5px;
  font-size: 16px;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  padding-top: 10px;
}

.gap15 {
  gap: 1.5rem;
}

.url {
  padding: 10px;
  display: inline-block;
  background-color: #18181b;
  border-radius: 5%;
  box-sizing: border-box;
}

.url img {
  border-radius: 10%;
  width: 100%;
}

.url button {
  width: 32px;
  height: 32px;
  position: absolute;
  bottom: 0;
  right: 5px;
}

.url button svg {
  width: 24px;
  height: 24px;
}

.url button:hover {
  background-color: red;
}

.icon-size {
  height: 16px;
  min-height: 1rem;
  min-width: 1rem;
  width: 16px;
  align-self: center;
  flex: none;
}

.transition-colors {
  transition-duration: 0.15s;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.img-btn {
  position: relative;
}

.display-area {
  display: flex;
}

.display-area button {
  width: 160px;
  padding: 0.5rem;
}

.display-card {
  display: grid;
  height: 100%;
}

.card-area {
  width: 100%;
  display: flex;
  margin-top: 100px;
  flex-wrap: wrap;
  gap: 20px;
  position: relative;
}

.selectedGray {
  background-color: rgb(63, 63, 70) !important;
}

.w-full-col {
  display: grid;
}

.grow-1 {
  flex-grow: 1;
  justify-content: left;
  align-items: center;
}

.input-item-2 {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 9999px;
  max-width: 270px;
  height: 15px;
  background-color: #18181b80;
  border-radius: 0.75rem;
  gap: 0.5rem;
  align-items: flex-start;
}

.input-text {
  display: flex;
  width: 100%;
  font-size: 1rem;
  --tw-text-opacity: 1;
  color: rgb(161 161 170);
  background-color: transparent;
  border-style: none;
  align-items: center;
  height: 40px;
}

.input-button-2 {
  border-radius: 9999px;
  background-color: transparent;
  background-image: none;
  text-transform: none;
  line-height: inherit;
  padding: 0.25rem;
  margin: -0.25rem;
  color: rgb(255 255 255);
  cursor: pointer;
  width: 40px;
  height: 40px;
}

.input-button-2 svg {
  display: block;
  align-items: center;
  stroke-width: 2;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
}

.input-button-2:hover {
  opacity: 0.6;
}

@media (width < 1200px) {
  .main-container {
    width: 100%;
    margin-top: 0px;
  }

  .header-container {
    width: 100%;
    top: 0px;
  }

  .search-container {
    min-width: calc(100% - 160px);
  }

  .notice-area {
    display: none;
  }

  .show-card {
    padding: 0px;
    margin: 0;
    width: 100%;
  }

  .grid-card {
    padding: 0;
    margin: 0;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: 100%;
  }
  .url {
    background-color: transparent;
  }
  .url img {
    border-radius: 10%;
    width: 100%;
  }
}

@media (width < 1024px) {
  .grid-card {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (width < 768px) {
  .grid-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .url img {
    border-radius: 10%;
    width: 100%;
  }
}
@media (width < 375px) {
  .login-btn {
    display: none;
  }
}
</style>
<style src="@/assets/css/work-shop/work-shop-rwd.css" scoped></style>
