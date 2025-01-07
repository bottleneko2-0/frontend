<script setup>
import { useRouter } from 'vue-router'
import SideBar from '@/components/home/SidebarGrid.vue'
import Notice from '@/components/notice/Notice.vue'
import Footer from '@/components/home/MainFooter.vue'
import Login from '@/components/login/NavLoginBtn.vue'
import AngleL from '@/components/svg/AngleL.vue'
import Question from '@/components/svg/Question.vue'
import AngleD from '@/components/svg/AngleD.vue'

const router = useRouter()
const BASE_URL = import.meta.env.VITE_BASE_URL

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="layout">
    <SideBar class="sidebar-container" />
    <header class="z-10 h-16">
      <nav class="header-container">
        <button
          @click="handleBack"
          class="flex-none p-1 text-white rounded-full bg-black/50 default-transition hover:bg-zinc-800/50"
        >
          <AngleL />
        </button>
        <div class="justify-start w-full min-w-0 font-bold text-white">
          <h2 class="text-2xl font-bold truncate header-title">與我聯絡</h2>
        </div>

        <Notice class="notice-mobile-hidden" />
        <Login class="login-mobile-hidden" />
      </nav>
    </header>
    <div class="background scrollbar">
      <main class="main-grid">
        <section class="main-container">
          <section class="w-full md:w-[75%] mx-auto text-white">
            <div class="mt-12 mb-8">
              <h2 class="text-3xl font-black text-center">與我聯絡</h2>
              <p class="mt-2 text-center">
                無論您有任何問題、意見與建議，歡迎透過以下方式與我們聯絡！
              </p>
            </div>
            <div class="grid grid-cols-1 gap-4 mt-2 md:grid-cols-2">
              <a
                class="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#0866ff50] to-zinc-700 hover:shadow-lg hover:shadow-zinc-700/50"
                :href="`${BASE_URL}/team`"
                target="_blank"
              >
                <div class="capie-img">
                  <img src="@/img/capie-user.png" />
                </div>
                <div>
                  <h3 class="text-lg font-bold">關於卡派團隊</h3>
                  <p class="text-zinc-300">專注於提供趣味卡牌遊戲的七人小組</p>
                </div>
              </a>
              <a
                class="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-[#0866ff50] to-zinc-700 hover:shadow-lg hover:shadow-zinc-700/50"
                href="https://discord.com/channels/1303258823104135219/1321898702750748752"
              >
                <div class="capie-img">
                  <img src="@/img/capie-user.png" />
                </div>
                <div>
                  <h3 class="text-lg font-bold">卡派 Discord</h3>
                  <p class="text-zinc-300">加入 Discord 一起討論與分享消息</p>
                </div>
              </a>
            </div>
          </section>
          <section class="question-section">
            <h2>常見問答</h2>
            <div class="question-area">
              <div>
                <input type="checkbox" id="question1" />
                <label for="question1" class="question question1">
                  <Question />
                  <h3>Capie是什麼？</h3>
                  <AngleD class="dropdown-icon" />
                </label>
                <p class="answer">
                  Capie是一個線上的卡牌組牌工具，提供各種便利的功能，讓您可以輕鬆的組牌、分享牌組、查詢卡片等等。
                  目前專為 Weiβ Schwarz 卡牌遊戲製作。
                </p>
              </div>
              <div>
                <input type="checkbox" id="question2" />
                <label for="question2" class="question question2">
                  <Question />
                  <h3>是否有手機版可以用？</h3>
                  <AngleD class="dropdown-icon" />
                </label>
                <p class="answer">
                  目前Capie以全網站式開發，但您能可以透過以下方式加入至主畫面：<br /><br />
                  1. 在裝置上開啟原生瀏覽器並進入Capie網站 <br />
                  2. Android 裝置點選 [安裝]。 iPhone
                  裝置輕觸網址列右上方的「分享」圖示 <br />
                  3. 找出並輕觸「加入主畫面」並按照畫面上的指示操作 <br />
                  4. 在手機桌面即可出現Capie應用程式 <br />
                  <br />
                  相關教學
                  <span
                    ><a
                      href="https://support.google.com/chrome/answer/9658361?hl=zh-Hant&co=GENIE.Platform%3DiOS"
                      >使用漸進式網頁應用程式</a
                    ></span
                  >
                </p>
              </div>
              <div>
                <input type="checkbox" id="question3" />
                <label for="question3" class="question question3">
                  <Question />
                  <h3>我的Capie打不開或是轉圈圈？</h3>
                  <AngleD class="dropdown-icon" />
                </label>
                <p class="answer">
                  請您先確認處於網路良好狀態，並嘗試著重新開啟網站/應用程式，<br />
                  如仍然失敗，請立即與Capie團隊聯絡，很有可能伺服器冒煙不乖了
                </p>
              </div>
              <div>
                <input type="checkbox" id="question4" />
                <label for="question4" class="question question4">
                  <Question />
                  <h3>我是新手，我要怎麼開始呢？</h3>
                  <AngleD class="dropdown-icon" />
                </label>
                <p class="answer">
                  由於Capie提供很多功能，您可以首先到 "系列卡表"
                  尋找喜愛的系列查看，<br />
                  卡片會有中文翻譯/機器翻譯，點選加入按鈕進行牌組製作。<br />
                  或是您可以到社群上找大家或是官方賽事的牌組來複製。<br /><br />

                  如果您對此仍不熟悉，歡迎至Capie Discord
                  頻道讓大家一起幫你解答：<span>
                    <a href="https://discord.com/invite/QMtPcXrdBq"
                      >Discord
                    </a></span
                  >
                </p>
              </div>
              <div>
                <input type="checkbox" id="question5" />
                <label for="question5" class="question question5">
                  <Question />
                  <h3>我要怎麼加入英雄會員呢？</h3>
                  <AngleD class="dropdown-icon" />
                </label>
                <p class="answer">
                  英雄榜的會員，可以到工作坊找到 "加入英雄榜" 按鈕。<br />
                  完成贊助後到粉專與我們聯繫，會幫您處理後續動作。
                </p>
              </div>
              <div>
                <input type="checkbox" id="question6" />
                <label for="question6" class="question question6">
                  <Question />
                  <h3>是否有其他資源？</h3>
                  <AngleD class="dropdown-icon" />
                </label>
                <p class="answer">
                  目前Capie搜集來自<span
                    ><a href="https://ws-tcg.com/"> WS官方</a></span
                  >以及<span><a href="https://yuyu-tei.jp/">遊遊亭</a></span
                  >的價格資訊，以及強大的Capie管理群資源。<br />
                  如果您有資源想與我們分享或商業合作，請與我聯繫！
                </p>
              </div>
              <div>
                <input type="checkbox" id="question7" />
                <label for="question7" class="question question7">
                  <Question />
                  <h3>Capie與武士道</h3>
                  <AngleD class="dropdown-icon" />
                </label>
                <p class="answer">
                  Capie提供的 Weiβ Schwarz 卡牌資訊以及卡圖，皆為<span
                    ><a href="https://ws-tcg.com/">武士道官方資料</a></span
                  >，與Capie本身無任何關係。<br />
                  若卡片資訊有相關侵權問題，則會下架其內容，Capie僅為提供輔助工具進行服務。
                </p>
              </div>
              <div>
                <input type="checkbox" id="question8" />
                <label for="question8" class="question question8">
                  <Question />
                  <h3>其他問題與我們態度</h3>
                  <AngleD class="dropdown-icon" />
                </label>
                <p class="answer">
                  保持正向、保持快樂、持續改善。 <br />
                  無論您有任何問題、許願、想法...等等，歡迎您與我們討論！
                </p>
              </div>
            </div>
          </section>
        </section>
        <Footer />
      </main>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base.css';

.capie-img {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
}

.capie-img img {
  border-radius: 999px;
}

.notice-mobile-hidden {
  z-index: 999;
}

.scrollbar {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

.notice-item.read {
  background-color: #1f1f22;
}

.notice-item.unread {
  background-color: #2d2d2d;
}

.layout {
  display: flex;
  flex-direction: row;
}

header {
  width: calc(100% - 270px - 0.5rem);
  position: fixed;
  top: 0;
  right: 0;
  background-color: rgba(50, 201, 255, 0);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  margin: 0.5rem 0.5rem 0 0;
}

.header-container {
  height: 100%;
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  position: relative;
  margin-top: 0.5rem;
}

.notice {
  position: relative;
}

.notice-icon {
  width: 24px;
  height: 24px;
  margin-right: 20px;
  cursor: pointer;
  border-radius: 50%;
  padding: 6px;
  background-color: transparent;
  transition:
    background-color 0.3s ease,
    opacity 0.3s ease;
}

.notice-icon:hover {
  background-color: #2a2727;
  opacity: 0.8;
}

.notice-grid-up h2 {
  color: white;
  font-weight: bolder;
  font-size: 24px;
}

.notice-grid {
  display: grid;
  grid-template-columns: 352px;
  grid-template-rows: 64px 416px;
  position: absolute;
  top: 120%;
  left: 50%;
  transform: translateX(-70%);
  display: none;
  height: 0;
  transition:
    opacity 0.3s ease,
    height 0.3s ease,
    transform 0.3s ease;
  z-index: 999;
}

#notice-jump:checked ~ .notice-grid {
  display: block;
  height: 480px;
}

#notice-jump {
  display: none;
}

.notice-grid-up {
  grid-area: 1/1/2/2;
  background-color: #27272a;
  padding: 24px 16px 8px 16px;
  border-radius: 10px 10px 0px 0px;
}

.notice-grid-down {
  background-color: #1e1e1e;
  border-radius: 0px 0px 10px 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 700px;
}

.notice-grid-down img {
  height: 240px;
  margin-bottom: 30px;
}

.notice-grid-down h2 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  color: #f4f4f5;
}

.notice-grid-down p {
  color: rgb(161 161 170);
  font-size: 16px;
  text-align: center;
  margin-top: 10px;
  line-height: 20px;
}

.background {
  height: calc(100vh - 5rem);
  width: calc(100vw - 270px - 0.5rem);
  border-radius: 1rem;
  background-color: #121212;
  margin-top: 5rem;
  overflow-y: scroll;
}

.main-grid {
  background-color: #121212;
  padding-bottom: 2rem;
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  overflow: auto;
  grid-area: main-view;
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

.question-section {
  margin: 0 auto;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  margin-left: 53.5px;
  margin-right: 53.5px;
  margin-left: 125.45px;
  margin-right: 125.45px;
}

.question-section h2 {
  color: white;
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 2rem;
}

.question-area > div {
  display: flex;
  flex-direction: column;
  background-color: rgba(39, 39, 42, 0.8);
  border-radius: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
}

.question-area > div svg {
  width: 32px;
  height: 32px;
  stroke: white;
}

.question {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  position: relative;
}

.question h3 {
  font-weight: 900;
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.dropdown-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-left: auto;
  position: absolute;
  right: 0;
  background-color: rgba(24, 24, 27, 0.5);
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
}

.answer {
  margin-top: 1rem;
  margin-left: 1rem;
  font-size: 16px;
  cursor: pointer;
  color: rgb(161 161 170);
  line-height: 1.5;
  height: 0;
  overflow: hidden;
  transition: height 3s ease;
}

#question1:checked ~ .answer {
  height: auto;
}

#question2:checked ~ .answer {
  height: auto;
}

#question3:checked ~ .answer {
  height: auto;
}

#question4:checked ~ .answer {
  height: auto;
}

#question5:checked ~ .answer {
  height: auto;
}

#question6:checked ~ .answer {
  height: auto;
}

#question7:checked ~ .answer {
  height: auto;
}

#question8:checked ~ .answer {
  height: auto;
}

input[type='checkbox'] {
  display: none;
}

input[type='checkbox']:checked + label .dropdown-icon {
  transform: rotate(180deg);
  transition: transform 0.5s ease;
}

input[type='checkbox']:not(:checked) + label .dropdown-icon {
  transform: rotate(0deg);
  transition: transform 0.5s ease;
}

.answer span a {
  text-decoration: none;
  color: rgb(59 130 246);
}

@media screen and (width < 1200px) {
  .login-mobile-hidden {
    display: none;
  }

  .notice-mobile-hidden {
    display: none;
  }

  header {
    width: 100%;
    position: fixed;
    top: 0;
    right: 0;
    margin: 0;
    border-radius: 0%;
  }

  .header-container {
    background-color: #000000;
    margin-top: 0rem;
  }

  .arrow-right {
    display: none;
  }

  .notice {
    display: none;
  }

  .login-btn {
    display: none;
  }

  .background {
    width: 100%;
    border-radius: 0;
    margin-top: 5rem;
  }

  .md\:mt-2 {
    margin-top: 0;
  }

  .md\:mr-2 {
    margin-right: 0;
  }
  .question-section {
    margin-left: 0px !important;
    margin-right: 0px !important;
  }
}
</style>
