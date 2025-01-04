<script setup>
import { ref, onMounted, computed, watch, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { useCardInfoStore } from '@/stores/card-info'
import { useDeckMakeStore } from '@/stores/deck-make'
import { useSidebarStore } from '@/stores/sidebar'
import initCardEffect from '@/assets/js/cardEffect.js'

const cardInfoStore = useCardInfoStore()
const {
  cardInfo,
  translatedCardInfo,
  cardInfoDisplay,
  leftDisabled,
  rightDisabled,
  translatedCardQAList,
} = storeToRefs(cardInfoStore)
const changeCardInfoCard = cardInfoStore.changeCardInfoCard
const getCardQA = cardInfoStore.getCardQA

const deckMakeStore = useDeckMakeStore()
const { selectedCards } = storeToRefs(deckMakeStore)

const sidebarStore = useSidebarStore()
const { isActive } = storeToRefs(sidebarStore)
const handleSwitchTranslate = () => {
  sidebarStore.switchLang()
}

const addCard = deckMakeStore.addCard
const removeCard = deckMakeStore.removeCard
const countCards = deckMakeStore.countCards

const cardInfoDesc = computed(() => {
  return translatedCardInfo.value.effect
    .replace(/『(.*?)』/g, '<mark class="mark-1">『$1』</mark>')
    .replace(/\[(.*?)\]/g, '<mark class="mark-2">[$1]</mark>')
    .replace(/「(.*?)」/g, '<mark class="mark-3">「$1」</mark>')
    .replace(/【(.*?)】/g, '<mark class="mark-4">【$1】</mark>')
    .replace(/《(.*?)》/g, '<mark class="mark-5">《$1》</mark>')
    .replace(/\(([^)]*)\)/g, '<mark class="mark-6">($1)</mark>')
})

const cardInfoQA = computed(() => {
  return translatedCardQAList.value.map((qa) => {
    return {
      ...qa,
      q: qa.q
        .replace(/『(.*?)』/g, '<mark class="mark-1">『$1』</mark>')
        .replace(/\[(.*?)\]/g, '<mark class="mark-2">[$1]</mark>')
        .replace(/「(.*?)」/g, '<mark class="mark-3">「$1」</mark>')
        .replace(/【(.*?)】/g, '<mark class="mark-4">【$1】</mark>')
        .replace(/《(.*?)》/g, '<mark class="mark-5">《$1》</mark>')
        .replace(/\(([^)]*)\)/g, '<mark class="mark-6">($1)</mark>'),
      a: qa.a
        .replace(/『(.*?)』/g, '<mark class="mark-1">『$1』</mark>')
        .replace(/\[(.*?)\]/g, '<mark class="mark-2">[$1]</mark>')
        .replace(/「(.*?)」/g, '<mark class="mark-3">「$1」</mark>')
        .replace(/【(.*?)】/g, '<mark class="mark-4">【$1】</mark>')
        .replace(/《(.*?)》/g, '<mark class="mark-5">《$1》</mark>')
        .replace(/\(([^)]*)\)/g, '<mark class="mark-6">($1)</mark>'),
    }
  })
})

// 卡片在牌組中的數量
const cardCount = ref(0)
// 監聽卡片在牌組中的數量並更新
watch(selectedCards.value, () => {
  cardCount.value = countCards(cardInfo.value)
})

const iconTextColor = computed(() => {
  if (cardInfo.value.color == 'red') {
    return `text-red-700`
  } else if (cardInfo.value.color == 'blue') {
    return `text-blue-700`
  } else if (cardInfo.value.color == 'green') {
    return `text-green-700`
  } else if (cardInfo.value.color == 'yellow') {
    return `text-yellow-700`
  } else if (cardInfo.value.color == 'purple') {
    return `text-purple-700`
  }
})

const iconBgColor = computed(() => {
  if (cardInfo.value.color == 'red') {
    return `bg-red-200`
  } else if (cardInfo.value.color == 'blue') {
    return `bg-blue-200`
  } else if (cardInfo.value.color == 'green') {
    return `bg-green-200`
  } else if (cardInfo.value.color == 'yellow') {
    return `bg-yellow-200`
  } else if (cardInfo.value.color == 'purple') {
    return `bg-purple-200`
  }
})

const iconShadowColor = computed(() => {
  if (cardInfo.value.color == 'red') {
    return `shadow-red-200/50`
  } else if (cardInfo.value.color == 'blue') {
    return `shadow-blue-200/50`
  } else if (cardInfo.value.color == 'green') {
    return `shadow-green-200/50`
  } else if (cardInfo.value.color == 'yellow') {
    return `shadow-yellow-200/50`
  } else if (cardInfo.value.color == 'purple') {
    return `shadow-purple-200/50`
  }
})

const textColor = computed(() => {
  if (cardInfo.value.color == 'red') {
    return `text-red-100`
  } else if (cardInfo.value.color == 'blue') {
    return `text-blue-100`
  } else if (cardInfo.value.color == 'green') {
    return `text-green-100`
  } else if (cardInfo.value.color == 'yellow') {
    return `text-yellow-100`
  } else if (cardInfo.value.color == 'purple') {
    return `text-purple-100`
  }
})

const bgColor = computed(() => {
  if (cardInfo.value.color == 'red') {
    return `bg-red-700/50`
  } else if (cardInfo.value.color == 'blue') {
    return `bg-blue-700/50`
  } else if (cardInfo.value.color == 'green') {
    return `bg-green-700/50`
  } else if (cardInfo.value.color == 'yellow') {
    return `bg-yellow-700/50`
  } else if (cardInfo.value.color == 'purple') {
    return `bg-purple-700/50`
  }
})
// const handle
onBeforeMount(() => {})

onMounted(async () => {
  initCardEffect()
  cardCount.value = countCards(cardInfo.value)
  await getCardQA()
})
</script>
<template>
  <section
    class="fixed sm:top-0 left-0 w-screen h-screen z-[100] grid overflow-y-auto overflow-x-hidden md:overflow-hidden backdrop-blur place-content-center xs:-top-[44px]"
  >
    <div
      class="flex sm:flex-nowrap items-center gap-4 sm:w-[80vw] 2xl:w-[70vw] h-[80vh] xs:flex-wrap xs:w-screen"
    >
      <button
        class="p-4 text-white rounded-full arrow bg-black/50 disabled:bg-black/30 disabled:text-white/20 hover:bg-cyan-500"
        @click="changeCardInfoCard('left')"
        :disabled="leftDisabled"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          ></path>
        </svg>
      </button>
      <div
        class="relative flex-none p-0 card-wrapper rounded-2xl sm:w-4/12 sm:m-0 xs:w-3/4 xs:m-auto"
      >
        <div class="card overflow-hidden shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
          <div
            class="absolute top-0 left-0 w-full h-full glossy rounded-2xl z-2 mix-blend-lighten"
          ></div>
          <img
            class="flex-none object-cover w-full min-w-0 shadow-lg select-none rounded-card aspect-card default-transition bg-image"
            :src="translatedCardInfo.cover"
            alt=""
            size="sm:100vw md:50vw lg:600px"
          />
          <button
            class="absolute bottom-0 p-4 text-white rounded-full md-arrow left-2 bg-black/50 disabled:bg-black/30 disabled:text-white/20 hover:bg-cyan-500"
            @click="changeCardInfoCard('left')"
            :disabled="leftDisabled"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="stroke-2 size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              ></path>
            </svg>
          </button>
          <button
            class="absolute bottom-0 p-4 text-white rounded-full md-arrow right-2 bg-black/50 disabled:bg-black/30 disabled:text-white/20 hover:bg-cyan-500"
            @click="changeCardInfoCard('right')"
            :disabled="rightDisabled"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="stroke-2 size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <div
        class="grow-1 w-full xs:rounded-t-2xl xs:rounded-b-none sm:rounded-2xl bg-zinc-800 h-[80vh] overflow-auto scroll-smooth scrollbar"
      >
        <div
          class="sticky top-0 z-10 px-4 pt-4 shadow-xl rounded-xl bg-zinc-800"
        >
          <div class="flex items-center justify-between w-full gap-2">
            <div class="flex items-center counter gap-x-1">
              <button
                class="text-white btn btn-sm bg-zinc-700 hover:bg-green-400"
                @click="addCard(translatedCardInfo)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  class="stroke-2 size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  ></path>
                </svg>
              </button>
              <div class="text-white btn btn-sm bg-zinc-700">
                <span
                  class="flex items-center justify-center stroke-2 size-6"
                  >{{ cardCount }}</span
                >
              </div>
              <button
                class="text-white btn btn-sm bg-zinc-700 hover:bg-red-400"
                @click="removeCard(translatedCardInfo)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  class="stroke-2 size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 12h14"
                  ></path>
                </svg>
              </button>
            </div>
            <div class="flex items-center counter gap-x-2">
              <button
                v-if="isActive === true"
                class="flex-none text-white shadow btn btn-sm bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/50"
                @click="handleSwitchTranslate"
              >
                <svg
                  class="w-6 h-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
                  ></path>
                </svg>
              </button>
              <button
                v-else-if="isActive === false"
                class="flex-none text-white shadow btn btn-sm bg-zinc-700 hover:bg-gradient-to-r from-purple-500 to-pink-500 shadow-purple-500/50"
                @click="handleSwitchTranslate"
              >
                <svg
                  class="w-6 h-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802"
                  ></path>
                </svg>
              </button>
              <button
                class="flex-none text-white btn btn-sm bg-black/70 hover:bg-white hover:text-black"
                @click="cardInfoDisplay = false"
              >
                <svg
                  class="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex items-center mt-4 gap-x-2">
            <div class="flex flex-col items-center justify-center w-16 gap-2">
              <!-- <div class="p-2 text-blue-700 bg-blue-200 rounded-full shadow-lg shadow-blue-200/50">
                                <svg  class="size-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"></path>
                                </svg>
                            </div> -->
              <div
                :class="[
                  'p-2',
                  iconTextColor,
                  iconBgColor,
                  'rounded-full',
                  'shadow-lg',
                  iconShadowColor,
                ]"
              >
                <svg
                  v-if="translatedCardInfo.type === 'キャラ'"
                  class="size-8"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  ></path>
                </svg>
                <svg
                  v-else-if="translatedCardInfo.type === 'イベント'"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  class="size-8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  ></path>
                </svg>
                <svg
                  v-else-if="translatedCardInfo.type === 'クライマックス'"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  class="size-8"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                  ></path>
                </svg>
              </div>
              <!-- <p class="w-full text-xs text-center text-white truncate">角色</p> -->
              <p
                v-if="translatedCardInfo.type === 'キャラ'"
                class="w-full text-xs text-center text-white truncate"
              >
                角色
              </p>
              <p
                v-else-if="translatedCardInfo.type === 'イベント'"
                class="w-full text-xs text-center text-white truncate"
              >
                事件
              </p>
              <p
                v-else-if="translatedCardInfo.type === 'クライマックス'"
                class="w-full text-xs text-center text-white truncate"
              >
                名場
              </p>
            </div>
            <div>
              <p class="font-mono text-xs text-zinc-300">
                {{ translatedCardInfo.id }}
              </p>
              <h3 class="text-2xl font-bold text-white">
                {{ translatedCardInfo.title }}
              </h3>
              <p class="text-zinc-300">{{ translatedCardInfo.productName }}</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2 mt-4">
            <div class="flex items-center">
              <span
                :class="[
                  'relative',
                  'px-1',
                  textColor,
                  'rounded',
                  'z-1',
                  'whitespace-nowrap',
                  bgColor,
                ]"
                >等級</span
              >
              <span
                class="bg-black/30 rounded-r pl-2 pr-1 -ml-1 whitespace-nowrap text-white text-center font-mono md:min-w-[2rem]"
                >{{ translatedCardInfo.level }}</span
              >
            </div>
            <div class="flex items-center">
              <span
                :class="[
                  'relative',
                  'px-1',
                  textColor,
                  'rounded',
                  'z-1',
                  'whitespace-nowrap',
                  bgColor,
                ]"
                >費用</span
              >
              <span
                class="bg-black/30 rounded-r pl-2 pr-1 -ml-1 whitespace-nowrap text-white text-center font-mono md:min-w-[2rem]"
                >{{ translatedCardInfo.cost }}</span
              >
            </div>
            <div class="flex items-center">
              <span
                :class="[
                  'relative',
                  'px-1',
                  textColor,
                  'rounded',
                  'z-1',
                  'whitespace-nowrap',
                  bgColor,
                ]"
                >魂傷</span
              >
              <span
                class="bg-black/30 rounded-r pl-2 pr-1 -ml-1 whitespace-nowrap text-white text-center font-mono md:min-w-[2rem]"
                >{{ translatedCardInfo.soul }}</span
              >
            </div>
            <div class="flex items-center">
              <span
                :class="[
                  'relative',
                  'px-1',
                  textColor,
                  'rounded',
                  'z-1',
                  'whitespace-nowrap',
                  bgColor,
                ]"
                >攻擊</span
              >
              <span
                class="bg-black/30 rounded-r pl-2 pr-1 -ml-1 whitespace-nowrap text-white text-center font-mono md:min-w-[2rem]"
                >{{ translatedCardInfo.attack }}</span
              >
            </div>
            <div class="flex items-center">
              <span
                :class="[
                  'relative',
                  'px-1',
                  textColor,
                  'rounded',
                  'z-1',
                  'whitespace-nowrap',
                  bgColor,
                ]"
                >稀有度</span
              >
              <span
                class="bg-black/30 rounded-r pl-2 pr-1 -ml-1 whitespace-nowrap text-white text-center font-mono md:min-w-[2rem]"
                >{{ translatedCardInfo.rare }}</span
              >
            </div>
          </div>
          <div
            class="flex items-center justify-around gap-2 mt-6 overflow-auto"
          >
            <button
              class="flex items-center rounded-full group default-transition bg-zinc-700 text-zinc-100 hover:bg-cyan-700 hover:text-cyan-100"
            >
              <div
                class="btn btn-sm default-transition bg-zinc-600 group-hover:bg-cyan-600"
              >
                <svg
                  class="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                  ></path>
                </svg>
              </div>
              <p class="hidden px-0 md:block md:pl-1 md:pr-2 whitespace-nowrap">
                資訊
              </p>
            </button>
            <a href="#information">
              <button
                class="flex items-center rounded-full group default-transition bg-zinc-700 text-zinc-100 hover:bg-cyan-700 hover:text-cyan-100"
              >
                <div
                  class="btn btn-sm default-transition bg-zinc-600 group-hover:bg-cyan-600"
                >
                  <svg
                    class="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    ></path>
                  </svg>
                </div>
                <p
                  class="hidden px-0 md:block md:pl-1 md:pr-2 whitespace-nowrap"
                >
                  價格
                </p>
              </button>
            </a>
            <a href="#pricearea">
              <button
                class="flex items-center rounded-full group default-transition bg-zinc-700 text-zinc-100 hover:bg-cyan-700 hover:text-cyan-100"
              >
                <div
                  class="btn btn-sm default-transition bg-zinc-600 group-hover:bg-cyan-600"
                >
                  <svg
                    class="w-6 h-6"
                    cxmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                    ></path>
                  </svg>
                </div>
                <p
                  class="hidden px-0 md:block md:pl-1 md:pr-2 whitespace-nowrap"
                >
                  QA
                </p>
              </button>
            </a>
            <!-- 待開發功能 -->
            <!-- <a href="#qaarea">
              <button
                class="flex items-center rounded-full group default-transition bg-zinc-700 text-zinc-100 hover:bg-cyan-700 hover:text-cyan-100"
              >
                <div
                  class="btn btn-sm default-transition bg-zinc-600 group-hover:bg-cyan-600"
                >
                  <svg
                    class="w-6 h-6"
                    cxmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                    ></path>
                  </svg>
                </div>
                <p
                  class="hidden px-0 md:block md:pl-1 md:pr-2 whitespace-nowrap"
                >
                  留言
                </p>
              </button>
            </a> -->
          </div>
          <hr class="my-2 -mx-4 border-zinc-700" />
        </div>
        <div id="information" class="flex flex-col gap-4 p-4">
          <h4 class="flex items-center gap-1 text-cyan-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              ></path>
            </svg>
            <span class="text-lg font-bold leading-none">資訊</span>
          </h4>
          <p
            class="text-sm leading-relaxed text-white whitespace-pre-line"
            v-html="cardInfoDesc"
          ></p>
          <hr id="pricearea" class="my-2 -mx-4 border-zinc-700" />
          <h4 class="flex items-center gap-1 text-cyan-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              ></path>
            </svg>
            <span class="text-lg font-bold leading-none">價格</span>
          </h4>
          <div class="p-2 my-4 text-center rounded-xl">
            <div
              class="flex items-start justify-center text-amber-500 dark:text-amber-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
                class="size-7"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m9 7.5 3 4.5m0 0 3-4.5M12 12v5.25M15 12H9m6 3H9m12-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                ></path>
              </svg>
              <!-- <h3 class="font-mono text-6xl font-bold">448000</h3> -->
              <h3 class="font-mono text-6xl font-bold">
                {{ translatedCardInfo.price.number }}
              </h3>
            </div>
            <p class="mt-4 text-sm text-zinc-500 dark:text-zinc-300">
              於 2024-11-07 遊々亭價格更新
            </p>
          </div>
          <hr id="qaarea" class="my-2 -mx-4 border-zinc-700" />
          <h4 class="flex items-center gap-1 text-cyan-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              ></path>
            </svg>
            <span class="text-lg font-bold leading-none">QA</span>
          </h4>
          <div
            v-if="translatedCardQAList.length > 0"
            class="flex flex-col gap-4"
            v-for="qa in cardInfoQA"
          >
            <div class="flex items-end gap-2">
              <div
                class="bg-gradient-to-tr from-emerald-500 to-green-300 p-2 rounded-2xl max-w-[80%]"
              >
                <p
                  v-html="qa.q"
                  class="text-sm leading-relaxed whitespace-pre-line"
                ></p>
              </div>
              <div class="flex flex-col">
                <p class="font-bold text-zinc-300">Q.{{ qa.id }}</p>
                <p class="font-mono text-xs whitespace-nowrap text-zinc-500">
                  {{ qa.date }}
                </p>
              </div>
            </div>
            <div class="flex flex-row-reverse items-end gap-2">
              <div
                class="bg-gradient-to-bl from-white to-neutral-400 p-2 rounded-2xl max-w-[80%]"
              >
                <p
                  v-html="qa.a"
                  class="text-sm leading-relaxed whitespace-pre-line"
                ></p>
              </div>
              <div class="flex flex-col text-right">
                <p class="font-bold text-zinc-300">A.{{ qa.id }}</p>
                <p class="font-mono text-xs whitespace-nowrap text-zinc-500">
                  {{ qa.date }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-else-if="translatedCardQAList.length <= 0"
            class="h-[10rem] grid place-content-center rounded-2xl text-white bg-black/20"
          >
            <div class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
                class="size-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
                ></path>
              </svg>
              <span>沒東西</span>
            </div>
          </div>
          <div class=""></div>
          <!-- <hr class="my-2 -mx-4 border-zinc-700" /> -->
          <!-- 待開發功能 -->
          <!-- <div id="chat" class="flex flex-col gap-4">
            <h4 class="flex items-center gap-1 text-cyan-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                ></path>
              </svg>
              <span class="text-lg font-bold leading-none">留言</span>
            </h4>
            <div class="relative flex flex-col gap-2">
              <div class="flex items-start gap-2">
                <a
                  href="/login"
                  class="flex items-center w-full gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <span class="text-lg text-zinc-300">留言前請先登入帳號</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    class="ml-auto size-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    ></path>
                  </svg>
                </a>
              </div>
              <h3 class="mr-2 font-bold text-right text-zinc-300">0則留言</h3>
              <div class="relative md:min-h-[8rem]">
                <div class="flex flex-col gap-2"></div>
              </div>
            </div>
          </div> -->
        </div>
      </div>
      <button
        class="p-4 text-white rounded-full arrow bg-black/50 disabled:bg-black/30 disabled:text-white/20 hover:bg-cyan-500"
        @click="changeCardInfoCard('right')"
        :disabled="rightDisabled"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          ></path>
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
@import '@/assets/base.css';
@import '@/assets/css/card-effect.css';

*,
:after,
:before {
  border: 0 solid #e5e7eb;
  box-sizing: border-box;
}
.arrow {
  display: block;
}
.md-arrow {
  display: none;
}
.btn {
  border-radius: 9999px;
  display: grid;
  padding: 0.25rem;
  place-content: center;
  position: relative;
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

@media screen and (width < 1200px) {
  .arrow {
    display: none;
  }
  .md-arrow {
    display: block;
  }
}

@media screen and (width < 768px) {
}
</style>
