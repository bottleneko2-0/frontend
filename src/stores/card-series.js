import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useI18n } from 'vue-i18n'

export const useCardSeriesStore = defineStore('card-series', () => {
  const API_URL = import.meta.env.VITE_API_URL

  const serieslastReleaseTime = ref('')
  const seriesCode = ref('')
  const seriesInfo = ref('')
  const seriesCardList = ref([])
  const seriesCardListLength = ref(0)
  const { locale } = useI18n()

  // 獲取指定系列所有卡牌資訊;
  const getSeriesCards = async (seriesId) => {
    try {
      const seriesRes = await axios.get(`${API_URL}/api/series`)
      const selectedSeries = seriesRes.data.find((series) => {
        return series.id == seriesId
      })
      seriesInfo.value = selectedSeries

      const res = await axios.get(`${API_URL}/api/series/${seriesId}`)
      // res.data.forEach((card) => {
      //   if (card.type === 'キャラ') {
      //     card.typeTranslate = '角色'
      //   } else if (card.type === 'イベント') {
      //     card.typeTranslate = '事件'
      //   } else if (card.type === 'クライマックス') {
      //     card.typeTranslate = '名場'
      //   }
      // })
      seriesCardList.value = res.data
      seriesCardListLength.value = seriesCardList.value.length
    } catch (err) {
      console.log(err)
    }
  }

  // 存取最後瀏覽的系列
  const saveLastViewSeries = (seriesId) => {
    if (seriesCardList.value) {
      localStorage.setItem('lastViewSeriesId', seriesId)
    }
  }

  // 獲取最後瀏覽的系列
  const getLastViewSeries = async (seriesId) => {
    if (seriesId) {
      await getSeriesCards(seriesId)
    } else if (seriesCardList.value.length === 0) {
      const lastViewSeriesId = localStorage.getItem('lastViewSeriesId')
      if (lastViewSeriesId) {
        await getSeriesCards(lastViewSeriesId)
      }
    }
  }

  const translatedSeriesCardList = computed(() => {
    return seriesCardList.value.map((card) => {
      const translateTitle = card.i18n?.[locale.value]?.title
      const translateFeature = card.i18n?.[locale.value]?.feature
      const translateProductName = card.i18n?.[locale.value]?.productName
      const translateSay = card.i18n?.[locale.value]?.say
      const translateEffect = card.i18n?.[locale.value]?.effect
      return {
        ...card,
        title: translateTitle || card.title,
        feature: translateFeature || card.feature,
        productName: translateProductName || card.productName,
        say: translateSay || card.say,
        effect: translateEffect || card.effect,
        author: card.i18n?.[locale.value]?.author,
      }
    })
  })

  const translatedSeriesInfo = computed(() => {
    return {
      ...seriesInfo.value,
      name:
        seriesInfo.value.i18n?.[locale.value]?.name || seriesInfo.value.name,
    }
  })

  return {
    serieslastReleaseTime,
    seriesCode,
    seriesCardList,
    translatedSeriesCardList,
    getSeriesCards,
    saveLastViewSeries,
    getLastViewSeries,
    seriesInfo,
    translatedSeriesInfo,
    seriesCardListLength,
  }
})
