import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useCardInfoStore } from '@/stores/card-info'

export const useDeckMakeStore = defineStore('deck-make', () => {
  const cardInfoStore = useCardInfoStore()
  const API_URL = import.meta.env.VITE_API_URL

  const selectedCards = ref([])
  const editType = ref('CHECK_INFO')
  const showCardPrice = ref(false)
  const sortedDeck = ref([])
  const sortedTitle = ref([])
  const sortStatus = ref('TYPE')

  // 新增所選卡牌到製作牌組
  const addCard = (selectedCardData) => {
    if (selectedCards.value === null) {
      selectedCards.value = []
    }
    const card = selectedCardData
    selectedCards.value.push(card)
    saveLastDeckEdit()
    switchSortMode()
  }

  // 根據卡牌在製作牌組內的位置，移除所選卡牌
  const removeCard = (card) => {
    const cardIndex = selectedCards.value.findIndex(
      (item) => item.id === card.id
    )
    if (cardIndex >= 0) {
      selectedCards.value.splice(cardIndex, 1)
    } else {
      return
    }
    saveLastDeckEdit()
    switchSortMode()
  }

  // 清空製作牌組內的卡牌和重置最後編輯狀態
  const clearSelectedCards = () => {
    selectedCards.value = []
    localStorage.removeItem('deckEdit')
    switchSortMode()
  }

  // 存取最後製作牌組的編輯狀態
  const saveLastDeckEdit = () => {
    localStorage.setItem('deckEdit', JSON.stringify(selectedCards.value))
  }

  // 獲取最後製作牌組的編輯狀態
  const getLastDeckEdit = () => {
    const lastDeckEditData = localStorage.getItem('deckEdit')
    if (lastDeckEditData) {
      selectedCards.value = JSON.parse(lastDeckEditData)
    }
  }

  // 計算製作牌組內所有卡牌的總價
  const countDeck = computed(() => {
    return selectedCards.value.reduce((total, card) => {
      return total + card.price.number
    }, 0)
  })

  //   切換到增加卡片編輯狀態
  const changeTypeToAdd = () => {
    if (editType.value === 'DELETE_CARD') {
      editType.value = 'ADD_CARD'
    } else if (editType.value === 'ADD_CARD') {
      editType.value = 'CHECK_INFO'
    } else if (editType.value === 'CHECK_INFO') {
      editType.value = 'ADD_CARD'
    }
  }

  //   切換到刪除卡片編輯狀態
  const changeTypeToDelete = () => {
    if (editType.value === 'DELETE_CARD') {
      editType.value = 'CHECK_INFO'
    } else if (editType.value === 'ADD_CARD') {
      editType.value = 'DELETE_CARD'
    } else if (editType.value === 'CHECK_INFO') {
      editType.value = 'DELETE_CARD'
    }
  }

  const checkTypeAndRunFunction = (card, cardIndex, deckIndex) => {
    if (editType.value === 'CHECK_INFO') {
      cardInfoStore.getCardInfoAndShow(card)
    } else if (editType.value === 'ADD_CARD') {
      addCard(card)
      switchSortMode()
    } else if (editType.value === 'DELETE_CARD') {
      removeCard(card)
      switchSortMode()
    }
  }

  const switchSortMode = () => {
    sortedTitle.value = []
    sortedDeck.value = []
    if (sortStatus.value === 'TYPE') {
      // 獲取所有卡牌的類型
      const typeArr = []

      selectedCards.value.forEach((card) => {
        if (typeArr.length <= 0) {
          typeArr.push(card.type)
        }
        const ishave = typeArr.find((type) => type === card.type)
        if (ishave === undefined) {
          typeArr.push(card.type)
        }
      })
      sortedTitle.value = typeArr

      // 獲取每種類型的卡牌
      typeArr.forEach((type) => {
        const cardArr = []
        selectedCards.value.forEach((card) => {
          if (card.type === type) {
            cardArr.push(card)
          }
        })
        sortedDeck.value.push(cardArr)
      })
    } else if (sortStatus.value === 'COLOR') {
      const typeArr = []

      selectedCards.value.forEach((card) => {
        if (typeArr.length <= 0) {
          typeArr.push(card.color)
        }
        const ishave = typeArr.find((color) => color === card.color)
        if (ishave === undefined) {
          typeArr.push(card.color)
        }
      })
      sortedTitle.value = typeArr

      // 獲取每種類型的卡牌
      typeArr.forEach((color) => {
        const cardArr = []
        selectedCards.value.forEach((card) => {
          if (card.color === color) {
            cardArr.push(card)
          }
        })
        sortedDeck.value.push(cardArr)
      })
    } else if (sortStatus.value === 'LEVEL') {
      const typeArr = []

      selectedCards.value.forEach((card) => {
        if (typeArr.length <= 0) {
          typeArr.push(card.level)
        }
        const ishave = typeArr.find((level) => level === card.level)
        if (ishave === undefined) {
          typeArr.push(card.level)
        }
      })
      sortedTitle.value = typeArr

      // 獲取每種類型的卡牌
      typeArr.forEach((level) => {
        const cardArr = []
        selectedCards.value.forEach((card) => {
          if (card.level === level) {
            cardArr.push(card)
          }
        })
        sortedDeck.value.push(cardArr)
      })
    } else if (sortStatus.value === 'RARE') {
      const typeArr = []

      selectedCards.value.forEach((card) => {
        if (typeArr.length <= 0) {
          typeArr.push(card.rare)
        }
        const ishave = typeArr.find((rare) => rare === card.rare)
        if (ishave === undefined) {
          typeArr.push(card.rare)
        }
      })
      sortedTitle.value = typeArr

      // 獲取每種類型的卡牌
      typeArr.forEach((rare) => {
        const cardArr = []
        selectedCards.value.forEach((card) => {
          if (card.rare === rare) {
            cardArr.push(card)
          }
        })
        sortedDeck.value.push(cardArr)
      })
    } else if (sortStatus.value === 'PRODUCT') {
      const typeArr = []

      selectedCards.value.forEach((card) => {
        if (typeArr.length <= 0) {
          typeArr.push(card.productName)
        }
        const ishave = typeArr.find(
          (productName) => productName === card.productName
        )
        if (ishave === undefined) {
          typeArr.push(card.productName)
        }
      })
      sortedTitle.value = typeArr

      // 獲取每種類型的卡牌
      typeArr.forEach((productName) => {
        const cardArr = []
        selectedCards.value.forEach((card) => {
          if (card.productName === productName) {
            cardArr.push(card)
          }
        })
        sortedDeck.value.push(cardArr)
      })
    }
  }

  // 選擇要切換的類型
  const handleSwitchBtnClick = (switchType) => {
    sortStatus.value = switchType
    switchSortMode()
  }

  // 傳送給後端存入資料庫
  const sendDeckToDatabase = async (deckData) => {
    try {
      const userToken = localStorage.getItem('token')

      const res = await axios.post(
        `${API_URL}/api/add-deck`,
        {
          deckData,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      )

      return res
    } catch (error) {
      console.log(error)
    }
  }

  // 獲取卡片在牌組中的數量
  const countCards = (card) => {
    return selectedCards.value.filter((selectedCard) => {
      return selectedCard.id === card.id
    }).length
  }

  return {
    addCard,
    removeCard,
    checkTypeAndRunFunction,
    selectedCards,
    saveLastDeckEdit,
    getLastDeckEdit,
    clearSelectedCards,
    countDeck,
    editType,
    changeTypeToAdd,
    changeTypeToDelete,
    showCardPrice,
    sortedDeck,
    sortedTitle,
    sortStatus,
    switchSortMode,
    handleSwitchBtnClick,
    sendDeckToDatabase,
    countCards,
  }
})
