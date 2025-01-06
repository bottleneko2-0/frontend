<script setup>
import { onBeforeMount, ref, onMounted, nextTick, watch } from 'vue'
import axios from 'axios'
import { Fancybox } from '@fancyapps/ui'
import '@fancyapps/ui/dist/fancybox/fancybox.css'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import Notice from '@/components/notice/Notice.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import AngleL from '@/components/svg/AngleL.vue'
import AngleR from '@/components/svg/AngleR.vue'
import AnglesR from '@/components/svg/AnglesR.vue'
import TypeGroup from '@/components/svg/TypeGroup.vue'

Fancybox.bind('[data-fancybox="daily-card"]', {})

const API_URL = import.meta.env.VITE_API_URL

const seriesSortTitleArr = ref([])
const seriesSortCardsArr = ref([])
const dateSortTitleArr = ref([])
const dateSortCardsArr = ref([])
const thisCategory = ref('SERIES')
const currentSection = ref('') // 紀錄目前所在內容標示
const observer = ref(null)

const getDailyCards = async () => {
  seriesSortTitleArr.value = []
  seriesSortCardsArr.value = []
  dateSortTitleArr.value = []
  dateSortCardsArr.value = []

  const { data } = await axios.get(`${API_URL}/api/daily-card`)

  // 取出系列
  data.forEach((item) => {
    if (
      !seriesSortTitleArr.value.find((title) => {
        return title == item.series
      })
    ) {
      seriesSortTitleArr.value.push(item.series)
    }
  })

  for (let i = 0; i < seriesSortTitleArr.value.length; i++) {
    const cards = data.filter((item) => {
      return item.series == seriesSortTitleArr.value[i]
    })
    seriesSortCardsArr.value.push(cards)
  }

  const sortArr = ref([])
  // 取出日期
  data.forEach((item) => {
    const year = item.today.slice(0, 4)
    const month = item.today.slice(4, 6)
    const day =
      item.today.slice(6).length == 1
        ? `0${item.today.slice(6)}`
        : item.today.slice(6, 8)
    const date = `${year}${month}${day}`

    if (
      !sortArr.value.find((title) => {
        return title == date
      })
    ) {
      sortArr.value.push(date)
    }
  })
  // 取出加上.的日期
  data.forEach((item) => {
    const year = item.today.slice(0, 4)
    const month = item.today.slice(4, 6)
    const day =
      item.today.slice(6).length == 1
        ? `0${item.today.slice(6)}`
        : item.today.slice(6, 8)
    const date = [year, month, day].join('.')

    if (
      !dateSortTitleArr.value.find((title) => {
        return title == date
      })
    ) {
      dateSortTitleArr.value.push(date)
    }
  })
  // 取出各日期的卡片
  for (let i = 0; i < sortArr.value.length; i++) {
    const cards = data.filter((item) => {
      return item.today == sortArr.value[i]
    })
    dateSortCardsArr.value.push(cards)
  }
}

const switchCategory = (category) => {
  if (category == 'SERIES') {
    thisCategory.value = 'SERIES'
  } else if (category == 'DATE') {
    thisCategory.value = 'DATE'
  }
}

const goToSection = (target) => {
  document
    .querySelector(`[data-id="${target}"]`)
    .scrollIntoView({ behavior: 'smooth' })
}

const goBack = () => {
  router.go(-1)
}

const goAhead = () => {
  router.go(+1)
}

const initializeObserver = () => {
  // 斷開之前的觀察器
  if (observer.value) {
    observer.value.disconnect()
  }

  const options = {
    root: document.querySelector('.background'),
    rootMargin: '0px',
    threshold: 0.1, // 當內容 10% 部分可見時觸發
  }

  const observerCallback = (entries) => {
    // 過濾出正在交叉的區塊
    const visibleEntries = entries.filter((entry) => entry.isIntersecting)

    if (visibleEntries.length === 0) return

    // 將可見的區塊按距離視口頂部的距離排序
    visibleEntries.sort(
      (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
    )

    // 選擇最靠近頂部的區塊
    const topMostEntry = visibleEntries[0]

    const sectionId = topMostEntry.target.getAttribute('data-id')
    currentSection.value = sectionId
  }

  observer.value = new IntersectionObserver(observerCallback, options)
  const sections = document.querySelectorAll('[data-id]')

  sections.forEach((section) => {
    observer.value.observe(section)
  })
}

// 監聽 thisCategory 的變化，重新初始化觀察器
watch(thisCategory, async (newCategory, oldCategory) => {
  await nextTick() // 確保 DOM 已更新
  initializeObserver()
})

onMounted(async () => {
  await getDailyCards()
  await nextTick() // 確保 DOM 已更新

  // 設置 IntersectionObserver
  initializeObserver()
})
</script>
<template>
  <div class="overflow-hidden bg-black root-container">
    <SidebarGrid />
    <div>
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
            class="flex-none hidden p-1 text-white rounded-full md:block bg-black/50 default-transition hover:bg-zinc-800/50 disabled:opacity-30"
            disabled
          >
            <AngleR class="stroke-[1.5] size-6" />
          </button>
          <div class="w-full min-w-0 text-lg font-bold text-white md:text-2xl">
            <h2 class="text-2xl font-bold truncate">每日卡歷史回顧</h2>
          </div>
          <Notice />
          <NavLoginBtn />
        </nav>
      </header>
      <div class="background">
        <main class="relative content-container bg-base z-1">
          <div class="px-4 content scroll-smooth scrollbar md:px-6">
            <section class="main-container">
              <input type="checkbox" id="list-switch" />
              <label
                for="list-switch"
                class="list-switch cursor-pointer w-[6.5rem] h-fit p-1 bg-zinc-600/80 text-zinc-200 default-transition rounded-full mb-2.5 fixed z-10"
              >
                <span class="hide">Close</span>
                <AnglesR
                  class="rotate-180 stroke-2 size-6 default-transition"
                />
              </label>
              <ul
                v-if="thisCategory == 'SERIES'"
                class="date-list default-transition w-[6.5rem] bg-zinc-600/80 rounded-xl fixed"
              >
                <li
                  v-for="(title, index) in seriesSortTitleArr"
                  :key="title"
                  @click.prevent="goToSection(title)"
                >
                  <a
                    :href="`#${title}`"
                    class="date line-clamp-1"
                    :class="{ active: currentSection === title }"
                    >{{ title }}</a
                  >
                </li>
              </ul>
              <ul
                v-if="thisCategory == 'DATE'"
                class="date-list default-transition w-[6.5rem] bg-zinc-600/80 rounded-xl fixed"
              >
                <li
                  v-for="(title, index) in dateSortTitleArr"
                  :key="title"
                  @click.prevent="goToSection(title)"
                >
                  <a
                    :href="`#${title}`"
                    class="date line-clamp-1"
                    :class="{ active: currentSection === title }"
                    >{{ title }}</a
                  >
                </li>
              </ul>
              <div
                class="content-block absolute -top-2 z-1 mt-2 flex flex-col gap-4 md:gap-6 default-transition ml-[calc(6.5rem+1rem)]"
              >
                <div
                  id="tab-ghost"
                  :class="{
                    'tab-ghost-series': thisCategory == 'SERIES',
                    'tab-ghost-date': thisCategory == 'DATE',
                  }"
                  class="absolute rounded-lg shadow will-change-auto bg-gradient-to-r from-lime-500 to-cyan-500 shadow-sky-500/50"
                  data-flip-id="auto-2"
                ></div>
                <nav
                  class="relative flex flex-wrap items-center gap-2 rounded-lg"
                >
                  <button
                    id="tab-series"
                    class="flex items-center gap-2 py-1 pl-1 pr-2 text-white rounded-lg will-change-auto"
                    @click="switchCategory('SERIES')"
                  >
                    <TypeGroup class="flex-none stroke-2 size-6" />
                    <span
                      class="text-sm font-bold select-none whitespace-nowrap"
                      >系列</span
                    >
                  </button>
                  <button
                    id="tab-today"
                    class="flex items-center gap-2 py-1 pl-1 pr-2 text-white rounded-lg will-change-auto"
                    data-flip-id="auto-1"
                    style="translate: none; rotate: none; scale: none"
                    @click="switchCategory('DATE')"
                  >
                    <TypeGroup class="flex-none stroke-2 size-6" />
                    <span
                      class="text-sm font-bold select-none whitespace-nowrap"
                      >日期</span
                    >
                  </button>
                  <h3 class="font-bold text-red-500">
                    ＊僅顯示最近30天的資料內容
                  </h3>
                </nav>
                <section
                  v-if="thisCategory == 'SERIES'"
                  class="relative py-0 grid-container z-1"
                  v-for="(title, i) in seriesSortTitleArr"
                  :key="title"
                  :data-id="title"
                  ref="section"
                >
                  <h3
                    id="2024.11.08"
                    class="text-xl font-bold text-white col-span-full"
                  >
                    {{ title }}
                  </h3>
                  <div class="card" v-for="card in seriesSortCardsArr[i]">
                    <img
                      :src="card.image"
                      class="select-none daily-card rounded-xl"
                      data-fancybox="daily-card"
                      :data-src="card.image"
                      :data-caption="`${card.series} - ${card.sell}`"
                    />
                  </div>
                </section>
                <section
                  v-if="thisCategory == 'DATE'"
                  class="relative py-0 grid-container z-1"
                  v-for="(title, i) in dateSortTitleArr"
                  :key="title"
                  :data-id="title"
                  ref="section"
                >
                  <h3
                    id="2024.11.08"
                    class="text-xl font-bold text-white col-span-full"
                  >
                    {{ title }}
                  </h3>
                  <div class="card" v-for="card in dateSortCardsArr[i]">
                    <img
                      :src="card.image"
                      class="select-none daily-card rounded-xl"
                      data-fancybox="daily-card"
                      :data-src="card.image"
                      :data-caption="`${card.series} - ${card.sell}`"
                    />
                  </div>
                </section>
                <MainFooter />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';

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
  margin-top: 0.5rem;
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
  overflow: hidden;
}

.content-container {
  display: flex;
  flex-direction: column;
  grid-area: main-view;
}

.content {
  margin-top: calc(64px + 0.5rem);
  overflow: auto;
}

.scrollbar {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

.main-container {
  height: calc(100vh - 1rem - 64px);
  position: relative;
  z-index: 1;
}

#list-switch,
.list-switch {
  display: none;
}

.date-list {
  grid-area: date-list;
  transition-duration: 0.3s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  top: 5rem;
}

.date-list li {
  cursor: pointer;
  background-color: (82, 82, 91, 0.8);
  text-align: center;
  padding: 0.5rem;
}

.date {
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  color: rgb(228 228 231);
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

.date.active {
  color: #67e8f9;
}

.tab-ghost-series {
  translate: none;
  rotate: none;
  scale: none;
  padding: 0px;
  grid-area: 1 / 1 / 1 / 1;
  transition: none;
  position: absolute;
  width: 72px;
  height: 32px;
  top: 0px;
  left: 0px;
  transform: translate3d(0px, 0px, 0px);
}

.tab-ghost-date {
  translate: none;
  rotate: none;
  scale: none;
  padding: 0px;
  grid-area: 1 / 1 / 1 / 1;
  transition: none;
  position: absolute;
  width: 72px;
  height: 32px;
  top: 0px;
  left: 0px;
  transform: translate3d(80px, 0px, 0px);
}

.grid-container {
  margin-top: 1rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.card {
  cursor: pointer;
}

.list-item:hover {
  color: rgb(161 161 170);
}

@media screen and (min-width: 1440px) {
  .grid-container {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
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

  .header-container {
    margin-top: 0;
  }

  .background {
    width: 100%;
    margin: 0;
    border-radius: 0;
    background-color: #121212;
  }

  .content-container {
    padding-top: 0;
    height: 100vh;
  }

  .list-switch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    top: 4.5rem;
  }

  #list-switch:checked ~ .list-switch {
    text-align: center;
    width: fit-content;
    position: absolute;
    top: 0;
    left: -0.5rem;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    transition-duration: 0.3s;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  #list-switch:checked ~ .list-switch .hide {
    display: none;
  }

  #list-switch:checked ~ .list-switch > svg {
    transform: rotate(0deg);
    transition-duration: 0.3s;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  #list-switch:checked ~ .date-list {
    position: relative;
    top: -2.5rem;
    left: -7rem;
    transition-duration: 0.3s;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }

  #list-switch:checked ~ .content-block {
    margin-left: 0;
  }

  #list-switch:checked ~ .content-block nav {
    margin-left: 2rem;
  }

  #list-switch:checked ~ .content-block #tab-ghost {
    left: 2rem;
  }

  .date-list {
    top: 7rem;
  }
}

@media screen and (width < 1024px) {
  .grid-container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media screen and (width < 768px) {
  .content-block {
    width: calc(100vw - 9.5rem);
  }

  #list-switch:checked ~ .content-block {
    width: calc(100vw - 2rem);
  }

  .grid-container {
    gap: 1rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
