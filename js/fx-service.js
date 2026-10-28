/**
 * fx-service.js
 * Dual-Currency Real-Time Synchronization Engine (MYR <-> USD)
 * Implements 3-Tier Public No-Key FX API Fallback + 12-Hour localStorage Cache
 */

(function () {
  const CACHE_KEY = "fire_wealth_usd_myr_cache_v1";
  const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
  const DEFAULT_FX_RATE = 4.42;

  const FXService = {
    rate: DEFAULT_FX_RATE,
    mode: "live", // 'live' | 'custom' | 'fallback'
    sourceName: "預設基準",
    lastUpdated: null,

    init() {
      const inputEl = document.getElementById("fx-rate-input");
      const syncBtn = document.getElementById("fx-sync-btn");

      if (inputEl) {
        inputEl.value = this.rate.toFixed(2);
        inputEl.addEventListener("input", (e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val) && val >= 1.5 && val <= 15.0) {
            this.setCustomRate(val);
          }
        });
        inputEl.addEventListener("blur", (e) => {
          const val = parseFloat(e.target.value);
          if (isNaN(val) || val < 1.5 || val > 15.0) {
            e.target.value = this.rate.toFixed(2);
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

    loadInitialRate() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const age = Date.now() - (parsed.timestamp || 0);
          if (parsed.rate && age < CACHE_TTL_MS) {
            this.rate = parseFloat(parsed.rate);
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
        statusBadge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-sky-400 animate-ping mr-1.5"></span>同步匯率中...`;
      }

      const endpoints = [
        {
          name: "Frankfurter ECB",
          url: "https://api.frankfurter.app/latest?from=USD&to=MYR",
          parse: (data) => data && data.rates && data.rates.MYR,
        },
        {
          name: "Open ER-API",
          url: "https://open.er-api.com/v6/latest/USD",
          parse: (data) => data && data.rates && data.rates.MYR,
        },
        {
          name: "Fawazahmed0 CDN",
          url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
          parse: (data) => data && data.usd && data.usd.myr,
        },
      ];

      let fetchedRate = null;
      let usedSource = "";

      for (const ep of endpoints) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4500);
          const resp = await fetch(ep.url, { signal: controller.signal });
          clearTimeout(timer);
          if (!resp.ok) continue;
          const json = await resp.json();
          const candidate = parseFloat(ep.parse(json));
          if (!isNaN(candidate) && candidate > 2.0 && candidate < 10.0) {
            fetchedRate = candidate;
            usedSource = ep.name;
            break;
          }
        } catch (err) {
          // Proceed to next fallback endpoint
        }
      }

      if (fetchedRate !== null) {
        this.rate = fetchedRate;
        this.mode = "live";
        this.sourceName = usedSource;
        this.lastUpdated = new Date();
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              rate: this.rate,
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
        this.sourceName = "離線基準匯率";
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
      this.rate = newRate;
      this.mode = "custom";
      this.sourceName = "使用者自訂";
      this.syncUI(false);
      this.updateAllDualCurrencyNodes();
      this.notifySubscribers();
    },

    syncUI(updateInput = true) {
      const inputEl = document.getElementById("fx-rate-input");
      const statusBadge = document.getElementById("fx-status-badge");

      if (inputEl && updateInput) {
        inputEl.value = this.rate.toFixed(2);
      }

      if (statusBadge) {
        if (this.mode === "custom") {
          statusBadge.className =
            "hidden 2xl:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-[#e6c762] border border-[#d4af37]/40";
          statusBadge.textContent = "CUSTOM FX";
        } else {
          statusBadge.className =
            "hidden 2xl:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 border border-white/10";
          statusBadge.textContent = `LIVE · ${this.sourceName}`;
        }
      }

      // Also update any inline FX rate display spans
      document.querySelectorAll("[data-fx-rate-display]").forEach((el) => {
        el.textContent = this.rate.toFixed(2);
      });
    },

    myrToUsd(myrAmount) {
      return myrAmount / (this.rate || DEFAULT_FX_RATE);
    },

    usdToMyr(usdAmount) {
      return usdAmount * (this.rate || DEFAULT_FX_RATE);
    },

    formatRM(amount, compact = false) {
      if (compact) {
        if (Math.abs(amount) >= 1_000_000_000) {
          return `RM ${(amount / 1_000_000_000).toFixed(2)}B`;
        }
        if (Math.abs(amount) >= 1_000_000) {
          const m = amount / 1_000_000;
          return `RM ${m >= 100 ? Math.round(m) : m.toFixed(2)}M`;
        }
        if (Math.abs(amount) >= 10_000) {
          return `RM ${Math.round(amount / 1_000).toLocaleString()}k`;
        }
      }
      if (Math.abs(amount) > 0 && Math.abs(amount) < 20 && Math.abs(amount % 1) > 0.04) {
        return `RM ${amount.toFixed(1)}`;
      }
      return `RM ${Math.round(amount).toLocaleString("en-US")}`;
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

    /**
     * Automatically updates all DOM elements tagged with:
     * - data-myr-to-usd="<MYR number>" -> renders "$X,XXX USD"
     * - data-usd-to-myr="<USD number>" -> renders "RM X,XXX"
     * - data-usd-range-to-myr="<minUSD>,<maxUSD>" -> renders "RM X – RM Y"
     * - data-dual-myr="<MYR number>"  -> renders "RM X,XXX (≈ $Y,YYY USD)"
     * - data-dual-usd="<USD number>"  -> renders "$X,XXX USD (≈ RM Y,YYY)"
     */
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
