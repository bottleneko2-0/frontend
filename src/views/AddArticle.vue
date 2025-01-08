<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import MainFooter from '@/components/home/MainFooter.vue'
import Notice from '@/components/notice/Notice.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import Editor from '@tinymce/tinymce-vue'
import AngleL from '@/components/svg/AngleL.vue'
import AngleR from '@/components/svg/AngleR.vue'
import Earth from '@/components/svg/Earth.vue'
import ArrowR from '@/components/svg/ArrowR.vue'
import ArrowT from '@/components/svg/ArrowT.vue'
import Null from '@/components/svg/Null.vue'
import Ball from '@/components/svg/Ball.vue'
import Banner from '@/components/svg/Banner.vue'
import ChatBox from '@/components/svg/ChatBox.vue'
import Message from '@/components/svg/Message.vue'
import Triangle from '@/components/svg/Triangle.vue'

const router = useRouter()
const Tiny_API_KEY = import.meta.env.VITE_Tiny_API_KEY

const token = ref(localStorage.getItem('token'))
const title = ref('')
const content = ref('')
const imageUrl = ref(null)
const uploadedImage = ref(null)
const deckId = ref(null)
const decks = ref([])
const filteredDecks = ref([])
const menuExpanded = ref(false)
const menuHeight = ref(0)
const searchQuery = ref('')
const seriesName = ref('選擇牌組')

const submitArticle = async () => {
  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('content', content.value)
  formData.append('deck_id', parseInt(deckId.value, 10))

  if (uploadedImage.value) {
    formData.append('picture', uploadedImage.value)
  } else if (imageUrl.value) {
    formData.append('post_picture', imageUrl.value)
  }
  const API_URL = import.meta.env.VITE_API_URL
  try {
    if (!title.value) {
      Swal.fire({
        icon: 'warning',
        title: '標題不能為空',
        color: '#e1e1e1',
        background: '#27272a',
      })
      return
    }

    const response = await axios.post(`${API_URL}/api/articles`, formData, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    })

    const postCode = response.data.post_code

    Swal.fire({
      icon: 'success',
      title: '成功',
      showConfirmButton: false,
      color: '#e1e1e1',
      background: '#27272a',
      timer: 1000,
    }).then(() => {
      router.push(`/social/${postCode}`)
    })
  } catch (error) {
    if (error.response && error.response.status === 403) {
      const BASE_URL = import.meta.env.VITE_BASE_URL
      Swal.fire({
        title: '請先登入',
        text: '登入後才能發布文章',
        icon: 'warning',
        confirmButtonText: '確定',
        color: '#e1e1e1',
        background: '#27272a',
      }).then(() => {
        window.location.href = `${BASE_URL}/login`
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: '新增文章失敗',
        color: '#e1e1e1',
        background: '#27272a',
      })
    }
  }
}

const handleButtonClick = (event) => {
  if (imageUrl.value) {
    imageUrl.value = null
    uploadedImage.value = null
    event.target.value = '' // 重置 input 的值
    event.preventDefault()
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadedImage.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const getUserDecks = async () => {
  if (!token.value) return
  const API_URL = import.meta.env.VITE_API_URL
  try {
    const res = await axios.get(`${API_URL}/decks`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    decks.value = res.data.decks
    filteredDecks.value = res.data.decks
  } catch (error) {
    console.error('獲取牌組資料失敗', error)
  }
}

const selectDeck = (deck) => {
  title.value = deck.deck_name
  seriesName.value = deck.deck_name
  imageUrl.value = deck.deck_cover
  deckId.value = deck.id
  menuExpanded.value = false
}

const toggleMenu = () => {
  menuExpanded.value = !menuExpanded.value
  if (menuExpanded.value) calculateMenuHeight()
}

const calculateMenuHeight = () => {
  menuHeight.value = 45 + filteredDecks.value.length * 35
}

const searchSeries = () => {
  if (!searchQuery.value.trim()) {
    filteredDecks.value = decks.value
  } else {
    const query = searchQuery.value.toLowerCase()
    filteredDecks.value = decks.value.filter((deck) =>
      deck.deck_name?.toLowerCase().includes(query)
    )
  }
  calculateMenuHeight()
}

const clearSearch = () => {
  searchQuery.value = ''
  filteredDecks.value = decks.value
  calculateMenuHeight()
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  getUserDecks()
})
</script>

<template>
  <SidebarGrid style="grid-area: sidebar" />
  <main>
    <header>
      <div class="pagebtn-area">
        <button class="page-btn" @click="goBack">
          <AngleL />
        </button>
        <button class="page-btn next-btn">
          <AngleR />
        </button>
        <h2>新增文章</h2>
      </div>
      <div class="btn-area">
        <button class="submit-btn" @click="submitArticle">
          <Earth />
          <span>送出</span>
          <ArrowR />
        </button>
        <Notice />
        <div class="user-sign">
          <NavLoginBtn />
        </div>
      </div>
    </header>
    <section class="title-area">
      <div class="title-area-container">
        <button class="upload-btn" @click="handleButtonClick">
          <ArrowT v-if="!imageUrl" />
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="預覽圖片"
            class="preview-image"
          />
          <input
            type="file"
            class="file-input"
            @change="handleFileUpload"
            accept="image/*"
            ref="fileInput"
          />
          <Null v-if="imageUrl" />
        </button>
        <div class="add-section">
          <div class="add-article">
            <Ball />
            <p>新增文章</p>
          </div>
          <input
            v-model="title"
            class="enter-title"
            type="text"
            placeholder="請輸入標題"
          />
          <div class="card-select-area" style="position: relative">
            <button class="card-select-btn" @click="toggleMenu">
              <Banner />
              <p>{{ seriesName }}</p>
            </button>
            <ul
              class="menu-area"
              v-show="menuExpanded"
              :style="{ height: menuHeight + 'px' }"
            >
              <li class="menu-search">
                <input
                  v-model="searchQuery"
                  @keyup="searchSeries"
                  class="keyword"
                  type="text"
                  placeholder="Keyword"
                />
                <button @click="clearSearch">✖</button>
              </li>

              <li
                class="menu"
                v-for="deck in filteredDecks"
                :key="deck.id"
                v-if="decks && decks.length"
                @click="selectDeck(deck)"
              >
                <Banner />
                <p class="text-xs truncate">{{ deck.deck_name }}</p>
              </li>
            </ul>

            <div class="cannot-change">
              <p>非必填，但新增文章後將無法更改牌組內容</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="text-area">
      <div class="edit-area">
        <div class="message-tag">
          <ChatBox />
        </div>

        <editor
          v-model="content"
          :api-key="Tiny_API_KEY"
          :init="{
            height: 415,
            menubar: false,
            plugins: 'lists link image',
            toolbar:
              'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent',
            content_style: 'body { background-color: #222F3E ;color: #FFF; }',
          }"
        />
      </div>
      <div class="message-area">
        <div class="user-message">
          <div class="message-user-img">
            <img src="/src/img/avatar.png" alt="" />
          </div>
          <div class="message">
            <Message />
            <input
              class="enter-message"
              type="text"
              placeholder="留言..."
              disabled
            />
            <button>
              <Triangle />
            </button>
          </div>
        </div>
        <span class="message-count">0則留言</span>
      </div>
    </section>
    <MainFooter />
  </main>
</template>

<style scoped>
svg {
  stroke-width: 1.5px;
}

.sidebar-container {
  position: fixed;
  top: 0;
}

.sidebar p {
  color: #a1a1aa;
  font-size: 16px;
  margin-top: 30px;
}

.pagebtn-area {
  position: relative;
  width: 20%;
  height: 64px;
  background-color: #32c9ff;
  min-width: 195px;
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
}

.next-btn {
  opacity: 0.3;
}

.btn-area {
  position: absolute;
  right: 30px;
  display: flex;
  gap: 8px;
}

.submit-btn {
  width: 100px;
  height: 36px;
  background-color: white;
  border-radius: 20px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #f59e0b;
  color: white;
  stroke: white;
}

.submit-btn:hover span {
  color: white;
}

.submit-btn:hover svg {
  stroke: white;
}

.submit-btn svg {
  width: 20px;
  height: 20px;
  stroke: #292828;
}

.submit-btn span {
  color: #292828;
  font-size: 15px;
  font-weight: 900;
}

main {
  overflow: hidden;
  margin: 0.5rem;
  margin-left: 270px;
  width: calc(100% - 278px);
  height: calc(100vh - 16px);
  border-radius: 20px;
  background-color: #32c9ff;
  scroll-behavior: smooth;
  overflow-y: scroll;
  scrollbar-width: none;
}

header {
  background-color: #32c9ff;
  border-radius: 20px 20px 0 0;
  width: calc(100% - 278px);
  height: 64px;
  display: flex;
  position: fixed;
  top: 8px;
  z-index: 4;
  align-items: center;
}

.title-area {
  width: 100%;
  height: 378px;
  margin-top: 72px;
  display: flex;
}

.title-area-container {
  width: 100%;
  margin-top: 88px;
  margin-left: 24px;
  display: flex;
}

.upload-btn {
  margin-top: 0;
  width: 240px;
  min-width: 240px;
  height: 240px;
  background-color: #333333;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.upload-btn svg {
  width: 85px;
  height: 85px;
  --tw-text-opacity: 1;
  color: rgb(228 228 231 / var(--tw-text-opacity, 1));
  visibility: hidden;
  opacity: 0;
  transition: ease 0.2s;
}

.upload-btn:hover svg {
  visibility: visible;
  opacity: 1;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.add-section {
  width: 100%;
  margin-left: 32px;
  margin-top: 53px;
}

.add-article {
  display: flex;
  margin-bottom: 8px;
}

.add-article svg {
  width: 24px;
  height: 24px;
  color: white;
}

.add-article p {
  margin-left: 4px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: white;
}

.enter-title {
  box-sizing: border-box;
  color: white;
  padding: 6px;
  border: none;
  display: flex;
  width: 90%;
  font-size: 80px;
  height: 105px;
  background-color: #32c9ff;
  border-bottom: 1px solid #99e4ff;
}

.enter-title:focus {
  outline: none;
}

.enter-title::placeholder {
  font-size: 80px;
  font-weight: 900;
}

.menu {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  color: white;
  cursor: pointer;
  gap: 5px;
}

.menu-area {
  display: grid;
  position: absolute;
  background-color: #20567a;
  border-radius: 7px;
  width: 270px;
  margin-top: 45px;
  margin-left: 5px;
  overflow: hidden;
  transition: height 1s ease;
  z-index: 3;
}

.menu-search {
  display: flex;
  align-items: center;
  padding: 10px;
  color: white;
  position: relative;
  width: 250px;
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
  width: 250px;
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

.card-select-area {
  width: 100%;
  display: flex;
  gap: 24px;
}

.card-select-btn {
  margin-top: 8px;
  width: 108px;
  height: 32px;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background-color: #2fb7e7;
  cursor: pointer;
}

.card-select-btn p {
  font-size: 16px;
  font-weight: 900;
  color: white;
  line-height: 16px;
  height: 16px;
  overflow: hidden;
}

.card-select-btn:hover {
  background-color: #2d7894;
}

.card-select-btn svg,
.menu svg {
  width: 24px;
  height: 24px;
  stroke: white;
}

.cannot-change {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.cannot-change p {
  font-size: 16px;
  color: white;
  font-weight: 900;
}

.text-area {
  box-sizing: border-box;
  height: 520px;
  display: flex;
  background: linear-gradient(
    to bottom,
    rgb(32, 99, 122) 100px,
    rgb(19, 22, 23) 450px
  );
}

.edit-area {
  width: 55%;
  height: 456px;
  padding: 8px;
  box-sizing: border-box;
  background-color: #1c3d4b;
  margin: 32px 0 0 24px;
  border-radius: 10px;
}

.enter-text {
  margin-top: 8px;
  border-radius: 10px;
  height: 392px;
  width: calc(100% - 8px);
  background-color: #222f3e;
  border: 2px solid black;
}

.message-tag {
  width: 50%;
  background-color: #1c3d4b;
  display: flex;
  gap: 8px;
}

.message-tag svg {
  width: 32px;
  height: 32px;
  stroke: rgb(116, 112, 112);
}

.message-tag input {
  box-sizing: border-box;
  width: 100%;
  background-color: transparent;
  border: none;
  color: rgb(116, 112, 112);
  font-size: 16px;
  border-bottom: 2px solid rgb(116, 112, 112);
}

.message-tag input:focus {
  outline: none;
}

.message-area {
  width: 45%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  margin-top: 36px;
  margin-left: 16px;
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
  background-color: #1c3d4b;
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

.message-count {
  color: white;
  position: absolute;
  top: 56px;
  right: 40px;
  font-weight: bold;
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

footer {
  background: linear-gradient(
    to bottom,
    rgb(19, 22, 23) 100px,
    rgb(32, 99, 122) 300px
  );
  width: 100%;
}

.main-footer {
  background: linear-gradient(to bottom, rgb(19, 22, 23), #121212);
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

input:disabled {
  cursor: not-allowed;
}

@media screen and (max-width: 1200px) {
  body {
    min-width: 100%;
  }

  .sidebar-container {
    top: auto;
  }

  main {
    margin-left: 0;
    width: 100%;
  }

  header {
    border-radius: 0;
    width: 100%;
    top: 0;
  }

  .next-btn {
    display: none;
  }

  .title-area {
    width: 100%;
    margin-top: 0;
    margin-left: 0;
    height: 560px;
  }

  .title-area-container {
    height: 560px;
    display: flex;
    flex-direction: column;
    margin-left: 0;
    margin-top: 80px;
  }

  .upload-btn {
    width: 288px;
    height: 288px;
    margin: 0 auto;
  }
  .preview-image {
    width: 288px;
  }

  .add-section {
    width: 100%;
    margin-left: 16px;
    margin-top: 25px;
  }

  .enter-title {
    padding: 0;
    width: 90%;
    font-size: 35px;
    height: 40px;
  }

  .enter-title::placeholder {
    font-size: 35px;
    font-weight: 900;
  }

  .card-select-area {
    gap: 5px;
    flex-direction: column;
  }

  .card-select-btn {
    justify-content: start;
    width: 90%;
  }

  .menu-area {
    width: 89%;
  }
  .menu-search {
    width: 100%;
  }
  .menu-search button {
    right: 40px;
  }
  .keyword {
    width: 97%;
  }

  .cannot-change {
    width: calc(100% - 16px);
  }

  .cannot-change p {
    font-size: 14px;
    width: calc(100% - 16px);
  }

  .text-area {
    box-sizing: border-box;
    width: 100%;
    height: 650px;
    flex-direction: column;
  }

  .edit-area {
    width: 95%;
    box-sizing: border-box;
    background-color: #1c3d4b;
    margin: 16px auto;
  }

  .message-user-img img {
    width: 50px;
    height: 50px;
  }

  .enter-message {
    width: 100%;
  }

  .message-area {
    width: 95%;
    height: 40px;
    margin-top: 36px;
    margin-left: 16px;
  }

  .message {
    width: 90%;
    height: 50px;
    gap: 8px;
    background-color: #2a2a2b;
  }

  .message-count {
    position: absolute;
    top: 70px;
    right: 20px;
  }

  .edit-area {
    width: 95%;
    box-sizing: border-box;
    background-color: #1c3d4b;
    margin: 16px auto;
  }

  .message-user-img img {
    width: 50px;
    height: 50px;
  }

  .enter-message {
    width: 100%;
  }

  .message-area {
    width: 95%;
    height: 40px;
    margin-top: 36px;
    margin-left: 16px;
  }

  .message {
    width: 90%;
    height: 50px;
    gap: 8px;
    background-color: #2a2a2b;
  }

  .message-count {
    position: absolute;
    top: 70px;
    right: 20px;
  }

  .user-sign {
    display: none;
  }
}
</style>
