# 🇲🇾 馬來西亞財富階梯與退休金庫互動式教學網站
**Malaysian Wealth Ladder & Retirement Cash Vault Interactive Guide (VWRA × EPF × Cash Vault)**

本專案為可直接部署於 **GitHub Pages** 的全端量化理財與退休提領實證互動平台，採用 **「Python 預先渲染 300-DPI 高解析靜態實證數據圖表 + 前端 Chart.js 即時雙核心互動計算機 + MYR/USD 雙幣即時匯率連動系統」** 雙軌架構。

---

## 📂 專案目錄結構 (Zero-Build GitHub Pages Architecture)

```text
fire-investment/
├── index.html                  # 主頁面（含 8 大互動簡報章節、雙幣導覽列與 2 組 Chart.js 計算機）
├── generate_charts.py          # Python 高清實證數據圖表生成腳本 (Matplotlib / NumPy, 300 DPI)
├── css/
│   └── style.css               # 深色金融科技風格樣式表 (Dark Fintech Glassmorphism)
├── js/
│   ├── fx-service.js           # 三層備援公開匯率 API 服務 + 12 小時 localStorage 快取與全站雙幣連動引擎
│   ├── calculator.js           # 財富階梯定位儀、模組 A (黃金交叉與退休模擬)、模組 B (4% 金庫 30 年壓力測試)
│   └── app.js                  # 簡報分頁切換、鍵盤快捷鍵、全頁總覽切換與 300-DPI 圖表放大燈箱
├── assets/
│   └── charts/                 # 由 generate_charts.py 自動生成的 6 張 300-DPI 實證圖表
│       ├── 01_bursa_epf_vs_world_myr.png
│       ├── 02_vwra_vs_vwrd_vs_vt.png
│       ├── 03_crossover_point.png
│       ├── 04_why_people_fall_back.png
│       ├── 05_stage1_work_vs_invest.png
│       └── 06_alpha_vs_beta_stages.png
└── README.md                   # 專案說明與 GitHub Pages 部署指南
```

---

## 📊 Step 1: 如何重新執行 Python 腳本更新 6 張實證圖表

當你想調整歷史數據序列、模擬假設或視覺配色時，只需執行 `generate_charts.py` 即可重新生成 `./assets/charts/` 下的 6 張 300-DPI 圖表：

### 1. 建立並啟用虛擬環境（首次執行）
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install matplotlib numpy pandas
```

### 2. 執行圖表生成腳本
```bash
python3 generate_charts.py
```

執行成功後，終端機會顯示以下輸出，並將高清 PNG 圖表寫入 `./assets/charts/`：
- `assets/charts/01_bursa_epf_vs_world_myr.png`：馬來西亞人的本土偏誤代價（2010–2025 Bursa KLCI vs EPF vs FTSE All-World MYR 總報酬與匯率走勢）
- `assets/charts/02_vwra_vs_vwrd_vs_vt.png`：為什麼首推 VWRA？25 年真實稅務（15% vs 30% + 40% 美國遺產稅風險）與股息再投入摩擦差距
- `assets/charts/03_crossover_point.png`：財富階梯雙黃金交叉圖（第一黃金交叉：獲利 > 年儲蓄；第二黃金交叉：獲利 > 全年工作總年薪）
- `assets/charts/04_why_people_fall_back.png`：2000 科技泡沫 + 2008 金融海嘯報酬順序風險實證（盲目賣股第 18 年破產 vs 3 年現金金庫重回巔峰）與四大返貧主因
- `assets/charts/05_stage1_work_vs_invest.png`：第一階段殘酷真相（本金 RM 10,000 拼 20% 股神報酬 vs 專注本業每月多存 RM 1,500）
- `assets/charts/06_alpha_vs_beta_stages.png`：關鍵轉折 Beta (β) vs Alpha (α) 實證（研究選股時薪 ROI 隨資產規模變化 + Stage 2 過早追 Alpha 翻車 vs Stage 3 解鎖核心+衛星配置 20 年軌跡）

---

## 💱 Step 2: 雙幣別即時匯率系統 (MYR & USD)

網站頂部固定配置 `1 USD = [ 輸入框 ] MYR` 控制器，`js/fx-service.js` 會自動依序串接三層免 API Key 的公開匯率端點（並於 `localStorage` 快取 12 小時）：
1. **Primary**: `https://api.frankfurter.app/latest?from=USD&to=MYR`
2. **Fallback 1**: `https://open.er-api.com/v6/latest/USD`
3. **Fallback 2**: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json`

使用者也可直接在導覽列手動修改匯率（如輸入 `4.50` 或 `4.20`），全站所有文字中的雙幣對照標籤、定位儀、模組 A 與模組 B 計算機及 30 年明細表皆會**毫秒級即時重算**。

---

## 🚀 Step 3: 如何預覽與部署至 GitHub Pages

### 在本地端啟動預覽伺服器
由於採用 Zero-Build 純靜態架構，不需任何 Webpack/Vite 打包步驟，直接啟動內建 HTTP Server 即可：
```bash
python3 -m http.server 8080
```
接著打開瀏覽器前往 `http://localhost:8080` 即可完整體驗。

### 推送並部署至 GitHub Pages
1. 初始化 Git 並推送到你的 GitHub 儲存庫：
   ```bash
   git init
   git add index.html generate_charts.py README.md .gitignore css/ js/ assets/
   git commit -m "feat: initial release of Malaysian Wealth Ladder & Cash Vault interactive guide"
   git branch -M main
   git remote add origin https://github.com/<你的GitHub帳號>/<你的Repo名稱>.git
   git push -u origin main
   ```
2. 前往 GitHub Repository 頁面 ➔ 點擊 **Settings** ➔ 左側選單點擊 **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 選擇 `Deploy from a branch`。
4. 將 **Branch** 設為 `main`、資料夾設為 `/ (root)`，點擊 **Save**。
5. 等待約 1 分鐘後，即可透過 `https://<你的GitHub帳號>.github.io/<你的Repo名稱>/` 訪問線上版本！
