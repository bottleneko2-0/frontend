<script setup>
import SidebarGrid from '@/components/home/SidebarGrid.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import Notice from '@/components/notice/Notice.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Horn from '@/components/svg/Horn.vue'

const API_URL = import.meta.env.VITE_API_URL

// 定義資料變數，將 product 改為 products 陣列
const products = ref([])

// 當組件掛載時請求資料
onMounted(async () => {
  try {
    const response = await axios.get(`${API_URL}/api/product`) // 更新 API URL
    products.value = response.data.data // 設置資料
  } catch (err) {
    console.error('獲取產品資料失敗:', err.message)
  }
})
</script>

<template>
  <div class="All">
    <SidebarGrid />
    <div class="content">
      <div class="top-container">
        <!-- 通知與登入 -->
        <div class="left-icon">
          <button class="left-icon-button1">
            <i class="fa-solid fa-angle-left"></i>
          </button>
          <button class="left-icon-button2">
            <i class="fa-solid fa-angle-right"></i>
          </button>
          <h2>官方商品列表</h2>
        </div>
        <div class="icons">
          <notice />
          <NavLoginBtn />
        </div>
      </div>
      <div class="all-card">
        <h2 class="font-size30 color-white">官方商品列表</h2>
        <p class="font-size75rem color-a1">
          官方歷史產品列表，點擊項目導向至產品詳細頁面。資料來源：
          <a href="https://ws-tcg.com/" class="p-a">Weiβ Schwarz</a>
        </p>
        <section class="grid-card">
          <a
            :href="product.link"
            class="transition-colors url"
            v-for="(product, index) in products"
            :key="index"
          >
            <div>
              <img
                v-if="product.cover"
                :src="product.cover"
                alt=""
                class="a-img"
              />
            </div>
            <div class="card-text">
              <div class="flex">
                <Horn class="icon-size color-a1" />
                <p class="color-a1 flex-p" v-if="product.publishAt">
                  {{ product.publishAt }}
                </p>
              </div>
              <p
                class="font-size14 color-white padding-bottom"
                v-if="product.name"
              >
                {{ product.name }}
              </p>
            </div>
          </a>
        </section>
      </div>
      <MainFooter />
    </div>
  </div>
</template>

<style scoped>
.All {
  display: flex;
  position: relative;
}
.sidebar-container {
  width: 270px;
  height: 100%;
  display: flex;
  flex-direction: column;
  grid-area: sidebar;
  min-height: 0;
  padding: 1rem;
}
.sidebar-head {
  text-decoration: none;
  color: black;
  cursor: pointer;
  display: flex;
  gap: 5px;
}

.nav-icon {
  width: 40px;
  height: 40px;
  border-radius: 40%;
}
.nav-svg {
  fill: #fff;
  height: 1.5rem;
  align-self: center;
}

.sidebar-menu {
  margin-top: 20px;
}

.sidebar-menu > li {
  display: flex;
  align-items: center;
  width: 238px;
  height: 40px;
  margin-bottom: 5px;
}

.sidebar-menu li h2 {
  color: #a1a1aa;
  font-weight: 700;
  font-size: 14px;
}

.sidebar-menu a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #a1a1aa;
  gap: 10px;
}

.sidebar-menu a:hover h2 {
  color: white;
}

.sidebar-menu > li > a:hover svg {
  stroke: white;
}

.translate-btn {
  display: flex;
  align-items: center;
  width: 238px;
  height: 40px;
  gap: 8px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(45deg, #a855f7, #ec4899);
  color: white;
  margin-top: 20px;
  cursor: pointer;
  position: relative;
}

.translate-btn::after {
  content: '';
  position: absolute;
  border-top: 1px solid #3f3f46;
  top: 50px;
  left: 0;
  right: 0;
  width: 100%;
}
.translate-btn h2 {
  font-size: 14px;
  font-weight: 700;
}
.sidebar p {
  color: #a1a1aa;
  font-size: 16px;
  margin-top: 30px;
}

nav {
  position: fixed;
}

.w-7 {
  width: 1.75rem;
}

.h-7 {
  height: 1.75rem;
}

.content {
  position: absolute;
  top: 0;
  left: 270px;
  background-color: #121212;
  padding: 10px;
  /* width: 100%; */
  /* height: 100vh; */
  box-sizing: border-box;
  margin: 8px 8px 8px 0;
  border-radius: 10px;
}
.top-container {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #121212;
  padding: 20px 30px;
  border-radius: 5px;
  justify-content: space-between;
  position: fixed;
  width: calc(100% - 339px);
  top: 0px;
  left: 270px;
}
.Top-bar {
  display: flex;
  gap: 0.5rem;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  color: #333;
  border-radius: 20px;
  padding: 5px 10px;
  position: relative;
}

.search-bar input {
  border: none;
  outline: none;
  background: none;
  padding: 5px;
  font-size: 14px;
  color: #333;
}

.search-bar input::placeholder {
  color: #888;
}

.search-bar button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  position: absolute;
  right: 5px;
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
  background-color: white;
  font-weight: 700;
  width: 52px;
  padding: 8px;
  white-space: nowrap;
  font-size: 0.875rem;
}

.sort-button .active {
  background: linear-gradient(to right, #2ec7c9, #70e1f5);
}

.icons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.icons .icon {
  font-size: 18px;
  cursor: pointer;
  color: white;
}

.icons .login {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  background-color: #090909;
  padding: 10px;
  color: white;
  border-radius: 20px;
}

.icons .login span {
  font-size: 14px;
}
.left-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.left-icon button {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 6px 10px;
  color: rgb(148, 147, 147);
  border: 1px solid transparent;
  cursor: not-allowed;
}
.left-icon h2 {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.all-card {
  margin-top: 80px;
}
.all-card > h2 {
  text-align: center;
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 20px;
}
.all-card > p {
  text-align: center;
  color: #e4e4e7;
}
.all-card p a {
  color: #71717a;
}
.grid-card {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.5rem;
  padding: 0 40px;
  margin: 20px 0px;
  justify-items: start;
}

.card-text {
  margin-top: 1rem;
}
.flex {
  display: flex;
  gap: 0.25rem;
}
.flex-p {
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  width: 100%;
}

.font-size14 {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  text-align: start;
}
.font-size30 {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.75rem;
  padding-bottom: 0.5rem;
  padding-top: 1.5rem;
  --tw-text-opacity: 1;
}
.font-size75rem {
  font-size: 17.5px;
  font-weight: 400;
}
.padding-bottom {
  padding-bottom: 5px;
  overflow: hidden;
}

.color-white {
  color: white;
}
.color-a1 {
  color: #a1a1aa;
}
.url {
  padding: 0.75rem;
  background-color: #18181b;
  border-radius: 5%;
  box-sizing: border-box;
}
.url img {
  border-radius: 10%;
  aspect-ratio: 1 / 1;
}
.icon-size {
  height: 1rem;
  min-height: 1rem;
  min-width: 1rem;
  width: 1rem;
  align-self: center;
}
.transition-colors {
  transition-duration: 0.15s;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
a {
  text-decoration: none;
  width: 100%;
}
.a-img {
  object-fit: contain;
  width: 100%;
}
.grid-card a:hover {
  background-color: #27272a;
}
.all-card .p-a:hover {
  color: white;
}
@media (width > 1439px) {
  .grid-card {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}
@media (width < 1199px) {
  .grid-card {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    width: 100%;
    padding: 0px;
  }
  .top-container {
    width: 100%;
    left: 0;
    top: 0;
    padding: 24px 16px;
  }
  .all-card {
    width: 100%;
  }
  .icons {
    display: none;
  }
  .sidebar-container {
    width: 100%;
    max-height: 65.5px;
    position: fixed;
    bottom: 0;
    z-index: 999;
    display: unset;
    padding: 0;
  }

  .sidebar-head {
    display: none;
  }

  .sidebar-menu {
    display: flex;
    width: 100%;
    margin: 0px;
    top: 2.5rem;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(0, 0, 0, 0.5) 10%,
      rgba(0, 0, 0, 0.9) 30%,
      #000 90%
    );
  }

  .sidebar-menu > li {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .sidebar-menu > .md-menu {
    display: block;
  }

  .sidebar-menu li h2 {
    font-size: 9px;
  }

  .sidebar-menu a {
    width: 100%;
    height: 100%;
    flex-direction: column;
    gap: 0.25rem;
    justify-content: space-between;
    padding: 8px 12px 12px;
    box-sizing: border-box;
  }

  .translate-btn {
    display: none;
  }

  .translate-btn + p {
    display: none;
  }
  .content {
    left: 0;
    margin: 0px;
  }
  .url {
    background-color: transparent;
    padding: 0;
  }
  .left-icon-button2 {
    display: none;
  }
}
@media (width < 1023px) {
  .grid-card {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .top-container {
    width: 100%;
  }

  .icons {
    display: none;
  }
  .all-card {
    width: 100%;
  }
}
@media (width <767px) {
  .grid-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .top-container {
    width: 100%;
  }

  .icons {
    display: none;
  }
  .all-card {
    width: 100%;
  }
}
.work-shop-footer {
  max-width: 100%;
  padding: 80px 32px 64px;
  box-sizing: border-box;
  background-color: #121212;
}

.work-shop-footer-flexbox {
  width: 100%;
  display: flex;
}

.work-shop-footer-flexbox-left {
  width: 100%;
  display: flex;
  gap: 1rem;
}

.work-shop-footer-flexbox-left-item {
  list-style: none;
  margin-top: 16px;
  width: 160px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.work-shop-footer-flexbox-left-item-title {
  width: 100%;
  color: white;
  line-height: 24px;
}

.work-shop-footer-flexbox-left-item-link {
  width: 100%;
  line-height: 24px;
}

.work-shop-footer-flexbox-left-item-link-text {
  display: inline-block;
  width: 100%;
  text-decoration: none;
  color: #6d6d76;
}

.work-shop-footer-flexbox-left-item-link-text:hover {
  color: white;
}

.work-shop-footer-flexbox-right {
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
}

.work-shop-footer-flexbox-right-group {
  /* width: 100%; */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.work-shop-footer-flexbox-right-item {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #d4d4d8;
  text-decoration: none;
}

.work-shop-footer-flexbox-right-item:hover span {
  cursor: pointer;
  color: white;
}

.work-shop-footer-flexbox-right-item-icon {
  width: 24px;
  height: 24px;
  text-align: center;
  line-height: 24px;
  color: #d4d4d8;
  font-size: 20px;
}

.work-shop-footer-flexbox-right-item-text {
  color: #d4d4d8;
  font-size: 20px;
  line-height: 28px;
}

.work-shop-footer-flexbox-right-icon-list {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.work-shop-footer-flexbox-right-icon-list a {
  display: inline-block;
  width: 40px;
  height: 40px;
  color: white;
  font-size: 24px;
  border-radius: 50%;
  background-color: #3f3f46;
  text-align: center;
  line-height: 40px;
}

.work-shop-footer-flexbox-right-icon-list a:hover {
  background-color: #5b5b64;
}

.work-shop-footer-hr {
  border: none;
  border-top: 1px solid #3f3f46;
  margin: 16px 0px;
}

.work-shop-footer-copyright {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.work-shop-footer-copyright-left {
  display: flex;
  gap: 1rem;
  list-style: none;
}

.work-shop-footer-copyright-left-item {
  width: 100%;
  text-wrap: nowrap;
}

.work-shop-footer-copyright-left-item a {
  text-decoration: none;
  color: #6d6d76;
  width: 100%;
}

.work-shop-footer-copyright-left-item a:hover {
  color: white;
  cursor: pointer;
}

.work-shop-footer-copyright-right {
  color: #6d6d76;
  font-size: 14px;
}

.work-shop-footer-copyright-right span {
  line-height: 20px;
}

.text-color-red {
  color: #941816;
}

.text-color-red:hover {
  color: red;
}

@media screen and (width < 1200px) {
  .work-shop-footer {
    padding: 80px 16px 176px;
    max-width: 100%;
  }

  .work-shop-footer-flexbox {
    display: block;
  }

  .work-shop-footer-flexbox-left {
    flex-direction: column;
    margin-bottom: 16px;
  }

  .work-shop-footer-flexbox-left-item {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .work-shop-footer-flexbox-left-item-title {
    grid-column-start: 1;
    grid-column-end: 3;
  }

  .work-shop-footer-flexbox-right {
    justify-content: center;
  }

  .work-shop-footer-flexbox-right-icon-list {
    justify-content: center;
  }

  .work-shop-footer-flexbox-right-icon-list a {
    background-color: transparent;
  }

  .work-shop-footer-copyright {
    flex-direction: column;
    gap: 8px;
  }

  .work-shop-footer-copyright-right span {
    display: block;
  }
}
</style>
