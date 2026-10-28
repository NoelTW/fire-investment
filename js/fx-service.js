/**
 * fx-service.js
 * Multi-Currency Real-Time Synchronization Engine (USD, MYR, TWD, SGD, HKD)
 * Implements 3-Tier Public No-Key FX API Fallback + 12-Hour localStorage Cache
 * Supports dynamic currency switching across all interactive calculators.
 */

(function () {
  const CACHE_KEY = "fire_wealth_multi_fx_cache_v2";
  const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

  // Default baseline exchange rates vs USD (1 USD = X Currency)
  const DEFAULT_RATES = {
    USD: 1.0,
    MYR: 4.42,
    TWD: 32.40,
    SGD: 1.34,
    HKD: 7.78,
  };

  const CURRENCY_META = {
    MYR: {
      code: "MYR",
      symbol: "RM",
      name: "馬幣 (MYR)",
      flag: "🇲🇾",
      step: 5000,
      salStep: 500,
      nwDefault: 180000,
      salDefault: 6500,
      sliderMax: 6000000,
      salSliderMax: 40000,
    },
    TWD: {
      code: "TWD",
      symbol: "NT$",
      name: "新台幣 (TWD)",
      flag: "🇹🇼",
      step: 50000,
      salStep: 3000,
      nwDefault: 1320000,
      salDefault: 48000,
      sliderMax: 45000000,
      salSliderMax: 300000,
    },
    USD: {
      code: "USD",
      symbol: "$",
      name: "美元 (USD)",
      flag: "🇺🇸",
      step: 1000,
      salStep: 200,
      nwDefault: 40724,
      salDefault: 1470,
      sliderMax: 1500000,
      salSliderMax: 10000,
    },
    SGD: {
      code: "SGD",
      symbol: "S$",
      name: "新幣 (SGD)",
      flag: "🇸🇬",
      step: 2000,
      salStep: 300,
      nwDefault: 54600,
      salDefault: 1970,
      sliderMax: 2000000,
      salSliderMax: 15000,
    },
    HKD: {
      code: "HKD",
      symbol: "HK$",
      name: "港幣 (HKD)",
      flag: "🇭🇰",
      step: 10000,
      salStep: 1500,
      nwDefault: 317000,
      salDefault: 11400,
      sliderMax: 12000000,
      salSliderMax: 80000,
    },
  };

  const FXService = {
    currentCurrency: "MYR", // Active input currency: 'MYR' | 'TWD' | 'USD' | 'SGD' | 'HKD'
    rates: { ...DEFAULT_RATES },
    rate: DEFAULT_RATES.MYR, // Backwards compatibility: rate of currentCurrency vs USD
    mode: "live", // 'live' | 'custom' | 'fallback'
    sourceName: "預設基準",
    lastUpdated: null,
    meta: CURRENCY_META,

    init() {
      const inputEl = document.getElementById("fx-rate-input");
      const syncBtn = document.getElementById("fx-sync-btn");
      const curSelect = document.getElementById("header-cur-select");

      // Bind Currency Select in Header
      if (curSelect) {
        curSelect.value = this.currentCurrency;
        curSelect.addEventListener("change", (e) => {
          this.setCurrency(e.target.value);
        });
      }

      // Bind Rate Input
      if (inputEl) {
        inputEl.value = this.getRate(this.currentCurrency).toFixed(2);
        inputEl.addEventListener("input", (e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val) && val >= 0.5 && val <= 100.0) {
            this.setCustomRate(val);
          }
        });
        inputEl.addEventListener("blur", (e) => {
          const val = parseFloat(e.target.value);
          const current = this.getRate(this.currentCurrency);
          if (isNaN(val) || val < 0.5 || val > 100.0) {
            e.target.value = current.toFixed(2);
          } else {
            e.target.value = val.toFixed(2);
          }
        });
      }

      if (syncBtn) {
        syncBtn.addEventListener("click", () => {
          this.fetchLiveRate(true);
        });
      }

      // Load cached or live FX rate
      this.loadInitialRate();
    },

    getRate(cur = this.currentCurrency) {
      return this.rates[cur] || DEFAULT_RATES[cur] || 1.0;
    },

    setCurrency(cur) {
      if (!CURRENCY_META[cur]) return;
      this.currentCurrency = cur;
      this.rate = this.getRate(cur);

      // Sync header currency dropdown
      const curSelect = document.getElementById("header-cur-select");
      if (curSelect && curSelect.value !== cur) {
        curSelect.value = cur;
      }

      // Sync locator currency select
      const locatorCurSelect = document.getElementById("locator-currency-select");
      if (locatorCurSelect && locatorCurSelect.value !== cur) {
        locatorCurSelect.value = cur;
      }

      this.syncUI();
      this.notifySubscribers();
    },

    loadInitialRate() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const age = Date.now() - (parsed.timestamp || 0);
          if (parsed.rates && age < CACHE_TTL_MS) {
            this.rates = { ...DEFAULT_RATES, ...parsed.rates };
            this.rate = this.getRate(this.currentCurrency);
            this.mode = "live";
            this.sourceName = parsed.source || "Fast Cache";
            this.lastUpdated = new Date(parsed.timestamp);
            this.syncUI();
            this.updateAllDualCurrencyNodes();
            this.notifySubscribers();
            return;
          }
        }
      } catch (err) {
        console.warn("FX cache read error:", err);
      }
      this.fetchLiveRate(false);
    },

    async fetchLiveRate(forceRefresh = false) {
      const syncBtn = document.getElementById("fx-sync-btn");
      const statusBadge = document.getElementById("fx-status-badge");

      if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.classList.add("opacity-60");
      }
      if (statusBadge) {
        statusBadge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-sky-400 animate-ping mr-1"></span>同步中...`;
      }

      const endpoints = [
        {
          name: "Open ER-API",
          url: "https://open.er-api.com/v6/latest/USD",
          parse: (data) => {
            if (data && data.rates) {
              return {
                MYR: parseFloat(data.rates.MYR),
                TWD: parseFloat(data.rates.TWD),
                SGD: parseFloat(data.rates.SGD),
                HKD: parseFloat(data.rates.HKD),
                USD: 1.0,
              };
            }
            return null;
          },
        },
        {
          name: "Frankfurter ECB",
          url: "https://api.frankfurter.app/latest?from=USD&to=MYR,SGD,HKD",
          parse: (data) => {
            if (data && data.rates) {
              return {
                MYR: parseFloat(data.rates.MYR),
                TWD: 32.40, // ECB does not always quote TWD
                SGD: parseFloat(data.rates.SGD),
                HKD: parseFloat(data.rates.HKD),
                USD: 1.0,
              };
            }
            return null;
          },
        },
        {
          name: "Fawazahmed0 CDN",
          url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
          parse: (data) => {
            if (data && data.usd) {
              return {
                MYR: parseFloat(data.usd.myr),
                TWD: parseFloat(data.usd.twd),
                SGD: parseFloat(data.usd.sgd),
                HKD: parseFloat(data.usd.hkd),
                USD: 1.0,
              };
            }
            return null;
          },
        },
      ];

      let fetchedRates = null;
      let usedSource = "";

      for (const ep of endpoints) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4500);
          const resp = await fetch(ep.url, { signal: controller.signal });
          clearTimeout(timer);
          if (!resp.ok) continue;
          const json = await resp.json();
          const parsed = ep.parse(json);
          if (parsed && parsed.MYR > 2.0 && parsed.MYR < 10.0) {
            fetchedRates = parsed;
            usedSource = ep.name;
            break;
          }
        } catch (err) {
          // Proceed to next fallback endpoint
        }
      }

      if (fetchedRates !== null) {
        this.rates = { ...DEFAULT_RATES, ...fetchedRates };
        this.rate = this.getRate(this.currentCurrency);
        this.mode = "live";
        this.sourceName = usedSource;
        this.lastUpdated = new Date();
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              rates: this.rates,
              source: this.sourceName,
              timestamp: Date.now(),
            })
          );
        } catch (e) {
          // Ignore storage quota errors
        }
      } else {
        // Offline / Sandbox fallback
        this.mode = "live";
        this.sourceName = "預設基準";
      }

      if (syncBtn) {
        syncBtn.disabled = false;
        syncBtn.classList.remove("opacity-60");
      }

      this.syncUI();
      this.updateAllDualCurrencyNodes();
      this.notifySubscribers();
    },

    setCustomRate(newRate) {
      this.rates[this.currentCurrency] = newRate;
      this.rate = newRate;
      this.mode = "custom";
      this.sourceName = "自訂匯率";
      this.syncUI(false);
      this.updateAllDualCurrencyNodes();
      this.notifySubscribers();
    },

    syncUI(updateInput = true) {
      const inputEl = document.getElementById("fx-rate-input");
      const statusBadge = document.getElementById("fx-status-badge");
      const rateLabel = document.getElementById("fx-rate-pair-label");

      const activeRate = this.getRate(this.currentCurrency);

      if (inputEl && updateInput) {
        inputEl.value = activeRate.toFixed(2);
      }

      if (rateLabel) {
        rateLabel.textContent = `USD/${this.currentCurrency}`;
      }

      if (statusBadge) {
        if (this.mode === "custom") {
          statusBadge.className =
            "hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#e6c762] border border-[#d4af37]/40";
          statusBadge.textContent = "CUSTOM";
        } else {
          statusBadge.className =
            "hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 border border-white/10";
          statusBadge.textContent = `LIVE · ${this.sourceName}`;
        }
      }

      // Also update any inline FX rate display spans
      document.querySelectorAll("[data-fx-rate-display]").forEach((el) => {
        el.textContent = (this.rates.MYR || DEFAULT_RATES.MYR).toFixed(2);
      });
    },

    // Convert amount from one currency to another
    convert(amount, fromCur = "MYR", toCur = "USD") {
      const fromRate = this.rates[fromCur] || DEFAULT_RATES[fromCur] || 1.0;
      const toRate = this.rates[toCur] || DEFAULT_RATES[toCur] || 1.0;
      const amountUSD = amount / fromRate;
      return amountUSD * toRate;
    },

    toUSD(amount, fromCur = this.currentCurrency) {
      return this.convert(amount, fromCur, "USD");
    },

    fromUSD(usdAmount, toCur = this.currentCurrency) {
      return this.convert(usdAmount, "USD", toCur);
    },

    // Format currency amount with symbol
    formatCurrency(amount, cur = this.currentCurrency, compact = false) {
      const meta = CURRENCY_META[cur] || CURRENCY_META.MYR;
      const sym = meta.symbol;

      if (compact) {
        if (Math.abs(amount) >= 1_000_000_000) {
          return `${sym} ${(amount / 1_000_000_000).toFixed(2)}B`;
        }
        if (Math.abs(amount) >= 1_000_000) {
          const m = amount / 1_000_000;
          return `${sym} ${m >= 100 ? Math.round(m) : m.toFixed(2)}M`;
        }
        if (Math.abs(amount) >= 10_000) {
          return `${sym} ${Math.round(amount / 1_000).toLocaleString()}k`;
        }
      }
      if (Math.abs(amount) > 0 && Math.abs(amount) < 20 && Math.abs(amount % 1) > 0.04) {
        return `${sym} ${amount.toFixed(1)}`;
      }
      return `${sym} ${Math.round(amount).toLocaleString("en-US")}`;
    },

    // Backwards compatibility helpers
    myrToUsd(myrAmount) {
      return myrAmount / (this.rates.MYR || DEFAULT_RATES.MYR);
    },

    usdToMyr(usdAmount) {
      return usdAmount * (this.rates.MYR || DEFAULT_RATES.MYR);
    },

    formatRM(amount, compact = false) {
      return this.formatCurrency(amount, "MYR", compact);
    },

    formatUSD(amount, compact = false) {
      if (compact) {
        if (Math.abs(amount) >= 1_000_000_000) {
          return `$${(amount / 1_000_000_000).toFixed(2)}B USD`;
        }
        if (Math.abs(amount) >= 1_000_000) {
          const m = amount / 1_000_000;
          return `$${m >= 100 ? Math.round(m) : m.toFixed(2)}M USD`;
        }
        if (Math.abs(amount) >= 10_000) {
          return `$${Math.round(amount / 1_000).toLocaleString()}k USD`;
        }
      }
      if (Math.abs(amount) > 0 && Math.abs(amount) < 20 && Math.abs(amount % 1) > 0.04) {
        return `$${amount.toFixed(1)} USD`;
      }
      return `$${Math.round(amount).toLocaleString("en-US")} USD`;
    },

    updateAllDualCurrencyNodes() {
      document.querySelectorAll("[data-myr-to-usd]").forEach((el) => {
        const myr = parseFloat(el.getAttribute("data-myr-to-usd"));
        const compact = el.getAttribute("data-compact") === "true";
        const prefix = el.getAttribute("data-prefix") ?? "≈ ";
        if (!isNaN(myr)) {
          const usd = this.myrToUsd(myr);
          el.textContent = `${prefix}${this.formatUSD(usd, compact)}`;
        }
      });

      document.querySelectorAll("[data-usd-to-myr]").forEach((el) => {
        const usd = parseFloat(el.getAttribute("data-usd-to-myr"));
        const compact = el.getAttribute("data-compact") === "true";
        const prefix = el.getAttribute("data-prefix") ?? "≈ ";
        const suffix = el.getAttribute("data-suffix") ?? "";
        if (!isNaN(usd)) {
          const myr = this.usdToMyr(usd);
          el.textContent = `${prefix}${this.formatRM(myr, compact)}${suffix}`;
        }
      });

      document.querySelectorAll("[data-usd-range-to-myr]").forEach((el) => {
        const raw = el.getAttribute("data-usd-range-to-myr") || "";
        const parts = raw.split(",").map((s) => parseFloat(s.trim()));
        const compact = el.getAttribute("data-compact") === "true";
        const prefix = el.getAttribute("data-prefix") ?? "≈ ";
        const suffix = el.getAttribute("data-suffix") ?? "";
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const m1 = this.usdToMyr(parts[0]);
          const m2 = this.usdToMyr(parts[1]);
          el.textContent = `${prefix}${this.formatRM(m1, compact)} – ${this.formatRM(m2, compact)}${suffix}`;
        }
      });

      document.querySelectorAll("[data-dual-myr]").forEach((el) => {
        const myr = parseFloat(el.getAttribute("data-dual-myr"));
        const compact = el.getAttribute("data-compact") === "true";
        if (!isNaN(myr)) {
          const usd = this.myrToUsd(myr);
          el.innerHTML = `<span class="font-semibold text-[#f5f5f7] font-mono-num">${this.formatRM(myr, compact)}</span> <span class="text-zinc-500 text-xs font-mono-num">(${this.formatUSD(usd, compact)})</span>`;
        }
      });

      document.querySelectorAll("[data-dual-usd]").forEach((el) => {
        const usd = parseFloat(el.getAttribute("data-dual-usd"));
        const compact = el.getAttribute("data-compact") === "true";
        if (!isNaN(usd)) {
          const myr = this.usdToMyr(usd);
          el.innerHTML = `<span class="font-semibold text-[#f5f5f7] font-mono-num">${this.formatUSD(usd, compact)}</span> <span class="text-zinc-500 text-xs font-mono-num">(${this.formatRM(myr, compact)})</span>`;
        }
      });
    },

    notifySubscribers() {
      window.dispatchEvent(
        new CustomEvent("fx:updated", {
          detail: {
            currency: this.currentCurrency,
            rates: this.rates,
            rate: this.rate,
            mode: this.mode,
            source: this.sourceName,
          },
        })
      );
    },
  };

  window.FXService = FXService;
})();
