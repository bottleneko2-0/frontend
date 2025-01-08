<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import Notice from '@/components/notice/Notice.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import Editor from '@tinymce/tinymce-vue'
import AngleL from '@/components/svg/AngleL.vue'
import ArrowR from '@/components/svg/ArrowR.vue'
import Ball from '@/components/svg/Ball.vue'
import Content from '@/components/svg/Content.vue'
import Deck from '@/components/svg/Deck.vue'
import Earth from '@/components/svg/Earth.vue'

const Tiny_API_KEY = import.meta.env.VITE_Tiny_API_KEY
const router = useRouter()
const route = useRoute()

const token = ref(localStorage.getItem('token'))
const title = ref('')
const content = ref('')
const deck_name = ref('')
const picture = ref('')

const fetchArticle = async () => {
  const postCode = route.params.post_code
  const API_URL = import.meta.env.VITE_API_URL
  try {
    const response = await axios.get(`${API_URL}/api/articles/${postCode}`)
    title.value = response.data.title
    content.value = response.data.content
    deck_name.value = response.data.deck_list.deck_name
    picture.value = response.data.post_picture
  } catch (error) {
    console.error('Error fetching article_id:', error)
  }
}

const submitEdit = async () => {
  const postCode = route.params.post_code
  const API_URL = import.meta.env.VITE_API_URL

  if (!title.value) {
    Swal.fire({
      icon: 'warning',
      title: '標題不能為空',
      color: '#e1e1e1',
      background: '#27272a',
    })
    return
  }

  try {
    await axios.put(
      `${API_URL}/api/articles/${postCode}`,
      {
        title: title.value,
        content: content.value,
      },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    )

    Swal.fire({
      icon: 'success',
      title: '更新成功',
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
        text: '登入後才能更新文章',
        icon: 'warning',
        color: '#e1e1e1',
        background: '#27272a',
        confirmButtonText: '確定',
      }).then(() => {
        window.location.href = `${BASE_URL}/login`
      })
    } else if (error.response && error.response.status === 404) {
      Swal.fire({
        title: '非本人文章',
        text: '無權編輯',
        icon: 'warning',
        color: '#e1e1e1',
        background: '#27272a',
        confirmButtonText: '確定',
      }).then(() => {
        router.push(`/social/${postCode}`)
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: '更新文章失敗',
        color: '#e1e1e1',
        background: '#27272a',
      })
    }
  }
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    router.push('/')
  }
}

onMounted(() => {
  fetchArticle()
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
        <h2>更新文章</h2>
      </div>
      <div class="btn-area">
        <button class="submit-btn" @click="submitEdit">
          <Earth />
          <span>送出</span>
          <ArrowR  />
        </button>
        <Notice />
        <div class="user-sign">
          <NavLoginBtn />
        </div>
      </div>
    </header>
    <section class="title-area">
      <div class="title-area-container">
        <button class="upload-btn">
          <img :src="picture" alt="" />
        </button>
        <div class="edit-section">
          <div class="edit-article">
            <Ball />
            <p>更新文章</p>
          </div>
          <input
            v-model="title"
            class="enter-title"
            type="text"
            placeholder="請輸入標題"
          />
          <div class="card-select-area">
            <button class="card-select-btn">
              <Deck />
              <p>{{ deck_name }}</p>
            </button>

            <div class="cannot-change">
              <p>更新文章時，無法更改牌組內容</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="text-area">
      <div class="edit-area">
        <div class="message-tag">
          <Content />
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
    </section>
    <MainFooter />
  </main>
</template>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
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
  width: 92px;
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
  stroke-width: 1.5px;
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

.upload-btn img {
  width: 240px;
  position: absolute;
  left: 0;
  top: 0;
}

.edit-section {
  width: 100%;
  margin-left: 32px;
  margin-top: 53px;
}

.edit-article {
  display: flex;
  margin-bottom: 8px;
}

.edit-article svg {
  width: 24px;
  height: 24px;
  color: white;
  stroke-width: 1.5px;
}

.edit-article p {
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
  align-items: center;
  border: none;
  background-color: #2fb7e7;
  cursor: pointer;
  padding-left: 10px;
  gap:5px;
  box-sizing: border-box;
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
  stroke-width: 1.5px;
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

  .upload-btn img {
    width: 288px;
  }

  .edit-section {
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
    width: 98%;
  }

  .cannot-change p {
    font-size: 14px;
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
