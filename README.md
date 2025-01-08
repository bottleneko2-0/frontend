# 卡派Capie

capie.onrender.com/

## 專案介紹

卡派是一個線上的卡牌組牌工具，提供各種便利的功能，讓您可以輕鬆的組牌、分享牌組、查詢卡片等等。

### **首頁**

![](https://live.staticflickr.com/65535/54228497972_0d866f90cb_h.jpg)

- 查看每日卡的輪播圖。
- 新系列的卡牌展示。
- 新的社群文章列表。

### **系列卡表**

![](https://live.staticflickr.com/65535/54228497952_bcdda50a46_h.jpg)
![](https://live.staticflickr.com/65535/54228497957_9648469224_h.jpg)

- 查看各大系列的卡牌。
- 功能包括：
  - **先前查看的系列**
  - **搜尋欄**
  - **名稱排序**
  - **日期排序**
- 點進系列後可以點選卡牌生成自己的牌組，並提供複合式篩選功能。

### **我的牌組**

![](https://live.staticflickr.com/65535/54229634868_e4297d53c4_h.jpg)

- 組完的牌組會存放於此。
- 功能包括：
  - **系列按鈕篩選**
  - **搜尋欄**
  - **名稱排序**
  - **匯出牌組**
  - **日期排序**

### **社群**

![](https://live.staticflickr.com/65535/54251658784_49e8beeed8_h.jpg)

- 查看其他用戶新增的文章。
- 支援留言功能。
- 點選 **新增文章按鈕** 可建立自己的文章。

### **工作坊**

![](https://live.staticflickr.com/65535/54251834060_c5ac47ed95_h.jpg)

- 提供多種功能按鈕：
  - **英雄榜**
  - **每日卡**
  - **官方商品**
  - **卡片問答集**
  - **尋找牌組**
  - **匯出牌組**

### **英雄榜**

![](https://live.staticflickr.com/65535/54229407176_c6850d0bbb_h.jpg)

- 支援透過金流功能付費，從一般用戶升級成英雄會員。

## 取得專案

```
git clone https://github.com/capie2024/frontend
```

## 移動到專案內

```
cd frontend
```

## 安裝套件

```
npm install
```

### 運行專案

```sh
npm run dev
```

### 環境變數設定

請複製`.env.development.example`的內容到`.env`檔案，並依據 `.env` 內容調整相關欄位。

### 開啟專案

在瀏覽器網址列輸入以下即可看到畫面

```sh
http://localhost:5173/
```

## 資料夾說明

- views - 畫面放置處
- components - 元件放置處
- modules - 模組放置處
- assets - 靜態資源放置處
  - css - css 檔案放置處
  - images - 圖片放置處

## 專案技術

- pinia 2.2.6
- vue 3.5.12
- vue-router 4.4.5
- tailwindcss 3.4.15

## 第三方服務

- Google Login
- Paypal

## 聯絡作者

可以透過以下方式與我們聯絡

### 團隊成員

- 旻叡 :https://github.com/minjuilu
  - 會員註冊
  - 留言區
  - 牌組- 群組及排序
  - 通知功能
- 佳樺 :https://github.com/wuuhua
  - 串接第三方登入
  - JWT 驗證
  - 串接雲端儲存服務
- 宗倫 :https://github.com/allen84324
  - API串接
  - 牌組匯出PDF功能
  - 尋找牌組/文章功能
- 代賢 :https://github.com/Wandaihsien
  - API串接
  - 我的牌組篩選排序功能
  - 系列卡表排序功能
- 宜臻 :https://github.com/Enya-Wu
  - 一般發文及帶牌組發文
  - 系列和文章搜尋
  - 之前查看功能
- 景淵 :https://github.com/Kenny1238
  - 我的牌組頁面切版
- 昱丞 :https://github.com/YuCheng07
  - 製作牌組功能
  - 卡片複合篩選
  - 翻譯功能
