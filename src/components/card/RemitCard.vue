<script setup>
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'
import axios from 'axios'
import Swal from 'sweetalert2'
import Close from '@/components/svg/Close.vue'
import Tag from '@/components/svg/Tag.vue'
import Triangle from '@/components/svg/Triangle.vue'
import Tick from '@/components/svg/Tick.vue'
import Paper from '@/components/svg/Paper.vue'

const API_URL = import.meta.env.VITE_API_URL

// 定義變數
const deckId = ref('') // 用來儲存用戶輸入的 Deck ID
const buttons = ref([false, false]) // 按鈕的狀態分別是 false
const deckValid = ref(false) // 判斷是否有對應的牌組
const deckInvalid = ref(false) // 判斷是否為無效代碼
const isVisible = ref(false) // 控制模態框顯示狀態

// 計算屬性：判斷所有按鈕是否都是 active 狀態
const allButtonsActive = computed(() => {
  return buttons.value.every((isActive) => isActive)
})

// 切換按鈕的 active 狀態
const toggleActive = (index) => {
  buttons.value[index] = !buttons.value[index]
}

// 顯示模態框
const showModal = () => {
  const modalElement = $refs.remitModal
  if (modalElement) {
    modalElement.style.display = 'block'
    modalElement.setAttribute('inert', '') // 添加 inert 屬性
    modalElement.focus() // 聚焦於模態框
  }
  isVisible.value = true // 更新模態框顯示狀態
}

// 隱藏模態框
const hideModal = () => {
  const modalElement = document.querySelector('#remit')
  if (modalElement) {
    modalElement.style.display = 'none'
    modalElement.removeAttribute('inert') // 移除 inert 屬性
  }
  isVisible.value = false // 更新模態框顯示狀態
}

// 確認是否關閉
const confirmClose = () => {
  Swal.fire({
    title: '確定要離開嗎？',
    text: '您的資料尚未完成，確定要離開嗎？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '離開',
    cancelButtonText: '取消',
    reverseButtons: true,
    color: '#e1e1e1',
    background: '#27272a',
  }).then((result) => {
    if (result.isConfirmed) {
      hideModal()
      const modalOverlay = document.querySelector('.modal-overlay')
      if (modalOverlay) {
        modalOverlay.style.display = 'none'
      }
    }
  })
}

// 檢查 Deck ID 是否有效
const checkDeckId = async () => {
  if (deckId.value && deckId.value.length >= 5) {
    try {
      const response = await axios.get(
        `${API_URL}/api/cardPDF?input=${deckId.value}`
      )
      if (response.data && response.data.deck_name) {
        deckValid.value = true
        deckInvalid.value = false
      } else {
        deckValid.value = false
        deckInvalid.value = true
      }
    } catch (error) {
      console.error('Error checking deck ID:', error)
      if (error.response && error.response.status === 404) {
        deckValid.value = false
        deckInvalid.value = true
      } else {
        deckValid.value = false
        deckInvalid.value = false
      }
    }
  } else {
    deckValid.value = false
    deckInvalid.value = false
  }
}

// 匯出 PDF
const exportToPDF = async () => {
  if (!deckId.value) {
    alert('請輸入牌組代碼')
    return
  }

  try {
    const fontResponse = await fetch(`${API_URL}/api/font`)
    if (!fontResponse.ok) {
      throw new Error('無法獲取字型資料')
    }

    const base64msyh = await fontResponse.text()

    const response = await fetch(`${API_URL}/api/cardPDF?input=${deckId.value}`)
    if (!response.ok) {
      throw new Error('API 回應非 OK')
    }

    const { covers, deck_name } = await response.json()

    if (!deck_name || !covers || covers.length === 0) {
      throw new Error('資料不足或圖片載入錯誤')
    }

    const pdf = new jsPDF()
    pdf.addFileToVFS('GenSenRounded2PJP-R.ttf', base64msyh)
    pdf.addFont('GenSenRounded2PJP-R.ttf', 'GenSenRounded2PJP-R', 'normal')
    pdf.setFont('GenSenRounded2PJP-R', 'normal')

    pdf.text(deck_name, 10, 10)
    const pageWidth = 210
    const pageHeight = 297
    const columns = 3
    const rows = 3
    const marginX = 15
    const marginY = 25
    const maxImageWidth = (pageWidth - (columns + 1) * marginX) / columns
    const maxImageHeight = (pageHeight - (rows + 1) * marginY) / rows

    let xPosition = marginX
    let yPosition = marginY + 5
    let imageCount = 0

    const imagePromises = covers.map((coverUrl) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = coverUrl

        img.onload = () => {
          const aspectRatio = img.width / img.height
          let imageWidth = maxImageWidth
          let imageHeight = maxImageHeight

          if (img.width > img.height) {
            imageHeight = imageWidth / aspectRatio
          } else {
            imageWidth = imageHeight * aspectRatio
          }

          pdf.addImage(
            img,
            'JPEG',
            xPosition,
            yPosition,
            imageWidth,
            imageHeight
          )
          imageCount++
          xPosition += imageWidth + marginX

          if (imageCount % columns === 0) {
            xPosition = marginX
            yPosition += imageHeight + marginY
          }

          if (
            imageCount % (columns * rows) === 0 &&
            imageCount < covers.length
          ) {
            pdf.addPage()
            xPosition = marginX
            yPosition = marginY + 10
          }

          resolve()
        }

        img.onerror = () => reject(new Error(`圖片載入失敗: ${coverUrl}`))
      })
    })

    await Promise.all(imagePromises)
    pdf.save(`${deck_name}_deck.pdf`)
  } catch (error) {
    console.error('匯出 PDF 時發生錯誤:', error.message)
    alert('匯出 PDF 時發生錯誤')
  }
}
</script>

<template>
  <div class="modal-overlay"></div>
  <section
    class="modal fade"
    id="remit"
    tabindex="-1"
    aria-labelledby="remitLabel"
    ref="remitModal"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title topic" id="remitLabel">匯出牌組</h2>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="confirmClose"
          >
            <Close class="w-6 h-6" />
          </button>
        </div>

        <div class="modal-body">
          <h3 class="my-4 topic">
            選擇牌組
            <span class="subtitle">選擇你的牌組來源</span>
          </h3>
        </div>

        <div class="input-button">
          <button
            :class="{ active: buttons[0] }"
            @click="toggleActive(0)"
            class="z-20 button-remit item focus-button"
          >
            <Tag class="icon size-6" />
            <span class="font-mono text-sm">牌組編號</span>
          </button>

          <div class="input-item-2">
            <input
              class="input-text"
              id="input-text"
              type="text"
              placeholder="代碼"
              v-model="deckId"
            />

            <button
              class="input-button-2 item default-transition"
              id="input-button-2"
              @click="checkDeckId"
            >
              <Triangle class="icon-input size-6" />
            </button>
          </div>

          <!-- 當 deckId 有對應的牌組時顯示綠色提示 -->
          <div v-if="deckValid" class="show-text-green">
            <div>
              <Tick stroke-width="2" />
            </div>
            <span class="font-mono text-green-500 truncate">找到牌組</span>
          </div>

          <!-- 當 deckId 沒有對應的牌組時顯示紅色提示 -->
          <div v-if="deckInvalid" class="show-text-red">
            <div>
              <Close stroke-width="2" />
            </div>
            <span>無效代碼</span>
          </div>
        </div>
        <div class="modal-body">
          <h3 class="my-4 topic">
            匯出設定
            <span class="subtitle">選擇你的匯出格式內容</span>
          </h3>
          <h3 class="my-4 topic">選擇匯出格式</h3>
        </div>

        <div class="input-button">
          <button
            class="button-remit item focus-button"
            :class="{ active: buttons[1] }"
            @click="toggleActive(1)"
          >
            <Paper class="icon size-6" />
            <span class="font-mono text-sm">PDF</span>
          </button>
        </div>

        <div class="seeting">
          <button
            class="justify-center item default-transition gray setting-text"
            id="setting-text"
            @click="exportToPDF"
            :disabled="!allButtonsActive"
            :class="{ black: allButtonsActive, gray: !allButtonsActive }"
          >
            <Tick class="icon size-6" />
            <span class="font-mono text-sm input-text" id="input-text">
              設定完成
            </span>
          </button>
        </div>
      </div>
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  z-index: 998;
  backdrop-filter: blur(5px); /* 背景模糊效果 */
}

.modal {
  position: fixed; /* 固定位置 */
  top: 50%; /* 垂直置中 */
  left: 50%; /* 水平置中 */
  transform: translate(-50%, -50%); /*居中對齊 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.gray {
  background-color: gray;
  color: white;
  cursor: not-allowed;
}

.black {
  background-color: #121212;
  color: black;
  cursor: pointer;
}
.modal-content {
  background-color: rgb(18, 18, 18);
  border-radius: 10px;
  width: 551px;
}

.modal-title {
  color: white;
  font-size: 16px;
  width: 100%;
}

.input-text {
  align-items: center;
  border-radius: 0.75rem;
  display: flex;
  gap: 0.5rem;
  padding-left: 5px;
  width: 100%;
  height: 40px;
  background-color: transparent;
  color: #e5e7eb;
  border-style: none;
}
#input-text:focus-visible {
  border-color: transparent !important ;
  outline: none;
}

#input-button-2 {
  border: 1px solid transparent;
}

.icon-input {
  color: #e5e7eb;
}

.default-transition {
  transition-duration: 0.3s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.div[aria-hidden='true'] {
  display: none !important;
}

.modal-header {
  display: flex;
  padding: 1rem;
}

.modal-body {
  padding: 0.5rem 1rem 0rem 1rem;
}
.btn-close {
  flex: none;
  background-color: black;
  color: #e5e7eb;
  border-radius: 35px;
  gap: 0.5rem;
  height: 1.5rem;
  width: 1.5rem;
  border: 0 solid #e5e7eb;
  box-sizing: border-box;
}

.icon {
  color: #e5e7eb;
  width: 24px;
}

.btn-close:hover {
  background-color: #e5e7eb;
  color: black;
}

.my-4 {
  display: grid;
  word-break: break-all;
  margin-top: 0;
}

.topic {
  --tw-text-opacity: 1;
  color: rgb(228 228 231 / var(--tw-text-opacity));
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.75rem;
}

.subtitle {
  color: #a1a1aa;
  font-size: 14px;
}

.input-button {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  box-sizing: content-box;
  padding: 0.5rem 1rem 0 1rem;
  align-items: center;
}

.input-item button svg {
  width: 20px;
  height: 20px;
  color: #111111;
}

.button-remit:not(:focus) {
  align-items: center;
  border-radius: 20px;
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  white-space: nowrap;
  width: 142px;
  height: 64px;
  color: rgb(255, 255, 255);
  background-color: #18181b80;
  align-items: center;
  border: 1px solid #a1a1aa;
}
.button-remit:focus {
  background: linear-gradient(to right, #3b82f6, #06b6d4);
  --tw-gradient-from: #3b82f6 var(--tw-gradient-from-position);
  color: rgb(255 255 255 / var(--tw-text-opacity));
  --tw-shadow-color: rgba(14, 165, 233, 0.5);
  color: white;
  width: 142px;
  height: 64px;
  display: flex;
  align-items: center;
  border-radius: 20px;
  white-space: nowrap;
  gap: 0.5rem;
  padding: 0.5rem;
}

#button-remit-div {
  align-items: center;
  border-radius: 20px;
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
  height: 64px;
  color: rgb(255, 255, 255);
  background-color: transparent !important;
  align-items: center;
}
#button-remit-div {
  padding: 0.5rem 0.5rem;
}

.button-remit.active {
  background: linear-gradient(to right, #3b82f6, #06b6d4);
  color: white;
}

.button-remit:hover {
  background-color: #27272a;
}
.button-remit-div:not(.active):hover {
  background-color: #27272a; /* 僅對未激活按鈕應用懸停效果 */
}
.button-remit-div.active {
  background: linear-gradient(to right, #3b82f6, #06b6d4);
  color: white;
}

.input-item-2 {
  align-items: center;
  border-radius: 0.75rem;
  gap: 0.5rem;
  align-items: center;
  margin: 8px;
  display: flex;
  border: 1px solid #a1a1aa;
  padding: 10px 0;
}

.show-text-green {
  display: flex;
  color: #20b055;
  align-items: center;
}

.show-text-green svg {
  width: 28px;
  background-color: #402f2f;
  border-radius: 99px;
  padding: 4px;
  margin: 5px;
}

.show-text-red {
  display: flex;
  color: #ef4444;
  align-items: center;
}

.show-text-red svg {
  width: 28px;
  background-color: #402f2f;
  border-radius: 99px;
  padding: 4px;
  margin: 5px;
}

.seeting {
  display: flex;
  justify-content: center;
}

.setting-text {
  display: flex;
  justify-content: center;
  border-radius: 12px;
  margin-bottom: 8px;
  margin-top: 10px;
  align-items: center;
  gap: 0.5rem;
}
#setting-text {
  padding: 0.3rem;
}
.setting:hover {
  background-color: #27272a;
}

.item {
  padding: 0 0.5rem 0 0;
  border: 1px solid #a1a1aa;
}

@media (max-width: 767px) {
  .input-button {
    /* display: grid; */
    /* align-items: flex-start; */
    gap: 0.5rem;
    box-sizing: content-box;
    /* padding: 1rem; */
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .modal-dialog {
    height: 100%;
    width: 100%;
  }

  .button-remit-div {
    width: 100%;
  }
  .modal-content {
    width: 80vw;
    height: 60vh;
  }
}

@media screen and (max-width: 375px) {
  .modal-content {
    width: 100vw;
    height: 75vh;
  }
}
</style>
