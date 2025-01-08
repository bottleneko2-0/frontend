<script setup>
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import Notice from '@/components/notice/Notice.vue'
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  onBeforeMount,
  watch,
  nextTick,
} from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCardSeriesStore } from '@/stores/card-series'
import { useDeckMakeStore } from '@/stores/deck-make'
import { useCardInfoStore } from '@/stores/card-info'
import Swal from 'sweetalert2'
import { useCardFilterStore } from '@/stores/card-filter'
import { useRoute } from 'vue-router'
import Card from '@/components/card/Card.vue'
import AddCard from '../components/svg/AddCard.vue'
import AngleL from '@/components/svg/AngleL.vue'
import ArrowR from '@/components/svg/ArrowR.vue'
import CardInfo from '@/components/svg/CardInfo.vue'
import Cash from '@/components/svg/Cash.vue'
import CashJP from '@/components/svg/CashJP.vue'
import Filter from '../components/svg/Filter.vue'
import Flag from '../components/svg/Flag.vue'
import Minus from '@/components/svg/Minus.vue'
import Plus from '@/components/svg/Plus.vue'
import Release from '../components/svg/Release.vue'
import Table from '@/components/svg/Table.vue'
import TypeGroup from '@/components/svg/TypeGroup.vue'

const router = useRouter()
// 引入CardFilterStore並使用
const cardFilterStore = useCardFilterStore()
const { applyBtnStatus, keyWordGroup, myFiltersGroup } =
  storeToRefs(cardFilterStore)
const filterVaribleSet = cardFilterStore.filterVaribleSet
const useFilters = cardFilterStore.useFilters
const changeReplaceKeyWord = cardFilterStore.changeReplaceKeyWord
const changeFilterStatus = cardFilterStore.changeFilterStatus
const resetFilter = cardFilterStore.resetFilter
const changeSortStatus = cardFilterStore.changeSortStatus
const resetAllFilter = cardFilterStore.resetAllFilter
const checkHaveFilterOrSort = cardFilterStore.checkHaveFilterOrSort
const saveKeyWord = cardFilterStore.saveKeyWord
const countMouseUp = cardFilterStore.countMouseUp
const deleteKeyWord = cardFilterStore.deleteKeyWord
const saveMyFilters = cardFilterStore.saveMyFilters
const deleteMyFilters = cardFilterStore.deleteMyFilters

// 引入CardSeriesStore並使用
const cardSeriesStore = useCardSeriesStore()
const {
  seriesCardList,
  seriesInfo,
  seriesCardListLength,
  translatedSeriesCardList,
  translatedSeriesInfo,
} = storeToRefs(cardSeriesStore)
const getLastViewSeries = cardSeriesStore.getLastViewSeries
const saveLastViewSeries = cardSeriesStore.saveLastViewSeries

// 引入DeckMakeStore並使用
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
const addCard = deckMakeStore.addCard
const clearSelectedCards = deckMakeStore.clearSelectedCards
const getLastDeckEdit = deckMakeStore.getLastDeckEdit
const changeTypeToAdd = deckMakeStore.changeTypeToAdd
const changeTypeToDelete = deckMakeStore.changeTypeToDelete
const checkTypeAndRunFunction = deckMakeStore.checkTypeAndRunFunction
const switchSortMode = deckMakeStore.switchSortMode
const handleSwitchBtnClick = deckMakeStore.handleSwitchBtnClick
const sendDeckToDatabase = deckMakeStore.sendDeckToDatabase

// 引入CardInfoStore並使用
const cardInfoStore = useCardInfoStore()
const getCardInfoAndShow = cardInfoStore.getCardInfoAndShow

// 定義一些狀態
const sidebarSelectedStatus = ref(true)
const chooseCoverCard = ref('')
const deckName = ref('XX牌組')
const deckDescription = ref('這是測試牌組')
const settingDeckStatus = ref(false)
const levelOrder = computed(() => {
  const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
    return item === 'levelUpSort' || item === 'levelDownSort'
  })
  return index + 1
})
const colorOrder = computed(() => {
  const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
    return item === 'colorUpSort' || item === 'colorDownSort'
  })
  return index + 1
})
const priceOrder = computed(() => {
  const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
    return item === 'priceUpSort' || item === 'priceDownSort'
  })
  return index + 1
})
const replaceWord = computed(() => {
  return filterVaribleSet.replaceKeyWord ? 'OR' : 'AND'
})

// 清除牌組並回到第一步編輯牌組的狀態
const clearDeckAndBacktoFirstStep = async () => {
  const res = await Swal.fire({
    icon: 'question',
    title: '清除牌組',
    text: '確定要清除牌組嗎?',
    confirmButtonText: '確定',
    showCancelButton: true,
    cancelButtonText: '取消',
    color: '#e1e1e1',
    background: '#27272a',
  })
  if (res.isConfirmed) {
    clearSelectedCards()
    settingDeckStatus.value = false
    sidebarSelectedStatus.value = true
  }
}

// 新增刪除完牌組後前往下一步
const nextStep = () => {
  sidebarSelectedStatus.value = false
  settingDeckStatus.value = true
}

// 結束編輯牌組，新增牌組到牌組資料庫，跳轉至新製作的牌組頁面
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
        color: '#e1e1e1',
        background: '#27272a',
      })
      router.push('/login')
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
        color: '#e1e1e1',
        background: '#27272a',
      })
      router.push(`/deck/${res.data.data.deck_id}`)
    } else if (res.status == 403) {
      await Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '請重新登入',
        color: '#e1e1e1',
        background: '#27272a',
      })
      router.push('/login')
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '創建牌組失敗',
        color: '#e1e1e1',
        background: '#27272a',
      })
    }
  } else {
    if (deckName.value.trim() == '') {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '需填寫牌組名',
        color: '#e1e1e1',
        background: '#27272a',
      })
    } else if (deckDescription.value.trim() == '') {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '需填寫牌組描述',
        color: '#e1e1e1',
        background: '#27272a',
      })
    } else if (chooseCoverCard.value.trim() == '') {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '未選擇封面卡',
        color: '#e1e1e1',
        background: '#27272a',
      })
    }
  }
}

// 篩選、排序數量
const filterCount = ref(0)
const sortCount = ref(0)

// 關鍵字篩選的狀態
const handleKeyWord = () => {
  if (filterVaribleSet.keyWord.trim() != '') {
    applyBtnStatus.value = true
  } else if (filterVaribleSet.keyWord.trim() == '') {
    checkHaveFilterOrSort()
  }
}

// 按下apply按鈕後執行篩選功能
const handleApplyStatus = async () => {
  if (applyBtnStatus.value === true) {
    await useFilters(filterVaribleSet.keyWord.trim())
  }

  filterCount.value = 0
  sortCount.value = 0
  Object.keys(filterVaribleSet).forEach((item) => {
    if (
      item != 'replaceKeyWord' ||
      item != 'levelUpsort' ||
      item != 'levelDownSort' ||
      item != 'colorUpSort' ||
      item != 'colorDownSort' ||
      item != 'priceUpSort' ||
      item != 'priceDownSort' ||
      item != 'typeCharacter' ||
      item != 'typeScene' ||
      item != 'typeEvent'
    ) {
      if (filterVaribleSet[item] === true) {
        filterCount.value++
      }
    }

    if (
      item == 'replaceKeyWord' ||
      item == 'levelUpsort' ||
      item == 'levelDownSort' ||
      item == 'colorUpSort' ||
      item == 'colorDownSort' ||
      item == 'priceUpSort' ||
      item == 'priceDownSort' ||
      item == 'typeCharacter' ||
      item == 'typeScene' ||
      item == 'typeEvent'
    ) {
      if (filterVaribleSet[item] === true) {
        sortCount.value++
      }
    }
  })
  currentMain.value = ''
}

// 按下關鍵字按鈕
const handleUseKeyWordBtn = (keyWord) => {
  filterVaribleSet.keyWord = keyWord
  handleKeyWord()
}

// 按下常用篩選按鈕
const handleUseMyFiltersBtn = (myFilter) => {
  Object.assign(filterVaribleSet, myFilter.filters)
  applyBtnStatus.value = true
}

const currentSidebar = ref('')
const sidebarFilterWidth = ref(490)
const sidebarDeckWidth = ref(490)
const extraOffset = ref(262)
const isLargeScreen = ref(window.innerWidth > 1200)
const view = ref('card-info')
const currentMain = ref(null)
const filters = ref([
  {
    name: '常用',
    checked: true,
    icon: 'fa-solid fa-star',
    checkButton: false,
    delButton: false,
    filterTag: [''],
  },
  {
    name: '關鍵字',
    checked: true,
    icon: 'fa-solid fa-magnifying-glass',
    checkButton: false,
    delButton: true,
    filterTag: ['keyWord'],
  },
  {
    name: '排序',
    checked: true,
    icon: 'fa-solid fa-sliders',
    checkButton: false,
    delButton: true,
    filterTag: [
      'levelDownSort',
      'levelUpSort',
      'colorDownSort',
      'colorUpSort',
      'priceDownSort',
      'priceUpSort',
    ],
  },
  {
    name: '類型',
    checked: true,
    icon: 'fa-solid fa-filter',
    checkButton: false,
    delButton: true,
    filterTag: ['typeCharacter', 'typeScene', 'typeEvent'],
  },
  {
    name: '等級',
    checked: true,
    icon: 'fa-solid fa-filter',
    checkButton: false,
    delButton: true,
    filterTag: ['levelFilter0', 'levelFilter1', 'levelFilter2', 'levelFilter3'],
  },
  {
    name: '顏色',
    checked: true,
    icon: 'fa-solid fa-filter',
    checkButton: false,
    delButton: true,
    filterTag: ['colorFilterRed', 'colorFilterBlue', 'colorFilterYellow'],
  },
  {
    name: '費用',
    checked: true,
    icon: 'fa-solid fa-filter',
    checkButton: false,
    delButton: true,
    filterTag: ['costFilter0', 'costFilter1', 'costFilter2'],
  },
  {
    name: '魂傷',
    checked: true,
    icon: 'fa-solid fa-filter',
    checkButton: false,
    delButton: true,
    filterTag: ['soulFilter0', 'soulFilter1', 'soulFilter2'],
  },
  {
    name: '攻擊力',
    checked: true,
    icon: 'fa-solid fa-filter',
    checkButton: false,
    delButton: true,
    filterTag: [
      'attackFilter0',
      'attackFilter500',
      'attackFilter1000',
      'attackFilter1500',
      'attackFilter2000',
      'attackFilter2500',
      'attackFilter3000',
      'attackFilter3500',
      'attackFilter4000',
      'attackFilter4500',
      'attackFilter5000',
      'attackFilter5500',
      'attackFilter6000',
      'attackFilter6500',
      'attackFilter7000',
      'attackFilter7500',
      'attackFilter8000',
      'attackFilter8500',
      'attackFilter9000',
      'attackFilter9500',
      'attackFilter10000',
      'attackFilter10500',
      'attackFilter11000',
    ],
  },
  {
    name: '稀有度',
    checked: true,
    icon: 'fa-solid fa-filter',
    checkButton: false,
    delButton: true,
    filterTag: [
      'rareFilterRR',
      'rareFilterSSP',
      'rareFilterLRR',
      'rareFilterR',
      'rareFilterSR',
      'rareFilterOFR',
      'rareFilterU',
      'rareFilterC',
      'rareFilterCR',
      'rareFilterRRR',
      'rareFilterCC',
      'rareFilterPR',
      'rareFilterTD',
      'rareFilterSP',
      'rareFilterN',
      'rareFilterLRP',
      'rareFilterSIR',
    ],
  },
  // { name: '判定', checked: true, icon: 'fa-solid fa-filter', checkButton: true },
  // { name: '特徵', checked: true, icon: 'fa-solid fa-filter', checkButton: true },
  // { name: '商品', checked: true, icon: 'fa-solid fa-filter', checkButton: true }
])

const sidebarMarginLeft = computed(() => {
  if (!isLargeScreen.value) return 0
  if (currentSidebar.value === 'open-filter') {
    return sidebarFilterWidth.value - extraOffset.value
  } else if (currentSidebar.value === 'open-deck') {
    return sidebarDeckWidth.value - extraOffset.value
  }
  return 0
})

const toggleSidebar = (sidebar) => {
  currentSidebar.value = currentSidebar.value === sidebar ? '' : sidebar
}

const toggleFilter = (value) => {
  if (!isLargeScreen.value) {
    currentSidebar.value = ''
  }
  currentMain.value = currentMain.value === value ? null : value
}

const MenuFilter = (index) => {
  filters.value[index].checked = !filters.value[index].checked
}

const closeSidebar = () => {
  currentSidebar.value = ''
  currentMain.value = ''

  settingDeckStatus.value = false
  sidebarSelectedStatus.value = true
  deckName.value = ''
  deckDescription.value = ''
  chooseCoverCard.value = ''
}

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth > 1200
  if (!isLargeScreen.value) {
    closeSidebar()
  } else {
    currentMain.value = ''
  }
}

const goBack = () => {
  router.go(-1)
}

const randomColor = ref('')
const bgColors = ['red', 'yellow', 'green', 'blue', 'purple']
const randomBgColor = () => {
  randomColor.value = ''
  randomColor.value = bgColors[Math.floor(Math.random() * bgColors.length)]
}

onBeforeMount(async () => {
  const route = useRoute()
  const seriesId = route.params.series_id
  saveLastViewSeries(seriesId)
  await getLastViewSeries()
})
// Lifecycle hooks
onMounted(async () => {
  getLastDeckEdit()
  switchSortMode()
  randomBgColor()
  window.addEventListener('resize', updateScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>
<template>
  <div class="overflow-hidden bg-black root-container">
    <nav class="sidebar-container">
      <SidebarGrid
        :class="{
          hidden: currentMain === 'open-filter' || currentMain === 'open-deck',
        }"
      />

      <section v-show="currentSidebar === 'open-filter'" class="sidebar-filter">
        <header class="sidebar-filter-header">
          <div class="flex-col">
            <p>卡片篩選</p>
            <p>
              {{ filterCount }} 篩選、{{ sortCount }} 排序、關鍵字 : "{{
                filterVaribleSet.keyWord.trim()
              }}"
            </p>
          </div>
          <div>
            <button class="icon del-btn" @click="resetAllFilter">
              <i class="fa-solid fa-trash"></i>
            </button>
            <button class="icon open-btn">
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <button @click="closeSidebar" class="icon xmark-btn">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </header>

        <div class="sidebar-filter-content">
          <div
            class="whole-menu"
            v-for="(filter, index) in filters"
            :key="index"
          >
            <div class="menu" @click="MenuFilter(index)">
              <i :class="[filter.icon]"></i>
              <p>{{ filter.name }}</p>
              <button
                class="icon del"
                v-if="filter.delButton"
                @click.stop="resetFilter(filter.filterTag)"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
              <button class="icon check" v-if="filter.checkButton">
                <i class="fa-regular fa-circle-check"></i>
              </button>
              <button class="open">
                <i
                  class="fa fa-chevron-down"
                  :style="{ transform: filter.checked ? 'rotate(180deg)' : '' }"
                ></i>
              </button>
            </div>
            <div class="menu-inner" v-show="filter.checked">
              <div v-if="filter.name === '常用'">
                <span
                  >"+"
                  按鈕可以儲存當下篩選內容，長按儲存篩選可以進行刪除。</span
                >
                <div class="myfilter-button-group">
                  <button class="plus-btn-used" @click="saveMyFilters">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                  <button
                    class="myfilter-button-item"
                    v-for="(myfilter, index) in myFiltersGroup"
                    :key="index"
                    @click="handleUseMyFiltersBtn(myfilter)"
                    @mousedown="countMouseUp"
                    @mouseup="deleteMyFilters(myfilter)"
                  >
                    {{ myfilter.name }}
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '關鍵字'">
                <span
                  >可輸入 "空白" 來複合搜尋，"AND/OR" 可以進行切換。
                  <br />當前搜尋內容： {{ filterVaribleSet.keyWord.trim() }}
                </span>
                <div
                  class="input-keyword"
                  :class="{
                    'input-keyword-haveValue':
                      filterVaribleSet.keyWord.trim() != '',
                  }"
                >
                  <ArrowR class="stroke-2 size-6" />
                  <input
                    class="w-full p-0 bg-transparent border-transparent focus:ring-0 placeholder:text-zinc-500 focus:outline-none"
                    type="text"
                    placeholder="關鍵字搜尋"
                    v-model="filterVaribleSet.keyWord"
                    @input="handleKeyWord"
                  />
                  <div>
                    <button @click="changeReplaceKeyWord">
                      <span>{{ replaceWord }}</span>
                    </button>
                    <!-- <button><span>OR</span></button> -->
                    <button class="plus-btn" @click="saveKeyWord">
                      <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
                <p class="keyword-below">
                  "+" 按鈕可以儲存關鍵字，長按儲存關鍵字可以進行刪除。
                </p>
                <span v-if="keyWordGroup.length === 0">無資料</span>
                <div class="keyword-button-group">
                  <button
                    class="keyword-button-item"
                    v-for="(keyWord, index) in keyWordGroup"
                    :key="index"
                    @click="handleUseKeyWordBtn(keyWord)"
                    @mousedown="countMouseUp"
                    @mouseup="deleteKeyWord(keyWord)"
                  >
                    {{ keyWord }}
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '排序'">
                <div class="menu-inner-slider-btn">
                  <button
                    :class="{
                      'btn-default-bg':
                        !filterVaribleSet.levelDownSort ||
                        !filterVaribleSet.levelUpSort,
                      'btn-active-bg':
                        filterVaribleSet.levelDownSort ||
                        filterVaribleSet.levelUpSort,
                    }"
                    @click="changeSortStatus('level')"
                  >
                    <div
                      class="slider-btn"
                      :class="{
                        'slider-btn-active':
                          filterVaribleSet.levelDownSort ||
                          filterVaribleSet.levelUpSort,
                      }"
                    >
                      {{ levelOrder > 0 ? levelOrder : '' }}
                    </div>
                    等級
                    <i
                      class="fa-solid fa-arrow-up"
                      :class="{
                        'arrow-up': !filterVaribleSet.levelUpSort,
                        'arrow-down': filterVaribleSet.levelUpSort,
                      }"
                    ></i>
                  </button>
                  <button
                    :class="{
                      'btn-default-bg':
                        !filterVaribleSet.colorDownSort ||
                        !filterVaribleSet.colorUpSort,
                      'btn-active-bg':
                        filterVaribleSet.colorDownSort ||
                        filterVaribleSet.colorUpSort,
                    }"
                    @click="changeSortStatus('color')"
                  >
                    <div
                      class="slider-btn"
                      :class="{
                        'slider-btn-active':
                          filterVaribleSet.colorDownSort ||
                          filterVaribleSet.colorUpSort,
                      }"
                    >
                      {{ colorOrder > 0 ? colorOrder : '' }}
                    </div>
                    顏色
                    <i
                      class="fa-solid fa-arrow-up"
                      :class="{
                        'arrow-up': !filterVaribleSet.colorUpSort,
                        'arrow-down': filterVaribleSet.colorUpSort,
                      }"
                    ></i>
                  </button>
                  <button
                    :class="{
                      'btn-default-bg':
                        !filterVaribleSet.priceDownSort ||
                        !filterVaribleSet.priceUpSort,
                      'btn-active-bg':
                        filterVaribleSet.priceDownSort ||
                        filterVaribleSet.priceUpSort,
                    }"
                    @click="changeSortStatus('price')"
                  >
                    <div
                      class="slider-btn"
                      :class="{
                        'slider-btn-active':
                          filterVaribleSet.priceDownSort ||
                          filterVaribleSet.priceUpSort,
                      }"
                    >
                      {{ priceOrder > 0 ? priceOrder : '' }}
                    </div>
                    價格
                    <i
                      class="fa-solid fa-arrow-up"
                      :class="{
                        'arrow-up': !filterVaribleSet.priceUpSort,
                        'arrow-down': filterVaribleSet.priceUpSort,
                      }"
                    ></i>
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '類型'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.typeCharacter,
                      'btn-active-bg': filterVaribleSet.typeCharacter,
                    }"
                    @click="changeFilterStatus('typeCharacter')"
                  >
                    角色
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.typeEvent,
                      'btn-active-bg': filterVaribleSet.typeEvent,
                    }"
                    @click="changeFilterStatus('typeEvent')"
                  >
                    事件
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.typeScene,
                      'btn-active-bg': filterVaribleSet.typeScene,
                    }"
                    @click="changeFilterStatus('typeScene')"
                  >
                    名場
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '等級'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.levelFilter0,
                      'btn-active-bg': filterVaribleSet.levelFilter0,
                    }"
                    @click="changeFilterStatus('levelFilter0')"
                  >
                    0
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.levelFilter1,
                      'btn-active-bg': filterVaribleSet.levelFilter1,
                    }"
                    @click="changeFilterStatus('levelFilter1')"
                  >
                    1
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.levelFilter2,
                      'btn-active-bg': filterVaribleSet.levelFilter2,
                    }"
                    @click="changeFilterStatus('levelFilter2')"
                  >
                    2
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.levelFilter3,
                      'btn-active-bg': filterVaribleSet.levelFilter3,
                    }"
                    @click="changeFilterStatus('levelFilter3')"
                  >
                    3
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '顏色'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.colorFilterYellow,
                      'btn-active-bg': filterVaribleSet.colorFilterYellow,
                    }"
                    @click="changeFilterStatus('colorFilterYellow')"
                  >
                    黃色
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.colorFilterRed,
                      'btn-active-bg': filterVaribleSet.colorFilterRed,
                    }"
                    @click="changeFilterStatus('colorFilterRed')"
                  >
                    紅色
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.colorFilterBlue,
                      'btn-active-bg': filterVaribleSet.colorFilterBlue,
                    }"
                    @click="changeFilterStatus('colorFilterBlue')"
                  >
                    藍色
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '費用'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.costFilter0,
                      'btn-active-bg': filterVaribleSet.costFilter0,
                    }"
                    @click="changeFilterStatus('costFilter0')"
                  >
                    0
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.costFilter1,
                      'btn-active-bg': filterVaribleSet.costFilter1,
                    }"
                    @click="changeFilterStatus('costFilter1')"
                  >
                    1
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.costFilter2,
                      'btn-active-bg': filterVaribleSet.costFilter2,
                    }"
                    @click="changeFilterStatus('costFilter2')"
                  >
                    2
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '魂傷'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.soulFilter0,
                      'btn-active-bg': filterVaribleSet.soulFilter0,
                    }"
                    @click="changeFilterStatus('soulFilter0')"
                  >
                    0
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.soulFilter1,
                      'btn-active-bg': filterVaribleSet.soulFilter1,
                    }"
                    @click="changeFilterStatus('soulFilter1')"
                  >
                    1
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.soulFilter2,
                      'btn-active-bg': filterVaribleSet.soulFilter2,
                    }"
                    @click="changeFilterStatus('soulFilter2')"
                  >
                    2
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '攻擊力'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter0,
                      'btn-active-bg': filterVaribleSet.attackFilter0,
                    }"
                    @click="changeFilterStatus('attackFilter0')"
                  >
                    0
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter500,
                      'btn-active-bg': filterVaribleSet.attackFilter500,
                    }"
                    @click="changeFilterStatus('attackFilter500')"
                  >
                    500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter1000,
                      'btn-active-bg': filterVaribleSet.attackFilter1000,
                    }"
                    @click="changeFilterStatus('attackFilter1000')"
                  >
                    1000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter1500,
                      'btn-active-bg': filterVaribleSet.attackFilter1500,
                    }"
                    @click="changeFilterStatus('attackFilter1500')"
                  >
                    1500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter2000,
                      'btn-active-bg': filterVaribleSet.attackFilter2000,
                    }"
                    @click="changeFilterStatus('attackFilter2000')"
                  >
                    2000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter2500,
                      'btn-active-bg': filterVaribleSet.attackFilter2500,
                    }"
                    @click="changeFilterStatus('attackFilter2500')"
                  >
                    2500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter3000,
                      'btn-active-bg': filterVaribleSet.attackFilter3000,
                    }"
                    @click="changeFilterStatus('attackFilter3000')"
                  >
                    3000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter3500,
                      'btn-active-bg': filterVaribleSet.attackFilter3500,
                    }"
                    @click="changeFilterStatus('attackFilter3500')"
                  >
                    3500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter4000,
                      'btn-active-bg': filterVaribleSet.attackFilter4000,
                    }"
                    @click="changeFilterStatus('attackFilter4000')"
                  >
                    4000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter4500,
                      'btn-active-bg': filterVaribleSet.attackFilter4500,
                    }"
                    @click="changeFilterStatus('attackFilter4500')"
                  >
                    4500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter5000,
                      'btn-active-bg': filterVaribleSet.attackFilter5000,
                    }"
                    @click="changeFilterStatus('attackFilter5000')"
                  >
                    5000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter5500,
                      'btn-active-bg': filterVaribleSet.attackFilter5500,
                    }"
                    @click="changeFilterStatus('attackFilter5500')"
                  >
                    5500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter6000,
                      'btn-active-bg': filterVaribleSet.attackFilter6000,
                    }"
                    @click="changeFilterStatus('attackFilter6000')"
                  >
                    6000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter6500,
                      'btn-active-bg': filterVaribleSet.attackFilter6500,
                    }"
                    @click="changeFilterStatus('attackFilter6500')"
                  >
                    6500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter7000,
                      'btn-active-bg': filterVaribleSet.attackFilter7000,
                    }"
                    @click="changeFilterStatus('attackFilter7000')"
                  >
                    7000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter7500,
                      'btn-active-bg': filterVaribleSet.attackFilter7500,
                    }"
                    @click="changeFilterStatus('attackFilter7500')"
                  >
                    7500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter8000,
                      'btn-active-bg': filterVaribleSet.attackFilter8000,
                    }"
                    @click="changeFilterStatus('attackFilter8000')"
                  >
                    8000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter8500,
                      'btn-active-bg': filterVaribleSet.attackFilter8500,
                    }"
                    @click="changeFilterStatus('attackFilter8500')"
                  >
                    8500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter9000,
                      'btn-active-bg': filterVaribleSet.attackFilter9000,
                    }"
                    @click="changeFilterStatus('attackFilter9000')"
                  >
                    9000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter9500,
                      'btn-active-bg': filterVaribleSet.attackFilter9500,
                    }"
                    @click="changeFilterStatus('attackFilter9500')"
                  >
                    9500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter10000,
                      'btn-active-bg': filterVaribleSet.attackFilter10000,
                    }"
                    @click="changeFilterStatus('attackFilter10000')"
                  >
                    10000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter10500,
                      'btn-active-bg': filterVaribleSet.attackFilter10500,
                    }"
                    @click="changeFilterStatus('attackFilter10500')"
                  >
                    10500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter11000,
                      'btn-active-bg': filterVaribleSet.attackFilter11000,
                    }"
                    @click="changeFilterStatus('attackFilter11000')"
                  >
                    11000
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '稀有度'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterRR,
                      'btn-active-bg': filterVaribleSet.rareFilterRR,
                    }"
                    @click="changeFilterStatus('rareFilterRR')"
                  >
                    RR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterSSP,
                      'btn-active-bg': filterVaribleSet.rareFilterSSP,
                    }"
                    @click="changeFilterStatus('rareFilterSSP')"
                  >
                    SSP
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterLRR,
                      'btn-active-bg': filterVaribleSet.rareFilterLRR,
                    }"
                    @click="changeFilterStatus('rareFilterLRR')"
                  >
                    LRR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilteR,
                      'btn-active-bg': filterVaribleSet.rareFilterR,
                    }"
                    @click="changeFilterStatus('rareFilterR')"
                  >
                    R
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterSR,
                      'btn-active-bg': filterVaribleSet.rareFilterSR,
                    }"
                    @click="changeFilterStatus('rareFilterSR')"
                  >
                    SR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterOFR,
                      'btn-active-bg': filterVaribleSet.rareFilterOFR,
                    }"
                    @click="changeFilterStatus('rareFilterOFR')"
                  >
                    OFR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterU,
                      'btn-active-bg': filterVaribleSet.rareFilterU,
                    }"
                    @click="changeFilterStatus('rareFilterU')"
                  >
                    U
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterC,
                      'btn-active-bg': filterVaribleSet.rareFilterC,
                    }"
                    @click="changeFilterStatus('rareFilterC')"
                  >
                    C
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterCR,
                      'btn-active-bg': filterVaribleSet.rareFilterCR,
                    }"
                    @click="changeFilterStatus('rareFilterCR')"
                  >
                    CR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterRRR,
                      'btn-active-bg': filterVaribleSet.rareFilterRRR,
                    }"
                    @click="changeFilterStatus('rareFilterRRR')"
                  >
                    RRR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterCC,
                      'btn-active-bg': filterVaribleSet.rareFilterCC,
                    }"
                    @click="changeFilterStatus('rareFilterCC')"
                  >
                    CC
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterPR,
                      'btn-active-bg': filterVaribleSet.rareFilterPR,
                    }"
                    @click="changeFilterStatus('rareFilterPR')"
                  >
                    PR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterTD,
                      'btn-active-bg': filterVaribleSet.rareFilterTD,
                    }"
                    @click="changeFilterStatus('rareFilterTD')"
                  >
                    TD
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterSP,
                      'btn-active-bg': filterVaribleSet.rareFilterSP,
                    }"
                    @click="changeFilterStatus('rareFilterSP')"
                  >
                    SP
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterN,
                      'btn-active-bg': filterVaribleSet.rareFilterN,
                    }"
                    @click="changeFilterStatus('rareFilterN')"
                  >
                    N
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterLRP,
                      'btn-active-bg': filterVaribleSet.rareFilterLRP,
                    }"
                    @click="changeFilterStatus('rareFilterLRP')"
                  >
                    LRP
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterSIR,
                      'btn-active-bg': filterVaribleSet.rareFilterSIR,
                    }"
                    @click="changeFilterStatus('rareFilterSIR')"
                  >
                    SIR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer class="sidebar-filter-footer">
          <button
            :class="{
              'apply-btn': !applyBtnStatus,
              'apply-btn-active': applyBtnStatus,
            }"
            @click="handleApplyStatus"
          >
            <span>Apply</span>
          </button>
        </footer>
      </section>

      <section v-show="currentSidebar === 'open-deck'" class="sidebar-deck">
        <header class="sidebar-header">
          <div>
            <p>牌組製作</p>
            <p>
              已選擇 {{ selectedCards.length }} 張卡片，總價 ¥{{ countDeck }}
            </p>
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
            <TypeGroup class="flex-none stroke-2 size-6" />
            類型
          </button>
          <button @click="handleSwitchBtnClick('TYPE')" v-else>
            <TypeGroup class="flex-none stroke-2 size-6" />
            類型
          </button>
          <button id="color-btn-active" v-if="sortStatus === 'COLOR'">
            <TypeGroup class="flex-none stroke-2 size-6" />
            顏色
          </button>
          <button @click="handleSwitchBtnClick('COLOR')" v-else>
            <TypeGroup class="flex-none stroke-2 size-6" />
            顏色
          </button>
          <button id="level-btn-active" v-if="sortStatus === 'LEVEL'">
            <TypeGroup class="flex-none stroke-2 size-6" />
            等級
          </button>
          <button @click="handleSwitchBtnClick('LEVEL')" v-else>
            <TypeGroup class="flex-none stroke-2 size-6" />
            等級
          </button>
          <button id="rare-btn-active" v-if="sortStatus === 'RARE'">
            <TypeGroup class="flex-none stroke-2 size-6" />
            稀有度
          </button>
          <button @click="handleSwitchBtnClick('RARE')" v-else>
            <TypeGroup class="flex-none stroke-2 size-6" />
            稀有度
          </button>
          <button id="product-btn-active" v-if="sortStatus === 'PRODUCT'">
            <TypeGroup class="flex-none stroke-2 size-6" />
            商品
          </button>
          <button @click="handleSwitchBtnClick('PRODUCT')" v-else>
            <TypeGroup class="flex-none stroke-2 size-6" />
            商品
          </button>
        </div>
        <div class="sidebar-deck-control" v-if="sidebarSelectedStatus === true">
          <button class="cash" @click="showCardPrice = !showCardPrice">
            <Cash class="flex-none size-5 md:size-6" />
          </button>
          <span class="flex-none font-mono divder text-zinc-500/50"> | </span>

          <button
            id="plus-active"
            @click="changeTypeToAdd"
            v-if="editType === 'ADD_CARD'"
          >
            <Plus class="stroke-2 size-6" />
          </button>
          <button
            class="plus"
            @click="changeTypeToAdd"
            v-else="editType === 'CHECK_INFO'"
          >
            <Plus class="stroke-2 size-6" />
          </button>

          <button
            id="minus-active"
            @click="changeTypeToDelete"
            v-if="editType === 'DELETE_CARD'"
          >
            <Minus class="stroke-2 size-6" />
          </button>
          <button class="minus" @click="changeTypeToDelete" v-else>
            <Minus class="stroke-2 size-6" />
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
                  @click="
                    checkTypeAndRunFunction(card, index, sortedTitleIndex)
                  "
                >
                  <div class="card-price" v-if="showCardPrice">
                    <CashJP class="currency-icon" />
                    <span>{{ card.price.number }}</span>
                    <span>{{ card.rare }}</span>
                  </div>
                  <Card>
                    <div class="card-image">
                      <img :src="card.cover" />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="deck-save" v-if="settingDeckStatus === true">
          <div class="deck-save-title-section">
            <div class="deck-save-title-section-top">
              <Flag class="stroke-2 size-5" />
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
              <Flag class="stroke-2 size-5" />
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
          <div
            class="deck-save-covercard-section"
            v-if="selectedCards.length > 0"
          >
            <div class="deck-save-covercard-section-top">
              <Flag class="stroke-2 size-5" />
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
            <span>
              下一步
              <ArrowR class="stroke-2 size-6" />
            </span>
          </button>
          <div
            class="sidebar-footer-box"
            v-else-if="settingDeckStatus === true"
          >
            <button id="sidebar-footer-active" @click="finalStep">
              <span>
                完成
                <ArrowR class="stroke-2 size-6" />
              </span>
            </button>
          </div>
          <button v-else>
            <span>
              下一步
              <ArrowR class="stroke-2 size-6" />
            </span>
          </button>
        </footer>
      </section>
    </nav>

    <div class="main" :style="{ marginLeft: sidebarMarginLeft + 'px' }">
      <div
        class="main-info"
        :class="{
          'main-info-red': randomColor == 'red',
          'main-info-yellow': randomColor == 'yellow',
          'main-info-green': randomColor == 'green',
          'main-info-blue': randomColor == 'blue',
          'main-info-purple': randomColor == 'purple',
        }"
      >
        <header
          class="main-info-header"
          :class="{
            'main-info-header-red': randomColor == 'red',
            'main-info-header-yellow': randomColor == 'yellow',
            'main-info-header-green': randomColor == 'green',
            'main-info-header-blue': randomColor == 'blue',
            'main-info-header-purple': randomColor == 'purple',
          }"
        >
          <button
              @click="goBack"
              class="flex-none p-1 text-white rounded-full bg-black/50 default-transition hover:bg-zinc-800/50"
            >
            <AngleL class="stroke-[1.5] size-6" />
          </button>

          <div class="w-full min-w-0 text-lg font-bold text-white md:text-2xl">
            <h2 class="text-2xl font-bold truncate w-72">
              {{ translatedSeriesInfo.name }}
            </h2>
          </div>
          <Notice />
          <div
            class="items-center gap-1 text-white rounded-full login-btn bg-black/50 default-transition hover:bg-zinc-800/50"
          >
            <NavLoginBtn />
          </div>
        </header>
        <button @click="toggleSidebar('open-filter')" class="toggle-filter">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#155E75"
            aria-hidden="true"
            data-slot="icon"
          >
            <path
              fill-rule="evenodd"
              d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
        <button @click="toggleSidebar('open-deck')" class="toggle-deck">
          <div class="toggle-deck-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#C3D7D5"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                d="M16.5 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3v-6A4.5 4.5 0 0 1 10.5 6h6Z"
              ></path>
              <path
                d="M18 7.5a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3v-7.5a3 3 0 0 1 3-3H18Z"
              ></path>
            </svg>
            <p>{{ selectedCards.length }}</p>
          </div>
        </button>
        <section class="info-container">
          <img
            v-if="translatedSeriesInfo.cover"
            :src="translatedSeriesInfo.cover"
          />
          <img v-else src="@/img/cover.png" />
          <div flex-col class="inner-info-container">
            <span class="text-white"
              ><i class="fa-regular fa-clone"></i>
              <span
                v-for="(code, index) in translatedSeriesInfo.code"
                :key="index"
                >{{ code
                }}{{
                  index == translatedSeriesInfo.code.length - 1 ? '' : ', '
                }}</span
              ></span
            >
            <h1 class="text-white">{{ translatedSeriesInfo.name }}</h1>
            <div class="text-white">
              <div v-if="translatedSeriesInfo.sellAt">
                <Release class="size-5 md:size-6"/>
                <span
                  >最新發布{{
                    seriesInfo.sellAt[seriesInfo.sellAt.length - 1]
                  }}</span
                >
              </div>
              <div v-else>
                <Release class="size-5 md:size-6"/>
                <span>最新發布</span>
              </div>
              <div v-if="seriesCardListLength > 0">
                <i class="fa-regular fa-clone"></i
                ><span>總數{{ seriesCardListLength }}張</span>
              </div>
              <div v-else>
                <i class="fa-regular fa-clone"></i><span>總數 0 張</span>
              </div>
              <div>
                <Filter class="stroke-2 size-5 md:size-6" />
                <span>篩選出{{ seriesCardList.length }}張</span>
              </div>
            </div>
          </div>
        </section>

        <section class="info-container-filter">
          <div class="card-control">
            <p>
              請在
              <Filter class="stroke-2 size-5 md:size-6" />
              新增常用篩選
            </p>
            <div>
              <button
                @click="toggleFilter('open-filter')"
                class="toggle-inner-filter"
              >
                <Filter class="size-7" />
              </button>
              <button
                @click="view = 'card-sheet'"
                :class="{ active: view === 'card-sheet' }"
                class="icon-control change-sheet"
              >
                <Table class="size-6" />
              </button>
              <button
                @click="view = 'card-info'"
                :class="{ active: view === 'card-info' }"
                class="icon-control change-info"
              >
                <CardInfo class="size-6" />
              </button>
            </div>
          </div>
          <div v-if="view === 'card-sheet'" class="card-sheet">
            <div class="row">
              <div
                class="col-Sheet"
                v-for="(card, index) in translatedSeriesCardList"
                :key="card.id"
                @click.stop="getCardInfoAndShow(seriesCardList[index])"
              >
                <div class="card-image">
                  <img :src="card.cover" />
                  <div>
                    <p>{{ card.id }}</p>
                    <h3>{{ card.title }}</h3>
                  </div>
                  <button
                    @click.stop="addCard(seriesCardList[index])"
                    class="group-hover:bg-zinc-800 group-hover:shadow group-hover:shadow-zinc-800/50 flex-none rounded-full p-1 shadow-xl will-change-[background,shadow] transition-all"
                  >
                    <AddCard class="stroke-2 size-7" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="seriesCardList.length > 0 && view === 'card-info'"
            class="card-info"
          >
            <div class="row">
              <div
                class="col-Info"
                v-for="(card, index) in translatedSeriesCardList"
                :key="index"
                @click.stop="addCard(seriesCardList[index])"
              >
                <div class="card-info-image">
                  <Card>
                    <img :src="card.cover" />
                  </Card>
                  <div
                    class="card-inner-info"
                    @click.stop="getCardInfoAndShow(seriesCardList[index])"
                  >
                    <div class="card-inner-info-header">
                      <p>{{ card.id }}</p>
                      <p>{{ card.rare }}</p>
                    </div>
                    <h3>{{ card.title }}</h3>
                    <div class="details">
                      <div v-if="card.type === 'キャラ'">
                        <span :class="`bg-${card.color}`">類型</span>角色
                      </div>
                      <div v-else-if="card.type === 'イベント'">
                        <span :class="`bg-${card.color}`">類型</span>事件
                      </div>
                      <div v-else-if="card.type === 'クライマックス'">
                        <span :class="`bg-${card.color}`">類型</span>名場
                      </div>
                      <div>
                        <span :class="`bg-${card.color}`">魂傷</span
                        >{{ card.soul }}
                      </div>
                      <div>
                        <span :class="`bg-${card.color}`">等級</span
                        >{{ card.level }}
                      </div>
                      <div>
                        <span :class="`bg-${card.color}`">攻擊</span
                        >{{ card.attack }}
                      </div>
                      <div>
                        <span :class="`bg-${card.color}`">費用</span
                        >{{ card.cost }}
                      </div>
                    </div>
                    <div class="price-download">
                      <p>${{ card.price.number }}</p>
                      <button @click.stop="addCard(seriesCardList[index])">
                        <AddCard class="stroke-2 size-7" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="card-info-empty">
            <div class="card-info-empty-content">
              <div class="card-info-empty-content-box">
                <img src="@/img/no-data.png" alt="" />
                <h2>沒東西</h2>
                <p>何もないことは、何でもあることだ。 - YC</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <section v-show="currentMain === 'open-filter'" class="sidebar-filter">
        <header class="sidebar-filter-header">
          <div>
            <p>卡片篩選</p>
            <p>
              {{ filterCount }} 篩選、{{ sortCount }} 排序、關鍵字 : "{{
                filterVaribleSet.keyWord.trim()
              }}"
            </p>
          </div>
          <div>
            <button class="icon del-btn">
              <i class="fa-solid fa-trash"></i>
            </button>
            <button class="icon open-btn">
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <button @click="closeSidebar" class="icon xmark-btn">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </header>

        <div class="sidebar-filter-content">
          <div
            class="whole-menu"
            v-for="(filter, index) in filters"
            :key="index"
          >
            <div class="menu" @click="MenuFilter(index)">
              <i :class="[filter.icon]"></i>
              <p>{{ filter.name }}</p>
              <button
                class="icon del"
                v-if="filter.delButton"
                @click.stop="resetFilter(filter.filterTag)"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
              <button class="icon check" v-if="filter.checkButton">
                <i class="fa-regular fa-circle-check"></i>
              </button>
              <button class="open">
                <i
                  class="fa fa-chevron-down"
                  :style="{ transform: filter.checked ? 'rotate(180deg)' : '' }"
                ></i>
              </button>
            </div>
            <div class="menu-inner" v-show="filter.checked">
              <div v-if="filter.name === '常用'">
                <span
                  >"+"
                  按鈕可以儲存當下篩選內容，長按儲存篩選可以進行刪除。</span
                >
                <div class="myfilter-button-group">
                  <button class="plus-btn-used" @click="saveMyFilters">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                  <button
                    class="myfilter-button-item"
                    v-for="(myfilter, index) in myFiltersGroup"
                    :key="index"
                    @click="handleUseMyFiltersBtn(myfilter)"
                    @mousedown="countMouseUp"
                    @mouseup="deleteMyFilters(myfilter)"
                  >
                    {{ myfilter.name }}
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '關鍵字'">
                <span
                  >可輸入 "空白" 來複合搜尋，"AND/OR" 可以進行切換。
                  <br />當前搜尋內容： {{ filterVaribleSet.keyWord.trim() }}
                </span>
                <div
                  class="input-keyword"
                  :class="{
                    'input-keyword-haveValue':
                      filterVaribleSet.keyWord.trim() != '',
                  }"
                >
                  <ArrowR class="stroke-2 size-6" />
                  <input
                    class="w-full p-0 bg-transparent border-transparent focus:ring-0 placeholder:text-zinc-500 focus:outline-none"
                    type="text"
                    placeholder="關鍵字搜尋"
                    v-model="filterVaribleSet.keyWord"
                    @input="handleKeyWord"
                  />
                  <div class="input-keyword-btn">
                    <button @click="changeReplaceKeyWord">
                      <span>{{ replaceWord }}</span>
                    </button>
                    <!-- <button><span>OR</span></button> -->
                    <button class="plus-btn" @click="saveKeyWord">
                      <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
                <p class="keyword-below">
                  "+" 按鈕可以儲存關鍵字，長按儲存關鍵字可以進行刪除。
                </p>
                <span v-if="keyWordGroup.length === 0">無資料</span>
                <div class="keyword-button-group">
                  <button
                    class="keyword-button-item"
                    v-for="(keyWord, index) in keyWordGroup"
                    :key="index"
                    @click="handleUseKeyWordBtn(keyWord)"
                    @mousedown="countMouseUp"
                    @mouseup="deleteKeyWord(keyWord)"
                  >
                    {{ keyWord }}
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '排序'">
                <div class="menu-inner-slider-btn">
                  <button
                    :class="{
                      'btn-default-bg':
                        !filterVaribleSet.levelDownSort ||
                        !filterVaribleSet.levelUpSort,
                      'btn-active-bg':
                        filterVaribleSet.levelDownSort ||
                        filterVaribleSet.levelUpSort,
                    }"
                    @click="changeSortStatus('level')"
                  >
                    <div
                      class="slider-btn"
                      :class="{
                        'slider-btn-active':
                          filterVaribleSet.levelDownSort ||
                          filterVaribleSet.levelUpSort,
                      }"
                    >
                      {{ levelOrder > 0 ? levelOrder : '' }}
                    </div>
                    等級
                    <i
                      class="fa-solid fa-arrow-up"
                      :class="{
                        'arrow-up': !filterVaribleSet.levelUpSort,
                        'arrow-down': filterVaribleSet.levelUpSort,
                      }"
                    ></i>
                  </button>
                  <button
                    :class="{
                      'btn-default-bg':
                        !filterVaribleSet.colorDownSort ||
                        !filterVaribleSet.colorUpSort,
                      'btn-active-bg':
                        filterVaribleSet.colorDownSort ||
                        filterVaribleSet.colorUpSort,
                    }"
                    @click="changeSortStatus('color')"
                  >
                    <div
                      class="slider-btn"
                      :class="{
                        'slider-btn-active':
                          filterVaribleSet.colorDownSort ||
                          filterVaribleSet.colorUpSort,
                      }"
                    >
                      {{ colorOrder > 0 ? colorOrder : '' }}
                    </div>
                    顏色
                    <i
                      class="fa-solid fa-arrow-up"
                      :class="{
                        'arrow-up': !filterVaribleSet.colorUpSort,
                        'arrow-down': filterVaribleSet.colorUpSort,
                      }"
                    ></i>
                  </button>
                  <button
                    :class="{
                      'btn-default-bg':
                        !filterVaribleSet.priceDownSort ||
                        !filterVaribleSet.priceUpSort,
                      'btn-active-bg':
                        filterVaribleSet.priceDownSort ||
                        filterVaribleSet.priceUpSort,
                    }"
                    @click="changeSortStatus('price')"
                  >
                    <div
                      class="slider-btn"
                      :class="{
                        'slider-btn-active':
                          filterVaribleSet.priceDownSort ||
                          filterVaribleSet.priceUpSort,
                      }"
                    >
                      {{ priceOrder > 0 ? priceOrder : '' }}
                    </div>
                    價格
                    <i
                      class="fa-solid fa-arrow-up"
                      :class="{
                        'arrow-up': !filterVaribleSet.priceUpSort,
                        'arrow-down': filterVaribleSet.priceUpSort,
                      }"
                    ></i>
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '類型'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.typeCharacter,
                      'btn-active-bg': filterVaribleSet.typeCharacter,
                    }"
                    @click="changeFilterStatus('typeCharacter')"
                  >
                    角色
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.typeEvent,
                      'btn-active-bg': filterVaribleSet.typeEvent,
                    }"
                    @click="changeFilterStatus('typeEvent')"
                  >
                    事件
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.typeScene,
                      'btn-active-bg': filterVaribleSet.typeScene,
                    }"
                    @click="changeFilterStatus('typeScene')"
                  >
                    名場
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '等級'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.levelFilter0,
                      'btn-active-bg': filterVaribleSet.levelFilter0,
                    }"
                    @click="changeFilterStatus('levelFilter0')"
                  >
                    0
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.levelFilter1,
                      'btn-active-bg': filterVaribleSet.levelFilter1,
                    }"
                    @click="changeFilterStatus('levelFilter1')"
                  >
                    1
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.levelFilter2,
                      'btn-active-bg': filterVaribleSet.levelFilter2,
                    }"
                    @click="changeFilterStatus('levelFilter2')"
                  >
                    2
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.levelFilter3,
                      'btn-active-bg': filterVaribleSet.levelFilter3,
                    }"
                    @click="changeFilterStatus('levelFilter3')"
                  >
                    3
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '顏色'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.colorFilterYellow,
                      'btn-active-bg': filterVaribleSet.colorFilterYellow,
                    }"
                    @click="changeFilterStatus('colorFilterYellow')"
                  >
                    黃色
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.colorFilterRed,
                      'btn-active-bg': filterVaribleSet.colorFilterRed,
                    }"
                    @click="changeFilterStatus('colorFilterRed')"
                  >
                    紅色
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.colorFilterBlue,
                      'btn-active-bg': filterVaribleSet.colorFilterBlue,
                    }"
                    @click="changeFilterStatus('colorFilterBlue')"
                  >
                    藍色
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '費用'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.costFilter0,
                      'btn-active-bg': filterVaribleSet.costFilter0,
                    }"
                    @click="changeFilterStatus('costFilter0')"
                  >
                    0
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.costFilter1,
                      'btn-active-bg': filterVaribleSet.costFilter1,
                    }"
                    @click="changeFilterStatus('costFilter1')"
                  >
                    1
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.costFilter2,
                      'btn-active-bg': filterVaribleSet.costFilter2,
                    }"
                    @click="changeFilterStatus('costFilter2')"
                  >
                    2
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '魂傷'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.soulFilter0,
                      'btn-active-bg': filterVaribleSet.soulFilter0,
                    }"
                    @click="changeFilterStatus('soulFilter0')"
                  >
                    0
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.soulFilter1,
                      'btn-active-bg': filterVaribleSet.soulFilter1,
                    }"
                    @click="changeFilterStatus('soulFilter1')"
                  >
                    1
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.soulFilter2,
                      'btn-active-bg': filterVaribleSet.soulFilter2,
                    }"
                    @click="changeFilterStatus('soulFilter2')"
                  >
                    2
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '攻擊力'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter0,
                      'btn-active-bg': filterVaribleSet.attackFilter0,
                    }"
                    @click="changeFilterStatus('attackFilter0')"
                  >
                    0
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter500,
                      'btn-active-bg': filterVaribleSet.attackFilter500,
                    }"
                    @click="changeFilterStatus('attackFilter500')"
                  >
                    500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter1000,
                      'btn-active-bg': filterVaribleSet.attackFilter1000,
                    }"
                    @click="changeFilterStatus('attackFilter1000')"
                  >
                    1000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter1500,
                      'btn-active-bg': filterVaribleSet.attackFilter1500,
                    }"
                    @click="changeFilterStatus('attackFilter1500')"
                  >
                    1500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter2000,
                      'btn-active-bg': filterVaribleSet.attackFilter2000,
                    }"
                    @click="changeFilterStatus('attackFilter2000')"
                  >
                    2000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter2500,
                      'btn-active-bg': filterVaribleSet.attackFilter2500,
                    }"
                    @click="changeFilterStatus('attackFilter2500')"
                  >
                    2500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter3000,
                      'btn-active-bg': filterVaribleSet.attackFilter3000,
                    }"
                    @click="changeFilterStatus('attackFilter3000')"
                  >
                    3000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter3500,
                      'btn-active-bg': filterVaribleSet.attackFilter3500,
                    }"
                    @click="changeFilterStatus('attackFilter3500')"
                  >
                    3500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter4000,
                      'btn-active-bg': filterVaribleSet.attackFilter4000,
                    }"
                    @click="changeFilterStatus('attackFilter4000')"
                  >
                    4000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter4500,
                      'btn-active-bg': filterVaribleSet.attackFilter4500,
                    }"
                    @click="changeFilterStatus('attackFilter4500')"
                  >
                    4500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter5000,
                      'btn-active-bg': filterVaribleSet.attackFilter5000,
                    }"
                    @click="changeFilterStatus('attackFilter5000')"
                  >
                    5000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter5500,
                      'btn-active-bg': filterVaribleSet.attackFilter5500,
                    }"
                    @click="changeFilterStatus('attackFilter5500')"
                  >
                    5500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter6000,
                      'btn-active-bg': filterVaribleSet.attackFilter6000,
                    }"
                    @click="changeFilterStatus('attackFilter6000')"
                  >
                    6000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter6500,
                      'btn-active-bg': filterVaribleSet.attackFilter6500,
                    }"
                    @click="changeFilterStatus('attackFilter6500')"
                  >
                    6500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter7000,
                      'btn-active-bg': filterVaribleSet.attackFilter7000,
                    }"
                    @click="changeFilterStatus('attackFilter7000')"
                  >
                    7000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter7500,
                      'btn-active-bg': filterVaribleSet.attackFilter7500,
                    }"
                    @click="changeFilterStatus('attackFilter7500')"
                  >
                    7500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter8000,
                      'btn-active-bg': filterVaribleSet.attackFilter8000,
                    }"
                    @click="changeFilterStatus('attackFilter8000')"
                  >
                    8000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter8500,
                      'btn-active-bg': filterVaribleSet.attackFilter8500,
                    }"
                    @click="changeFilterStatus('attackFilter8500')"
                  >
                    8500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter9000,
                      'btn-active-bg': filterVaribleSet.attackFilter9000,
                    }"
                    @click="changeFilterStatus('attackFilter9000')"
                  >
                    9000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter9500,
                      'btn-active-bg': filterVaribleSet.attackFilter9500,
                    }"
                    @click="changeFilterStatus('attackFilter9500')"
                  >
                    9500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter10000,
                      'btn-active-bg': filterVaribleSet.attackFilter10000,
                    }"
                    @click="changeFilterStatus('attackFilter10000')"
                  >
                    10000
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter10500,
                      'btn-active-bg': filterVaribleSet.attackFilter10500,
                    }"
                    @click="changeFilterStatus('attackFilter10500')"
                  >
                    10500
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.attackFilter11000,
                      'btn-active-bg': filterVaribleSet.attackFilter11000,
                    }"
                    @click="changeFilterStatus('attackFilter11000')"
                  >
                    11000
                  </button>
                </div>
              </div>
              <div v-else-if="filter.name === '稀有度'">
                <div class="menu-inner-btn">
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterRR,
                      'btn-active-bg': filterVaribleSet.rareFilterRR,
                    }"
                    @click="changeFilterStatus('rareFilterRR')"
                  >
                    RR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterSSP,
                      'btn-active-bg': filterVaribleSet.rareFilterSSP,
                    }"
                    @click="changeFilterStatus('rareFilterSSP')"
                  >
                    SSP
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterLRR,
                      'btn-active-bg': filterVaribleSet.rareFilterLRR,
                    }"
                    @click="changeFilterStatus('rareFilterLRR')"
                  >
                    LRR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilteR,
                      'btn-active-bg': filterVaribleSet.rareFilterR,
                    }"
                    @click="changeFilterStatus('rareFilterR')"
                  >
                    R
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterSR,
                      'btn-active-bg': filterVaribleSet.rareFilterSR,
                    }"
                    @click="changeFilterStatus('rareFilterSR')"
                  >
                    SR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterOFR,
                      'btn-active-bg': filterVaribleSet.rareFilterOFR,
                    }"
                    @click="changeFilterStatus('rareFilterOFR')"
                  >
                    OFR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterU,
                      'btn-active-bg': filterVaribleSet.rareFilterU,
                    }"
                    @click="changeFilterStatus('rareFilterU')"
                  >
                    U
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterC,
                      'btn-active-bg': filterVaribleSet.rareFilterC,
                    }"
                    @click="changeFilterStatus('rareFilterC')"
                  >
                    C
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterCR,
                      'btn-active-bg': filterVaribleSet.rareFilterCR,
                    }"
                    @click="changeFilterStatus('rareFilterCR')"
                  >
                    CR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterRRR,
                      'btn-active-bg': filterVaribleSet.rareFilterRRR,
                    }"
                    @click="changeFilterStatus('rareFilterRRR')"
                  >
                    RRR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterCC,
                      'btn-active-bg': filterVaribleSet.rareFilterCC,
                    }"
                    @click="changeFilterStatus('rareFilterCC')"
                  >
                    CC
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterPR,
                      'btn-active-bg': filterVaribleSet.rareFilterPR,
                    }"
                    @click="changeFilterStatus('rareFilterPR')"
                  >
                    PR
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterTD,
                      'btn-active-bg': filterVaribleSet.rareFilterTD,
                    }"
                    @click="changeFilterStatus('rareFilterTD')"
                  >
                    TD
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterSP,
                      'btn-active-bg': filterVaribleSet.rareFilterSP,
                    }"
                    @click="changeFilterStatus('rareFilterSP')"
                  >
                    SP
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterN,
                      'btn-active-bg': filterVaribleSet.rareFilterN,
                    }"
                    @click="changeFilterStatus('rareFilterN')"
                  >
                    N
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterLRP,
                      'btn-active-bg': filterVaribleSet.rareFilterLRP,
                    }"
                    @click="changeFilterStatus('rareFilterLRP')"
                  >
                    LRP
                  </button>
                  <button
                    :class="{
                      'btn-default-bg': !filterVaribleSet.rareFilterSIR,
                      'btn-active-bg': filterVaribleSet.rareFilterSIR,
                    }"
                    @click="changeFilterStatus('rareFilterSIR')"
                  >
                    SIR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer class="sidebar-filter-footer">
          <button
            :class="{
              'apply-btn': !applyBtnStatus,
              'apply-btn-active': applyBtnStatus,
            }"
            @click="handleApplyStatus"
          >
            <span>Apply</span>
          </button>
        </footer>
      </section>
    </div>
  </div>
</template>
<style src="@/assets/base.css" scoped></style>
<style src="@/assets/css/card-series/main-content.css" scoped></style>
<style src="@/assets/css/card-series/sidebar-filter.css" scoped></style>
<style src="@/assets/css/card-series/sidebar-deck.css" scoped></style>
<style scoped>
.hidden {
  display: none;
}
</style>
