# babylon_8_test

## 專案簡介
本專案以 TypeScript 與 BABYLON.js 開發，採用 MVC 架構，目標打造賭場場景的博弈遊戲（如百家樂、slot）。

## 專案初始化
```bash
yarn install
```
或
```bash
npm install
```

## 啟動方式
```bash
yarn start
```
或
```bash
npm start
```

## 目錄結構與說明

```
├── app.ts                # 專案啟動入口
├── public/               # 靜態資源（index.html等）
├── res/                  # 遊戲素材（音效、模型、貼圖、UI等）
├── src/
│   ├── components/       # 可重用遊戲物件（Mesh、UI元件、卡牌、骰子等）
│   ├── constants/        # 常數、設定、工具（enum、config、utils）
│   ├── controllers/      # 遊戲流程控制（如發牌、下注、結算）
│   ├── engine/           # 物理引擎相關（碰撞、動畫等）
│   ├── managers/         # 管理系統（燈光、模型、UI、物理等）
│   ├── models/           # 資料模型（玩家、牌桌、遊戲狀態等）
│   ├── states/           # 狀態機管理（遊戲階段切換）
│   ├── views/            # 場景與視覺呈現（BABYLON.js場景、UI）
│   └── app.ts            # 專案啟動入口（重複於根目錄，依實際結構調整）
├── package.json          # 專案依賴與腳本
├── tsconfig.json         # TypeScript 設定
├── webpack.config.js     # Webpack 設定
```

## 主要技術
- TypeScript
- BABYLON.js
- Webpack
- Yarn / npm

## 開發建議
- 依照 MVC 架構分離資料、邏輯、視覺，方便擴充與維護。
- 遊戲物件請盡量模組化，方便重用。

---
如需更多說明或範例，請參考各目錄下的程式碼與註解。