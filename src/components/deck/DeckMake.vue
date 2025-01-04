<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCardSeriesStore } from '@/stores/card-series'
import { useDeckMakeStore } from '@/stores/deck-make'
import { useCardInfoStore } from '@/stores/card-info'
import Swal from 'sweetalert2'

const cardSeriesStore = useCardSeriesStore()
const router = useRouter()
const getLastViewSeries = cardSeriesStore.getLastViewSeries
const saveLastViewSeries = cardSeriesStore.saveLastViewSeries

const deckMakeStore = useDeckMakeStore()
const {
  selectedCards,
  countDeck,
  editType,
  showCardPrice,
  sortedDeck,
  sortedTitle,
  sortStatus,
} = storeToRefs(deckMakeStore)

const clearSelectedCards = deckMakeStore.clearSelectedCards
const getLastDeckEdit = deckMakeStore.getLastDeckEdit
const changeTypeToAdd = deckMakeStore.changeTypeToAdd
const changeTypeToDelete = deckMakeStore.changeTypeToDelete
const checkTypeAndRunFunction = deckMakeStore.checkTypeAndRunFunction
const switchSortMode = deckMakeStore.switchSortMode
const handleSwitchBtnClick = deckMakeStore.handleSwitchBtnClick
const sendDeckToDatabase = deckMakeStore.sendDeckToDatabase

const sidebarSelectedStatus = ref(true)
const chooseCoverCard = ref('')
const deckName = ref('LL牌組')
const deckDescription = ref('這是測試牌組')
const settingDeckStatus = ref(false)

const clearDeckAndBacktoFirstStep = async () => {
  const res = await Swal.fire({
    icon: 'question',
    title: '清除牌組',
    text: '確定要清除牌組嗎?',
    confirmButtonText: '確定',
    showCancelButton: true,
    cancelButtonText: '取消',
  })
  if (res.isConfirmed) {
    clearSelectedCards()
    settingDeckStatus.value = false
    sidebarSelectedStatus.value = true
  }
}

const nextStep = () => {
  sidebarSelectedStatus.value = false
  settingDeckStatus.value = true
}

const finalStep = async () => {
  const coverCard = selectedCards.value.find((card) => {
    return card.id == chooseCoverCard.value
  })

  if (
    deckName.value.trim() != '' &&
    deckDescription.value.trim() != '' &&
    chooseCoverCard.value.trim() != ''
  ) {
    const deckData = {
      deckName: deckName.value,
      deckDescription: deckDescription.value,
      deck: selectedCards.value,
      deckCover: coverCard.cover,
    }
    const res = await sendDeckToDatabase(deckData)

    if (res == undefined) {
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '請重新登入',
      })
      router.push('/login')
      currentMain.value = ''
    }

    if (res.status == 200) {
      settingDeckStatus.value = false
      sidebarSelectedStatus.value = true
      deckName.value = ''
      deckDescription.value = ''
      chooseCoverCard.value = ''
      clearSelectedCards()
      await Swal.fire({
        icon: 'success',
        title: '成功',
        text: '成功創建牌組',
      })

      router.push(`/deck/${res.data.data.deck_id}`)
      currentMain.value = ''
    } else if (res.status == 403) {
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '請重新登入',
      })
      router.push('/login')
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '創建牌組失敗',
      })
    }
  } else {
    if (deckName.value.trim() == '') {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '需填寫牌組名',
      })
    } else if (deckDescription.value.trim() == '') {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '需填寫牌組描述',
      })
    } else if (chooseCoverCard.value.trim() == '') {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '未選擇封面卡',
      })
    }
  }
}

const currentSidebar = ref('')

const isLargeScreen = ref(window.innerWidth > 1200)

const currentMain = ref(null)

function toggleFilter(value) {
  if (!isLargeScreen.value) {
    currentSidebar.value = ''
  }
  currentMain.value = currentMain.value === value ? null : value
}

function closeSidebar() {
  currentSidebar.value = ''
  currentMain.value = ''

  settingDeckStatus.value = false
  sidebarSelectedStatus.value = true
  deckName.value = ''
  deckDescription.value = ''
  chooseCoverCard.value = ''
}

function updateScreenSize() {
  isLargeScreen.value = window.innerWidth > 1200
  if (!isLargeScreen.value) {
    closeSidebar()
  } else {
    currentMain.value = ''
  }
}
// onBeforeMount(async () => {
//   const route = useRoute()
//   const seriesId = route.params.series_id
//   saveLastViewSeries(seriesId)
//   await getLastViewSeries()
// })
// Lifecycle hooks
onMounted(async () => {
  getLastDeckEdit()
  switchSortMode()
  window.addEventListener('resize', updateScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<template>
  <section v-show="currentMain === 'open-deck'" class="sidebar-deck">
    <header class="sidebar-header">
      <div>
        <p>牌組製作</p>
        <p>已選擇 {{ selectedCards.length }} 張卡片，總價 ¥{{ countDeck }}</p>
      </div>
      <div>
        <button class="icon del-btn" @click="clearDeckAndBacktoFirstStep">
          <i class="fa-solid fa-trash"></i>
        </button>
        <button @click="closeSidebar" class="icon xmark-btn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </header>

    <div class="sidebar-deck-choice" v-if="sidebarSelectedStatus === true">
      <button id="type-btn-active" v-if="sortStatus === 'TYPE'">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">類型</span>
      </button>
      <button @click="handleSwitchBtnClick('TYPE')" v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">類型</span>
      </button>
      <button id="color-btn-active" v-if="sortStatus === 'COLOR'">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">顏色</span>
      </button>
      <button @click="handleSwitchBtnClick('COLOR')" v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">顏色</span>
      </button>
      <button id="level-btn-active" v-if="sortStatus === 'LEVEL'">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold select-none whitespace-nowrap"
          >等級</span
        >
      </button>
      <button @click="handleSwitchBtnClick('LEVEL')" v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">等級</span>
      </button>
      <button id="rare-btn-active" v-if="sortStatus === 'RARE'">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">稀有度</span>
      </button>
      <button @click="handleSwitchBtnClick('RARE')" v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">稀有度</span>
      </button>
      <button id="product-btn-active" v-if="sortStatus === 'PRODUCT'">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">商品</span>
      </button>
      <button @click="handleSwitchBtnClick('PRODUCT')" v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          width="24"
          height="24"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          class="flex-none stroke-2 size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
          ></path>
        </svg>
        <span class="text-sm font-bold whitespace-nowrap">商品</span>
      </button>
    </div>
    <div class="sidebar-deck-control" v-if="sidebarSelectedStatus === true">
      <button class="cash" @click="showCardPrice = !showCardPrice">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
          aria-hidden="true"
          data-slot="icon"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
          ></path>
        </svg>
      </button>
      <span class="flex-none font-mono divder text-zinc-500/50"> | </span>

      <button
        id="plus-active"
        @click="changeTypeToAdd"
        v-if="editType === 'ADD_CARD'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
          aria-hidden="true"
          data-slot="icon"
          class=""
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          ></path>
        </svg>
      </button>
      <button
        class="plus"
        @click="changeTypeToAdd"
        v-else="editType === 'CHECK_INFO'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
          aria-hidden="true"
          data-slot="icon"
          class=""
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          ></path>
        </svg>
      </button>

      <button
        id="minus-active"
        @click="changeTypeToDelete"
        v-if="editType === 'DELETE_CARD'"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
          aria-hidden="true"
          data-slot="icon"
          class=""
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 12h14"
          ></path>
        </svg>
      </button>
      <button class="minus" @click="changeTypeToDelete" v-else>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          width="24"
          height="24"
          aria-hidden="true"
          data-slot="icon"
          class=""
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 12h14"
          ></path>
        </svg>
      </button>
    </div>
    <div class="card-content" v-if="sidebarSelectedStatus === true">
      <div
        class="card-section"
        v-for="(title, sortedTitleIndex) in sortedTitle"
        :key="sortedTitleIndex"
      >
        <h3>{{ title }} - {{ sortedDeck[sortedTitleIndex].length }}</h3>
        <div class="card-choiced">
          <div class="row">
            <div
              class="col-choice"
              v-for="(card, index) in sortedDeck[sortedTitleIndex]"
              :key="index"
              @click="checkTypeAndRunFunction(card, index, sortedTitleIndex)"
            >
              <div class="card-price" v-if="showCardPrice">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  class="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m9 7.5 3 4.5m0 0 3-4.5M12 12v5.25M15 12H9m6 3H9m12-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  ></path>
                </svg>
                <span>{{ card.price.number }}</span>
                <span>{{ card.rare }}</span>
              </div>
              <div class="card-image">
                <img :src="card.cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="deck-save" v-if="settingDeckStatus === true">
      <div class="deck-save-title-section">
        <div class="deck-save-title-section-top">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="stroke-2 size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
            ></path>
          </svg>
          <h2>標題：</h2>
        </div>
        <input
          type="text"
          placeholder="輸入牌組名稱"
          name="deckName"
          id="deckName"
          v-model="deckName"
        />
        <p>設定預設牌組名稱，前往<a href="#">偏好設定</a></p>
      </div>
      <div class="deck-save-content-section">
        <div class="deck-save-content-section-top">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="stroke-2 size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
            ></path>
          </svg>
          <h2>內容：</h2>
        </div>
        <textarea
          name=""
          id=""
          cols="30"
          rows="4"
          placeholder="用一段話介紹一下你的牌組"
          v-model="deckDescription"
        ></textarea>
      </div>
      <div class="deck-save-covercard-section" v-if="selectedCards.length > 0">
        <div class="deck-save-covercard-section-top">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="stroke-2 size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
            ></path>
          </svg>
          <h2>封面卡：</h2>
        </div>
        <div class="deck-save-covercard-section-content">
          <div
            :class="{
              'deck-save-covercard-section-content-card': true,
              'cover-card-selected': card.id === chooseCoverCard,
            }"
            v-for="card in selectedCards"
            :key="card.id"
            @click="chooseCoverCard = card.id"
          >
            <img :src="card.cover" />
            <div class="deck-save-covercard-section-content-card-info">
              <h3>{{ card.title }}</h3>
              <p>{{ card.id }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="sidebar-footer">
      <button
        id="sidebar-footer-active"
        v-if="selectedCards.length > 0 && settingDeckStatus === false"
        @click="nextStep"
      >
        <span
          >下一步<svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            ></path>
          </svg>
        </span>
      </button>
      <div class="sidebar-footer-box" v-else-if="settingDeckStatus === true">
        <button id="sidebar-footer-active" @click="finalStep">
          <span
            >完成
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="size-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              ></path>
            </svg>
          </span>
        </button>
      </div>
      <button v-else>
        <span
          >下一步<svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            ></path>
          </svg>
        </span>
      </button>
    </footer>
  </section>

  <div
    class="deck-container"
    @click="toggleFilter('open-deck')"
    v-if="selectedCards.length > 0"
  >
    <div class="deck-content">
      <div class="deck-img">
        <img src="@/img/capie-icon.png" alt="" />
      </div>
      <div class="line"></div>
      <div class="total-cards">
        <span>牌組製作，共{{ selectedCards.length }}張卡</span>
      </div>
      <div class="deckbtn-area">
        <button class="deck-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            ></path>
          </svg>
        </button>
        <div class="pay-btn">
          <svg
            width="24px"
            height="24px"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
            data-slot="icon"
            class="flex-none size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m9 7.5 3 4.5m0 0 3-4.5M12 12v5.25M15 12H9m6 3H9m12-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            ></path>
          </svg>
          <span>{{ countDeck }} </span><span>¥</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style src="@/assets/base.css" scoped></style>
<style src="@/assets/css/card-series/sidebar-deck.css" scoped></style>
<style scoped>
.deck-container {
  width: 100%;
  height: 56px;
  position: fixed;
  bottom: 66px;
  display: none;
  padding: 0 8px;
  cursor: pointer;
  z-index: 1000;
}

.deck-img {
  overflow: hidden;
  border-radius: 10px;
  transform: translateX(8px);
  z-index: 1;
}

.deck-img img {
  width: 45px;
  height: 45px;
  object-fit: cover;
}

.deck-content {
  width: 100%;
  height: 56px;
  background-color: rgba(86, 68, 10, 0.9);
  display: flex;
  padding-left: 8px;
  border-radius: 10px;
  align-items: center;
  position: relative;
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
  padding-left: 15px;
}

.total-cards span {
  font-size: 14px;
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
  align-items: center;
  position: absolute;
  right: 110px;
  cursor: pointer;
  justify-content: center;
}

.deck-btn:hover {
  background-color: #42ebeb;
}

.deck-btn svg {
  width: 25px;
  height: 25px;
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
  justify-content: space-around;
  color: #dad7d7;
  border-radius: 20px;
  cursor: pointer;
}

.pay-btn:hover {
  background-color: #e27637;
}

.pay-btn span {
  font-size: 14px;
  margin-right: 5px;
  gap: 5px;
}

@media screen and (max-width: 1199px) {
  .deck-container {
    display: flex;
  }
}
</style>
