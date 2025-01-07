<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import placeholderImage from '@/img/card-loading.png'
import NavLoginBtn from '@/components/login/NavLoginBtn.vue'
import Notice from '@/components/notice/Notice.vue'
import MainFooter from '@/components/home/MainFooter.vue'
import Flag from '@/components/svg/Flag.vue'
import Cube from '@/components/svg/Cube.vue'
import Question from '@/components/svg/Question.vue'
import ArrowDown from '@/components/svg/ArrowDown.vue'
import Link from '@/components/svg/Link.vue'

const isScrolled = ref(false)

const handleScroll = () => {
  const scrollTop = mainElement.value.scrollTop
  isScrolled.value = scrollTop > 64
}

let mainElement = ref(null)

const main = () => {
  mainElement.value = document.querySelector('.content-container')
  if (mainElement.value) {
    mainElement.value.addEventListener('scroll', handleScroll)
  }
}

const numberOfGrids = 10
const itemsPerGrid = 10

const grids = ref(
  Array.from({ length: numberOfGrids }, () =>
    Array.from({ length: itemsPerGrid }, () => placeholderImage)
  )
)

const API_URL = import.meta.env.VITE_API_URL

const fetchGrids = async () => {
  try {
    // 使用 Promise.all 並行請求，提高效率
    const gridPromises = Array.from({ length: numberOfGrids }, async () => {
      const itemPromises = Array.from({ length: itemsPerGrid }, async () => {
        try {
          const response = await axios.get(`${API_URL}/cards/random`)
          const covers = response.data.covers

          return covers.length > 0
            ? covers[Math.floor(Math.random() * covers.length)]
            : placeholderImage
        } catch (error) {
          console.error('單個卡片請求失敗：', error)
          return placeholderImage
        }
      })

      // 等待每個網格的所有項目
      return Promise.all(itemPromises)
    })

    // 更新網格
    grids.value = await Promise.all(gridPromises)
  } catch (error) {
    console.error('讀取失敗：', error)
    // 如果向後端發送請求失敗，全部使用預設圖片
    grids.value = Array.from({ length: numberOfGrids }, () =>
      Array.from({ length: itemsPerGrid }, () => placeholderImage)
    )
  }
}

onMounted(() => {
  main()
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        fetchGrids()
        observer.disconnect() // 執行一次後斷開觀察
      }
    })
  })
  observer.observe(document.getElementById('main-page'))
})

onBeforeUnmount(() => {
  if (mainElement.value) {
    mainElement.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <header class="z-10 h-16 header-bg">
    <nav
      class="relative flex items-center justify-end w-full h-full gap-2 px-4 py-6 rounded-t-xl header-container default-transition"
      :class="{ scrolled: isScrolled }"
    >
      <Notice />
      <NavLoginBtn />
    </nav>
  </header>

  <main
    id="main-page"
    class="relative flex flex-col content-container rounded-b-2xl bg-base scroll-smooth scrollbar z-1"
  >
    <div class="h-full px-4 content md:px-6">
      <section class="h-[75vh] relative overflow-hidden -mx-4 md:-mx-6">
        <div class="flex gap-4 card-container md:gap-6 default-transition">
          <div
            v-for="(grid, gridIndex) in grids"
            :key="gridIndex"
            :class="`grid${gridIndex + 1} flex flex-col flex-wrap items-center justify-center flex-none gap-4`"
          >
            <div
              v-for="(imageUrl, index) in grid"
              :key="index"
              class="relative item"
            >
              <img
                :src="imageUrl || placeholderImage"
                alt="卡片圖片"
                class="opacity-80 h-[10rem] md:h-[15rem] lg:h-[20rem] rounded-xl"
              />
            </div>
          </div>
        </div>
        <div class="logo-banner">
          <div class="bg-zinc-900 rounded-xl">
            <img
              src="@/img/capie-icon.png"
              alt=""
              class="w-32 h-32 shadow-2xl rounded-2xl shadow-black/50"
            />
          </div>
          <h1 class="mb-0 text-3xl font-black text-white md:text-6xl">Capie</h1>
          <p class="mb-12 text-xl text-white/50">- 輕鬆開啟你的卡牌派對 -</p>
        </div>
      </section>

      <section class="author-section">
        <div>
          <div class="author-icon">
            <h2>Capie 團隊</h2>
            <Flag />
          </div>
          <div class="author-text">
            <p>
              Capie 是個 WS
              組牌工具，抱持著身為玩家熱情而開發。我們希望大家在過程中能夠有好的體驗與幫助到您，也希望能夠聽見您的需求使我們更好！
            </p>
          </div>
        </div>
      </section>

      <section class="card-section">
        <div class="card1">
          <div>
            <h2>找牌好簡單</h2>
            <span>系列卡表簡單好檢索</span>
            <p>
              快速的檢索功能與篩選， <br />
              到您想要的卡片，並且可以直接將卡片加入組牌清單中。
            </p>
          </div>
          <div class="card1-img">
            <img
              src="https://jasonxddd.me:9000/image/about/series.png"
              alt=""
            />
          </div>
        </div>
        <div class="card2">
          <div class="card2-left">
            <h2>系列卡表</h2>
            <p>點選目標系列、多樣功能的篩選，並呈現您的內容。</p>
            <div class="card2-left-img">
              <img
                src="https://jasonxddd.me:9000/image/about/series-1.gif"
                alt=""
              />
            </div>
          </div>
          <div class="card2-right">
            <h2>卡片詳細</h2>
            <p>中文自動翻譯、QA、價格查詢、高低版本、以及方便的連動卡。</p>
            <div class="card2-right-img">
              <img
                src="https://jasonxddd.me:9000/image/about/series-2.gif"
                alt=""
              />
            </div>
          </div>
        </div>
        <div class="card3">
          <div>
            <h2>
              快來製作 <br />
              你的必勝牌組
            </h2>
            <span>我的牌組，愛不釋手</span>
            <p>
              便捷工具、分群檢索、快速分享，<br />
              超簡單的操作讓你愛不釋手。
            </p>
          </div>
          <div class="card3-img">
            <img src="https://jasonxddd.me:9000/image/about/deck.png" alt="" />
          </div>
        </div>
        <div class="card4">
          <div class="card4-left">
            <div class="card4-left-img">
              <h2>快速製作牌組</h2>
              <span>挑選卡片後，下方直接編輯牌組，並且填寫牌組資訊。</span>
            </div>
          </div>
          <div class="card4-right">
            <div class="card4-right-img">
              <h2>多功能群組檢視</h2>
              <span>牌組檢視、根據選項群組卡片</span>
            </div>
          </div>
        </div>
        <div class="card5">
          <div class="card5-left">
            <h2>連結你與大家</h2>
            <span>社群文章廣納來自各處的內容</span>
            <p>
              最新討論、分享牌組、比賽用牌，<br />
              隨時為你整理想要的資訊。
            </p>
          </div>
          <div class="card5-right">
            <div class="card5-text">
              <h2>添上一筆完美的工具</h2>
              <span>工作坊，若要玩得好，必先利其器</span>
              <p>
                各式各樣的方便工具推陳出新，<br />
                個個都是好幫手。
              </p>
            </div>
            <div class="card5-grid">
              <div>
                <Cube />
                <span>官方牌組</span>
              </div>
              <div>
                <Cube />
                <span>上傳至官方</span>
              </div>
              <div>
                <Cube />
                <span>匯出圖片</span>
              </div>
              <div>
                <Cube />
                <span>匯出檔案</span>
              </div>
              <div>
                <Cube />
                <span>匯出賽用表</span>
              </div>
              <div>
                <Cube />
                <span>More...</span>
              </div>
            </div>
          </div>
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
              <ArrowDown class="dropdown-icon" />
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
              <ArrowDown class="dropdown-icon" />
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
              <ArrowDown class="dropdown-icon" />
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
              <ArrowDown class="dropdown-icon" />
            </label>
            <p class="answer">
              由於Capie提供很多功能，您可以首先到 "系列卡表"
              尋找喜愛的系列查看，<br />
              卡片會有中文翻譯/機器翻譯，點選加入按鈕進行牌組製作。<br />
              或是您可以到社群上找大家或是官方賽事的牌組來複製。<br /><br />

              如果您對此仍不熟悉，歡迎至Capie Discord
              頻道讓大家一起幫你解答：<span>
                <a
                  href="https://discord.com/channels/1303258823104135219/1321898702750748752"
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
              <ArrowDown class="dropdown-icon" />
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
              <ArrowDown class="dropdown-icon" />
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
              <ArrowDown class="dropdown-icon" />
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
              <ArrowDown class="dropdown-icon" />
            </label>
            <p class="answer">
              保持正向、保持快樂、持續改善。 <br />
              無論您有任何問題、許願、想法...等等，歡迎您與我們討論！
            </p>
          </div>
        </div>
      </section>

      <section class="specialthank-section">
        <h2>特別感謝</h2>
        <div class="specialthank-img">
          <label for="shop1" class="shop-img1"
            ><img src="https://jasonxddd.me:9000/partner/kurou.jpg" alt=""
          /></label>
          <label for="shop2" class="shop-img2"
            ><img src="https://jasonxddd.me:9000/partner/ankervoo.jpg" alt=""
          /></label>
          <label for="shop3" class="shop-img3"
            ><img
              src="https://jasonxddd.me:9000/partner/pengpengbird.jpg"
              alt=""
          /></label>
          <label for="shop4" class="shop-img4"
            ><img
              src="https://jasonxddd.me:9000/partner/highspeed-area.png"
              alt=""
          /></label>
          <label for="shop5" class="shop-img5"
            ><img src="https://jasonxddd.me:9000/partner/dfghtym2.jpg" alt=""
          /></label>
        </div>
        <div class="shop-area">
          <input
            type="radio"
            id="shop1"
            name="shop"
            class="shop-toggle"
            checked
          />
          <div class="shop-info" id="shop-info1">
            <img src="https://jasonxddd.me:9000/partner/kurou.jpg" alt="" />
            <div class="shop-info-col">
              <h3>くろう-KUROU-</h3>
              <div class="shop-info-btn">
                <button>
                  <a href="https://www.facebook.com/YT.KUROU" target="_blank"
                    >Facebook</a
                  >
                </button>
                <button>
                  <a
                    href="https://www.youtube.com/channel/UCVSL2VEwuMN5ReOtZsO4WJg"
                    target="_blank"
                    >Youtube</a
                  >
                </button>
              </div>
              <p>
                くろう-KUROU-
                WS的基礎教學與效果解說、開盒影片，FB會更新每日卡翻譯，有其他WS問題也可以詢問喔。
              </p>
            </div>
          </div>
          <input type="radio" id="shop2" name="shop" class="shop-toggle" />
          <div class="shop-info" id="shop-info2">
            <img src="https://jasonxddd.me:9000/partner/ankervoo.jpg" alt="" />
            <div class="shop-info-col">
              <h3>小鄔的卡片遊戲翻譯</h3>
              <div class="shop-info-btn">
                <button>
                  <a href="https://www.facebook.com/ankervoo" target="_blank"
                    >Facebook</a
                  >
                </button>
                <button>
                  <a
                    href="https://www.youtube.com/channel/UCYjTbZffxCHGJKwUJM0lFzg/featured"
                    target="_blank"
                    >Youtube</a
                  >
                </button>
              </div>
              <p>
                翻譯各類卡片遊戲與解釋各種疑難雜症，目前有翻譯的卡片遊戲為：WS，Rebirth
                for You，VG-D，FAB（？ 不時還有聊天直播
              </p>
            </div>
          </div>
          <input type="radio" id="shop3" name="shop" class="shop-toggle" />
          <div class="shop-info" id="shop-info3">
            <img
              src="https://jasonxddd.me:9000/partner/pengpengbird.jpg"
              alt=""
            />
            <div class="shop-info-col">
              <h3>碰碰鳥卡牌-楠梓店</h3>
              <div class="shop-info-btn">
                <button>
                  <a
                    href="https://www.facebook.com/pengpengbird/"
                    target="_blank"
                    >Facebook</a
                  >
                </button>
                <button>
                  <a href="https://shopee.tw/igram1234" target="_blank"
                    >蝦皮購物</a
                  >
                </button>
                <button>
                  <a
                    href="https://www.ruten.com.tw/store/k800131/"
                    target="_blank"
                    >露天拍賣</a
                  >
                </button>
              </div>
              <p>
                回歸打牌的初衷, 輕鬆單純的氛圍, 不濾包,不濾盒, 預祝天天中簽卡
                歡迎至露天,蝦皮預購。謝謝各位支持一間小小的卡店
                (碰碰鳥卡牌-楠梓店)
              </p>
            </div>
          </div>
          <input type="radio" id="shop4" name="shop" class="shop-toggle" />
          <div class="shop-info" id="shop-info4">
            <img
              src="https://jasonxddd.me:9000/partner/highspeed-area.png"
              alt=""
            />
            <div class="shop-info-col">
              <h3>高速領域WS(Weiβ Schwarz)聯合隊伍</h3>
              <div class="shop-info-btn">
                <button>
                  <a
                    href="https://www.facebook.com/groups/370181819661701/"
                    target="_blank"
                    >Facebook</a
                  >
                </button>
                <button>
                  <a
                    href="https://www.facebook.com/groups/1823888517738143/"
                    target="_blank"
                    >高速領域-亞洲交易專區</a
                  >
                </button>
              </div>
              <p>
                高速領域是臉書的WS社團，有討論的主版區以及交易用的亞洲交易區，
                希望大家能夠一起交流WS的情報與討論與分享，讓更多新人加入一起同樂
              </p>
            </div>
          </div>
          <input type="radio" id="shop5" name="shop" class="shop-toggle" />
          <div class="shop-info" id="shop-info5">
            <img src="https://jasonxddd.me:9000/partner/dfghtym2.jpg" alt="" />
            <div class="shop-info-col">
              <h3>水色代購</h3>
              <div class="shop-info-btn">
                <button>
                  <a href="https://www.facebook.com/aquabuyer" target="_blank"
                    >Facebook</a
                  >
                </button>
                <button>
                  <a
                    href="https://www.ruten.com.tw/store/dfghtym2/"
                    target="_blank"
                    >露天</a
                  >
                </button>
                <button>
                  <a href="https://line.me/tw/#~" target="_blank">Line</a>
                </button>
              </div>
              <p>
                專業日本卡牌周片商品代購團隊，優質服務品質
                日本最新商品訂購後貨到付款，庫存品火速出貨
                每月上架數百件精美商品，等您來認領老婆
              </p>
            </div>
          </div>
        </div>
      </section>
      <section class="link-section">
        <h2>相關連結</h2>
        <div class="link-area">
          <div class="link-area1">
            <h3>實用連結</h3>
            <a href="https://bottleneko.app/policy" target="_blank">
              <Link stroke="#e4e4e7" />
              <span>隱私權政策</span>
            </a>
            <a href="https://bottleneko.app/eula" target="_blank">
              <Link stroke="#e4e4e7" />
              <span>服務條款</span>
            </a>
          </div>
          <div class="link-area2">
            <h3>外部連結</h3>
            <a href="https://ws-tcg.com/" target="_blank">
              <Link stroke="#e4e4e7" />
              <span>Weiβ Schwarz</span>
            </a>
            <a href="https://yuyu-tei.jp/" target="_blank">
              <Link stroke="#e4e4e7" />
              <span>遊々亭</span>
            </a>
          </div>
          <div class="link-area3">
            <h3>內部連結</h3>
            <a href="/team">
              <Link stroke="#e4e4e7" />
              <span>關於我們</span>
            </a>
            <a href="/hero-member">
              <Link stroke="#e4e4e7" />
              <span>成為英雄榜會員</span>
            </a>
          </div>
        </div>
      </section>
      <section class="member-section">
        <a href="/login">
          <p>疑？你還不是會員嗎？ 趕快來加入我們吧！</p>
        </a>
      </section>
      <MainFooter />
    </div>
  </main>
</template>

<style scoped>
@import '@/assets/base.css';

nav {
  position: fixed;
  width: calc(100vw - 270px);
}

header {
  margin: 0.4rem 0.5rem 0 0;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.header-container {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  background-color: transparent;
}

.content-container {
  margin-top: calc(-64px + 0.5rem);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  height: calc(100vh - 1rem);
  width: calc(100vw - 270px - 0.5rem);
  /* grid-area: main-view; */
  background-color: #121212;
  overflow: scroll;
}

.scrollbar {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

.card-container {
  transform: translateY(-30%) translate(-10%) skewY(10deg) skew(-10deg);
}

@keyframes marqueeUpDown {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20%);
  }
  100% {
    transform: translateY(0);
  }
}

.grid1,
.grid2,
.grid3,
.grid4,
.grid5,
.grid6,
.grid7,
.grid8,
.grid9,
.grid10 {
  animation: marqueeUpDown 50s linear infinite;
}

.grid1,
.grid3,
.grid5,
.grid7,
.grid9 {
  animation-delay: 5s;
  animation-direction: normal;
}

.grid2,
.grid4,
.grid6,
.grid8,
.grid10 {
  animation-delay: -20s;
  animation-direction: reverse;
}

.item {
  flex: none;
}

.item::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  position: absolute;
  z-index: -1;
  background: linear-gradient(
    to bottom left,
    rgba(243, 236, 100, 0.825),
    rgba(249, 135, 14, 0.89)
  );
  transform: translate(5px) translateY(5px);
}

.logo-banner {
  position: absolute;
  bottom: 0;
  z-index: 5;
  width: 100%;
  height: 20rem;
  background: linear-gradient(to top, var(--tw-gradient-stops));
  --tw-gradient-from: #121212 var(--tw-gradient-from-position);
  --tw-gradient-stops: var(--tw-gradient-from),
    hsla(0, 0%, 7%, 0.9) var(--tw-gradient-via-position), var(--tw-gradient-to);
  --tw-gradient-to: transparent var(--tw-gradient-to-position);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin: 0 auto;
  margin-bottom: -1rem;
}

.author-section {
  height: 25rem;
  background-color: #121212;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.card-section {
  background-color: #121212;
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

.specialthank-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  background-color: #121212;
  margin-left: 53.5px;
  margin-right: 53.5px;
  margin-left: 125.45px;
  margin-right: 125.45px;
}

.link-section {
  margin-left: 53.5px;
  margin-right: 53.5px;
  margin-left: 125.45px;
  margin-right: 125.45px;
  margin-top: 3rem;
  background-color: #121212;
}

.member-section {
  margin-top: 3rem;
  margin-left: 53.5px;
  margin-right: 53.5px;
  margin-left: 125.45px;
  margin-right: 125.45px;
  background-color: #121212;
}

.logo-banner img {
  height: 128px;
}

.logo-banner h1 {
  font-size: 60px;
  font-weight: bold;
  color: white;
}

.logo-banner p {
  font-size: 20px;
  font-weight: bold;
  color: #757474;
}

.author-section > div {
  width: 90%;
  padding: 16px;
  background-color: #29292c;
  border-radius: 10px;
}

.author-icon {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-bottom: 32px;
}

.author-icon img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  margin-top: -4rem;
}

.author-icon svg {
  width: 32px;
  height: 32px;
  margin-left: auto;
  fill: #a1a1aa;
}

.author-icon h2 {
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: white;
}

.author-text {
  color: #a1a1aa;
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.card1 {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  background-color: #29292c;
  border-radius: 20px;
  padding: 32px 32px 0px 32px;
  overflow: hidden;
  margin-left: 53.5px;
  margin-right: 53.5px;
}

.card1-img {
  width: 100%;
}

.card1-img img {
  border-radius: 20px;
  width: 100%;
  object-fit: cover;
}

.card1 h2 {
  font-weight: 900;
  font-size: 3rem;
  line-height: 1;
  color: white;
  margin-bottom: 0.5rem;
}

.card1 span {
  font-size: 16px;
  color: #a1a1aa;
  margin-bottom: 0.5rem;
}

.card1 p {
  margin-top: 1rem;
  color: #e4e4e7;
  margin-bottom: 32px;
  line-height: 25px;
  font-size: 16px;
}

.card2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #121212;
  margin: 0 auto;
  margin-top: 40px;
  overflow: hidden;
  margin-left: 53.5px;
  margin-right: 53.5px;
  gap: 30px;
}

.card2-left {
  background: linear-gradient(45deg, #a855f7, #ec4899);
  height: 692px;
  border-radius: 20px;
  width: 48%;
  padding: 32px;
  box-sizing: border-box;
}

.card2-right {
  background: linear-gradient(45deg, #11b3d6, #3a85f4);
  height: 692px;
  border-radius: 20px;
  width: 48%;
  padding: 32px;
  box-sizing: border-box;
}

.card2-left-img {
  position: relative;
}

.card2-left-img img {
  position: absolute;
  top: 3rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 20px;
  border: 8px solid transparent;
  height: 624px;
  object-fit: cover;
}
.card2-right-img {
  position: relative;
}

.card2-right-img img {
  position: absolute;
  top: 3rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 20px;
  border: 8px solid transparent;
  height: 624px;
  object-fit: cover;
}

.card2 > div h2 {
  color: white;
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 900;
}

.card2-left span,
.card2-right span {
  color: white;
}

.card2-left p,
.card2-right p {
  color: white;
  font-size: 16px;
  margin-top: 1rem;
}

.card3 {
  display: flex;
  flex-direction: row;
  background-color: #29292c;
  height: 496px;
  padding: 32px;
  margin-top: 40px;
  overflow: hidden;
  border-radius: 20px;
  margin-left: 53.5px;
  margin-right: 53.5px;
  box-sizing: border-box;
}

.card3-img {
  margin-top: 30px;
}

.card3-img img {
  border-radius: 20px 0px 0px 20px;
  max-width: 100%;
  height: auto;
}

.card3 > div {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.5rem;
}

.card3 > div h2 {
  font-weight: 900;
  color: white;
  font-size: 3rem;
  line-height: 1;
  width: 352px;
}

.card3 > div span {
  font-size: 16px;
  color: #646469;
}

.card3 > div p {
  color: #e4e4e7;
  margin-top: 16px;
  font-size: 16px;
  line-height: 1.5;
}

.card4 {
  background-color: #121212;
  height: 480px;
  margin-left: 53.5px;
  margin-right: 53.5px;
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  grid-template-rows: 480px;
}

.card4-left {
  grid-area: 1/1/2/4;
  background: linear-gradient(45deg, #11b3d6, #3a85f4);
  border-radius: 20px;
}

.card4-right {
  grid-area: 1/4/2/6;
}

.card4-left-img {
  background-image: url(https://jasonxddd.me:9000/image/about/deck-2.gif);
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  position: relative;
}

.card4-left-img::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(
    to bottom,
    rgb(37, 158, 234, 1),
    rgb(96, 107, 241, 0.3)
  );
}

.card4-right-img {
  background-image: url(https://jasonxddd.me:9000/image/about/deck-1.gif);
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  position: relative;
}

.card4-right-img::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: linear-gradient(
    to top left,
    rgb(243, 63, 98, 1),
    rgb(96, 107, 241, 0.3)
  );
}

.card4-left-img h2 {
  position: absolute;
  color: white;
  font-weight: 900;
  font-size: 1.875rem;
  line-height: 2.25rem;
  z-index: 1;
  top: 2rem;
  left: 2rem;
}

.card4-left-img span {
  position: absolute;
  color: white;
  top: 5rem;
  left: 2rem;
  z-index: 1;
}

.card4-right-img h2 {
  position: absolute;
  color: white;
  font-weight: 900;
  font-size: 1.875rem;
  line-height: 2.25rem;
  z-index: 1;
  bottom: 4rem;
  right: 2rem;
}

.card4-right-img span {
  position: absolute;
  color: white;
  bottom: 2rem;
  right: 2rem;
  z-index: 1;
}

.card5 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(1, 1fr);
  gap: 2rem;
  margin-top: 40px;
  margin-left: 53.5px;
  margin-right: 53.5px;
  background-color: #121212;
}

.card5-left {
  background-image: url(https://jasonxddd.me:9000/image/about/social.png);
  grid-area: 1/1/2/2;
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px;
  box-sizing: border-box;
}

.card5-right {
  background-image: radial-gradient(
      at 100% 100%,
      rgba(170, 255, 0, 0.47),
      transparent
    ),
    radial-gradient(
      at 0% 0%,
      rgb(52, 59, 202),
      rgb(162, 120, 182) 50%,
      rgb(220, 135, 90)
    );
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 32px;
  box-sizing: border-box;
}

.card5-left h2 {
  font-weight: 900;
  color: white;
  font-size: 3rem;
  line-height: 1;
  text-align: center;
}

.card5-left span {
  color: rgb(161 161 170);
  font-size: 16px;
  margin-top: 0.5rem;
}

.card5-left p {
  color: rgb(228 228 231);
  margin-top: 1rem;
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
}

.card5-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
}

.card5-text h2 {
  font-weight: 900;
  color: white;
  font-size: 3rem;
  line-height: 1;
  text-align: center;
}

.card5-text span {
  color: rgb(24 24 27);
  font-size: 16px;
  margin-top: 1rem;
  font-weight: 600;
}

.card5-text p {
  color: rgb(228 228 231);
  margin-top: 1rem;
  font-size: 16px;
  text-align: center;
  line-height: 1.5;
}

.card5-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1rem;
}

.card5-grid div svg {
  width: 32px;
  height: 32px;
  stroke: white;
}

.card5-grid div span {
  color: white;
  font-weight: 700;
}

.card5-grid div:first-child {
  grid-area: 1/1/2/2;
  background-color: rgba(82, 82, 91, 0.5);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card5-grid div:nth-child(2) {
  grid-area: 1/2/2/3;
  background-color: rgba(82, 82, 91, 0.5);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card5-grid div:nth-child(3) {
  grid-area: 1/3/2/4;
  background-color: rgba(82, 82, 91, 0.5);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card5-grid div:nth-child(4) {
  grid-area: 2/1/3/2;
  background-color: rgba(82, 82, 91, 0.5);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.card5-grid div:nth-child(5) {
  grid-area: 2/2/3/3;
  background-color: rgba(82, 82, 91, 0.5);
  border-radius: 20px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.card5-grid div:last-child {
  grid-area: 2/3/3/4;
  background-color: rgba(82, 82, 91, 0.5);
  border-radius: 20px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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

.specialthank-section h2 {
  font-weight: 900;
  font-size: 1.875rem;
  line-height: 2.25rem;
  margin-bottom: 2rem;
  color: white;
}

.specialthank-img {
  max-width: 100%;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.5rem;
  overflow: auto;
}

.specialthank-img::-webkit-scrollbar {
  display: none;
}

.specialthank-img img {
  max-width: 128px;
  height: 128px;
  border-radius: 0.5rem;
  cursor: pointer;
}

.specialthank-img label {
  cursor: pointer;
}

.shop-info {
  padding: 2rem;
  background-color: rgba(39, 39, 42, 0.5);
  border-radius: 0.75rem;
  gap: 1rem;
  margin-top: 1rem;
  display: flex;
  display: none;
}

.shop-info img {
  width: 160px;
  height: 160px;
  border-radius: 20px;
}

.shop-info-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shop-info-col h3 {
  text-align: left;
  font-weight: 900;
  font-size: 1.875rem;
  line-height: 2.25rem;
  color: rgb(228 228 231);
  font-family:
    Roboto,
    Noto Sans TC,
    sans-serif;
}

.shop-info-btn {
  display: flex;
  justify-content: flex-start;
  align-content: center;
  gap: 0.5rem;
}

.shop-info-btn button {
  background-color: rgb(8 145 178);
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
}

.shop-info-btn button a {
  text-decoration: none;
  color: white;
}

.shop-info-col p {
  color: rgb(161 161 170);
  font-family:
    Roboto,
    Noto Sans TC,
    sans-serif;
  font-size: 16px;
  line-height: 1.5;
  font-weight: bold;
}

#shop1:checked ~ #shop-info1,
#shop2:checked ~ #shop-info2,
#shop3:checked ~ #shop-info3,
#shop4:checked ~ #shop-info4,
#shop5:checked ~ #shop-info5 {
  display: flex;
}

#shop1:checked ~ .specialthank-section .specialthank-img .shop-img1 img,
#shop2:checked ~ .specialthank-section .specialthank-img .shop-img2 img,
#shop3:checked ~ .specialthank-section .specialthank-img .shop-img3 img,
#shop4:checked ~ .specialthank-section .specialthank-img .shop-img4 img,
#shop5:checked ~ .specialthank-section .specialthank-img .shop-img5 img {
  padding: 10px;
  border: 2px solid blue;
  box-sizing: border-box;
}

input[type='radio'] {
  display: none;
}

.link-area {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(1, 1fr);
  gap: 2rem;
}

.link-section h2 {
  font-weight: 900;
  font-size: 1.875rem;
  line-height: 2.25rem;
  margin-bottom: 2rem;
  color: white;
  text-align: center;
}

.link-area1 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  grid-area: 1/1/2/2;
}

.link-area1 a,
.link-area2 a,
.link-area3 a {
  display: flex;
  align-items: center;
  background-color: rgba(39, 39, 42, 0.8);
  border-radius: 0.75rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: white;
  text-decoration: none;
  padding: 0.5rem;
}

.link-area1 span,
.link-area2 span,
.link-area3 span {
  margin-left: 0.5rem;
}

.link-area2 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  grid-area: 1/2/2/3;
}

.link-area3 {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  grid-area: 1/3/2/4;
}

.link-area svg {
  width: 32px;
  height: 32px;
}

.link-area h3 {
  font-weight: 700;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: white;
}

link-area3 a svg {
  stroke: rgb(239 68 68);
}

.member-section a {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 10rem;
  border-radius: 1rem;
  text-decoration: none;
  color: white;
  background-image: linear-gradient(to right, #6366f1, #a855f7, #ec4899);
}

.member-section a p {
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.75rem;
  padding-left: 2rem;
  padding-right: 2rem;
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
  gap: 0.5rem;
}

.work-shop-footer-flexbox-left-item-title {
  width: 100%;
  color: white;
  line-height: 24px;
}

.work-shop-footer-flexbox-left-item-link {
  width: 100%;
  line-height: 24px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

@media screen and (max-width: 1199px) {
  .sidebar {
    display: none;
  }

  header {
    margin: 0;
    border-radius: 0;
  }

  .content-container {
    width: 100%;
    border-radius: 0;
    margin-top: -64px;
  }

  .container div div img {
    height: 15rem;
  }

  .logo-banner h1 {
    font-size: 30px;
  }

  .card1 {
    margin-left: 0px;
    margin-right: 0px;
  }

  .card2 {
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    margin-left: 0px;
    margin-right: 0px;
  }

  .card2-left,
  .card2-right {
    width: 100%;
    margin-left: 0px;
    margin-right: 0px;
    overflow: hidden;
  }

  .card3 {
    margin-left: 0px;
    margin-right: 0px;
  }

  .card4 {
    margin-left: 0px;
    margin-right: 0px;
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(480px, auto);
  }

  .card4-left {
    grid-area: 1 / 1 / 2 / 2;
  }

  .card4-right {
    grid-area: 2 / 1 / 3 / 2;
  }

  .card5 {
    margin-left: 0px;
    margin-right: 0px;
    margin-top: 550px;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(384px, 480px);
  }

  .card5-left {
    grid-area: 1 / 1 / 2 / 2;
  }

  .card5-right {
    grid-area: 2 / 1 / 3 / 2;
  }

  .author-icon svg {
    margin-left: auto;
  }

  .question-section {
    margin-left: 0px;
    margin-right: 0px;
  }

  .specialthank-section {
    margin-left: 0px;
    margin-right: 0px;
  }

  .specialthank-img {
    justify-content: flex-start;
    align-items: center;
  }

  .shop-info {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .link-section {
    margin-left: 0px;
    margin-right: 0px;
  }

  .link-area {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 1fr);
    gap: 2rem;
  }

  .link-area1 {
    grid-area: 1/1/2/2;
  }

  .link-area2 {
    grid-area: 2/1/3/2;
  }

  .link-area3 {
    grid-area: 3/1/4/2;
  }

  .member-section {
    margin-left: 0px;
    margin-right: 0px;
  }

  .work-shop-footer-flexbox {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .work-shop-footer {
    padding: 5rem 0rem 11rem;
    padding-left: -16px;
    padding-right: -16px;
  }

  .work-shop-footer-flexbox-left {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .work-shop-footer-flexbox-left-item {
    width: 100%;
  }

  .work-shop-footer-flexbox-left-item-link {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .work-shop-footer-flexbox-right {
    justify-content: center;
  }

  .work-shop-footer-flexbox-right-item-text {
    font-size: 16px;
  }

  .work-shop-footer-flexbox-right-group {
    margin-top: 1rem;
  }

  .work-shop-footer-flexbox-right-icon-list {
    justify-content: center;
  }

  .work-shop-footer-copyright {
    flex-direction: column;
    gap: 0.5rem;
  }

  .work-shop-footer-copyright-right {
    display: flex;
    flex-direction: column;
  }

  .shop-info {
    padding: 2rem;
    background-color: rgba(39, 39, 42, 0.5);
    border-radius: 0.75rem;
    gap: 1rem;
    margin-top: 1rem;
    display: flex;
    display: none;
  }

  .card3 > div {
    justify-content: start;
  }

  .card3 {
    display: flex;
    flex-direction: column;
  }

  .card3-img img {
    border-radius: 20px 0px 0px 20px;
    max-width: 100%;
    height: auto;
  }
}

@media screen and (width < 1024px) {
  .container div div img {
    height: 10rem;
  }
}
</style>
