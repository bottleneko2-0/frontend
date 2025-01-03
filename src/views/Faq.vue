<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import Notice from '@/components/notice/Notice.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import { useI18n } from 'vue-i18n'
import AngleL from '@/components/svg/AngleL.vue'
import AngleR from '@/components/svg/AngleR.vue'
import Card from '@/components/svg/Card.vue'
import Clock from '@/components/svg/Clock.vue'
import Close from '@/components/svg/Close.vue'
import ListT from '@/components/svg/ListT.vue'
import ListB from '@/components/svg/ListB.vue'
import Search from '@/components/svg/Search.vue'

const router = useRouter()
const { locale } = useI18n()
const qaList = ref([])
const sortOrder = ref('desc')
const searchQuery = ref('')
const filteredData = ref([])
const API_URL = import.meta.env.VITE_API_URL

const getQAList = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/qa`)
    // 收集所有處理過的 relations 結果，只顯示共同的部分
    qaList.value = data.map((qa) => ({
      ...qa,
      processedRelation: qa.relations ? findSeries(qa.relations) : '',
    }))
  } catch (error) {
    console.error(error)
  }
}

const translatedQAList = computed(() => {
  return filteredData.value.map((qa) => {
    const translateQ = qa.i18n?.[locale.value]?.q
    const translateA = qa.i18n?.[locale.value]?.a
    return {
      ...qa,
      q: translateQ || qa.q,
      a: translateA || qa.a,
    }
  })
})

// highlightText: 對傳入字串進行括號、引號等符號區塊加上 <mark> 的處理
const highlightText = (str) => {
  if (typeof str !== 'string') return str

  let highlighted = str

  highlighted = highlighted.replace(
    /『(.*?)』/g,
    '<mark class="mark-1">『$1』</mark>'
  )
  highlighted = highlighted.replace(
    /\[(.*?)\]/g,
    '<mark class="mark-2">[$1]</mark>'
  )
  highlighted = highlighted.replace(
    /「(.*?)」/g,
    '<mark class="mark-3">「$1」</mark>'
  )
  highlighted = highlighted.replace(
    /【(.*?)】/g,
    '<mark class="mark-4">【$1】</mark>'
  )
  highlighted = highlighted.replace(
    /《(.*?)》/g,
    '<mark class="mark-5">《$1》</mark>'
  )
  highlighted = highlighted.replace(
    /\(([^)]*)\)/g,
    '<mark class="mark-6">($1)</mark>'
  )

  return highlighted
}

const findSeries = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return ''

  // 先拿第一個字串斜線前的部分當作初始比較
  let baseSegment = arr[0].split('/')[0] || ''
  if (!baseSegment) return ''

  // 依序與後續字串比較，若有字串斜線前部分不符合 baseSegment，則返回空字串
  for (let i = 1; i < arr.length; i++) {
    const segment = arr[i].split('/')[0] || ''
    if (segment !== baseSegment) {
      return ''
    }
  }
  return baseSegment
}

const goBack = () => {
  router.go(-1)
}

const goAhead = () => {
  router.go(+1)
}

// 排序
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  search()
}

const sortedData = computed(() => {
  return [...qaList.value].sort((a, b) => {
    if (sortOrder.value === 'desc') {
      return b.id - a.id
    } else {
      return a.id - b.id
    }
  })
})

// 搜尋
const search = () => {
  if (!searchQuery.value.trim()) {
    filteredData.value = sortedData.value
  } else {
    const query = searchQuery.value.toLowerCase()
    filteredData.value = sortedData.value.filter((qa) => {
      const q = qa.q?.toLowerCase() || ''
      const a = qa.a?.toLowerCase() || ''
      // 檢查 relations 陣列中的每個元素
      const hasMatchingRelation =
        qa.relations?.some((relationPath) => {
          // 檢查完整的 relation 路徑
          return relationPath.toLowerCase().includes(query)
        }) || false

      // 檢查共同標籤
      const commonLabelMatch = findSeries(qa.relations)
        ?.toLowerCase()
        .includes(query)

      return (
        q.includes(query) ||
        a.includes(query) ||
        hasMatchingRelation ||
        commonLabelMatch
      )
    })
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  filteredData.value = sortedData.value
}

// 進入問答詳情頁
const openFaqInfo = (id) => {
  router.push({ name: 'FaqInfo', params: { id } })
}

watch(searchQuery, () => {
  search()
})

onMounted(async () => {
  await getQAList()
  search()
})
</script>

<template>
  <div class="overflow-hidden bg-black root-container">
    <SidebarGrid />
    <header class="z-10 h-16 md:mt-2 md:mr-2 header-bg md:rounded-t-2xl">
      <nav class="header-container">
        <button
          @click="goBack"
          class="flex-none p-1 text-white rounded-full bg-black/50 default-transition hover:bg-zinc-800/50"
        >
          <AngleL class="stroke-[1.5] size-6" />
        </button>
        <button
          @click="goAhead"
          class="flex-none hidden p-1 text-white rounded-full md:block bg-black/50 default-transition hover:bg-zinc-800/50 disabled:opacity-30 disabled:cursor-not-allowed"
          disabled
        >
          <AngleR class="stroke-[1.5] size-6" />
        </button>
        <div class="flex items-center w-full gap-2 overflow-x-auto">
          <div
            class="flex items-center w-full min-w-0 gap-1 p-2 bg-white rounded-full shadow grow-1 md:w-fit text-zinc-700 shadow-zinc-900/50"
          >
            <Search class="flex-none stroke-2 size-5 text-zinc-700" />
            <input
              type="text"
              class="w-full min-w-0 p-0 text-sm bg-transparent border-none focus:ring-0 placeholder:text-zinc-500 placeholder:font-light"
              placeholder="想問什麼？"
              v-model="searchQuery"
              @keyup="search"
            />
            <Close
              @click="clearSearch"
              class="flex-none cursor-pointer stroke-2 size-5 text-zinc-700"
            />
          </div>
          <button
            @click="toggleSort"
            class="flex items-center flex-none gap-1 p-2 font-bold bg-white rounded-full shadow text-zinc-700 shadow-zinc-900/50"
          >
            <ListB
              v-if="sortOrder === 'desc'"
              class="flex-none stroke-2 size-5 text-zinc-700 default-transition"
            />
            <ListT
              v-else
              class="flex-none stroke-2 size-5 text-zinc-700 default-transition"
            />
          </button>
        </div>
        <Notice />
        <NavLoginBtn />
      </nav>
    </header>
    <div class="background"></div>
    <main
      class="relative overflow-auto content-container bg-base md:my-2 md:mr-2 z-1 md:rounded-b-2xl scrollbar"
    >
      <div class="py-8 text-center">
        <h2 class="text-5xl font-black text-zinc-100">問答集</h2>
        <p class="mt-4 text-zinc-200">
          卡片效果問答集，資料來源：
          <a href="https://ws-tcg.com" class="link hover:text-white">
            Weiβ Schwarz
          </a>
        </p>
      </div>
      <div>
        <section class="grid grid-cols-1 gap-4 p-6 md:grid-cols-4">
          <div
            class="flex flex-col cursor-pointer group"
            v-for="qa in translatedQAList"
            :key="qa.id"
            @click="openFaqInfo(qa.id)"
          >
            <div
              class="relative px-2 py-1 ml-auto bg-white rounded-full z-1 w-fit"
            >
              <span class="text-lg font-bold text-zinc-700">Q.{{ qa.id }}</span>
            </div>
            <div
              class="px-4 pt-8 pb-4 -mt-6 text-white border-2 group-hover:bg-green-700 bg-green-700/80 border-green-700/20 rounded-2xl"
            >
              <p
                v-html="highlightText(qa.q)"
                class="h-[6rem] overflow-auto mb-4 scrollbar leading-6"
              ></p>
              <p
                class="flex items-center gap-1 font-mono text-sm text-zinc-300"
              >
                <Clock class="stroke-[1.5] size-4" />
                {{ qa.date }}
              </p>
              <p
                class="flex items-center gap-1 font-mono text-sm truncate text-zinc-300"
              >
                <Card class="stroke-[1.5] size-4" />
                關聯 {{ qa.relations.length }} 張<span
                  v-if="qa.relations.length != 0"
                  >，包含
                  <span class="px-1 text-white rounded-lg bg-cyan-500">{{
                    qa.processedRelation
                  }}</span></span
                >
              </p>
            </div>
          </div>
        </section>
        <div
          class="flex items-center justify-center h-0 mt-8 text-white border-b qa-grid-end border-zinc-500/50"
        >
          <button
            class="px-4 py-1 border rounded-full bg-base border-zinc-500/50"
          >
            到底啦
          </button>
        </div>
        <MainFooter />
      </div>
    </main>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';

input:focus {
  outline: 2px solid transparent;
}

.root-container {
  display: grid;
  grid-template-areas:
    'sidebar navbar navbar'
    'sidebar main-view date-list';
  grid-template-columns: 270px 1fr;
  grid-template-rows: 4rem 1fr;
  height: 100vh;
}

.default-transition {
  transition-duration: 0.3s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
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
  padding-top: 10px;
  /* overflow: hidden; */
}

.link {
  color: #71717a;
}

.scrollbar {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

:deep([class*='mark-']) {
  border-radius: 9999px;
}
:deep(.mark-1) {
  background-color: hsla(0, 96%, 89%, 0.8);
}
:deep(.mark-2) {
  background-color: hsla(32, 98%, 83%, 0.8);
}
:deep(.mark-3) {
  background-color: hsla(53, 98%, 77%, 0.8);
}
:deep(.mark-4) {
  background-color: rgba(187, 247, 208, 0.8);
}
:deep(.mark-5) {
  background-color: rgba(191, 219, 254, 0.8);
}
:deep(.mark-6) {
  background-color: rgba(233, 213, 255, 0.8);
}
section {
  height: 100%;
}

.bg-base {
  background-color: #121212;
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
  }
}

@media screen and (width < 768px) {
  body {
    background-color: #121212;
  }
}
</style>
