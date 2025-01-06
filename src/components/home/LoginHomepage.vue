<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Notice from '@/components/notice/Notice.vue'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import Clock from '@/components/svg/Clock.vue'
import AngleR from '@/components/svg/AngleR.vue'
import Horn from '@/components/svg/Horn.vue'
import Card from '@/components/svg/Card.vue'
const BASE_URL = import.meta.env.VITE_BASE_URL
const API_URL = import.meta.env.VITE_API_URL
const API_DATA = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/topics`)
    const apiData = response.data.data // API 返回的資料

    const videos = apiData.find((item) => item.title === 'videos')
    const latest = apiData.find((item) => item.title === '最新商品')

    // 處理 videos 資料
    if (videos) {
      items.value.videos = videos.items.map((item) => ({
        ...item.data, // 解構出每個 video 的資料
        title: formatValue(item.data.title),
        ytId: formatValue(item.data.ytId),
        publishAt: formatDate(item.data.publishAt),
        authorName: formatValue(item.data.author?.name),
        authorHead: formatValue(item.data.author?.head),
      }))
    }

    // 處理最新商品資料
    if (latest) {
      items.value.latestProducts = latest.items.map((item) => ({
        cover: formatValue(item.data.cover),
        name: formatValue(item.data.name),
        description: formatValue(item.data.description),
        link: formatValue(item.data.link),
        publishAt: formatDate(item.data.publishAt),
      }))
    }

    // 新增 /api/series 的請求
    const seriesResponse = await axios.get(`${API_URL}/api/series`)
    const seriesData = seriesResponse.data
    items.value.series = seriesData.map((series) => ({
      id: formatValue(series.id),
      name: formatValue(series.name),
      cover: series.cover || 'https://bottleneko.app/images/cover.png',
      sellAt: formatDate(series.sell),
      code: formatValue(series.code.join(', ')),
    }))
  } catch (err) {
    console.error('獲取資料失敗:', err.message)
  }
}
const items = ref({ topics: [], videos: [], latestProducts: [], series: [] })

// 格式化資料函數，避免顯示 null 或 undefined
const formatValue = (value, defaultValue = '無資料') => {
  return value !== null && value !== undefined ? value : defaultValue
}

// 格式化日期函數
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date)
    ? date.toLocaleDateString()
    : '無發布日期'
}

onMounted(async () => {
  await API_DATA()
  import('@/assets/js/login-homepage/css-control.js')
  import('@/assets/js/login-homepage/swiper')
  import('@/assets/js/login-homepage/fancybox')
})
</script>

<template>
  <div class="All">
    <div class="container">
      <!-- 通知與登入 -->
      <div class="icons">
        <div class="search-bar">
          <div class="search-icon">
            <a href="/social">
              <i class="fa-solid fa-magnifying-glass"></i>
            </a>
          </div>
          <div class="xmark-icon xmark-icon-hidden">
            <i class="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div class="icon">
          <Notice />
        </div>
        <div class="login" id="login">
          <NavLoginBtn />
        </div>
      </div>
    </div>
    <div class="content">
      <div class="card1">
        <!-- first swiper -->
        <div class="swiper first-swiper-container">
          <div class="swiper-wrapper first-swiper-wrapper" id="">
            <div class="swiper-slide first-swiper-slide">
              <a href="/social">
                <img
                  src="https://live.staticflickr.com/65535/54241373235_97b0eccb08_o.jpg"
                  alt=""
                />
                <p>社群交流</p>
              </a>
            </div>
            <div class="swiper-slide first-swiper-slide">
              <a href="/hero-member">
                <img
                  src="https://live.staticflickr.com/65535/54229411676_a42d1f3584_o.png"
                  alt=""
                />
                <p>全新英雄榜登場</p>
              </a>
            </div>
            <div class="swiper-slide first-swiper-slide">
              <a href="/contact">
                <img
                  src="https://live.staticflickr.com/65535/54229639353_5dc882296c_o.png"
                  alt=""
                />
                <p>與我聯絡</p>
              </a>
            </div>
            <div class="swiper-slide first-swiper-slide">
              <a href="/series">
                <img
                  src="https://live.staticflickr.com/65535/54229411631_50fd6c43f7_o.jpg"
                  alt=""
                />
                <p>所有卡片系列</p>
              </a>
            </div>
          </div>
        </div>
        <!-- first swiper -->
      </div>
      <h2 class="title">
        每日卡
        <a :href="`${BASE_URL}/daily-card`" class="title-a">
          <Clock class="size-5 stroke-2" />
          <span class="text">回顧歷史紀錄</span>
        </a>
      </h2>
      <div class="card2">
        <h2>プレミアムブースター リコリス・リコイル</h2>
        <span class="card2-top-span">▼2024/11/15（金）発売</span>
        <!-- second swiper -->
        <div class="swiper second-swiper-container">
          <div class="swiper-wrapper second-swiper-wrapper">
            <div class="swiper-slide second-swiper-slide">
              <a
                href="#"
                data-fancybox="card-list"
                data-src="https://live.staticflickr.com/65535/54229641318_905fb943f7_o.png"
                data-caption="ブースターパック 「Re:ゼロから始める異世界生活」Vol.3 - ▼2024/11/22（金）発売"
              >
                <img
                  src="https://live.staticflickr.com/65535/54229641318_905fb943f7_o.png"
                  alt=""
                />
              </a>
            </div>
            <div class="swiper-slide second-swiper-slide">
              <a
                href="#"
                data-fancybox="card-list"
                data-src="https://live.staticflickr.com/65535/54229641308_a3fccb7d05_o.png"
                data-caption="ブースターパック 「Re:ゼロから始める異世界生活」Vol.3 - ▼2024/11/22（金）発売"
              >
                <img
                  src="https://live.staticflickr.com/65535/54229641308_a3fccb7d05_o.png"
                  alt=""
                />
              </a>
            </div>
            <div class="swiper-slide second-swiper-slide">
              <a
                href="#"
                data-fancybox="card-list"
                data-src="https://live.staticflickr.com/65535/54229815665_1020885b78_o.png"
                data-caption="ブースターパック 「Re:ゼロから始める異世界生活」Vol.3 - ▼2024/11/22（金）発売"
              >
                <img
                  src="https://live.staticflickr.com/65535/54229815665_1020885b78_o.png"
                  alt=""
                />
              </a>
            </div>
            <div class="swiper-slide second-swiper-slide">
              <a
                href="#"
                data-fancybox="card-list"
                data-src="https://live.staticflickr.com/65535/54228504232_22ffd68a8c_o.png"
                data-caption="ブースターパック 「Re:ゼロから始める異世界生活」Vol.3 - ▼2024/11/22（金）発売"
              >
                <img
                  src="https://live.staticflickr.com/65535/54228504232_22ffd68a8c_o.png"
                  alt=""
                />
              </a>
            </div>
            <div class="swiper-slide second-swiper-slide">
              <a
                href="#"
                data-fancybox="card-list"
                data-src="https://live.staticflickr.com/65535/54229413836_3068f8523a_o.png"
                data-caption="プレミアムブースター リコリス・リコイル - ▼2024/11/15（金）発売"
              >
                <img
                  src="https://live.staticflickr.com/65535/54229413836_3068f8523a_o.png"
                  alt=""
                />
              </a>
            </div>
            <div class="swiper-slide second-swiper-slide">
              <a
                href="#"
                data-fancybox="card-list"
                data-src="https://live.staticflickr.com/65535/54229641303_b1a36453b7_o.png"
                data-caption="プレミアムブースター リコリス・リコイル - ▼2024/11/15（金）発売"
              >
                <img
                  src="https://live.staticflickr.com/65535/54229641303_b1a36453b7_o.png"
                  alt=""
                />
              </a>
            </div>
            <div class="swiper-slide second-swiper-slide">
              <a
                href="#"
                data-fancybox="card-list"
                data-src="https://live.staticflickr.com/65535/54229641313_0be78bd7a4_o.png"
                data-caption="プレミアムブースター リコリス・リコイル - ▼2024/11/15（金）発売"
              >
                <img
                  src="https://live.staticflickr.com/65535/54229641313_0be78bd7a4_o.png"
                  alt=""
                />
              </a>
            </div>
          </div>
        </div>
        <!-- second swiper -->
        <span class="card2-bottom-span">2024-11-14</span>
      </div>
      <h2 class="title">發燒影片</h2>
      <div class="card3">
        <!-- third swiper -->
        <div class="swiper third-swiper-container">
          <div class="swiper-wrapper third-swiper-wrapper">
            <div
              class="swiper-slide third-swiper-slide"
              v-for="(video, index) in items.videos"
              :key="index"
            >
              <a :href="'https://www.youtube.com/watch?v=' + video.ytId">
                <div class="third-swiper-slide-content">
                  <div class="third-swiper-slide-content-img">
                    <img
                      src="https://live.staticflickr.com/65535/54242227912_d266b8b545_o.jpg"
                      alt=""
                    />
                  </div>
                  <div class="third-swiper-slide-content-info">
                    <h2>{{ video.title || '無標題' }}</h2>
                    <div class="third-swiper-slide-content-info-text">
                      <img :src="video.author.head" alt="" />
                      <div class="third-swiper-slide-content-info-text-box">
                        <p>{{ video.author.name }}</p>
                        <p>{{ formatDate(video.publishAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
        <!-- third swiper -->
      </div>
      <h2 class="title">
        <a :href="`${BASE_URL}/products`" class="title-a2">最新商品</a>
        <a :href="`${BASE_URL}/products`" class="title-a3">
          閱讀更多
          <AngleR class="size-4" />
        </a>
      </h2>
      <section class="show-card">
        <a
          :href="product.link"
          class="url transition-colors"
          v-for="product in items.latestProducts"
          :key="product.name"
        >
          <div>
            <img :src="product.cover" alt="商品圖片" />
          </div>
          <div class="card-text">
            <div class="flex">
              <Horn class="icon-size color-a1" />
              <p class="color-a1">{{ product.publishAt }}</p>
            </div>
            <p class="font-size20 color-white padding-bottom">
              {{ product.name }}
            </p>
          </div>
        </a>
      </section>
      <h2 class="title">
        <a :href="`${BASE_URL}/series`" class="title-a2">卡片系列</a>
        <a :href="`${BASE_URL}/series`" class="title-a3">
          閱讀更多
          <AngleR class="size-4" />
        </a>
      </h2>
      <section class="show-card">
        <a
          :href="`${BASE_URL}/card-series/${series.id}`"
          class="url transition-colors"
          v-for="series in items.series"
          :key="series.id"
        >
          <div>
            <img :src="series.cover" alt="series cover" />
          </div>
          <div class="card-text">
            <div class="flex">
              <Card class="icon-size flex-none color-a1" />
              <p class="color-a1">{{ series.code }}</p>
            </div>
            <p class="font-size20 color-white padding-bottom">
              {{ series.name }}
            </p>
            <p class="color-a1">{{ series.sellAt }}</p>
          </div>
        </a>
      </section>
      <MainFooter />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/css/login-homepage/Login Homepage.css';
</style>
