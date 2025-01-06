import { ref, computed, reactive } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useCardSeriesStore } from './card-series'
import Swal from 'sweetalert2'

export const useCardFilterStore = defineStore('card-filter', () => {
  const cardSeriesStore = useCardSeriesStore()

  const { seriesCardList } = storeToRefs(cardSeriesStore)
  const getLastViewSeries = cardSeriesStore.getLastViewSeries

  //APPLY按鈕變數
  const applyBtnStatus = ref(false)

  // 篩選用空陣列
  const newSeriesCardList = ref([])

  // 升降排序變數集合
  const filterVaribleSet = reactive({
    keyWord: '',
    replaceKeyWord: false,
    upDownSortArray: [],
    levelUpSort: false,
    levelDownSort: false,
    colorUpSort: false,
    colorDownSort: false,
    priceUpSort: false,
    priceDownSort: false,
    typeCharacter: false,
    typeScene: false,
    typeEvent: false,
    levelFilter0: false,
    levelFilter1: false,
    levelFilter2: false,
    levelFilter3: false,
    colorFilterRed: false,
    colorFilterBlue: false,
    colorFilterYellow: false,
    costFilter0: false,
    costFilter1: false,
    costFilter2: false,
    soulFilter0: false,
    soulFilter1: false,
    soulFilter2: false,
    attackFilter0: false,
    attackFilter500: false,
    attackFilter1000: false,
    attackFilter1500: false,
    attackFilter2000: false,
    attackFilter2500: false,
    attackFilter3000: false,
    attackFilter3500: false,
    attackFilter4000: false,
    attackFilter4500: false,
    attackFilter5000: false,
    attackFilter5500: false,
    attackFilter6000: false,
    attackFilter6500: false,
    attackFilter7000: false,
    attackFilter7500: false,
    attackFilter8000: false,
    attackFilter8500: false,
    attackFilter9000: false,
    attackFilter9500: false,
    attackFilter10000: false,
    attackFilter10500: false,
    attackFilter11000: false,
    rareFilterRR: false,
    rareFilterSSP: false,
    rareFilterLRR: false,
    rareFilterR: false,
    rareFilterSR: false,
    rareFilterOFR: false,
    rareFilterU: false,
    rareFilterC: false,
    rareFilterCR: false,
    rareFilterRRR: false,
    rareFilterCC: false,
    rareFilterPR: false,
    rareFilterTD: false,
    rareFilterSP: false,
    rareFilterN: false,
    rareFilterLRP: false,
    rareFilterSIR: false,
  })

  // 設定起始刪除計算時間
  const setStartTime = ref(0)
  const countMouseUp = () => {
    setStartTime.value = Date.now()
  }

  // 常用篩選群組
  const myFiltersGroup = ref(
    JSON.parse(localStorage.getItem('myFiltersGroup')) || []
  )

  // 儲存常用篩選功能
  const saveMyFilters = async () => {
    await Swal.fire({
      title: '常用',
      inputLabel: '請輸入常用篩選名稱',
      input: 'text',
      confirmButtonText: '確定',
      showCancelButton: true,
      cancelButtonText: '取消',
      color: '#fff',
      background: '#18181b',
      inputValidator: (value) => {
        if (value) {
          if (!localStorage.getItem('myFiltersGroup')) {
            myFiltersGroup.value.push({
              name: value,
              filters: { ...filterVaribleSet },
            })
          } else {
            const updatedGroup = JSON.parse(
              localStorage.getItem('myFiltersGroup')
            )
            updatedGroup.push({
              name: value,
              filters: { ...filterVaribleSet },
            })
            myFiltersGroup.value = updatedGroup
          }
        }
      },
    })
    localStorage.setItem('myFiltersGroup', JSON.stringify(myFiltersGroup.value))
  }

  // 刪除常用篩選功能
  const deleteMyFilters = async (myFilter) => {
    const finishedTime = Date.now() - setStartTime.value
    if (finishedTime > 300) {
      const index = myFiltersGroup.value.findIndex((item, index) => {
        item.name === myFilter.name
      })

      const res = await Swal.fire({
        icon: 'question',
        title: '刪除常用篩選',
        text: '確定要刪除嗎?',
        confirmButtonText: '確定',
        showCancelButton: true,
        cancelButtonText: '取消',
        color: '#fff',
        background: '#18181b',
      })
      if (res.isConfirmed) {
        myFiltersGroup.value.splice(index, 1)
        localStorage.setItem(
          'myFiltersGroup',
          JSON.stringify(myFiltersGroup.value)
        )
      }
    }
    setStartTime.value = 0
  }

  // 關鍵字群組
  const keyWordGroup = ref(
    JSON.parse(localStorage.getItem('keyWordGroup')) || []
  )

  // 儲存關鍵字功能
  const saveKeyWord = () => {
    if (!localStorage.getItem('keyWordGroup')) {
      keyWordGroup.value = [filterVaribleSet.keyWord]
    } else {
      const updatedGroup = JSON.parse(localStorage.getItem('keyWordGroup'))
      updatedGroup.push(filterVaribleSet.keyWord)
      keyWordGroup.value = updatedGroup
    }
    localStorage.setItem('keyWordGroup', JSON.stringify(keyWordGroup.value))
  }

  // 刪除關鍵字功能
  const deleteKeyWord = async (keyWord) => {
    const finishedTime = Date.now() - setStartTime.value
    if (finishedTime > 300) {
      const index = keyWordGroup.value.findIndex((item, index) => {
        item === keyWord
      })

      const res = await Swal.fire({
        icon: 'question',
        title: '刪除儲存關鍵字',
        text: '確定要刪除嗎?',
        confirmButtonText: '確定',
        showCancelButton: true,
        cancelButtonText: '取消',
        color: '#fff',
        background: '#18181b',
      })
      if (res.isConfirmed) {
        keyWordGroup.value.splice(index, 1)
        localStorage.setItem('keyWordGroup', JSON.stringify(keyWordGroup.value))
        filterVaribleSet.keyWord = ''
      }
    }
    setStartTime.value = 0
  }

  // AND按鈕切換
  const changeReplaceKeyWord = () => {
    if (filterVaribleSet.replaceKeyWord === true) {
      filterVaribleSet.replaceKeyWord = false
    } else {
      filterVaribleSet.replaceKeyWord = true
    }
  }

  // 篩選選項狀態切換
  const changeFilterStatus = (filterName) => {
    filterVaribleSet[filterName] = !filterVaribleSet[filterName]
    checkHaveFilterOrSort()
  }

  // 判斷是否有選擇篩選或排序
  const checkHaveFilterOrSort = () => {
    if (
      Object.keys(filterVaribleSet).find(
        (item) => filterVaribleSet[item] === true
      )
    ) {
      applyBtnStatus.value = true
    } else if (
      !Object.keys(filterVaribleSet).find(
        (item) => filterVaribleSet[item] === true
      )
    ) {
      applyBtnStatus.value = false
    }
  }

  // 升降排序狀態切換
  const changeSortStatus = (sortName) => {
    if (sortName == 'level') {
      if (filterVaribleSet.levelUpSort === false) {
        filterVaribleSet.levelUpSort = true
        filterVaribleSet.levelDownSort = false
        checkUpDownSortArray('levelUpSort')
      } else if (filterVaribleSet.levelDownSort === false) {
        filterVaribleSet.levelDownSort = true
        filterVaribleSet.levelUpSort = false
        checkUpDownSortArray('levelDownSort')
      }
    } else if (sortName == 'color') {
      if (filterVaribleSet.colorUpSort === false) {
        filterVaribleSet.colorUpSort = true
        filterVaribleSet.colorDownSort = false
        checkUpDownSortArray('colorUpSort')
      } else if (filterVaribleSet.colorDownSort === false) {
        filterVaribleSet.colorDownSort = true
        filterVaribleSet.colorUpSort = false
        checkUpDownSortArray('colorDownSort')
      }
    } else if (sortName == 'price') {
      if (filterVaribleSet.priceUpSort === false) {
        filterVaribleSet.priceUpSort = true
        filterVaribleSet.priceDownSort = false
        checkUpDownSortArray('priceUpSort')
      } else if (filterVaribleSet.priceDownSort === false) {
        filterVaribleSet.priceDownSort = true
        filterVaribleSet.priceUpSort = false
        checkUpDownSortArray('priceDownSort')
      }
    }
    checkHaveFilterOrSort()
  }

  // 檢查是否有重複的升降排序
  const checkUpDownSortArray = (sortName) => {
    const isHave = filterVaribleSet.upDownSortArray.find((item) => {
      return item === sortName
    })

    if (!isHave) {
      if (sortName == 'levelUpSort') {
        const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
          return item === 'levelDownSort'
        })
        if (index !== -1) {
          filterVaribleSet.upDownSortArray[index] = 'levelUpSort'
        } else {
          filterVaribleSet.upDownSortArray.push('levelUpSort')
        }
      }

      if (sortName == 'levelDownSort') {
        const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
          return item === 'levelUpSort'
        })
        if (index !== -1) {
          filterVaribleSet.upDownSortArray[index] = 'levelDownSort'
        } else {
          filterVaribleSet.upDownSortArray.push('levelDownSort')
        }
      }

      if (sortName == 'colorUpSort') {
        const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
          return item === 'colorDownSort'
        })
        if (index !== -1) {
          filterVaribleSet.upDownSortArray[index] = 'colorUpSort'
        } else {
          filterVaribleSet.upDownSortArray.push('colorUpSort')
        }
      }

      if (sortName == 'colorDownSort') {
        const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
          return item === 'colorUpSort'
        })
        if (index !== -1) {
          filterVaribleSet.upDownSortArray[index] = 'colorDownSort'
        } else {
          filterVaribleSet.upDownSortArray.push('colorDownSort')
        }
      }

      if (sortName == 'priceUpSort') {
        const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
          return item === 'priceDownSort'
        })
        if (index !== -1) {
          filterVaribleSet.upDownSortArray[index] = 'priceUpSort'
        } else {
          filterVaribleSet.upDownSortArray.push('priceUpSort')
        }
      }

      if (sortName == 'priceDownSort') {
        const index = filterVaribleSet.upDownSortArray.findIndex((item) => {
          return item === 'priceUpSort'
        })
        if (index !== -1) {
          filterVaribleSet.upDownSortArray[index] = 'priceDownSort'
        } else {
          filterVaribleSet.upDownSortArray.push('priceDownSort')
        }
      }
    }
  }

  // 重置部分篩選
  const resetFilter = (filterArr) => {
    const checkUpDownSort = filterArr.find((item) => {
      return (
        item === 'upDownSortArray' ||
        item === 'levelUpSort' ||
        item === 'levelDownSort' ||
        item === 'colorUpSort' ||
        item === 'colorDownSort' ||
        item === 'priceUpSort' ||
        item === 'priceDownSort'
      )
    })

    const checkHaveKeyWord = filterArr.find((item) => {
      return item === 'keyWord'
    })

    if (checkUpDownSort) {
      filterVaribleSet.upDownSortArray = []
      filterVaribleSet.levelUpSort = false
      filterVaribleSet.levelDownSort = false
      filterVaribleSet.colorUpSort = false
      filterVaribleSet.colorDownSort = false
      filterVaribleSet.priceUpSort = false
      filterVaribleSet.priceDownSort = false
    } else if (checkHaveKeyWord) {
      filterVaribleSet.keyWord = ''
    } else {
      filterArr.forEach((item) => {
        filterVaribleSet[item] = false
      })
    }

    checkHaveFilterOrSort()
  }

  // 重置全部篩選
  const resetAllFilter = async () => {
    Object.keys(filterVaribleSet).forEach((item) => {
      if (item === 'upDownSortArray') {
        filterVaribleSet[item] = []
      } else if (item === 'keyWord') {
        filterVaribleSet[item] = ''
      } else {
        filterVaribleSet[item] = false
      }
    })
    checkHaveFilterOrSort()
    newSeriesCardList.value = []
    seriesCardList.value = []
    await getLastViewSeries()
  }

  // 篩選功能
  const useFilters = async (keyWord) => {
    newSeriesCardList.value = []
    seriesCardList.value = []
    await getLastViewSeries()

    // seriesCardList是目前的系列所有的卡片，newSeriesCardList是篩選後的卡片
    newSeriesCardList.value = seriesCardList.value

    if (keyWord != '') {
      keyWordFilter(keyWord)
    }

    if (
      filterVaribleSet.typeCharacter ||
      filterVaribleSet.typeScene ||
      filterVaribleSet.typeEvent
    ) {
      typeSort()
    }

    if (
      filterVaribleSet.levelFilter0 ||
      filterVaribleSet.levelFilter1 ||
      filterVaribleSet.levelFilter2 ||
      filterVaribleSet.levelFilter3
    ) {
      levelFilter()
    }

    if (
      filterVaribleSet.colorFilterRed ||
      filterVaribleSet.colorFilterBlue ||
      filterVaribleSet.colorFilterYellow
    ) {
      colorFilter()
    }

    if (
      filterVaribleSet.costFilter0 ||
      filterVaribleSet.costFilter1 ||
      filterVaribleSet.costFilter2
    ) {
      costFilter()
    }

    if (
      filterVaribleSet.soulFilter0 ||
      filterVaribleSet.soulFilter1 ||
      filterVaribleSet.soulFilter2
    ) {
      soulFilter()
    }

    if (
      filterVaribleSet.attackFilter0 ||
      filterVaribleSet.attackFilter500 ||
      filterVaribleSet.attackFilter1000 ||
      filterVaribleSet.attackFilter1500 ||
      filterVaribleSet.attackFilter2000 ||
      filterVaribleSet.attackFilter2500 ||
      filterVaribleSet.attackFilter3000 ||
      filterVaribleSet.attackFilter3500 ||
      filterVaribleSet.attackFilter4000 ||
      filterVaribleSet.attackFilter4500 ||
      filterVaribleSet.attackFilter5000 ||
      filterVaribleSet.attackFilter5500 ||
      filterVaribleSet.attackFilter6000 ||
      filterVaribleSet.attackFilter6500 ||
      filterVaribleSet.attackFilter7000 ||
      filterVaribleSet.attackFilter7500 ||
      filterVaribleSet.attackFilter8000 ||
      filterVaribleSet.attackFilter8500 ||
      filterVaribleSet.attackFilter9000 ||
      filterVaribleSet.attackFilter9500 ||
      filterVaribleSet.attackFilter10000 ||
      filterVaribleSet.attackFilter10500 ||
      filterVaribleSet.attackFilter11000
    ) {
      attackFilter()
    }

    if (
      filterVaribleSet.rareFilterRR ||
      filterVaribleSet.rareFilterSSP ||
      filterVaribleSet.rareFilterLRR ||
      filterVaribleSet.rareFilterR ||
      filterVaribleSet.rareFilterSR ||
      filterVaribleSet.rareFilterOFR ||
      filterVaribleSet.rareFilterU ||
      filterVaribleSet.rareFilterC ||
      filterVaribleSet.rareFilterCR ||
      filterVaribleSet.rareFilterRRR ||
      filterVaribleSet.rareFilterCC ||
      filterVaribleSet.rareFilterPR ||
      filterVaribleSet.rareFilterTD ||
      filterVaribleSet.rareFilterSP ||
      filterVaribleSet.rareFilterN ||
      filterVaribleSet.rareFilterLRP ||
      filterVaribleSet.rareFilterSIR
    ) {
      rareFilter()
    }

    useUpDownSort()

    // 篩選完後把新的陣列賦值給seriesCardList
    seriesCardList.value = newSeriesCardList.value
    checkHaveFilterOrSort()
  }

  // 升降排序功能
  const useUpDownSort = () => {
    // 數組內分組
    const clusteredArray = ref([])
    // 數組內分組的依據
    const filterArray = ref([])

    // 第一階段 根據等級、顏色、價格排序
    if (
      filterVaribleSet.upDownSortArray[0] == 'levelUpSort' ||
      filterVaribleSet.upDownSortArray[0] == 'levelDownSort'
    ) {
      levelSort()

      newSeriesCardList.value.forEach((card) => {
        filterArray.value.push(card.level)
      })
      const uniArray = ref([])
      for (let i = 0; i < filterArray.value.length; i++) {
        const checkHaveLevel = uniArray.value.find((level) => {
          return level == filterArray.value[i]
        })
        if (checkHaveLevel == undefined) {
          uniArray.value.push(filterArray.value[i])
        }
      }
      filterArray.value = uniArray.value

      // 根據等級進行各別數組分組
      for (let i = 0; i < filterArray.value.length; i++) {
        const filteredArray = newSeriesCardList.value.filter((card) => {
          return card.level == filterArray.value[i]
        })
        clusteredArray.value.push(filteredArray)
      }

      // 將數組展開後合併成一個數組
      const unClusteredArray = ref([])
      clusteredArray.value.forEach((arr) => {
        unClusteredArray.value.push(...arr)
      })
      newSeriesCardList.value = unClusteredArray.value
    } else if (
      filterVaribleSet.upDownSortArray[0] == 'colorUpSort' ||
      filterVaribleSet.upDownSortArray[0] == 'colorDownSort'
    ) {
      colorSort()

      newSeriesCardList.value.forEach((card) => {
        filterArray.value.push(card.color)
      })
      const uniArray = ref([])
      for (let i = 0; i < filterArray.value.length; i++) {
        const checkHaveColor = uniArray.value.find((color) => {
          return color == filterArray.value[i]
        })
        if (checkHaveColor == undefined) {
          uniArray.value.push(filterArray.value[i])
        }
      }
      filterArray.value = uniArray.value

      // 根據顏色進行各別數組分組
      for (let i = 0; i < filterArray.value.length; i++) {
        const filteredArray = newSeriesCardList.value.filter((card) => {
          return card.color == filterArray.value[i]
        })
        clusteredArray.value.push(filteredArray)
      }

      // 將數組展開合併成一個數組
      const unClusteredArray = ref([])
      clusteredArray.value.forEach((arr) => {
        unClusteredArray.value.push(...arr)
      })
      newSeriesCardList.value = unClusteredArray.value
    } else if (
      filterVaribleSet.upDownSortArray[0] == 'priceUpSort' ||
      filterVaribleSet.upDownSortArray[0] == 'priceDownSort'
    ) {
      priceSort()

      newSeriesCardList.value.forEach((card) => {
        filterArray.value.push(card.price.number)
      })
      const uniArray = ref([])
      for (let i = 0; i < filterArray.value.length; i++) {
        const checkHavePrice = uniArray.value.find((price) => {
          return price == filterArray.value[i]
        })
        if (checkHavePrice == undefined) {
          uniArray.value.push(filterArray.value[i])
        }
      }
      filterArray.value = uniArray.value

      // 根據價格進行各別數組分組
      for (let i = 0; i < filterArray.value.length; i++) {
        const filteredArray = newSeriesCardList.value.filter((card) => {
          return card.price.number == filterArray.value[i]
        })
        clusteredArray.value.push(filteredArray)
      }

      // 將數組展開合併成一個數組
      const unClusteredArray = ref([])
      clusteredArray.value.forEach((arr) => {
        unClusteredArray.value.push(...arr)
      })
      newSeriesCardList.value = unClusteredArray.value
    }

    // 第二階段 分組排序
    if (
      filterVaribleSet.upDownSortArray[1] == 'levelUpSort' ||
      filterVaribleSet.upDownSortArray[1] == 'levelDownSort'
    ) {
      const newClusteredArray = ref([])
      for (let i = 0; i < clusteredArray.value.length; i++) {
        const newArr = levelSortV2(clusteredArray.value[i])
        newClusteredArray.value.push(newArr)
      }

      const unClusteredArray = ref([])
      newClusteredArray.value.forEach((arr) => {
        unClusteredArray.value.push(...arr)
      })
      // 包含未展開數組的數組
      clusteredArray.value = newClusteredArray.value
      // 將展開卡片的數組賦值回原數組
      newSeriesCardList.value = unClusteredArray.value
    } else if (
      filterVaribleSet.upDownSortArray[1] == 'colorUpSort' ||
      filterVaribleSet.upDownSortArray[1] == 'colorDownSort'
    ) {
      const newClusteredArray = ref([])
      for (let i = 0; i < clusteredArray.value.length; i++) {
        const newArr = colorSortV2(clusteredArray.value[i])
        newClusteredArray.value.push(newArr)
      }

      const unClusteredArray = ref([])
      newClusteredArray.value.forEach((arr) => {
        unClusteredArray.value.push(...arr)
      })
      // 包含未展開數組的數組
      clusteredArray.value = newClusteredArray.value
      // 將展開卡片的數組賦值回原數組
      newSeriesCardList.value = unClusteredArray.value
    } else if (
      filterVaribleSet.upDownSortArray[1] == 'priceUpSort' ||
      filterVaribleSet.upDownSortArray[1] == 'priceDownSort'
    ) {
      const newClusteredArray = ref([])
      for (let i = 0; i < clusteredArray.value.length; i++) {
        const newArr = priceSortV2(clusteredArray.value[i])
        newClusteredArray.value.push(newArr)
      }

      const unClusteredArray = ref([])
      newClusteredArray.value.forEach((arr) => {
        unClusteredArray.value.push(...arr)
      })
      // 包含未展開數組的數組
      clusteredArray.value = newClusteredArray.value
      // 將展開卡片的數組賦值回原數組
      newSeriesCardList.value = unClusteredArray.value
    }

    // 第三階段 分組排序
    if (
      filterVaribleSet.upDownSortArray[2] == 'levelUpSort' ||
      filterVaribleSet.upDownSortArray[2] == 'levelDownSort'
    ) {
      // 判斷第二階段是哪種升降排序
      if (
        filterVaribleSet.upDownSortArray[1] == 'priceUpSort' ||
        filterVaribleSet.upDownSortArray[1] == 'priceDownSort'
      ) {
        const newClusteredArray = ref([])

        for (let i = 0; i < clusteredArray.value.length; i++) {
          const secondClusteredArray = ref([])
          // 在第一階段分類的基礎上，做第二階段的分類
          secondClusteredArray.value = priceSortV3(clusteredArray.value[i])
          for (let j = 0; j < secondClusteredArray.value.length; j++) {
            const newArr = colorSortV2(secondClusteredArray.value[j])
            newClusteredArray.value.push(...newArr)
          }
        }
        newSeriesCardList.value = newClusteredArray.value
      } else if (
        filterVaribleSet.upDownSortArray[1] == 'colorUpSort' ||
        filterVaribleSet.upDownSortArray[1] == 'colorDownSort'
      ) {
        const newClusteredArray = ref([])

        for (let i = 0; i < clusteredArray.value.length; i++) {
          const secondClusteredArray = ref([])
          // 在第一階段分類的基礎上，做第二階段的分類
          secondClusteredArray.value = colorSortV3(clusteredArray.value[i])
          for (let j = 0; j < secondClusteredArray.value.length; j++) {
            const newArr = priceSortV2(secondClusteredArray.value[j])
            newClusteredArray.value.push(...newArr)
          }
        }
        newSeriesCardList.value = newClusteredArray.value
      }
    } else if (
      filterVaribleSet.upDownSortArray[2] == 'colorUpSort' ||
      filterVaribleSet.upDownSortArray[2] == 'colorDownSort'
    ) {
      // 判斷第二階段是哪種升降排序
      if (
        filterVaribleSet.upDownSortArray[1] == 'levelUpSort' ||
        filterVaribleSet.upDownSortArray[1] == 'levelDownSort'
      ) {
        const newClusteredArray = ref([])

        for (let i = 0; i < clusteredArray.value.length; i++) {
          const secondClusteredArray = ref([])
          // 在第一階段分類的基礎上，做第二階段的分類
          secondClusteredArray.value = levelSortV3(clusteredArray.value[i])
          for (let j = 0; j < secondClusteredArray.value.length; j++) {
            const newArr = colorSortV2(secondClusteredArray.value[j])
            newClusteredArray.value.push(...newArr)
          }
        }
        newSeriesCardList.value = newClusteredArray.value
      } else if (
        filterVaribleSet.upDownSortArray[1] == 'priceUpSort' ||
        filterVaribleSet.upDownSortArray[1] == 'priceDownSort'
      ) {
        const newClusteredArray = ref([])

        for (let i = 0; i < clusteredArray.value.length; i++) {
          const secondClusteredArray = ref([])
          // 在第一階段分類的基礎上，做第二階段的分類
          secondClusteredArray.value = priceSortV3(clusteredArray.value[i])
          for (let j = 0; j < secondClusteredArray.value.length; j++) {
            const newArr = colorSortV2(secondClusteredArray.value[j])
            newClusteredArray.value.push(...newArr)
          }
        }
        newSeriesCardList.value = newClusteredArray.value
      }
    } else if (
      filterVaribleSet.upDownSortArray[2] == 'priceUpSort' ||
      filterVaribleSet.upDownSortArray[2] == 'priceDownSort'
    ) {
      // 判斷第二階段是哪種升降排序
      if (
        filterVaribleSet.upDownSortArray[1] == 'levelUpSort' ||
        filterVaribleSet.upDownSortArray[1] == 'levelDownSort'
      ) {
        const newClusteredArray = ref([])

        for (let i = 0; i < clusteredArray.value.length; i++) {
          const secondClusteredArray = ref([])
          // 在第一階段分類的基礎上，做第二階段的分類
          secondClusteredArray.value = levelSortV3(clusteredArray.value[i])
          for (let j = 0; j < secondClusteredArray.value.length; j++) {
            const newArr = priceSortV2(secondClusteredArray.value[j])
            newClusteredArray.value.push(...newArr)
          }
        }
        newSeriesCardList.value = newClusteredArray.value
      } else if (
        filterVaribleSet.upDownSortArray[1] == 'colorUpSort' ||
        filterVaribleSet.upDownSortArray[1] == 'colorDownSort'
      ) {
        const newClusteredArray = ref([])

        for (let i = 0; i < clusteredArray.value.length; i++) {
          const secondClusteredArray = ref([])
          // 在第一階段分類的基礎上，做第二階段的分類
          secondClusteredArray.value = colorSortV3(clusteredArray.value[i])
          for (let j = 0; j < secondClusteredArray.value.length; j++) {
            const newArr = priceSortV2(secondClusteredArray.value[j])
            newClusteredArray.value.push(...newArr)
          }
        }
        newSeriesCardList.value = newClusteredArray.value
      }
    }
  }

  // 關鍵字搜尋
  const keyWordFilter = (keyWord) => {
    const keyWordArray = ref([])
    if (filterVaribleSet.replaceKeyWord === false) {
      keyWordArray.value = [keyWord]
    } else if (filterVaribleSet.replaceKeyWord === true) {
      keyWordArray.value = keyWord.replace(' ', ',').split(',')
    }
    const filterCards = ref([])

    keyWordArray.value.forEach((key) => {
      newSeriesCardList.value.filter((card) => {
        if (
          card.effect.includes(key) ||
          card.title.includes(key) ||
          card.i18n.zh.title.includes(key) ||
          card.i18n.zh.effect.includes(key)
        ) {
          filterCards.value.push(card)
        }
      })
    })
    newSeriesCardList.value = filterCards.value
  }

  // 等級升降排序
  const levelSort = () => {
    const levelSortArr = ref([])
    const levelArr = newSeriesCardList.value.map((card) => {
      return card.level
    })
    const maxLevel = Math.max(...levelArr)
    // 判斷降序還是升序
    if (filterVaribleSet.levelDownSort === true) {
      for (let i = maxLevel; i >= 0; i--) {
        newSeriesCardList.value.forEach((card) => {
          if (card.level === i) {
            levelSortArr.value.push(card)
          }
        })
      }
    } else if (filterVaribleSet.levelUpSort === true) {
      for (let i = maxLevel; i >= 0; i--) {
        newSeriesCardList.value.forEach((card) => {
          if (card.level === i) {
            levelSortArr.value.unshift(card)
          }
        })
      }
    }
    newSeriesCardList.value = levelSortArr.value
  }

  // 等級升降排序V2 *目前使用在整合分組第二階段*
  const levelSortV2 = (arr) => {
    const levelSortArr = ref([])
    const levelArr = arr.map((card) => {
      return card.level
    })
    const maxLevel = Math.max(...levelArr)
    // 判斷降序還是升序
    if (filterVaribleSet.levelDownSort === true) {
      for (let i = maxLevel; i >= 0; i--) {
        arr.forEach((card) => {
          if (card.level === i) {
            levelSortArr.value.push(card)
          }
        })
      }
    } else if (filterVaribleSet.levelUpSort === true) {
      for (let i = maxLevel; i >= 0; i--) {
        arr.forEach((card) => {
          if (card.level === i) {
            levelSortArr.value.unshift(card)
          }
        })
      }
    }
    return levelSortArr.value
  }

  // 等級升降排序V3 *目前使用在整合分組第三階段*
  const levelSortV3 = (arr) => {
    const levelSortArr = ref([])
    const levelArr = arr.map((card) => {
      return card.level
    })
    const maxLevel = Math.max(...levelArr)
    // 判斷降序還是升序
    if (filterVaribleSet.levelDownSort === true) {
      for (let i = maxLevel; i >= 0; i--) {
        const filteredArr = arr.filter((card) => {
          return card.level === i
        })
        levelSortArr.value.push(filteredArr)
      }
    } else if (filterVaribleSet.levelUpSort === true) {
      for (let i = maxLevel; i >= 0; i--) {
        const filteredArr = arr.filter((card) => {
          return card.level === i
        })
        levelSortArr.value.unshift(filteredArr)
      }
    }
    return levelSortArr.value
  }

  // 顏色升降排序
  const colorSort = () => {
    const colorSortArr = ref([])
    if (filterVaribleSet.colorDownSort === true) {
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'red') {
          colorSortArr.value.push(card)
        }
      })
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'yellow') {
          colorSortArr.value.push(card)
        }
      })
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'green') {
          colorSortArr.value.push(card)
        }
      })
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'blue') {
          colorSortArr.value.push(card)
        }
      })
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'purple') {
          colorSortArr.value.push(card)
        }
      })
    } else if (filterVaribleSet.colorUpSort === true) {
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'purple') {
          colorSortArr.value.push(card)
        }
      })
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'blue') {
          colorSortArr.value.push(card)
        }
      })
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'green') {
          colorSortArr.value.push(card)
        }
      })
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'yellow') {
          colorSortArr.value.push(card)
        }
      })
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'red') {
          colorSortArr.value.push(card)
        }
      })
    }
    newSeriesCardList.value = colorSortArr.value
  }

  // 顏色升降排序V2 *目前使用在整合分組第二階段*
  const colorSortV2 = (arr) => {
    const colorSortArr = ref([])
    if (filterVaribleSet.colorDownSort === true) {
      arr.forEach((card) => {
        if (card.color === 'red') {
          colorSortArr.value.push(card)
        }
      })
      arr.forEach((card) => {
        if (card.color === 'yellow') {
          colorSortArr.value.push(card)
        }
      })
      arr.forEach((card) => {
        if (card.color === 'green') {
          colorSortArr.value.push(card)
        }
      })
      arr.forEach((card) => {
        if (card.color === 'blue') {
          colorSortArr.value.push(card)
        }
      })
      arr.forEach((card) => {
        if (card.color === 'purple') {
          colorSortArr.value.push(card)
        }
      })
    } else if (filterVaribleSet.colorUpSort === true) {
      arr.forEach((card) => {
        if (card.color === 'purple') {
          colorSortArr.value.push(card)
        }
      })
      arr.forEach((card) => {
        if (card.color === 'blue') {
          colorSortArr.value.push(card)
        }
      })
      arr.forEach((card) => {
        if (card.color === 'green') {
          colorSortArr.value.push(card)
        }
      })
      arr.forEach((card) => {
        if (card.color === 'yellow') {
          colorSortArr.value.push(card)
        }
      })
      arr.forEach((card) => {
        if (card.color === 'red') {
          colorSortArr.value.push(card)
        }
      })
    }
    return colorSortArr.value
  }

  // 顏色升降排序V3 *目前使用在整合分組第三階段*
  const colorSortV3 = (arr) => {
    const colorSortArr = ref([])
    const newArr = ref([])
    if (filterVaribleSet.colorDownSort === true) {
      newArr.value = arr.filter((card) => {
        return card.color === 'red'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []

      newArr.value = arr.filter((card) => {
        return card.color === 'yellow'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []

      newArr.value = arr.filter((card) => {
        return card.color === 'green'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []

      newArr.value = arr.filter((card) => {
        return card.color === 'blue'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []

      newArr.value = arr.filter((card) => {
        return card.color === 'purple'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []
    } else if (filterVaribleSet.colorUpSort === true) {
      newArr.value = arr.filter((card) => {
        return card.color === 'purple'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []

      newArr.value = arr.filter((card) => {
        return card.color === 'blue'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []

      newArr.value = arr.filter((card) => {
        return card.color === 'green'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []

      newArr.value = arr.filter((card) => {
        return card.color === 'yellow'
      })
      colorSortArr.value.push(newArr.value)
      newArr.value = []

      newArr.value = arr.filter((card) => {
        return card.color === 'red'
      })
      colorSortArr.value.push(newArr.value)
    }
    return colorSortArr.value
  }

  // 價格升降排序
  const priceSort = () => {
    const priceSortArr = ref([])
    const priceArr = newSeriesCardList.value.map((card) => {
      return card.price.number
    })
    const newPriceArr = ref([])
    newPriceArr.value = Array.from(new Set(priceArr)).sort((a, b) => a - b)

    if (filterVaribleSet.priceUpSort === true) {
      for (let i = 0; i < newPriceArr.value.length; i++) {
        const filtedArr = newSeriesCardList.value.filter((card) => {
          return card.price.number === newPriceArr.value[i]
        })
        priceSortArr.value.push(...filtedArr)
      }
    } else if (filterVaribleSet.priceDownSort === true) {
      for (let i = 0; i < newPriceArr.value.length; i++) {
        const filtedArr = newSeriesCardList.value.filter((card) => {
          return card.price.number === newPriceArr.value[i]
        })
        priceSortArr.value.unshift(...filtedArr)
      }
    }
    newSeriesCardList.value = priceSortArr.value
  }

  // 價格升降排序V2 *目前使用在整合分組第二階段*
  const priceSortV2 = (arr) => {
    const priceSortArr = ref([])
    const priceArr = arr.map((card) => {
      return card.price.number
    })
    const newPriceArr = ref([])
    newPriceArr.value = Array.from(new Set(priceArr)).sort((a, b) => a - b)

    if (filterVaribleSet.priceUpSort === true) {
      for (let i = 0; i < newPriceArr.value.length; i++) {
        const filtedArr = arr.filter((card) => {
          return card.price.number === newPriceArr.value[i]
        })
        priceSortArr.value.push(...filtedArr)
      }
    } else if (filterVaribleSet.priceDownSort === true) {
      for (let i = 0; i < newPriceArr.value.length; i++) {
        const filtedArr = arr.filter((card) => {
          return card.price.number === newPriceArr.value[i]
        })
        priceSortArr.value.unshift(...filtedArr)
      }
    }
    return priceSortArr.value
  }

  // 價格升降排序V3 *目前使用在整合分組第三階段*
  const priceSortV3 = (arr) => {
    const priceSortArr = ref([])
    const priceArr = arr.map((card) => {
      return card.price.number
    })
    const newPriceArr = ref([])
    newPriceArr.value = Array.from(new Set(priceArr)).sort((a, b) => a - b)

    if (filterVaribleSet.priceUpSort === true) {
      for (let i = 0; i < newPriceArr.value.length; i++) {
        const filtedArr = arr.filter((card) => {
          return card.price.number === newPriceArr.value[i]
        })
        priceSortArr.value.push(filtedArr)
      }
    } else if (filterVaribleSet.priceDownSort === true) {
      for (let i = 0; i < newPriceArr.value.length; i++) {
        const filtedArr = arr.filter((card) => {
          return card.price.number === newPriceArr.value[i]
        })
        priceSortArr.value.unshift(filtedArr)
      }
    }
    return priceSortArr.value
  }

  // 類型篩選排序
  const typeSort = () => {
    const typeSortArr = ref([])
    if (filterVaribleSet.typeCharacter) {
      newSeriesCardList.value.forEach((card) => {
        if (card.type === 'キャラ') {
          const checkHaveCard = typeSortArr.value.find((item) => {
            return item === card
          })
          if (!checkHaveCard) {
            typeSortArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.typeScene) {
      newSeriesCardList.value.forEach((card) => {
        if (card.type === 'イベント') {
          const checkHaveCard = typeSortArr.value.find((item) => {
            return item === card
          })
          if (!checkHaveCard) {
            typeSortArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.typeEvent) {
      newSeriesCardList.value.forEach((card) => {
        if (card.type === 'クライマックス') {
          const checkHaveCard = typeSortArr.value.find((item) => {
            return item === card
          })
          if (!checkHaveCard) {
            typeSortArr.value.push(card)
          }
        }
      })
    }
    newSeriesCardList.value = typeSortArr.value
  }

  // 等級篩選排序
  const levelFilter = () => {
    const levelFilterArr = ref([])
    if (filterVaribleSet.levelFilter0) {
      newSeriesCardList.value.forEach((card) => {
        if (card.level === 0) {
          const checkHaveCard = levelFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            levelFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.levelFilter1) {
      newSeriesCardList.value.forEach((card) => {
        if (card.level === 1) {
          const checkHaveCard = levelFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            levelFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.levelFilter2) {
      newSeriesCardList.value.forEach((card) => {
        if (card.level === 2) {
          const checkHaveCard = levelFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            levelFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.levelFilter3) {
      newSeriesCardList.value.forEach((card) => {
        if (card.level === 3) {
          const checkHaveCard = levelFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            levelFilterArr.value.push(card)
          }
        }
      })
    }
    newSeriesCardList.value = levelFilterArr.value
  }

  // 顏色篩選排序
  const colorFilter = () => {
    const colorFilterArr = ref([])
    if (filterVaribleSet.colorFilterRed) {
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'red') {
          const checkHaveCard = colorFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            colorFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.colorFilterBlue) {
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'blue') {
          const checkHaveCard = colorFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            colorFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.colorFilterYellow) {
      newSeriesCardList.value.forEach((card) => {
        if (card.color === 'yellow') {
          const checkHaveCard = colorFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            colorFilterArr.value.push(card)
          }
        }
      })
    }
    newSeriesCardList.value = colorFilterArr.value
  }

  // 費用篩選排序
  const costFilter = () => {
    const costFilterArr = ref([])
    if (filterVaribleSet.costFilter0) {
      newSeriesCardList.value.forEach((card) => {
        if (card.cost === 0) {
          const checkHaveCard = costFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            costFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.costFilter1) {
      newSeriesCardList.value.forEach((card) => {
        if (card.cost === 1) {
          const checkHaveCard = costFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            costFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.costFilter2) {
      newSeriesCardList.value.forEach((card) => {
        if (card.cost === 2) {
          const checkHaveCard = costFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            costFilterArr.value.push(card)
          }
        }
      })
    }
    newSeriesCardList.value = costFilterArr.value
  }

  // 魂傷篩選排序
  const soulFilter = () => {
    const soulFilterArr = ref([])
    if (filterVaribleSet.soulFilter0) {
      newSeriesCardList.value.forEach((card) => {
        if (card.soul === 0) {
          const checkHaveCard = soulFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            soulFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.soulFilter1) {
      newSeriesCardList.value.forEach((card) => {
        if (card.soul === 1) {
          const checkHaveCard = soulFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            soulFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.soulFilter2) {
      newSeriesCardList.value.forEach((card) => {
        if (card.soul === 2) {
          const checkHaveCard = soulFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            soulFilterArr.value.push(card)
          }
        }
      })
    }
    newSeriesCardList.value = soulFilterArr.value
  }

  // 攻擊力篩選排序
  const attackFilter = () => {
    const attackFilterArr = ref([])
    if (filterVaribleSet.attackFilter0) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 0) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter1000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 1000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter1500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 1500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter2000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 2000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter2500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 2500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter3000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 3000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter3500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 3500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter4000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 4000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter4500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 4500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter5000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 5000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter5500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 5500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter6000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 6000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter6500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 6500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter7000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 7000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter7500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 7500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter8000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 8000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter8500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 8500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter9000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 9000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter9500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 9500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter10000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 10000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter10500) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 10500) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }
    if (filterVaribleSet.attackFilter11000) {
      newSeriesCardList.value.forEach((card) => {
        if (card.attack == 11000) {
          const checkHaveCard = attackFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard === undefined) {
            attackFilterArr.value.push(card)
          }
        }
      })
    }

    newSeriesCardList.value = attackFilterArr.value
  }

  // 稀有度篩選排序
  const rareFilter = () => {
    const rareFilterArr = ref([])
    if (filterVaribleSet.rareFilterRR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'RR') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterSSP) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'SSP') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterLRR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'LRR') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'R') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterSR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'SR') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterOFR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'OFR') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterU) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'U') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterC) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'C') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterCR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'CR') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterRRR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'RRR') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterCC) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'CC') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterPR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'PR') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterTD) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'TD') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterSP) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'SP') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterN) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'N') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterLRP) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'LRP') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    if (filterVaribleSet.rareFilterSIR) {
      newSeriesCardList.value.forEach((card) => {
        if (card.rare == 'SIR') {
          const checkHaveCard = rareFilterArr.value.find((item) => {
            return item === card
          })
          if (checkHaveCard == undefined) {
            rareFilterArr.value.push(card)
          }
        }
      })
    }

    newSeriesCardList.value = rareFilterArr.value
  }

  return {
    useFilters,
    applyBtnStatus,
    changeReplaceKeyWord,
    filterVaribleSet,
    changeFilterStatus,
    resetFilter,
    changeSortStatus,
    resetAllFilter,
    checkHaveFilterOrSort,
    saveKeyWord,
    keyWordGroup,
    countMouseUp,
    deleteKeyWord,
    saveMyFilters,
    myFiltersGroup,
    deleteMyFilters,
  }
})
