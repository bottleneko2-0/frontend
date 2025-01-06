<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardInfoStore } from '@/stores/card-info'
import Card from '@/components/card/Card.vue'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const faqData = ref([])
const faqId = Number(route.params.id) // 確保與資料型態相同
const faqItem = ref({})
const relationCards = ref([])
const API_URL = import.meta.env.VITE_API_URL
const { locale } = useI18n()

// 引入CardInfoStore並使用
const cardInfoStore = useCardInfoStore()
const getCardInfoAndShow = cardInfoStore.getCardInfoAndShow

const getCardData = async (id) => {
  try {
    const { data } = await axios.get(`${API_URL}/cards`, {
      params: { id },
    })

    if (!data) {
      throw new Error('No data received')
    }

    return data
  } catch (error) {
    console.error(`Error fetching card data for id ${id}:`, error)
    return null
  }
}

const getFaqData = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/qa`)
    faqData.value = data
    // 過濾出對應的 ID
    for (let i = 0; i < faqData.value.length; i++) {
      if (faqData.value[i].id == faqId) {
        faqItem.value = faqData.value[i]
        break
      }
    }

    if (faqItem.value.relations.length > 0) {
      await getRelationCards()
    }
  } catch (error) {
    console.error(error)
  }
}

const translatedFaqItem = computed(() => {
  const translateQ = faqItem.value.i18n?.[locale.value]?.q
  const translateA = faqItem.value.i18n?.[locale.value]?.a
  return {
    ...faqItem.value,
    q: translateQ || faqItem.value.q,
    a: translateA || faqItem.value.a,
  }
})

const getRelationCards = async () => {
  if (
    faqItem.value &&
    Array.isArray(faqItem.value.relations) &&
    faqItem.value.relations.length > 0
  ) {
    try {
      const promises = faqItem.value.relations.map((id) => getCardData(id))
      const results = await Promise.all(promises)
      // 過濾掉獲取失敗的卡片
      relationCards.value = results.filter((card) => card !== null)
    } catch (error) {
      console.error('Error fetching relation cards:', error)
    }
  } else {
    relationCards.value = []
  }
}

// highlightText: 對傳入字串進行括號、引號等符號區塊加上 <mark> 的處理
const highlightText = (str) => {
  if (typeof str !== 'string') return str

  let highlighted = str

  highlighted = highlighted.replace(
    /『(.*?)』/g,
    '<mark class="mark-1">『$1』</mark>'
  )
  highlighted = highlighted.replace(
    /\[(.*?)\]/g,
    '<mark class="mark-2">[$1]</mark>'
  )
  highlighted = highlighted.replace(
    /「(.*?)」/g,
    '<mark class="mark-3">「$1」</mark>'
  )
  highlighted = highlighted.replace(
    /【(.*?)】/g,
    '<mark class="mark-4">【$1】</mark>'
  )
  highlighted = highlighted.replace(
    /《(.*?)》/g,
    '<mark class="mark-5">《$1》</mark>'
  )
  highlighted = highlighted.replace(
    /\(([^)]*)\)/g,
    '<mark class="mark-6">($1)</mark>'
  )

  return highlighted
}

const goBack = () => {
  router.go(-1)
}

onMounted(async () => {
  getFaqData()
})

// 監聽路由參數的變化
watch(
  () => route.params.id,
  () => {
    getFaqData()
  }
)
</script>

<template>
  <section
    class="fixed top-0 left-0 w-screen h-screen z-[100] grid overflow-y-auto overflow-x-hidden md:overflow-hidden backdrop-blur place-content-center"
  >
    <div
      class="bg-black w-screen md:rounded-xl relative h-mobile-full overflow-auto flex flex-col md:w-[50vw] md:h-[80vh]"
    >
      <header
        class="sticky top-0 z-20 flex items-start px-4 pt-4 pb-2 border-b bg-zinc-900 border-zinc-800"
      >
        <h2 class="w-full text-white grow-1">
          <div class="flex items-center gap-2">
            <p class="text-lg font-bold">Q.{{ translatedFaqItem.id }}</p>
          </div>
        </h2>
        <div @click="goBack" class="flex justify-end flex-none gap-2">
          <button
            class="flex-none p-1 text-white rounded-full bg-black/70 hover:bg-white hover:text-black"
          >
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
                d="M6 18 18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </header>
      <main class="w-full h-full px-4 overflow-x-hidden pane-content scrollbar">
        <section class="flex flex-col h-full gap-2 py-4">
          <div class="flex flex-col gap-4">
            <div class="flex items-end gap-2">
              <div
                class="bg-gradient-to-tr from-emerald-500 to-green-300 p-2 rounded-2xl max-w-[80%]"
              >
                <p
                  v-html="highlightText(translatedFaqItem.q)"
                  class="text-sm leading-relaxed whitespace-pre-line"
                ></p>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-zinc-300"
                  >Q.{{ translatedFaqItem.id }}</span
                >
                <span
                  class="font-mono text-xs whitespace-nowrap text-zinc-500"
                  >{{ translatedFaqItem.date }}</span
                >
              </div>
            </div>
            <div class="flex flex-row-reverse items-end gap-2">
              <div
                class="bg-gradient-to-bl from-white to-neutral-400 p-2 rounded-2xl max-w-[80%]"
              >
                <p
                  v-html="highlightText(translatedFaqItem.a)"
                  class="text-sm leading-relaxed whitespace-pre-line"
                ></p>
              </div>
              <div class="flex flex-col text-right">
                <span class="font-bold text-zinc-300"
                  >A.{{ translatedFaqItem.id }}</span
                >
                <span
                  class="font-mono text-xs whitespace-nowrap text-zinc-500"
                  >{{ translatedFaqItem.date }}</span
                >
              </div>
            </div>
          </div>
          <h3 class="mt-12 text-white topic">
            關聯卡牌
            <span class="subtitle"
              >一共有
              {{
                translatedFaqItem && translatedFaqItem.relations
                  ? translatedFaqItem.relations.length
                  : 0
              }}
              張</span
            >
          </h3>
          <div class="grid grid-cols-2 gap-4 pb-8 lg:grid-cols-5">
            <div
              v-if="translatedFaqItem.relations != ''"
              v-for="card in relationCards"
              class="flex flex-col items-center"
            >
              <span class="font-mono text-sm truncate text-zinc-200">{{
                card.data.id
              }}</span>
              <div
                @click="getCardInfoAndShow(card.data)"
                class="relative cursor-pointer group"
              >
                <Card>
                  <div
                    class="relative overflow-hidden rounded-card"
                    style="
                      transition: transform 0.5s ease-in-out;
                      transform: rotateY(0deg) rotateX(0deg);
                    "
                  >
                    <img
                      :src="card.data.cover"
                      alt="關聯卡牌"
                      class="flex-none w-full min-w-0 shadow-lg select-none rounded-card aspect-card default-transition bg-image"
                    />
                  </div>
                </Card>
                <div
                  class="absolute z-[2] bottom-0 w-full px-1 pb-1 pt-4 flex items-end gap-1 bg-mask group-hover:bg-none"
                >
                  <div
                    class="grow-1 w-full min-w-0 group-hover:opacity-0 will-change-[opacity] transition-opacity select-none"
                  >
                    <p class="font-mono text-sm truncate text-zinc-300">
                      {{ card.data.id }}
                    </p>
                    <p class="font-bold text-white truncate">
                      {{ card.data.title }}
                    </p>
                  </div>
                  <button
                    class="group-hover:bg-zinc-800 group-hover:shadow group-hover:shadow-zinc-800/50 flex-none rounded-full p-1 shadow-xl will-change-[background,shadow] transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      class="text-white stroke-2 size-7"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </section>
</template>

<style scoped>
@import '@/assets/base.css';

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
.page {
  perspective: 1000px;
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

.subtitle {
  color: rgb(161 161 170);
  display: block;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1rem;
}

.bg-mask {
  background-image: linear-gradient(transparent, #0009 40%, #000000bf);
}

@media screen and (width < 768px) {
  body {
    background-color: #121212;
  }

  section > div {
    width: 100%;
    height: calc(100% - 70.5px);
    background-color: #121212;
    padding: 0;
  }
}
</style>
