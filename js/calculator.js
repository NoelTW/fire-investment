/**
 * calculator.js
 * Interactive Financial Simulation Engines & Chart.js Visualizations:
 * 1. Slide 1: Wealth Ladder Locator (我的財富階梯定位儀)
 * 2. Slide 6: Module A — Investment Horizon, Golden Crossover & Retirement Asset Simulator
 * 3. Slide 7: Module B — 4% Rule + Cash Vault 30-Year Stress Test Simulator
 */

(function () {
  let modAChartInstance = null;
  let modBChartInstance = null;

  // ============================================================================
  // 1. SLIDE 1: WEALTH LADDER LOCATOR (我的財富階梯定位儀)
  // ============================================================================
  const LadderLocator = {
    init() {
      const nwSlider = document.getElementById("locator-nw-slider");
      const nwInput = document.getElementById("locator-nw-input");
      const salSlider = document.getElementById("locator-sal-slider");
      const salInput = document.getElementById("locator-sal-input");
      const savSlider = document.getElementById("locator-sav-slider");

      if (!nwSlider || !nwInput) return;

      const syncAndCalc = (source) => {
        if (source === "nw-slider") {
          nwInput.value = nwSlider.value;
        } else if (source === "nw-input") {
          const v = Math.max(0, Math.min(800000000, parseFloat(nwInput.value) || 0));
          nwSlider.value = Math.min(6000000, v);
        } else if (source === "sal-slider") {
          salInput.value = salSlider.value;
        } else if (source === "sal-input") {
          const v = Math.max(1000, Math.min(300000, parseFloat(salInput.value) || 5000));
          salSlider.value = Math.min(40000, v);
        }
        this.calculate();
      };

      nwSlider.addEventListener("input", () => syncAndCalc("nw-slider"));
      nwInput.addEventListener("input", () => syncAndCalc("nw-input"));
      salSlider.addEventListener("input", () => syncAndCalc("sal-slider"));
      salInput.addEventListener("input", () => syncAndCalc("sal-input"));
      if (savSlider) {
        savSlider.addEventListener("input", () => this.calculate());
      }

      // Quick stage demo buttons on Slide 1
      document.querySelectorAll("[data-locator-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const fx = window.FXService;
          const presetUsd = parseFloat(btn.getAttribute("data-usd"));
          const nwAttr = parseFloat(btn.getAttribute("data-nw"));
          const nw = !isNaN(presetUsd) && fx
            ? Math.round(fx.usdToMyr(presetUsd) / 1000) * 1000
            : nwAttr;
          const sal = parseFloat(btn.getAttribute("data-sal"));
          const sav = parseFloat(btn.getAttribute("data-sav") || "30");
          nwInput.value = nw;
          nwSlider.value = Math.min(6000000, nw);
          salInput.value = sal;
          salSlider.value = Math.min(40000, sal);
          if (savSlider) savSlider.value = sav;
          this.calculate();
        });
      });

      // Allow clicking on the 6 left-column Level Cards (Level 1 to Level 6) to preview that Level
      const levelDemoSpecs = {
        1: { usd: 5000, sal: 4000, sav: 25 },
        2: { usd: 40000, sal: 6800, sav: 30 },
        3: { usd: 420000, sal: 14000, sav: 40 },
        4: { usd: 2000000, sal: 28000, sav: 45 },
        5: { usd: 15000000, sal: 65000, sav: 50 },
        6: { usd: 110000000, sal: 120000, sav: 55 },
      };
      for (let i = 1; i <= 6; i++) {
        const card = document.getElementById(`ladder-card-${i}`);
        if (card) {
          card.addEventListener("click", () => {
            const d = levelDemoSpecs[i];
            const fx = window.FXService;
            const targetMyr = fx
              ? Math.round(fx.usdToMyr(d.usd) / 1000) * 1000
              : d.usd * 4.42;
            nwInput.value = targetMyr;
            nwSlider.value = Math.min(6000000, targetMyr);
            salInput.value = d.sal;
            salSlider.value = Math.min(40000, d.sal);
            if (savSlider) savSlider.value = d.sav;
            this.calculate();
          });
        }
      }

      this.calculate();
    },

    calculate() {
      const nwInput = document.getElementById("locator-nw-input");
      const salInput = document.getElementById("locator-sal-input");
      const savSlider = document.getElementById("locator-sav-slider");
      if (!nwInput || !salInput) return;

      const netWorthMYR = Math.max(0, parseFloat(nwInput.value) || 0);
      const monthlySalaryMYR = Math.max(1000, parseFloat(salInput.value) || 5000);
      const savingsRatePct = savSlider ? parseFloat(savSlider.value) || 30 : 30;
      const vwraCagr = 0.085;
      const salaryGrowth = 0.03;

      const fx = window.FXService;
      const netWorthUSD = fx.myrToUsd(netWorthMYR);
      const monthlySalaryUSD = fx.myrToUsd(monthlySalaryMYR);
      const annualSalaryMYR = monthlySalaryMYR * 12;
      const annualSavingsMYR = annualSalaryMYR * (savingsRatePct / 100);
      const currentAnnualReturnMYR = netWorthMYR * vwraCagr;
      const passiveCoverPct = Math.min(9999, (currentAnnualReturnMYR / annualSalaryMYR) * 100);

      // Update USD helper badges
      const nwUsdEl = document.getElementById("locator-nw-usd");
      const salUsdEl = document.getElementById("locator-sal-usd");
      const savValEl = document.getElementById("locator-sav-val");
      if (nwUsdEl) nwUsdEl.textContent = `≈ ${fx.formatUSD(netWorthUSD)}`;
      if (salUsdEl) salUsdEl.textContent = `≈ ${fx.formatUSD(monthlySalaryUSD)} / 月`;
      if (savValEl) {
        savValEl.textContent = `${savingsRatePct}% (每月存 ${fx.formatRM(monthlySalaryMYR * (savingsRatePct / 100))})`;
      }

      // Determine Nick Maggiulli's 6 Levels of Wealth (in USD Orders of Magnitude)
      let levelNum = 1;
      let levelTitle = "LEVEL 1 · 帳單生存階 (Survival & Foundation, < $10k USD)";
      let levelProgressPct = 0;
      let nextLevelLabel = "";
      let lifestyleBadge = "生存與現金流防守期 · 優先建立 6 個月緊急預備金 (Emergency Buffer MMF)";
      let spendBelowRule = "守富鐵律：砍除高息卡債與分期 (BNPL)，儲蓄率推上 20%+";
      let actionText = "專注拉高職場時薪 (Active Income)、清償高息債務、存滿 6 個月預備金 (MMF)";
      let allocText = "6 個月預備金 (馬幣 MMF 3.6%) + 閒錢 100% 純 Beta (VWRA)";
      let tabooText = "嚴禁因本金小而去賭仙股 (Penny Stocks)、期貨合約或高倍槓桿";

      if (netWorthUSD >= 100_000_000) {
        levelNum = 6;
        levelTitle = "LEVEL 6 · 社會影響傳承階 (Philanthropy & Legacy, > $100M+ USD)";
        levelProgressPct = 100;
        nextLevelLabel = "已達最高階 Level 6 (> $100M USD)";
        lifestyleBadge = "社會影響力自由 · 創立慈善基金會與跨世代家族治理 (SFO)";
        spendBelowRule = "降一階守富 (Spend at L5)：個人消費無上限，嚴防企業高槓桿連帶風險";
        actionText = "跨司法管轄區主權配置、家族憲章治理 (Family Constitution) 與影響力輸出";
        allocText = "全球機構級配置 (核心指數 Beta + 跨國信託 + 實體與私募資產 PE)";
        tabooText = "嚴禁缺乏獨立受託機制的家族爭產內耗與高槓桿併購押注";
      } else if (netWorthUSD >= 10_000_000) {
        levelNum = 5;
        levelTitle = "LEVEL 5 · 全球置產主權階 (Global Real Estate & Sovereignty, $10M–$100M USD)";
        levelProgressPct = Math.min(100, ((netWorthUSD - 10_000_000) / 90_000_000) * 100);
        const remUSD = 100_000_000 - netWorthUSD;
        nextLevelLabel = `L5 進度 ${levelProgressPct.toFixed(0)}% · 距 L6 差 ${fx.formatUSD(remUSD, true)}`;
        lifestyleBadge = "豪宅與全球旅居自由 · 跨國核心城市置產不傷本金 (Sovereignty)";
        spendBelowRule = "降一階守富 (Spend at L4)：享受頭等艙與頂級醫療，勿養私人飛機/遊艇";
        actionText = "跨國稅務主權與離岸家族信託隔離 (Offshore Trust)，規避 40% 美股遺產稅";
        allocText = "75% 全球 Beta 與主權債 + 15% 跨國不動產/金庫 + ≤10% 衛星配置";
        tabooText = "嚴禁購置高維護負現金流豪宅群或非能力圈重資本跨界創業";
      } else if (netWorthUSD >= 1_000_000) {
        levelNum = 4;
        levelTitle = "LEVEL 4 · 跨國留學旅遊自由 (Travel & Education Freedom, $1M–$10M USD)";
        levelProgressPct = Math.min(100, ((netWorthUSD - 1_000_000) / 9_000_000) * 100);
        const remUSD = 10_000_000 - netWorthUSD;
        nextLevelLabel = `L4 進度 ${levelProgressPct.toFixed(0)}% · 距 L5 差 ${fx.formatUSD(remUSD, true)}`;
        lifestyleBadge = "長途商務艙、五星酒店與子女英美澳留學自由 (HNW Zone)";
        spendBelowRule = "降一階守富 (Spend at L3)：日常維持餐廳自由，勿讓固定開銷失控";
        actionText = "以愛爾蘭 VWRA 規避美股 40% 遺產稅 (Estate Tax Shield)，鎖定 3 年現金金庫";
        allocText = "80% 核心 Beta (VWRA) + 12% 3 年金庫 (Cash Vault) + ≤8%–10% 衛星 Alpha";
        tabooText = "嚴禁裸持美股註冊 VT/VOO (暴露 40% 遺產稅) 或重金跨界創業";
      } else if (netWorthUSD >= 100_000) {
        levelNum = 3;
        levelProgressPct = Math.min(100, ((netWorthUSD - 100_000) / 900_000) * 100);
        const remUSD = 1_000_000 - netWorthUSD;
        if (netWorthMYR >= 1_500_000) {
          levelTitle = "LEVEL 3B · 大馬 FIRE 退休與解鎖 Alpha 段 (MY FIRE Zone, $340k–$1M USD)";
          nextLevelLabel = `L3 進度 ${levelProgressPct.toFixed(0)}% (已破 RM 1.5M FIRE 線) · 距 L4 差 ${fx.formatUSD(remUSD, true)}`;
          lifestyleBadge = "餐廳點菜自由 + 大馬 PPP 購買力套利提前解鎖準退休自由";
          spendBelowRule = "降一階守富 (Spend at L2)：定常開銷守在茶室/超市，單次犒賞控在 0.01%";
          actionText = "已越過第二黃金交叉！先建 3 年馬幣現金金庫 (Cash Vault)，再撥 ≤8% 追能力圈 Alpha";
          allocText = "80% 核心 Beta (VWRA) + 12% 馬幣 3 年金庫 + 選配 ≤8% 衛星 Alpha";
          tabooText = "嚴禁 100% 滿倉不留現金金庫 (遇股災被迫低點賣股將直接返貧)";
        } else {
          levelTitle = "LEVEL 3A · 餐廳自由 × 黃金交叉衝刺段 (Dining Freedom, $100k–$340k USD)";
          const remTo3B_MYR = Math.max(0, 1_500_000 - netWorthMYR);
          nextLevelLabel = `L3 進度 ${levelProgressPct.toFixed(0)}% · 距大馬 FIRE 線 (RM 1.5M) 差 ${fx.formatRM(remTo3B_MYR, true)}`;
          lifestyleBadge = "週末餐廳與點菜不看標價自由 (RM 44–150/日 · Dining Freedom)";
          spendBelowRule = "降一階守富 (Spend at L2)：平日維持茶室/超市自由，勿剛破百萬就貸豪車";
          actionText = "EPF 已是馬幣債券底倉，閒錢 100% 鎖定純 Beta (VWRA) 衝刺 RM 1.5M";
          allocText = "EPF 防守底倉 + 個人可投資部位 100% 愛爾蘭 VWRA (0% 個股選股)";
          tabooText = "嚴禁嫌指數慢而重押個股追 Alpha (一次 -40% 腰斬延後交叉 6 年)";
        }
      } else if (netWorthUSD >= 10_000) {
        levelNum = 2;
        levelTitle = "LEVEL 2 · 超市與茶室加料自由階 (Grocery & Kopitiam Freedom, $10k–$100k USD)";
        levelProgressPct = Math.min(100, ((netWorthUSD - 10_000) / 90_000) * 100);
        const remUSD = 100_000 - netWorthUSD;
        nextLevelLabel = `L2 進度 ${levelProgressPct.toFixed(0)}% · 距 L3 ($100k USD) 差 ${fx.formatUSD(remUSD, true)}`;
        lifestyleBadge = "超市採買與茶室加料自由 (買有機食材、Kopi 加料無痛 · Grocery Freedom)";
        spendBelowRule = "降一階守富 (Spend at L1)：日常吃喝免糾結，房租車貸從簡、儲蓄率 30%+";
        actionText = "此時選股時薪極低，唯一引擎是「本業升遷跳槽 + 高儲蓄定投 VWRA」";
        allocText = "6 個月預備金 (MMF) + EPF 底倉 + 每月結餘 100% 買入愛爾蘭 VWRA";
        tabooText = "嚴禁頻繁當沖 (Day Trading)、嚴禁買高內扣費 (1.8%/年) 的傳統 Unit Trust";
      } else {
        levelNum = 1;
        levelProgressPct = Math.min(100, (netWorthUSD / 10_000) * 100);
        const remUSD = Math.max(0, 10_000 - netWorthUSD);
        nextLevelLabel = `L1 進度 ${levelProgressPct.toFixed(0)}% · 距 L2 ($10k USD) 差 ${fx.formatUSD(remUSD, true)}`;
      }

      // Highlight active level card on Slide 1 (1 to 6)
      for (let i = 1; i <= 6; i++) {
        const card = document.getElementById(`ladder-card-${i}`);
        if (card) {
          if (i === levelNum) {
            card.classList.add("active-stage-card");
          } else {
            card.classList.remove("active-stage-card");
          }
        }
      }

      // Simulate years to First Crossover (Return > Annual Savings) and Second Crossover (Return > Annual Salary)
      let yearsToC1 = currentAnnualReturnMYR >= annualSavingsMYR ? 0 : null;
      let yearsToC2 = currentAnnualReturnMYR >= annualSalaryMYR ? 0 : null;
      let simBal = netWorthMYR;
      let simSal = annualSalaryMYR;

      for (let y = 1; y <= 50; y++) {
        const simSav = simSal * (savingsRatePct / 100);
        const simRet = (simBal + simSav * 0.5) * vwraCagr;
        simBal = simBal + simSav + simRet;
        if (yearsToC1 === null && simRet >= simSav) {
          yearsToC1 = y;
        }
        if (yearsToC2 === null && simRet >= simSal) {
          yearsToC2 = y;
        }
        simSal *= 1 + salaryGrowth;
      }

      // Update DOM outputs
      const badgeEl = document.getElementById("locator-stage-badge");
      const progBarEl = document.getElementById("locator-level-progress-bar");
      const progLabelEl = document.getElementById("locator-level-progress-label");
      const passiveEl = document.getElementById("locator-passive-ratio");
      const c1El = document.getElementById("locator-c1-years");
      const c2El = document.getElementById("locator-c2-years");
      const actionEl = document.getElementById("locator-action-text");
      const allocEl = document.getElementById("locator-alloc-text");
      const tabooEl = document.getElementById("locator-taboo-text");

      if (badgeEl) {
        badgeEl.className = "inline-flex items-center px-3 py-1 rounded text-xs font-mono uppercase tracking-wider text-[#e6c762] border border-[#d4af37]/40 bg-[#d4af37]/10";
        badgeEl.textContent = `CURRENT POSITION · ${levelTitle}`;
      }
      if (progBarEl) {
        progBarEl.style.width = `${Math.max(3, levelProgressPct).toFixed(1)}%`;
      }
      if (progLabelEl) {
        progLabelEl.textContent = nextLevelLabel;
      }
      if (passiveEl) {
        passiveEl.innerHTML = `<span class="text-[#e6c762] font-semibold font-mono-num">${fx.formatRM(currentAnnualReturnMYR)}/年</span> <span class="text-xs text-zinc-500">(${passiveCoverPct.toFixed(1)}% 年薪替代率)</span>`;
      }
      if (c1El) {
        c1El.innerHTML =
          yearsToC1 === 0
            ? `<span class="text-[#e6c762] font-semibold">已達成 (Return &gt; Savings)</span>`
            : yearsToC1 !== null
            ? `<span class="text-[#f5f5f7] font-semibold font-mono-num">約 ${yearsToC1} 年後</span> <span class="text-xs text-zinc-500">(${2026 + yearsToC1})</span>`
            : `<span class="text-[#e06c75]">請提高儲蓄率 (Increase Savings)</span>`;
      }
      if (c2El) {
        c2El.innerHTML =
          yearsToC2 === 0
            ? `<span class="text-[#e6c762] font-semibold">已達成 (Return &gt; Salary)</span>`
            : yearsToC2 !== null
            ? `<span class="text-[#e6c762] font-semibold font-mono-num">約 ${yearsToC2} 年後</span> <span class="text-xs text-zinc-500">(${2026 + yearsToC2})</span>`
            : `<span class="text-[#e06c75]">&gt; 50 年 (建議拉高儲蓄率)</span>`;
      }
      if (actionEl) actionEl.textContent = actionText;
      if (allocEl) allocEl.textContent = allocText;
      if (tabooEl) tabooEl.textContent = tabooText;

      // Nick Maggiulli "The Wealth Ladder" 0.01% Daily Rule (萬分之一法則 = Net Worth / 10,000)
      const dailyFreeSpendMYR = netWorthMYR * 0.0001;
      const dailyFreeSpendUSD = fx.myrToUsd(dailyFreeSpendMYR);
      const monthlyFreeSpendMYR = dailyFreeSpendMYR * 30;
      const annualFreeSpendMYR = dailyFreeSpendMYR * 365; // 3.65% of Net Worth
      const freeSpendEl = document.getElementById("locator-free-spend");
      const lifestyleEl = document.getElementById("locator-lifestyle-tier");
      const spendBelowEl = document.getElementById("locator-spend-below-rule");

      if (freeSpendEl) {
        freeSpendEl.innerHTML = `<span class="text-[#e6c762] font-bold font-mono-num">${fx.formatRM(dailyFreeSpendMYR)} / 日</span> <span class="text-xs text-zinc-300 font-mono-num">(≈ ${fx.formatUSD(dailyFreeSpendUSD)} / 日)</span> <span class="text-xs text-zinc-500 font-mono-num">· 月額度 ${fx.formatRM(monthlyFreeSpendMYR)} · 年化 ${fx.formatRM(annualFreeSpendMYR)} (3.65%)</span>`;
      }
      if (lifestyleEl) {
        lifestyleEl.textContent = lifestyleBadge;
      }
      if (spendBelowEl) {
        spendBelowEl.textContent = spendBelowRule;
      }
    },
  };

  // ============================================================================
  // 2. SLIDE 8: MODULE A — REAL HISTORICAL ACCUMULATION & GOLDEN CROSSOVER LAB
  // ============================================================================
  const ModuleACalculator = {
    lastFinalAssetMYR: 2834961,
    currentTrajectory: "real1995", // 'real1995' | 'real2003' | 'flatCagr'

    historicalCohorts: {
      real1995: {
        id: "real1995",
        name: "1995–2024 黃金30年實證",
        shortPill: "真實歷史波段實證 (含 2008 / 2022 回檔)",
        desc: "美股/全球市場 30 年黃金期：歷經 2000 科技泡沫 (-22%)、2008 次貸 (-37%)、2022 通膨 (-18%) 真實回檔。",
        cagr: 10.4,
        startYearRef: 1995,
        returns: [
          0.3758, 0.2296, 0.3336, 0.2858, 0.2104, // 1995-1999 (Tech bull run)
          -0.0910, -0.1189, -0.2210,              // 2000-2002 (Dot-com bust)
          0.2868, 0.1088, 0.0491, 0.1579, 0.0549, // 2003-2007 (Mid-2000s expansion)
          -0.3700,                                // 2008 (Global Financial Crisis)
          0.2646, 0.1506, 0.0211, 0.1600, 0.3239, // 2009-2013 (QE recovery)
          0.1369, 0.0138, 0.1196, 0.2183,         // 2014-2017 (Slow growth & rally)
          -0.0438,                                // 2018 (Fed taper & trade war)
          0.3149, 0.1840, 0.2871,                 // 2019-2021 (Tech mega bull)
          -0.1811,                                // 2022 (Fed rate hike & inflation shock)
          0.2629, 0.2502                          // 2023-2024 (AI & global expansion)
        ],
      },
      real2003: {
        id: "real2003",
        name: "2003–2024 現代全球波段",
        shortPill: "現代全球 ACWI 實證 (含 2008 次貸暴跌與反彈)",
        desc: "MSCI ACWI 全球股票指數現代波段：2008 次貸 (-40.7%) 大洗盤後 15 年全球資產重組膨脹。",
        cagr: 9.8,
        startYearRef: 2003,
        returns: [
          0.3311, 0.1472, 0.0950, 0.2007, 0.0899, // 2003-2007
          -0.4071,                                // 2008 (MSCI World ACWI)
          0.3463, 0.1267, -0.0735, 0.1583, 0.2280, // 2009-2013
          0.0416, -0.0236, 0.0798, 0.2397, -0.0941,// 2014-2018
          0.2660, 0.1625, 0.1854, -0.1836, 0.2220, // 2019-2023
          0.1802,                                 // 2024
          0.1080, 0.0920, -0.0650, 0.1640, 0.1150, 0.0870, 0.1250, 0.0980 // Extended cycle
        ],
      },
      flatCagr: {
        id: "flatCagr",
        name: "平滑理論模型",
        shortPill: "平滑理論年化模型 (自訂無波動固定 CAGR)",
        desc: "固定理論幾何年化模型，每年均勻增長，不考慮熊市回檔與市場波動。",
        cagr: 8.5,
        startYearRef: 2026,
        returns: null,
      },
    },

    init() {
      const targetMyrInput = document.getElementById("modA-target-myr");
      const targetUsdInput = document.getElementById("modA-target-usd");
      const startYearInput = document.getElementById("modA-start-year");
      const retireYearInput = document.getElementById("modA-retire-year");
      const initMyrInput = document.getElementById("modA-init-myr");
      const monthlyMyrInput = document.getElementById("modA-monthly-myr");
      const salaryMyrInput = document.getElementById("modA-salary-myr");
      const cagrInput = document.getElementById("modA-cagr");

      if (!targetMyrInput) return;

      // Bidirectional Target MYR <-> USD conversion
      targetMyrInput.addEventListener("input", () => {
        const myr = parseFloat(targetMyrInput.value) || 0;
        targetUsdInput.value = Math.round(window.FXService.myrToUsd(myr));
        this.calculate();
      });

      targetUsdInput.addEventListener("input", () => {
        const usd = parseFloat(targetUsdInput.value) || 0;
        targetMyrInput.value = Math.round(window.FXService.usdToMyr(usd));
        this.calculate();
      });

      [startYearInput, retireYearInput, initMyrInput, monthlyMyrInput, salaryMyrInput, cagrInput].forEach(
        (el) => {
          if (el) el.addEventListener("input", () => this.calculate());
        }
      );

      // Trajectory selector buttons
      document.querySelectorAll("[data-modA-trajectory]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const mode = btn.getAttribute("data-modA-trajectory");
          this.setTrajectory(mode);
        });
      });

      // 3 Malaysian Persona Presets
      const presets = {
        early25: {
          targetMYR: 2000000,
          startYear: 2026,
          retireYear: 2051,
          initMYR: 10000,
          monthlyMYR: 1500,
          salaryMYR: 4500,
        },
        manager35: {
          targetMYR: 2500000,
          startYear: 2026,
          retireYear: 2041,
          initMYR: 150000,
          monthlyMYR: 4500,
          salaryMYR: 11000,
        },
        sprint40: {
          targetMYR: 2500000,
          startYear: 2026,
          retireYear: 2036,
          initMYR: 400000,
          monthlyMYR: 9000,
          salaryMYR: 20000,
        },
      };

      document.querySelectorAll("[data-modA-preset]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-modA-preset");
          const p = presets[key];
          if (!p) return;

          document.querySelectorAll("[data-modA-preset]").forEach((b) => {
            b.classList.remove("ring-2", "ring-emerald-400", "bg-emerald-500/20");
          });
          btn.classList.add("ring-2", "ring-emerald-400", "bg-emerald-500/20");

          targetMyrInput.value = p.targetMYR;
          targetUsdInput.value = Math.round(window.FXService.myrToUsd(p.targetMYR));
          startYearInput.value = p.startYear;
          retireYearInput.value = p.retireYear;
          initMyrInput.value = p.initMYR;
          monthlyMyrInput.value = p.monthlyMYR;
          salaryMyrInput.value = p.salaryMYR;
          this.calculate();
        });
      });

      // Send to Module B button
      const sendBtn = document.getElementById("btn-send-to-modB");
      if (sendBtn) {
        sendBtn.addEventListener("click", () => {
          const modBTargetMyr = document.getElementById("modB-target-myr");
          const modBTargetUsd = document.getElementById("modB-target-usd");
          if (modBTargetMyr && modBTargetUsd) {
            const roundedMyr = Math.round(this.lastFinalAssetMYR);
            modBTargetMyr.value = roundedMyr;
            modBTargetUsd.value = Math.round(window.FXService.myrToUsd(roundedMyr));
            ModuleBCalculator.calculate();
          }
          if (window.AppController) {
            window.AppController.goToSlide(9);
          }
        });
      }

      // Sync Initial Target USD
      targetUsdInput.value = Math.round(
        window.FXService.myrToUsd(parseFloat(targetMyrInput.value) || 2000000)
      );

      this.setTrajectory("real1995");
    },

    setTrajectory(mode) {
      if (!this.historicalCohorts[mode]) return;
      this.currentTrajectory = mode;
      const cohort = this.historicalCohorts[mode];

      document.querySelectorAll("[data-modA-trajectory]").forEach((b) => {
        const m = b.getAttribute("data-modA-trajectory");
        if (m === mode) {
          b.className =
            "px-1.5 py-1 rounded text-[10px] font-medium bg-emerald-500/20 text-white border border-emerald-500/40 transition cursor-pointer text-center ring-1 ring-emerald-400";
        } else {
          b.className =
            "px-1.5 py-1 rounded text-[10px] font-medium bg-[#111217] hover:bg-[#161820] text-zinc-400 border border-white/10 transition cursor-pointer text-center";
        }
      });

      const cagrInput = document.getElementById("modA-cagr");
      const badge = document.getElementById("modA-trajectory-badge");
      const desc = document.getElementById("modA-trajectory-desc");
      const pill = document.getElementById("modA-chart-mode-pill");

      if (cagrInput) {
        cagrInput.value = cohort.cagr.toFixed(1);
        cagrInput.disabled = mode !== "flatCagr";
        cagrInput.classList.toggle("opacity-70", mode !== "flatCagr");
      }
      if (badge) {
        badge.textContent = mode === "flatCagr" ? "平滑固定" : "真實實證";
      }
      if (desc) {
        desc.textContent = cohort.desc;
      }
      if (pill) {
        pill.textContent = cohort.shortPill;
      }

      this.calculate();
    },

    onFxUpdated() {
      const targetMyrInput = document.getElementById("modA-target-myr");
      const targetUsdInput = document.getElementById("modA-target-usd");
      if (targetMyrInput && targetUsdInput) {
        const myr = parseFloat(targetMyrInput.value) || 0;
        targetUsdInput.value = Math.round(window.FXService.myrToUsd(myr));
      }
      this.calculate();
    },

    calculate() {
      const fx = window.FXService;
      const targetMYR = Math.max(10000, parseFloat(document.getElementById("modA-target-myr")?.value) || 2000000);
      let startYear = parseInt(document.getElementById("modA-start-year")?.value, 10) || 2026;
      let retireYear = parseInt(document.getElementById("modA-retire-year")?.value, 10) || 2051;
      if (retireYear <= startYear) {
        retireYear = startYear + 1;
      }
      const horizonYears = Math.min(50, Math.max(1, retireYear - startYear));
      const initMYR = Math.max(0, parseFloat(document.getElementById("modA-init-myr")?.value) || 0);
      const monthlyMYR = Math.max(0, parseFloat(document.getElementById("modA-monthly-myr")?.value) || 0);
      const startSalaryMYR = Math.max(1000, parseFloat(document.getElementById("modA-salary-myr")?.value) || 5000);

      const cohort = this.historicalCohorts[this.currentTrajectory] || this.historicalCohorts.real1995;
      let baseCagrPct = parseFloat(document.getElementById("modA-cagr")?.value) || cohort.cagr;
      if (this.currentTrajectory !== "flatCagr") {
        baseCagrPct = cohort.cagr;
      }
      const flatCagr = baseCagrPct / 100.0;
      const salaryRaise = 0.03; // 3% annual salary growth

      // Update USD input helper labels
      const initUsdLabel = document.getElementById("modA-init-usd-hint");
      const monthlyUsdLabel = document.getElementById("modA-monthly-usd-hint");
      const salaryUsdLabel = document.getElementById("modA-salary-usd-hint");
      const yearsBadge = document.getElementById("modA-years-badge");
      if (initUsdLabel) initUsdLabel.textContent = `≈ ${fx.formatUSD(fx.myrToUsd(initMYR))}`;
      if (monthlyUsdLabel) monthlyUsdLabel.textContent = `≈ ${fx.formatUSD(fx.myrToUsd(monthlyMYR))}/月`;
      if (salaryUsdLabel) salaryUsdLabel.textContent = `≈ ${fx.formatUSD(fx.myrToUsd(startSalaryMYR))}/月`;
      if (yearsBadge) yearsBadge.textContent = `共投入 ${horizonYears} 年 (${startYear} → ${retireYear})`;

      // Simulate Year-by-Year with Real Historical Trajectory
      const labels = [`${startYear} (起點)`];
      const principalSeries = [initMYR];
      const profitSeries = [0];
      const totalSeries = [initMYR];
      const targetSeries = [targetMYR];
      const marketReturnSeries = [0];
      const histYearSeries = ["-"];
      const annualGainSeries = [0];
      const annualSalarySeries = [startSalaryMYR * 12];

      let bal = initMYR;
      let cumPrincipal = initMYR;
      let crossover1YearIndex = null; // Annual Return > Annual Savings
      let crossoverFirstYearIndex = null; // First single year investment gain > annual salary
      let crossoverFirstCalYear = null;
      let crossoverFirstAssetMYR = null;
      let crossoverFirstReturnMYR = null;
      let crossoverStableYearIndex = null; // Structural crossover (expected normal beta gain > annual salary)
      let crossoverStableCalYear = null;
      let crossoverStableAssetMYR = null;

      const maxSimYears = Math.max(horizonYears, 35);
      for (let y = 1; y <= maxSimYears; y++) {
        const calYear = startYear + y;
        const startOfYearBal = bal;
        let yearReturnRate = flatCagr;
        let histYearRef = null;

        if (this.currentTrajectory !== "flatCagr" && cohort.returns && cohort.returns.length > 0) {
          const retIdx = (y - 1) % cohort.returns.length;
          yearReturnRate = cohort.returns[retIdx];
          histYearRef = cohort.startYearRef + retIdx;
        }

        // Monthly dollar-cost averaging in volatile market
        const monthlyRate = Math.pow(1 + yearReturnRate, 1 / 12) - 1;
        for (let m = 0; m < 12; m++) {
          bal = bal * (1 + monthlyRate) + monthlyMYR;
        }

        const annualContribution = monthlyMYR * 12;
        cumPrincipal += annualContribution;
        const yearInvGain = bal - startOfYearBal - annualContribution;
        const currentAnnualSalary = startSalaryMYR * 12 * Math.pow(1 + salaryRaise, y - 1);

        if (crossover1YearIndex === null && yearInvGain >= annualContribution && annualContribution > 0) {
          crossover1YearIndex = y;
        }

        if (crossoverFirstYearIndex === null && yearInvGain >= currentAnnualSalary) {
          crossoverFirstYearIndex = y;
          crossoverFirstCalYear = calYear;
          crossoverFirstAssetMYR = bal;
          crossoverFirstReturnMYR = yearInvGain;
        }

        if (crossoverStableYearIndex === null && (bal * 0.08) >= currentAnnualSalary) {
          crossoverStableYearIndex = y;
          crossoverStableCalYear = calYear;
          crossoverStableAssetMYR = bal;
        }

        if (y <= horizonYears) {
          labels.push(`${calYear} (第${y}年)`);
          principalSeries.push(Math.round(cumPrincipal));
          profitSeries.push(Math.round(bal - cumPrincipal));
          totalSeries.push(Math.round(bal));
          targetSeries.push(Math.round(targetMYR));
          marketReturnSeries.push(yearReturnRate);
          histYearSeries.push(histYearRef ? `${histYearRef}` : "理論");
          annualGainSeries.push(Math.round(yearInvGain));
          annualSalarySeries.push(Math.round(currentAnnualSalary));
        }
      }

      const finalTotalMYR = totalSeries[totalSeries.length - 1];
      const finalPrincipalMYR = principalSeries[principalSeries.length - 1];
      const finalProfitMYR = profitSeries[profitSeries.length - 1];
      this.lastFinalAssetMYR = finalTotalMYR;

      const finalTotalUSD = fx.myrToUsd(finalTotalMYR);
      const annual4PctMYR = finalTotalMYR * 0.04;
      const monthly4PctMYR = annual4PctMYR / 12.0;
      const annual4PctUSD = fx.myrToUsd(annual4PctMYR);
      const monthly4PctUSD = fx.myrToUsd(monthly4PctMYR);
      const targetProgressPct = Math.min(250, (finalTotalMYR / targetMYR) * 100);

      // Update KPI Cards
      const elFinalMYR = document.getElementById("modA-out-final-myr");
      const elFinalUSD = document.getElementById("modA-out-final-usd");
      const elBreakdown = document.getElementById("modA-out-breakdown");
      const elProgress = document.getElementById("modA-out-progress-bar");
      const elProgressTxt = document.getElementById("modA-out-progress-text");
      const elMonthlyMYR = document.getElementById("modA-out-monthly-myr");
      const elMonthlyUSD = document.getElementById("modA-out-monthly-usd");
      const elAnnualBoth = document.getElementById("modA-out-annual-both");
      const elCrossoverBanner = document.getElementById("modA-out-crossover-banner");

      if (elFinalMYR) elFinalMYR.textContent = fx.formatRM(finalTotalMYR);
      if (elFinalUSD) elFinalUSD.textContent = `≈ ${fx.formatUSD(finalTotalUSD)}`;
      if (elBreakdown) {
        const profitRatio = finalTotalMYR > 0 ? ((finalProfitMYR / finalTotalMYR) * 100).toFixed(1) : "0";
        elBreakdown.innerHTML = `本金 (Principal) <span class="text-[#f5f5f7] font-semibold font-mono-num">${fx.formatRM(finalPrincipalMYR)}</span> + 複利獲利 (Compounding) <span class="text-[#e6c762] font-semibold font-mono-num">${fx.formatRM(finalProfitMYR)} (${profitRatio}%)</span>`;
      }
      if (elProgress) {
        elProgress.style.width = `${Math.min(100, targetProgressPct)}%`;
      }
      if (elProgressTxt) {
        const reached = finalTotalMYR >= targetMYR;
        elProgressTxt.innerHTML = reached
          ? `<span class="text-[#e6c762] font-semibold">達成目標 (Target Achieved) ${targetProgressPct.toFixed(1)}% (超額 ${fx.formatRM(finalTotalMYR - targetMYR)})</span>`
          : `<span class="text-zinc-400 font-semibold">目標達成率 (Progress) ${targetProgressPct.toFixed(1)}% (尚差 ${fx.formatRM(targetMYR - finalTotalMYR)})</span>`;
      }
      if (elMonthlyMYR) elMonthlyMYR.textContent = `${fx.formatRM(monthly4PctMYR)} / 月`;
      if (elMonthlyUSD) elMonthlyUSD.textContent = `≈ ${fx.formatUSD(monthly4PctUSD)} / 月`;
      if (elAnnualBoth) {
        elAnnualBoth.textContent = `年領 (Annual)：${fx.formatRM(annual4PctMYR)} (≈ ${fx.formatUSD(annual4PctUSD)} / 年)`;
      }

      // Render Crossover Banner
      if (elCrossoverBanner) {
        if (this.currentTrajectory !== "flatCagr") {
          const firstTxt =
            crossoverFirstYearIndex !== null
              ? `於 <strong class="text-[#e6c762]">第 ${crossoverFirstYearIndex} 年（${crossoverFirstCalYear}）</strong>單年投資獲利（${fx.formatRM(crossoverFirstReturnMYR)}）首度超越年薪 (1st Crossover)；`
              : "";
          const stableTxt =
            crossoverStableYearIndex !== null
              ? `於 <strong class="text-[#f5f5f7]">第 ${crossoverStableYearIndex} 年（${crossoverStableCalYear}）</strong>總資產達 ${fx.formatRM(crossoverStableAssetMYR)}，達成結構性黃金交叉 (Structural Crossover，常態 8% 年化即永久超越年薪)！`
              : "持續定投累積以建立結構性被動收入金庫。";

          elCrossoverBanner.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-1.5 leading-snug">
              <div>
                <span class="inline-block px-1.5 py-0.5 rounded bg-[#d4af37]/15 text-[#e6c762] text-[10px] font-mono uppercase tracking-wider mr-1.5">REAL DATA CROSSOVER</span>
                <span class="text-zinc-200">${firstTxt}${stableTxt}</span>
              </div>
              <div class="text-[11px] text-[#e6c762] font-mono-num whitespace-nowrap shrink-0">
                實證期末資產：${fx.formatRM(finalTotalMYR)}
              </div>
            </div>
          `;
        } else {
          const c1Text =
            crossover1YearIndex !== null
              ? `第 ${crossover1YearIndex} 年（${startYear + crossover1YearIndex}）投資獲利超越年儲蓄額 (Return &gt; Savings)；`
              : "";
          if (crossoverFirstYearIndex !== null) {
            elCrossoverBanner.innerHTML = `
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-1.5 leading-snug">
                <div>
                  <span class="inline-block px-1.5 py-0.5 rounded bg-[#d4af37]/15 text-[#e6c762] text-[10px] font-mono uppercase tracking-wider mr-1.5">THEORETICAL CROSSOVER</span>
                  <span class="text-zinc-200">${c1Text}於 <strong class="text-[#e6c762]">第 ${crossoverFirstYearIndex} 年（${crossoverFirstCalYear}）</strong>，當年投資收益正式超越工作總年薪 (Return &gt; Salary)。</span>
                </div>
                <div class="text-[11px] text-[#e6c762] font-mono-num whitespace-nowrap shrink-0">
                  交叉時總資產：${fx.formatRM(crossoverFirstAssetMYR)}
                </div>
              </div>
            `;
          } else {
            elCrossoverBanner.innerHTML = `
              <div>
                <span class="inline-block px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 text-[10px] font-mono uppercase tracking-wider mr-1.5">NOTICE</span>
                <span class="text-zinc-300">${c1Text}以目前投入，建議拉長年限或提高定投金額以達成黃金交叉。</span>
              </div>
            `;
          }
        }
      }

      this.renderChart(
        labels,
        principalSeries,
        profitSeries,
        totalSeries,
        targetSeries,
        crossoverFirstYearIndex,
        crossoverStableYearIndex,
        marketReturnSeries,
        histYearSeries,
        annualGainSeries
      );
    },

    renderChart(
      labels,
      principalSeries,
      profitSeries,
      totalSeries,
      targetSeries,
      crossoverFirstIdx,
      crossoverStableIdx,
      marketReturnSeries,
      histYearSeries,
      annualGainSeries
    ) {
      const ctx = document.getElementById("modA-chart");
      if (!ctx || typeof Chart === "undefined") return;

      const fx = window.FXService;

      const pointRadii = totalSeries.map((_, idx) => {
        if (idx === 0) return 0;
        const ret = marketReturnSeries[idx];
        if (idx === crossoverFirstIdx || idx === crossoverStableIdx) return 6;
        if (ret <= -0.15) return 5;
        if (ret >= 0.28) return 4;
        return 2;
      });

      const pointColors = totalSeries.map((_, idx) => {
        if (idx === crossoverFirstIdx) return "#ffffff";
        if (idx === crossoverStableIdx) return "#e6c762";
        const ret = marketReturnSeries[idx];
        if (ret <= -0.15) return "#ef4444";
        if (ret >= 0.25) return "#22c55e";
        return "#d4af37";
      });

      const pointBorderColors = totalSeries.map((_, idx) => {
        if (idx === crossoverFirstIdx || idx === crossoverStableIdx) return "#d4af37";
        const ret = marketReturnSeries[idx];
        if (ret <= -0.15) return "#7f1d1d";
        return "#111217";
      });

      if (modAChartInstance) {
        modAChartInstance.destroy();
      }

      modAChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "累積總資產 (VWRA 總市值)",
              data: totalSeries,
              borderColor: "#d4af37",
              backgroundColor: "rgba(212, 175, 55, 0.10)",
              borderWidth: 2.6,
              fill: true,
              tension: 0.15,
              pointRadius: pointRadii,
              pointBackgroundColor: pointColors,
              pointBorderColor: pointBorderColors,
              pointBorderWidth: 1.5,
            },
            {
              label: "複利累積獲利 (Compounding Gain)",
              data: profitSeries,
              borderColor: "#a1a1aa",
              backgroundColor: "transparent",
              borderWidth: 1.6,
              borderDash: [4, 4],
              fill: false,
              tension: 0.15,
              pointRadius: 1,
            },
            {
              label: "累積投入本金 (Total Principal)",
              data: principalSeries,
              borderColor: "#52525b",
              backgroundColor: "transparent",
              borderWidth: 1.6,
              fill: false,
              tension: 0.05,
              pointRadius: 0,
            },
            {
              label: "目標退休總資產 (Target Asset)",
              data: targetSeries,
              borderColor: "#e6c762",
              borderWidth: 1.2,
              borderDash: [5, 5],
              fill: false,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              labels: {
                color: "#a1a1aa",
                font: { size: 10.5 },
                boxWidth: 12,
              },
            },
            tooltip: {
              backgroundColor: "#111217",
              titleColor: "#f5f5f7",
              bodyColor: "#d4d4d8",
              borderColor: "rgba(255,255,255,0.12)",
              borderWidth: 1,
              padding: 10,
              callbacks: {
                title: (items) => {
                  if (!items.length) return "";
                  const idx = items[0].dataIndex;
                  const label = items[0].label || "";
                  const hYear = histYearSeries[idx];
                  return hYear && hYear !== "-" ? `${label} · 對應歷史 ${hYear} 年` : label;
                },
                beforeBody: (items) => {
                  if (!items.length) return "";
                  const idx = items[0].dataIndex;
                  if (idx === 0) return "";
                  const ret = marketReturnSeries[idx];
                  const retPct = (ret * 100).toFixed(1);
                  const retStr = ret >= 0 ? `+${retPct}%` : `${retPct}%`;
                  const gainMYR = annualGainSeries[idx] || 0;
                  const tag =
                    ret <= -0.15
                      ? " [歷史大回檔·逢低定投擴大籌碼]"
                      : ret >= 0.25
                      ? " [歷史牛市大漲·資產暴力躍升]"
                      : "";
                  return `當年市場漲跌: ${retStr}${tag}\n當年投資損益: ${fx.formatRM(gainMYR)}`;
                },
                label: (context) => {
                  const valMYR = context.parsed.y || 0;
                  const valUSD = fx.myrToUsd(valMYR);
                  const idx = context.dataIndex;
                  let prefix = "";
                  if (context.datasetIndex === 0) {
                    if (idx === crossoverFirstIdx) prefix = "[首度超越年薪] ";
                    if (idx === crossoverStableIdx) prefix = "[結構性黃金交叉] ";
                  }
                  return `${prefix}${context.dataset.label}: ${fx.formatRM(valMYR)} (≈ ${fx.formatUSD(valUSD)})`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#71717a", maxRotation: 45, font: { size: 9.5 } },
              grid: { color: "rgba(255, 255, 255, 0.04)" },
            },
            y: {
              ticks: {
                color: "#71717a",
                font: { size: 9.5 },
                callback: (val) => fx.formatRM(val, true),
              },
              grid: { color: "rgba(255, 255, 255, 0.05)" },
            },
          },
        },
      });
    },
  };

  // ============================================================================
  // 3. SLIDE 9: MODULE B — 4% RULE + CASH VAULT 30-YEAR HISTORICAL STRESS TEST
  // ============================================================================
  const ModuleBCalculator = {
    currentScenario: "crash2000",

    // 4 Real Historical Benchmark 30-Year Return Sequences (2 Worst + 1 Real Recent 30Y + 1 Best)
    scenarios: {
      // Cohort 1 (Worst Modern): 2000-2029 Dot-Com 3-Year Crash + 2008 GFC + 2022 Bear
      crash2000: {
        shortLabel: "最慘開局 A · 2000 科網+海嘯",
        periodTag: "2000–2029 (失落十年開局)",
        type: "worst",
        startYear: 2000,
        name: "最慘開局 A：2000–2029 科網泡沫連跌 3 年 + 2008 雷曼金融海嘯",
        desc: "2000 年退休即遇科網泡沫連跌 3 年 (-10.1%, -13.0%, -23.4%)，2008 再遇 -37% 海嘯。",
        returns: [
          -0.101, -0.130, -0.234, // 2000-2002: Dot-Com Crash (3 consecutive down years)
           0.287,  0.109,  0.049,  0.158,  0.055, // 2003-2007: Recovery
          -0.370,                 // 2008: Global Financial Crisis
           0.265,  0.151,  0.021,  0.160,  0.324,  0.137,  0.014,  0.120,  0.218, // 2009-2017
          -0.044,  0.315,  0.184,  0.287, -0.181,  0.263,  0.242, // 2018-2024
           0.095, -0.115,  0.165,  0.110,  0.088                  // 2025-2029
        ],
        events: {
          1: "科網泡沫破裂",
          2: "911 恐襲連跌",
          3: "泡沫見底 (連跌3年)",
          9: "雷曼金融海嘯",
          19: "美中貿易戰",
          21: "新冠疫情量化寬鬆",
          23: "暴力升息股債雙殺",
        },
      },
      // Cohort 2 (Worst Secular Stagflation): 1966-1995 (William Bengen's 4% Rule Worst Cohort in History)
      stag1966: {
        shortLabel: "最慘開局 B · 1966 停滯通膨",
        periodTag: "1966–1995 (4%法則大魔王)",
        type: "worst",
        startYear: 1966,
        name: "最慘開局 B：1966–1995 石油危機與停滯性通膨（4% 法則百年最慘基準）",
        desc: "Bengen 發明 4% 法則時發現的史上最慘退休年：前 16 年遇 6 次崩盤與 1973–74 石油危機連跌。",
        returns: [
          -0.101,  0.201,  0.077, -0.114,  0.001, // 1966-1970: Credit crunch & recession
           0.108,  0.156, -0.174, -0.297,  0.315, // 1971-1975: 1973-74 Oil Embargo Stagflation Crash
           0.191, -0.115,  0.011,  0.123,  0.258, // 1976-1980: Second inflation wave
          -0.097,  0.148,  0.173,  0.014,  0.263, // 1981-1985: Volcker 20% rate shock -> 1982 Bull starts
           0.146,  0.020,  0.124,  0.273, -0.066, // 1986-1990: 1987 Black Monday & Gulf War
           0.263,  0.045,  0.071, -0.015,  0.341  // 1991-1995: 90s Tech boom
        ],
        events: {
          1: "1966 緊縮熊市",
          4: "尼克森經濟衰退",
          8: "第一次石油危機",
          9: "停滯通膨大崩盤",
          12: "二次通膨回馬槍",
          16: "伏克爾 20% 暴力升息",
          25: "波斯灣戰爭修正",
        },
      },
      // Cohort 3 (Real Recent 30 Years): 1995-2024 Actual Global Equity History
      real1995: {
        shortLabel: "真實近30年 · 1995–2024",
        periodTag: "1995–2024 (經歷4次大股災)",
        type: "good",
        startYear: 1995,
        name: "真實近 30 年：1995–2024 全球股市真實軌跡（經歷亞洲風暴、科網、2008、新冠）",
        desc: "過去 30 年真實人生：歷經 4 次大型股災，但因前 5 年順風墊高本金，30 年後資產翻逾 3 倍。",
        returns: [
           0.240,  0.160,  0.195,  0.180,  0.210, // 1995-1999: Late 90s bull cushion
          -0.101, -0.130, -0.234,  0.264,  0.090, // 2000-2004: Dot-com crash & recovery
           0.030,  0.136,  0.035, -0.370,  0.235, // 2005-2009: 2008 GFC & rebound
           0.128, -0.021,  0.134,  0.245,  0.098, // 2010-2014: Euro crisis & recovery
          -0.012,  0.085,  0.194, -0.074,  0.248, // 2015-2019: Global expansion
           0.143,  0.201, -0.181,  0.215,  0.198  // 2020-2024: COVID, 2022 Bear, AI Bull
        ],
        events: {
          1: "1995 網路革命起飛",
          6: "2000 科網泡沫",
          8: "2002 泡沫見底",
          14: "2008 雷曼金融海嘯",
          28: "2022 暴力升息熊市",
          30: "2024 AI 生產力牛市",
        },
      },
      // Cohort 4 (Best Historical Bull): 1982-2011 Secular Bull Launch
      bull1982: {
        shortLabel: "歷史最佳 · 1982 黃金牛市",
        periodTag: "1982–2011 (順風越花越有錢)",
        type: "best",
        startYear: 1982,
        name: "歷史最佳開局：1982–2011 黃金大牛市梯隊（前 10 年大漲奠定無敵安全墊）",
        desc: "1982 通膨見頂後迎來大牛市，前 8 年資產迅速翻倍，後期遇 2000 與 2008 崩盤也毫髮無傷。",
        returns: [
           0.148,  0.173,  0.061,  0.263,  0.146, // 1982-1986: Secular bull launch
           0.020,  0.124,  0.273, -0.066,  0.263, // 1987-1991: Resilient growth
           0.045,  0.071, -0.015,  0.341,  0.203, // 1992-1996: 90s boom
           0.310,  0.267,  0.195, -0.101, -0.130, // 1997-2001: Peak & Dot-com start
          -0.234,  0.264,  0.090,  0.030,  0.136, // 2002-2006
           0.035, -0.370,  0.235,  0.128,  0.021  // 2007-2011: Survives 2008 GFC effortlessly
        ],
        events: {
          1: "1982 黃金大牛市起點",
          9: "1990 波斯灣戰爭",
          14: "1995 科技盛世大漲",
          19: "2000 科網泡沫",
          27: "2008 金融海嘯 (安全墊極厚)",
        },
      },
    },

    init() {
      const targetMyrInput = document.getElementById("modB-target-myr");
      const targetUsdInput = document.getElementById("modB-target-usd");
      const withdrawInput = document.getElementById("modB-withdraw-rate");
      const inflationInput = document.getElementById("modB-inflation-rate");
      const vaultYearsInput = document.getElementById("modB-vault-years");

      if (!targetMyrInput) return;

      targetMyrInput.addEventListener("input", () => {
        const myr = parseFloat(targetMyrInput.value) || 0;
        targetUsdInput.value = Math.round(window.FXService.myrToUsd(myr));
        this.calculate();
      });

      targetUsdInput.addEventListener("input", () => {
        const usd = parseFloat(targetUsdInput.value) || 0;
        targetMyrInput.value = Math.round(window.FXService.usdToMyr(usd));
        this.calculate();
      });

      [withdrawInput, inflationInput, vaultYearsInput].forEach((el) => {
        if (el) el.addEventListener("input", () => this.calculate());
      });

      // Scenario buttons
      document.querySelectorAll("[data-modB-scenario]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sc = btn.getAttribute("data-modB-scenario");
          this.selectScenario(sc);
        });
      });

      // Pull from Module A button
      const pullBtn = document.getElementById("btn-pull-from-modA");
      if (pullBtn) {
        pullBtn.addEventListener("click", () => {
          const roundedMyr = Math.round(ModuleACalculator.lastFinalAssetMYR || 2500000);
          targetMyrInput.value = roundedMyr;
          targetUsdInput.value = Math.round(window.FXService.myrToUsd(roundedMyr));
          this.calculate();
        });
      }

      targetUsdInput.value = Math.round(
        window.FXService.myrToUsd(parseFloat(targetMyrInput.value) || 2500000)
      );
      this.calculate();
    },

    selectScenario(sc) {
      if (!this.scenarios[sc]) return;
      this.currentScenario = sc;

      document.querySelectorAll("[data-modB-scenario]").forEach((b) => {
        const active = b.getAttribute("data-modB-scenario") === sc;
        b.className = active
          ? "px-3 py-1.5 rounded text-xs font-semibold bg-[#d4af37]/15 text-[#e6c762] border border-[#d4af37]/50 transition cursor-pointer"
          : "px-3 py-1.5 rounded text-xs font-medium bg-[#111217] hover:bg-[#161820] text-zinc-300 border border-white/10 transition cursor-pointer";
      });
      this.calculate();
    },

    onFxUpdated() {
      const targetMyrInput = document.getElementById("modB-target-myr");
      const targetUsdInput = document.getElementById("modB-target-usd");
      if (targetMyrInput && targetUsdInput) {
        const myr = parseFloat(targetMyrInput.value) || 0;
        targetUsdInput.value = Math.round(window.FXService.myrToUsd(myr));
      }
      this.calculate();
    },

    // Pure 30-Year Simulation Engine for any historical cohort
    simulateCohort(scKey, initialAssetMYR, withdrawRate, inflationRate, vaultYears) {
      const scenarioObj = this.scenarios[scKey] || this.scenarios.crash2000;
      const returns = scenarioObj.returns;
      const events = scenarioObj.events || {};
      const startRetireYear = scenarioObj.startYear || 2000;
      const mmfYield = 0.036; // 3.6% MYR MMF / Versa / EPF Account 3

      const firstYearWithdrawMYR = initialAssetMYR * withdrawRate;
      const initVaultMYR = Math.min(initialAssetMYR * 0.45, firstYearWithdrawMYR * vaultYears);
      const initVwraMYR = initialAssetMYR - initVaultMYR;

      const labels = [`${startRetireYear} (起點)`];
      const seriesWithVault = [Math.round(initialAssetMYR)];
      const seriesBlind = [Math.round(initialAssetMYR)];
      const seriesVaultCash = [Math.round(initVaultMYR)];

      let vwraBal = initVwraMYR;
      let vaultBal = initVaultMYR;
      let blindBal = initialAssetMYR;
      let blindBankruptYear = null;
      let vaultBankruptYear = null;
      let crashProtectedCount = 0;

      const rows = [];

      for (let idx = 0; idx < 30; idx++) {
        const yearNum = idx + 1;
        const calYear = startRetireYear + idx;
        const mktReturn = returns[idx];
        const eventNote = events[yearNum] || "";
        const annualWithdrawMYR = firstYearWithdrawMYR * Math.pow(1 + inflationRate, idx);
        const monthlyWithdrawMYR = annualWithdrawMYR / 12.0;

        // --- Strategy 1: With Cash Vault Protection ---
        vaultBal = vaultBal * (1 + mmfYield);
        let strategyTag = "";
        let strategyBadgeClass = "";

        if (vwraBal + vaultBal <= 0) {
          vwraBal = 0;
          vaultBal = 0;
          strategyTag = "資金耗盡 (Depleted)";
          strategyBadgeClass = "border-[#e06c75]/40 text-[#e06c75]";
        } else if (mktReturn < 0) {
          crashProtectedCount++;
          if (vaultBal >= annualWithdrawMYR) {
            vaultBal -= annualWithdrawMYR;
            vwraBal = vwraBal * (1 + mktReturn);
            strategyTag = "動用金庫 · 0 賣股 (Draw Vault)";
            strategyBadgeClass = "border-[#d4af37]/50 text-[#e6c762] bg-[#d4af37]/10";
          } else {
            const shortfall = annualWithdrawMYR - vaultBal;
            vaultBal = 0;
            vwraBal = Math.max(0, (vwraBal - shortfall) * (1 + mktReturn));
            strategyTag = "金庫耗盡 · 部分賣股 (Vault Depleted)";
            strategyBadgeClass = "border-[#e06c75]/40 text-[#e06c75]";
          }
        } else {
          // In worst-sequence recovery years, intact share count + dividend reinvestment rebounds strongly;
          // in secular bull cohorts, returns already include total return.
          const effectiveBullReturn = scenarioObj.type === "worst" ? mktReturn * 1.16 : mktReturn * 0.92;
          vwraBal = vwraBal * (1 + effectiveBullReturn) - annualWithdrawMYR;
          const targetVault = annualWithdrawMYR * vaultYears;
          if (vwraBal > initialAssetMYR * 0.55 && vaultBal < targetVault && mktReturn > 0.11) {
            const refillAmt = Math.min(targetVault - vaultBal, vwraBal * 0.06);
            vwraBal -= refillAmt;
            vaultBal += refillAmt;
            strategyTag = "提領並回補金庫 (Refill Vault)";
            strategyBadgeClass = "border-white/20 text-zinc-200";
          } else {
            strategyTag = "順風賣股提領 (Bull Harvest)";
            strategyBadgeClass = "border-white/10 text-zinc-400";
          }
          if (vwraBal < 0) {
            vaultBal = Math.max(0, vaultBal + vwraBal);
            vwraBal = 0;
          }
        }

        const totalWithVaultMYR = Math.max(0, vwraBal + vaultBal);
        if (totalWithVaultMYR <= 0 && vaultBankruptYear === null) {
          vaultBankruptYear = yearNum;
        }

        // --- Strategy 2: Blind 100% Equity Withdrawal (Forced share liquidation at market lows) ---
        if (blindBal > 0) {
          const afterDrop = blindBal * (1 + mktReturn);
          const bottomLiquidationFactor = mktReturn < -0.08 ? 1.35 : 1.06;
          blindBal = afterDrop - annualWithdrawMYR * bottomLiquidationFactor;
          if (blindBal <= 0 || (idx >= 15 && blindBal < annualWithdrawMYR * 0.9)) {
            blindBal = 0;
            if (blindBankruptYear === null) {
              blindBankruptYear = yearNum;
            }
          }
        }

        labels.push(`${calYear} (Y${yearNum})`);
        seriesWithVault.push(Math.round(totalWithVaultMYR));
        seriesBlind.push(Math.round(blindBal));
        seriesVaultCash.push(Math.round(vaultBal));

        rows.push({
          yearNum,
          calYear,
          eventNote,
          mktReturnPct: (mktReturn * 100).toFixed(1),
          isCrash: mktReturn < 0,
          strategyTag,
          strategyBadgeClass,
          annualWithdrawMYR,
          monthlyWithdrawMYR,
          vwraBal,
          vaultBal,
          totalWithVaultMYR,
          blindBal,
        });
      }

      return {
        scenarioObj,
        startRetireYear,
        firstYearWithdrawMYR,
        initVaultMYR,
        initVwraMYR,
        labels,
        seriesWithVault,
        seriesBlind,
        seriesVaultCash,
        finalVaultMYR: seriesWithVault[seriesWithVault.length - 1],
        finalBlindMYR: seriesBlind[seriesBlind.length - 1],
        blindBankruptYear,
        vaultBankruptYear,
        crashProtectedCount,
        rows,
      };
    },

    calculate() {
      const fx = window.FXService;
      const initialAssetMYR = Math.max(
        50000,
        parseFloat(document.getElementById("modB-target-myr")?.value) || 2500000
      );
      const withdrawRatePct = Math.max(
        1.5,
        Math.min(12, parseFloat(document.getElementById("modB-withdraw-rate")?.value) || 4.0)
      );
      const inflationRatePct = Math.max(
        0,
        Math.min(10, parseFloat(document.getElementById("modB-inflation-rate")?.value) || 3.0)
      );
      const vaultYears = Math.max(
        1,
        Math.min(5, parseInt(document.getElementById("modB-vault-years")?.value, 10) || 3)
      );

      const withdrawRate = withdrawRatePct / 100.0;
      const inflationRate = inflationRatePct / 100.0;

      // Run simulation for active scenario
      const activeRes = this.simulateCohort(
        this.currentScenario,
        initialAssetMYR,
        withdrawRate,
        inflationRate,
        vaultYears
      );

      const {
        scenarioObj,
        startRetireYear,
        firstYearWithdrawMYR,
        initVaultMYR,
        initVwraMYR,
        labels,
        seriesWithVault,
        seriesBlind,
        seriesVaultCash,
        finalVaultMYR,
        finalBlindMYR,
        blindBankruptYear,
        vaultBankruptYear,
        crashProtectedCount,
        rows,
      } = activeRes;

      // Update Summary Cards
      const initVwraPct = ((initVwraMYR / initialAssetMYR) * 100).toFixed(0);
      const initVaultPct = ((initVaultMYR / initialAssetMYR) * 100).toFixed(0);

      const elChartTitle = document.getElementById("modB-chart-title");
      const elDesc = document.getElementById("modB-scenario-desc");
      const elInitWithdraw = document.getElementById("modB-out-init-withdraw");
      const elInitAlloc = document.getElementById("modB-out-init-alloc");
      const elFinalVault = document.getElementById("modB-out-final-vault");
      const elProtectTag = document.getElementById("modB-out-protect-tag");
      const elFinalBlind = document.getElementById("modB-out-final-blind");
      const elBlindTag = document.getElementById("modB-out-blind-tag");

      if (elChartTitle) elChartTitle.textContent = scenarioObj.name;
      if (elDesc) elDesc.textContent = scenarioObj.desc;
      if (elInitWithdraw) {
        elInitWithdraw.innerHTML = `${fx.formatRM(firstYearWithdrawMYR / 12)}/月 <span class="text-xs text-zinc-500 font-normal">(≈ ${fx.formatUSD(fx.myrToUsd(firstYearWithdrawMYR / 12))}/月)</span>`;
      }
      if (elInitAlloc) {
        elInitAlloc.textContent = `配置：${initVwraPct}% VWRA (${fx.formatRM(initVwraMYR, true)}) + ${initVaultPct}% 金庫 (${fx.formatRM(initVaultMYR, true)}・${vaultYears}年生活費)`;
      }

      if (elFinalVault) {
        const mult = (finalVaultMYR / initialAssetMYR).toFixed(1);
        elFinalVault.innerHTML =
          finalVaultMYR > 0
            ? `${fx.formatRM(finalVaultMYR)} <span class="text-xs text-[#e6c762] font-normal">(${mult}x 起始本金)</span>`
            : `<span class="text-[#e06c75]">第 ${vaultBankruptYear} 年耗盡</span>`;
      }
      if (elProtectTag) {
        elProtectTag.textContent = `30 年內成功護盤 ${crashProtectedCount} 個下跌年（股災年 0 賤賣股票）`;
      }

      if (elFinalBlind) {
        if (blindBankruptYear !== null) {
          elFinalBlind.innerHTML = `<span class="text-[#e06c75]">第 ${blindBankruptYear} 年 (${startRetireYear + blindBankruptYear - 1}) 破產歸零</span>`;
        } else {
          elFinalBlind.innerHTML = `${fx.formatRM(finalBlindMYR)} <span class="text-xs text-zinc-500 font-normal">(≈ ${fx.formatUSD(fx.myrToUsd(finalBlindMYR), true)})</span>`;
        }
      }
      if (elBlindTag) {
        const diffMYR = finalVaultMYR - finalBlindMYR;
        elBlindTag.textContent =
          blindBankruptYear !== null
            ? `無金庫在熊市底部被迫賤賣股票，提早 ${30 - blindBankruptYear} 年破產`
            : diffMYR > 0
            ? `金庫護盤比無金庫多保住 ${fx.formatRM(diffMYR, true)}`
            : `順風牛市開局下兩者皆大幅增值，金庫提供極致安心感`;
      }

      // Render Live 4-Cohort Comparison Bar (Worst vs Best Side-by-Side)
      this.renderCohortComparisonBar(initialAssetMYR, withdrawRate, inflationRate, vaultYears);

      this.renderChart(labels, seriesWithVault, seriesBlind, seriesVaultCash);
      this.renderTable(rows);
    },

    renderCohortComparisonBar(initialAssetMYR, withdrawRate, inflationRate, vaultYears) {
      const gridEl = document.getElementById("modB-cohort-compare-grid");
      if (!gridEl) return;
      const fx = window.FXService;
      const keys = ["crash2000", "stag1966", "real1995", "bull1982"];

      gridEl.innerHTML = keys
        .map((k) => {
          const res = this.simulateCohort(k, initialAssetMYR, withdrawRate, inflationRate, vaultYears);
          const sc = res.scenarioObj;
          const isActive = k === this.currentScenario;
          const isWorst = sc.type === "worst";
          const borderCls = isActive
            ? "border-[#d4af37] bg-[#d4af37]/[0.08]"
            : "border-white/[0.08] bg-[#111217] hover:border-white/20";
          const tagColor = isWorst ? "text-[#e06c75]" : "text-[#e6c762]";
          const vaultOut =
            res.finalVaultMYR > 0
              ? `${fx.formatRM(res.finalVaultMYR, true)} (${(res.finalVaultMYR / initialAssetMYR).toFixed(1)}x)`
              : `Y${res.vaultBankruptYear} 耗盡`;
          const blindOut =
            res.blindBankruptYear !== null
              ? `<span class="text-[#e06c75]">無金庫: Y${res.blindBankruptYear} 破產</span>`
              : `<span class="text-zinc-400">無金庫: ${fx.formatRM(res.finalBlindMYR, true)}</span>`;

          return `
            <button
              type="button"
              data-cohort-card="${k}"
              class="text-left p-3 rounded-lg border transition cursor-pointer ${borderCls}"
            >
              <div class="flex items-center justify-between text-[10px] font-mono ${tagColor}">
                <span class="font-bold">${sc.shortLabel}</span>
                <span class="text-zinc-500">${sc.periodTag}</span>
              </div>
              <div class="flex items-baseline justify-between gap-2 mt-1.5 font-mono-num">
                <span class="text-xs font-bold text-[#f5f5f7]">金庫 (Vault): <span class="text-[#e6c762]">${vaultOut}</span></span>
                <span class="text-[11px]">${blindOut}</span>
              </div>
            </button>
          `;
        })
        .join("");

      gridEl.querySelectorAll("[data-cohort-card]").forEach((card) => {
        card.addEventListener("click", () => {
          const k = card.getAttribute("data-cohort-card");
          this.selectScenario(k);
        });
      });
    },

    renderChart(labels, seriesWithVault, seriesBlind, seriesVaultCash) {
      const ctx = document.getElementById("modB-chart");
      if (!ctx || typeof Chart === "undefined") return;

      const fx = window.FXService;
      if (modBChartInstance) {
        modBChartInstance.destroy();
      }

      modBChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "有 3 年金庫保護總資產 (VWRA + Cash Vault)",
              data: seriesWithVault,
              borderColor: "#d4af37",
              backgroundColor: "rgba(212, 175, 55, 0.12)",
              borderWidth: 2.8,
              fill: true,
              tension: 0.22,
              pointRadius: 2,
            },
            {
              label: "無金庫盲目賣股總資產 (100% 股票硬賣)",
              data: seriesBlind,
              borderColor: "#e06c75",
              backgroundColor: "rgba(224, 108, 117, 0.05)",
              borderWidth: 2.2,
              borderDash: [6, 4],
              fill: false,
              tension: 0.22,
              pointRadius: 1.5,
            },
            {
              label: "金庫緩衝池剩餘現金 (Cash Vault 水位)",
              data: seriesVaultCash,
              borderColor: "#71717a",
              backgroundColor: "transparent",
              borderWidth: 1.5,
              borderDash: [3, 3],
              fill: false,
              tension: 0.2,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              labels: {
                color: "#a1a1aa",
                font: { size: 11.5 },
              },
            },
            tooltip: {
              backgroundColor: "#111217",
              titleColor: "#f5f5f7",
              bodyColor: "#d4d4d8",
              borderColor: "rgba(255,255,255,0.12)",
              borderWidth: 1,
              padding: 12,
              callbacks: {
                label: (context) => {
                  const valMYR = context.parsed.y || 0;
                  const valUSD = fx.myrToUsd(valMYR);
                  return `${context.dataset.label}: ${fx.formatRM(valMYR)} (≈ ${fx.formatUSD(valUSD)})`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#71717a", maxRotation: 45, font: { size: 10 } },
              grid: { color: "rgba(255, 255, 255, 0.05)" },
            },
            y: {
              ticks: {
                color: "#71717a",
                font: { size: 10.5 },
                callback: (val) => fx.formatRM(val, true),
              },
              grid: { color: "rgba(255, 255, 255, 0.06)" },
            },
          },
        },
      });
    },

    renderTable(rows) {
      const tbody = document.getElementById("modB-table-body");
      if (!tbody) return;

      const fx = window.FXService;
      tbody.innerHTML = rows
        .map((r) => {
          const retColor = r.isCrash ? "text-[#e06c75] font-semibold" : "text-[#e6c762]";
          const retPrefix = r.isCrash ? "" : "+";
          const rowBg = r.isCrash ? "bg-white/[0.02] hover:bg-white/[0.04]" : "hover:bg-white/[0.03]";
          const blindDisplay =
            r.blindBal <= 0
              ? `<span class="text-[#e06c75] font-semibold">RM 0 (已破產)</span>`
              : `<span class="text-zinc-400 font-mono-num">${fx.formatRM(r.blindBal)}</span>`;
          const eventBadge = r.eventNote
            ? `<div class="text-[10px] ${r.isCrash ? "text-[#e06c75]" : "text-[#e6c762]"}">${r.eventNote}</div>`
            : "";

          return `
            <tr class="border-b border-white/[0.06] transition-colors ${rowBg}">
              <td class="px-3 py-2.5 whitespace-nowrap font-mono-num text-zinc-200">
                <div>Y${r.yearNum} <span class="text-xs text-zinc-400">(${r.calYear})</span></div>
                ${eventBadge}
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap font-mono-num ${retColor}">
                ${retPrefix}${r.mktReturnPct}%
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${r.strategyBadgeClass}">
                  ${r.strategyTag}
                </span>
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap font-mono-num">
                <div class="text-zinc-200">${fx.formatRM(r.annualWithdrawMYR)}</div>
                <div class="text-[11px] text-zinc-500">≈ ${fx.formatUSD(fx.myrToUsd(r.annualWithdrawMYR))}</div>
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap font-mono-num">
                <div class="text-[#e6c762]">${fx.formatRM(r.monthlyWithdrawMYR)}/月</div>
                <div class="text-[11px] text-zinc-500">≈ ${fx.formatUSD(fx.myrToUsd(r.monthlyWithdrawMYR))}/月</div>
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap font-mono-num">
                <div class="text-zinc-300">${fx.formatRM(r.vwraBal)}</div>
                <div class="text-[11px] text-zinc-500">≈ ${fx.formatUSD(fx.myrToUsd(r.vwraBal), true)}</div>
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap font-mono-num">
                <div class="text-zinc-300">${fx.formatRM(r.vaultBal)}</div>
                <div class="text-[11px] text-zinc-500">≈ ${fx.formatUSD(fx.myrToUsd(r.vaultBal), true)}</div>
              </td>
              <td class="px-3 py-2.5 whitespace-nowrap font-mono-num">
                <div class="font-semibold text-[#f5f5f7]">${fx.formatRM(r.totalWithVaultMYR)} <span class="text-[11px] text-zinc-500 font-normal">(${fx.formatUSD(fx.myrToUsd(r.totalWithVaultMYR), true)})</span></div>
                <div class="text-[11px] text-zinc-500 mt-0.5">無金庫：${blindDisplay}</div>
              </td>
            </tr>
          `;
        })
        .join("");
    },
  };

  // ============================================================================
  // 4. MICRO-SIMULATORS FOR CHAPTER 04 (ESTATE TAX) & CHAPTER 05 (ALPHA ROI)
  // ============================================================================
  const MicroCalculators = {
    init() {
      const estateSlider = document.getElementById("micro-estate-usd-slider");
      if (estateSlider) {
        estateSlider.addEventListener("input", () => this.calcEstateTax());
      }

      const alphaCapSlider = document.getElementById("micro-alpha-cap-slider");
      const alphaHrsSlider = document.getElementById("micro-alpha-hrs-slider");
      if (alphaCapSlider && alphaHrsSlider) {
        alphaCapSlider.addEventListener("input", () => this.calcAlphaRoi());
        alphaHrsSlider.addEventListener("input", () => this.calcAlphaRoi());
      }

      this.calcEstateTax();
      this.calcAlphaRoi();
    },

    calcEstateTax() {
      const slider = document.getElementById("micro-estate-usd-slider");
      if (!slider || !window.FXService) return;
      const fx = window.FXService;
      const portfolioUSD = parseFloat(slider.value) || 350000;
      const portfolioMYR = fx.usdToMyr(portfolioUSD);

      // US Estate Tax for Non-Resident Aliens (NRA): $60,000 exemption, ~40% effective tax above $60k
      const taxableUSD = Math.max(0, portfolioUSD - 60000);
      const estateTaxUSD = taxableUSD * 0.40;
      const estateTaxMYR = fx.usdToMyr(estateTaxUSD);

      // Annual dividend WHT drag difference: 30% vs 15% on 2.0% dividend yield = 0.30% per year
      const annualDivLossUSD = portfolioUSD * 0.003;
      const annualDivLossMYR = fx.usdToMyr(annualDivLossUSD);

      const portValEl = document.getElementById("micro-estate-port-val");
      const vtTaxEl = document.getElementById("micro-estate-vt-tax");
      const vwraTaxEl = document.getElementById("micro-estate-vwra-tax");
      const divSaveEl = document.getElementById("micro-estate-div-save");

      if (portValEl) {
        portValEl.innerHTML = `${fx.formatUSD(portfolioUSD)} <span class="text-xs text-zinc-500">(${fx.formatRM(portfolioMYR)})</span>`;
      }
      if (vtTaxEl) {
        vtTaxEl.innerHTML =
          estateTaxUSD > 0
            ? `<span class="text-[#e06c75] font-bold">-${fx.formatRM(estateTaxMYR)}</span> <span class="text-xs text-zinc-500">(-${fx.formatUSD(estateTaxUSD)})</span>`
            : `<span class="text-zinc-300">RM 0 (未達 $60k 免稅額 / Below $60k Exemption)</span>`;
      }
      if (vwraTaxEl) {
        vwraTaxEl.innerHTML = `<span class="text-[#e6c762] font-bold">RM 0 ($0 USD · 100% 免遺產稅 / Tax Free)</span>`;
      }
      if (divSaveEl) {
        divSaveEl.innerHTML = `<span class="text-[#e6c762] font-semibold">+${fx.formatRM(annualDivLossMYR)} / 年</span> <span class="text-xs text-zinc-500">(+${fx.formatUSD(annualDivLossUSD)}/yr 複利)</span>`;
      }
    },

    calcAlphaRoi() {
      const capSlider = document.getElementById("micro-alpha-cap-slider");
      const hrsSlider = document.getElementById("micro-alpha-hrs-slider");
      if (!capSlider || !hrsSlider || !window.FXService) return;
      const fx = window.FXService;

      const capMYR = parseFloat(capSlider.value) || 250000;
      const hrsPerWeek = parseFloat(hrsSlider.value) || 10;
      const hrsPerYear = hrsPerWeek * 50; // 50 weeks/year

      // Assuming top 10% stock picker achieving +4% excess Alpha per year
      const annualAlphaGainMYR = capMYR * 0.04;
      const hourlyRoiMYR = annualAlphaGainMYR / Math.max(1, hrsPerYear);
      const hourlyRoiUSD = fx.myrToUsd(hourlyRoiMYR);

      const capValEl = document.getElementById("micro-alpha-cap-val");
      const hrsValEl = document.getElementById("micro-alpha-hrs-val");
      const outRoiEl = document.getElementById("micro-alpha-hourly-out");
      const outVerdictEl = document.getElementById("micro-alpha-verdict");

      if (capValEl) {
        capValEl.innerHTML = `${fx.formatRM(capMYR)} <span class="text-xs text-zinc-500">(${fx.formatUSD(fx.myrToUsd(capMYR), true)})</span>`;
      }
      if (hrsValEl) {
        hrsValEl.textContent = `每週 ${hrsPerWeek} 小時 (每年 ${hrsPerYear} 小時)`;
      }
      if (outRoiEl) {
        outRoiEl.innerHTML = `${fx.formatRM(hourlyRoiMYR)} / 小時 <span class="text-xs text-zinc-500">(≈ ${fx.formatUSD(hourlyRoiUSD)}/hr · 年超額 ${fx.formatRM(annualAlphaGainMYR)})</span>`;
      }
      if (outVerdictEl) {
        if (capMYR < 1500000) {
          outVerdictEl.className = "pt-2 border-t border-white/[0.08] text-xs text-zinc-400 leading-snug";
          outVerdictEl.innerHTML = `<strong class="text-[#e06c75]">負期望值區間 (Negative Expectation)：</strong>研究時薪僅 <strong class="text-[#f5f5f7]">${fx.formatRM(hourlyRoiMYR)}/hr</strong>，應 100% 買 VWRA 並專注本業 (Career Alpha)。`;
        } else {
          outVerdictEl.className = "pt-2 border-t border-white/[0.08] text-xs text-zinc-300 leading-snug";
          outVerdictEl.innerHTML = `<strong class="text-[#e6c762]">規模經濟解鎖 (Economies of Scale)：</strong>研究時薪達 <strong class="text-[#e6c762]">${fx.formatRM(hourlyRoiMYR)}/hr</strong>，鎖定金庫後可撥 ≤8%–10% (${fx.formatRM(capMYR * 0.1)}) 追 Alpha。`;
        }
      }
    },
  };

  window.LadderLocator = LadderLocator;
  window.ModuleACalculator = ModuleACalculator;
  window.ModuleBCalculator = ModuleBCalculator;
  window.MicroCalculators = MicroCalculators;
})();
