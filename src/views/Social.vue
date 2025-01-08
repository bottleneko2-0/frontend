<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import Notice from '@/components/notice/Notice.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import userPicture from '@/img/avatar.png'
import Magnifier from '@/components/svg/Magnifier.vue'
import Close from '@/components/svg/Close.vue'
import TwoSquare from '@/components/svg/TwoSquare.vue'
import Edit from '@/components/svg/Edit.vue'
import Ball from '@/components/svg/Ball.vue'
const API_URL = import.meta.env.VITE_API_URL

const articles = ref([])
const searchQuery = ref('')
const filteredArticles = ref([])
const socialHistory = ref(
  JSON.parse(localStorage.getItem('socialHistory')) || []
)

const originalSeries = ref([])
const filteredDecks = ref([])
const menuExpanded = ref(false)
const codeMenuExpanded = ref(false)
const seriesName = ref('篩選系列')
const seriesFilter = ref('CODE')
const searchSeriesQuery = ref('')

const isScrolled = ref(false)
let intervalId = null

const fetchArticles = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/articles`)
    articles.value = response.data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
    filteredArticles.value = articles.value
  } catch (error) {
    console.error('獲取文章列表失敗', error)
  }
}

const searchArticles = () => {
  if (!searchQuery.value.trim()) {
    filteredArticles.value = articles.value
  } else {
    const query = searchQuery.value.toLowerCase()
    filteredArticles.value = articles.value.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.post_code.includes(query)
    )
  }
}

const handleEnter = () => {
  searchArticles()
  addSearchHistory()
  searchQuery.value = ''
}

const clearSearch = () => {
  searchQuery.value = ''
  filteredArticles.value = articles.value
}

const toggleMenu = () => {
  menuExpanded.value = !menuExpanded.value
}

const toggleCodeMenu = () => {
  codeMenuExpanded.value = !codeMenuExpanded.value
}

const fetchCardseries = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/series`)
    originalSeries.value = response.data
    filteredDecks.value = response.data
  } catch (err) {
    error.value = '獲取系列卡表資料失敗' + err.message
  }
}

const searchSeries = () => {
  if (!searchSeriesQuery.value.trim()) {
    filteredDecks.value = originalSeries.value
  } else {
    const query = searchSeriesQuery.value.toLowerCase()
    filteredDecks.value = originalSeries.value.filter((deck) =>
      deck.name?.toLowerCase().includes(query)
    )
  }
}

const clearMenuSearch = () => {
  searchSeriesQuery.value = ''
  filteredDecks.value = originalSeries.value
}

const selectDeck = (deck) => {
  seriesName.value = deck.name
  menuExpanded.value = !menuExpanded.value
  seriesFilter.value = deck.name
  codeMenuExpanded.value = !codeMenuExpanded.value

  let findDecks = articles.value.filter((decksItem) => {
    const deckList = decksItem.deck_list
    const query = searchQuery.value.toLowerCase()

    const isInSeries =
      deckList &&
      deckList.deck &&
      Array.isArray(deckList.deck) &&
      deckList.deck.some(
        (card) => card.seriesCode && deck.code.includes(card.seriesCode)
      )

    const isInSearchQuery =
      searchQuery.value.trim() === '' ||
      decksItem.title.toLowerCase().includes(query) ||
      decksItem.content.toLowerCase().includes(query) ||
      decksItem.post_code.includes(query)

    return isInSeries && isInSearchQuery
  })

  filteredArticles.value = [...findDecks]
  addSearchHistory()
}

const clearSearchSeries = () => {
  seriesName.value = '篩選系列'
  seriesFilter.value = 'CODE'
  menuExpanded.value = !menuExpanded.value
  filteredArticles.value = articles.value
  searchQuery.value = ''
}

const clearSeriesSearch = () => {
  seriesFilter.value = 'CODE'
  seriesName.value = '篩選系列'
  codeMenuExpanded.value = !codeMenuExpanded.value
  filteredArticles.value = articles.value
  searchQuery.value = ''
}

const searchResultCount = computed(() => filteredArticles.value.length)

const addSearchHistory = () => {
  const searchValue = searchQuery.value.trim() || '-'
  const seriesValue =
    seriesName.value && seriesName.value !== '篩選系列' ? seriesName.value : '-'

  if (searchValue !== '-' || seriesValue !== '-') {
    const newHistory = {
      searchQuery: searchValue,
      seriesName: seriesValue,
    }

    const existingIndex = socialHistory.value.findIndex(
      (item) =>
        item.searchQuery === newHistory.searchQuery &&
        item.seriesName === newHistory.seriesName
    )

    if (existingIndex !== -1) {
      socialHistory.value.splice(existingIndex, 1)
    }

    socialHistory.value = [newHistory, ...socialHistory.value]

    localStorage.setItem('socialHistory', JSON.stringify(socialHistory.value))
  }
}

const handleHistoryClick = (query, series) => {
  searchQuery.value = query === '-' ? '' : query

  if (series === '-') {
    seriesName.value = series === '-' ? '篩選系列' : series
    seriesFilter.value = series === '-' ? 'CODE' : series
  } else {
    seriesName.value = series
    seriesFilter.value = series
  }

  const selectedDeck = originalSeries.value.find((deck) => deck.name === series)
  if (selectedDeck) {
    selectDeck(selectedDeck)
  } else {
    searchArticles()
    menuExpanded.value = !menuExpanded.value
    codeMenuExpanded.value = !codeMenuExpanded.value
  }

  addSearchHistory()
  if (seriesName.value !== '-') {
    menuExpanded.value = !menuExpanded.value
    codeMenuExpanded.value = !codeMenuExpanded.value
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return date.split('T')[0]
}

const handleScroll = () => {
  const mainElement = document.querySelector('.main')
  isScrolled.value = mainElement && mainElement.scrollTop > 0
}

const startFunction = () => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  intervalId = setInterval(() => {
    handleScroll()
  }, 100)
}

onMounted(() => {
  fetchArticles()
  startFunction()
  fetchCardseries()
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="container">
    <SidebarGrid />
    <div class="main">
      <div class="header-container" :class="{ 'header-change': isScrolled }">
        <div class="search-container">
          <Magnifier class="magnifier" />
          <input
            v-model="searchQuery"
            @keyup.enter="handleEnter"
            class="search"
            type="text"
            placeholder="我想找找....?"
          />
          <Close class="close" />
        </div>
        <div style="position: relative">
          <button
            class="filter"
            :class="{
              'active-series': seriesName !== '篩選系列',
              'default-series': seriesName === '篩選系列',
            }"
            @click="toggleMenu"
          >
            <TwoSquare />
            {{ seriesName }}
            <Close class="close" @click="clearSearchSeries" />
          </button>
          <ul class="menu-area" v-show="menuExpanded">
            <li class="menu-search">
              <input
                v-model="searchSeriesQuery"
                @keyup="searchSeries"
                class="keyword"
                type="text"
                placeholder="Keyword"
              />
              <button @click="clearMenuSearch">✖</button>
            </li>
            <div class="menu-inner-area">
              <li
                class="menu"
                v-for="deck in filteredDecks"
                :key="deck.id"
                @click="selectDeck(deck)"
              >
                <TwoSquare />
                <p class="text-xs truncate">{{ deck.name }}</p>
              </li>
            </div>
          </ul>
        </div>
        <button
          class="filter-hidden"
          :class="{
            'active-series': seriesFilter !== 'CODE',
            'default-series': seriesFilter === 'CODE',
          }"
          @click="toggleCodeMenu"
        >
          <TwoSquare />
          <p>{{ seriesFilter }}</p>
          <Close />
        </button>
        <ul class="code-area" v-show="codeMenuExpanded">
          <li class="menu-search">
            <input
              v-model="searchSeriesQuery"
              @keyup="searchSeries"
              class="keyword"
              type="text"
              placeholder="Keyword"
            />
            <button @click="clearMenuSearch">✖</button>
          </li>
          <div class="menu-inner-area">
            <li
              class="menu"
              v-for="deck in filteredDecks"
              :key="deck.id"
              @click="selectDeck(deck)"
            >
              <TwoSquare />
              <p class="text-xs truncate">{{ deck.name }}</p>
            </li>
          </div>
        </ul>
        <div class="sign-container">
          <a :href="'/add'">
            <button class="add-article">
              <Edit />
              新增文章
            </button>
          </a>
          <a :href="'/add'">
            <button class="add-article-hidden">
              <Edit />
            </button>
          </a>
          <div class="bell">
            <Notice />
          </div>
          <div class="user-sign">
            <NavLoginBtn />
          </div>
        </div>
      </div>
      <section class="flex-item-hidden">
        <button
          v-for="(item, index) in socialHistory"
          :key="index"
          class="user-button"
          @click="
            handleHistoryClick(item.searchQuery || '-', item.seriesName || '-')
          "
        >
          <a href="#">
            <div class="user-link">
              <Magnifier />
              <span>{{ item.searchQuery || '-' }}</span>
            </div>
            <div class="user-link">
              <TwoSquare class="twoSquare" />
              <span>{{
                item.seriesName && item.seriesName !== 'seriesName'
                  ? item.seriesName
                  : '-'
              }}</span>
            </div>
          </a>
        </button>
      </section>
      <h2 class="title">
        搜尋結果
        <br />
        <span class="subtitle">一共有 {{ searchResultCount }} 結果</span>
      </h2>
      <section class="card-area">
        <a
          v-for="article in filteredArticles"
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
              :alt="article && article.title ? article.title : 'Default Title'"
            />
          </div>
          <div class="card-user">
            <div class="card-user-flex">
              <div class="card-user-img">
                <img
                  :src="article.users.picture || userPicture"
                  alt="用戶頭像"
                />
              </div>
              <div class="card-user-p">
                <p>{{ article.users.username }}</p>
                <div class="date-container">
                  <p class="date">{{ formatDate(article.created_at) }}</p>
                  <Ball />
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
      <MainFooter />
    </div>
  </div>
</template>

<style scoped>
svg {
  stroke-width: 1.5px;
}

.magnifier {
  cursor: pointer;
}

.close {
  cursor: pointer;
}

.twoSquare {
  width: 24px;
  height: 24px;
}

.menu {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  color: white;
  cursor: pointer;
  gap: 5px;
  height: 35px;
  box-sizing: border-box;
}

.menu svg {
  width: 28px;
  height: 28px;
}

.menu-area {
  position: absolute;
  top: 100%;
  display: grid;
  position: absolute;
  background-color: #202020;
  border-radius: 7px;
  width: 275px;
  overflow: hidden;
  transition: height 1s ease;
  z-index: 3;
}

.menu-inner-area {
  max-height: 210px;
  overflow-y: scroll;
  scrollbar-width: none;
}

.menu-search {
  position: fixed;
  display: flex;
  align-items: center;
  padding: 10px;
  color: white;
  position: relative;
  width: 255px;
}

.keyword {
  box-sizing: border-box;
  color: white;
  padding: 4px 8px;
  border: 1px solid gray;
  border-radius: 10px;
  display: flex;
  background-color: transparent;
  outline: none;
  width: 255px;
}

.menu-search button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: white;
  position: absolute;
  right: 12px;
}

li p,
li svg {
  color: rgba(255, 255, 255, 0.75);
}

li:hover p,
li:hover svg {
  color: rgb(255, 255, 255);
}

.code-area {
  display: none;
}

html,
body {
  width: 100%;
  height: 100vh;
}

a {
  text-decoration: none;
  color: #ffffff;
}

.sidebar-container {
  position: fixed;
  top: 0;
  background-color: black;
}

.container {
  width: 100%;
  position: relative;
}

.main {
  height: calc(100vh - 16px);
  border-radius: 1rem;
  margin: 0.5rem;
  margin-left: 270px;
  overflow: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  background-color: #121212;
}

.header-container {
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 0.05s ease;
  width: 100%;
  min-width: 30%;
  height: 64px;
  position: fixed;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  z-index: 1;
}

.header-change {
  background-color: rgba(0, 0, 0, 1);
  transition: background-color 0.05s ease;
}

.search-container {
  width: 271px;
  height: 36px;
  background-color: #fff;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 20px;
  position: fixed;
  top: 0;
  margin: 14px 0 0 24px;
  position: relative;
}

.search-container svg:nth-of-type(2) {
  cursor: pointer;
  width: 22px;
  height: 22px;
  position: absolute;
  right: 10px;
}

.search-container svg::before {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
}

.search {
  width: 207px;
  height: 20px;
  border: none;
}

.search:focus {
  outline: none;
}

.filter {
  width: 120px;
  border-radius: 20px;
  height: 36px;
  transform: translateY(14px);
  font-weight: 700;
  cursor: pointer;
  width: auto;
  display: flex;
  align-items: center;
  gap: 5px;
}

.active-series {
  background: linear-gradient(to right, #5eead4, #93c5fd);
  border: none;
}

.default-series {
  background-color: #f0f0f0;
  border: none;
}

.filter svg {
  width: 20px;
  height: 20px;
  display: inline;
}

.filter-hidden {
  width: 100px;
  height: 36px;
  border-radius: 20px;
  position: absolute;
  top: 14px;
  right: 59px;
  font-weight: 700;
  cursor: pointer;
  display: none;
}

.filter-hidden svg {
  width: 20px;
  height: 20px;
  display: inline;
}

.filter-hidden p {
  line-height: 20px;
  height: 20px;
  width: calc(100% - 40px);
  display: inline;
  overflow: hidden;
}

.sign-container {
  display: flex;
  align-items: center;
  position: absolute;
  top: 14px;
  right: 300px;
}

.sign-container {
  display: flex;
  gap: 8px;
}

.add-article {
  width: 96px;
  height: 36px;
  border-radius: 20px;
  background-color: #ffffff;
  font-weight: 900;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.add-article-hidden {
  border: 1px solid #f0f0f0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: -285px;
  display: none;
}

.flex-item-hidden {
  display: flex;
  padding: 0 20px;
  height: 62px;
  border-radius: 20px;
  margin-top: 80px;
  gap: 16px;
  overflow-x: scroll;
  scrollbar-width: none;
}

.user-button {
  box-sizing: border-box;
  padding: 9px;
  border: 1px solid #414142;
  background-color: #18181b;
  color: #d4d4d8;
  overflow: hidden;
  border-radius: 10px;
  display: flex;
  cursor: pointer;
}

.user-button:hover {
  background-color: #27272a;
}

.user-link {
  display: flex;
  gap: 5px;
}

.user-link svg {
  width: 20px;
  height: 20px;
  line-height: 1.25rem;
}

.user-link span {
  height: 20px;
  overflow: hidden;
  line-height: 1.25rem;
}

.size-5 {
  height: 1.25rem;
  min-height: 1.25rem;
  min-width: 1.25rem;
  width: 1.25rem;
}

.title {
  display: block;
  font-size: 25px;
  font-weight: 900;
  line-height: 1.75rem;
  color: #fff;
  text-align: start;
  margin: 40px 0 16px 20px;
}

.subtitle {
  color: #d4d4d8;
  font-weight: 100;
  font-size: 15px;
}

.card-area {
  padding: 0px 20px 20px 20px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
}

.date-container {
  display: flex;
  gap: 4px;
  color: rgb(170, 168, 168);
  align-items: center;
}

.date-container svg {
  display: flex;
  width: 15px;
  height: 15px;
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
  margin-top: 8px;
  font-size: 16px;
  color: rgb(170, 168, 168);
  height: 16px;
  overflow: hidden;
}

.card-name h2 {
  font-weight: 900;
}

@media screen and (min-width: 1470px) {
  .card-area {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media screen and (max-width: 1200px) {
  .menu-area {
    display: none;
  }

  .code-area {
    position: absolute;
    top: 100%;
    display: grid;
    position: absolute;
    background-color: #202020;
    border-radius: 7px;
    width: 275px;
    overflow: hidden;
    transition: height 1s ease;
    z-index: 3;
    right: 59px;
  }

  .main {
    margin: 0px;
  }

  .sidebar-container {
    top: auto;
    bottom: 0;
    background: linear-gradient(to top, #000, rgba(0, 0, 0, 0.9), transparent);
  }

  .search-container {
    width: calc(100% - 191px);
    position: relative;
  }

  .search {
    width: 100%;
  }

  #xx {
    display: flex;
    position: absolute;
    right: 10px;
  }

  .filter {
    display: none;
  }

  .filter-hidden {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .add-article {
    display: none;
  }

  .add-article-hidden {
    display: flex;
    align-items: center;
  }

  .bell,
  .user-sign {
    display: none;
  }

  .card-area {
    grid-template-columns: repeat(3, 1fr);
  }

  .chat {
    left: 85%;
  }
}

@media screen and (max-width: 768px) {
  .xx {
    background-color: #fff;
    z-index: 1;
  }

  .search {
    width: 100%;
  }

  .card-link {
    background-color: #121212;
    border-radius: 0;
    border-bottom: 1px solid gray;
  }

  .card-area {
    left: 5px;
    grid-template-columns: repeat(1, minmax(198px, 1fr));
  }

  .chat {
    left: 85%;
  }
}
</style>
