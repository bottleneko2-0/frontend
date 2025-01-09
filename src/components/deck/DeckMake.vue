<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDeckMakeStore } from '@/stores/deck-make'

import Swal from 'sweetalert2'
import Card from '@/components/card/Card.vue'
import Cash from '@/components/svg/Cash.vue'
import CashJP from '@/components/svg/CashJP.vue'
import Flag from '@/components/svg/Flag.vue'
import Minus from '@/components/svg/Minus.vue'
import Plus from '@/components/svg/Plus.vue'
import TypeGroup from '@/components/svg/TypeGroup.vue'

const router = useRouter()

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
        <Cash class="size-6" />
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
              @click="checkTypeAndRunFunction(card, index, sortedTitleIndex)"
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
      <div class="deck-save-covercard-section" v-if="selectedCards.length > 0">
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
      <div class="sidebar-footer-box" v-else-if="settingDeckStatus === true">
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
          <CashJP class="flex-none size-6" />
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
