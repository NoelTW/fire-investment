/**
 * app.js
 * Flagship One-Page Scrollytelling & Interactive Presentation Controller:
 * - Default One-Page Scrollytelling Architecture (with optional Spotlight Mode toggle)
 * - Top Reading Progress Bar (#scroll-progress-bar) & IntersectionObserver Active Chapter Spy
 * - Right-Edge Floating TOC Rail (#floating-toc)
 * - Chapter 03 Dual-Chart Switcher (Chart 01 vs Chart 03)
 * - High-Resolution 300 DPI Chart Lightbox Modal
 * - Global FX Update Listener & Keyboard Shortcuts
 */

(function () {
  const AppController = {
    currentSlide: 1,
    totalSlides: 9,
    onePageMode: true, // Default: Flagship One-Page Scrollytelling Mode

    init() {
      document.body.classList.add("one-page-mode");
      document.body.classList.remove("spotlight-mode");

      // Initialize top nav pills & floating TOC dots
      document.querySelectorAll("[data-slide-target]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = parseInt(btn.getAttribute("data-slide-target"), 10);
          if (!isNaN(target)) {
            this.goToSlide(target, true);
          }
        });
      });

      // Prev / Next Footer Buttons
      const prevBtn = document.getElementById("btn-prev-slide");
      const nextBtn = document.getElementById("btn-next-slide");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (this.currentSlide > 1) this.goToSlide(this.currentSlide - 1, true);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (this.currentSlide < this.totalSlides) this.goToSlide(this.currentSlide + 1, true);
        });
      }

      // Mode Toggle Button (One-Page Scrollytelling vs Spotlight Mode)
      document.querySelectorAll("[data-toggle-mode]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.toggleViewAll();
        });
      });

      // Slide 3 Dual Chart Switcher (Chart 01 vs Chart 03)
      document.querySelectorAll("[data-slide3-chart]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-slide3-chart");
          this.switchSlide3Chart(key);
        });
      });

      // Lightbox Modal for 300-DPI Python Charts
      this.initLightbox();

      // Mobile QR Code Modal
      this.initQrModal();

      // Scroll Progress Bar & Active Section ScrollSpy
      this.initScrollSpy();

      // Keyboard navigation (Left/Right arrows when in Spotlight mode)
      window.addEventListener("keydown", (e) => {
        const tag = (e.target && e.target.tagName) || "";
        if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
        const modal = document.getElementById("chart-lightbox-modal");
        const qrModal = document.getElementById("site-qr-modal");
        if (modal && !modal.classList.contains("hidden")) {
          if (e.key === "Escape") this.closeLightbox();
          return;
        }
        if (qrModal && !qrModal.classList.contains("hidden")) {
          if (e.key === "Escape") this.closeQrModal();
          return;
        }
        if (!this.onePageMode) {
          if (e.key === "ArrowRight" && this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1, true);
          } else if (e.key === "ArrowLeft" && this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1, true);
          }
        }
      });

      // Listen for FX rate updates and refresh all interactive calculators
      window.addEventListener("fx:updated", () => {
        if (window.LadderLocator) window.LadderLocator.calculate();
        if (window.ModuleACalculator) window.ModuleACalculator.onFxUpdated();
        if (window.ModuleBCalculator) window.ModuleBCalculator.onFxUpdated();
        if (window.MicroCalculators) {
          window.MicroCalculators.calcEstateTax();
          window.MicroCalculators.calcAlphaRoi();
        }
      });

      // Initialize Services & Calculators
      if (window.FXService) window.FXService.init();
      if (window.LadderLocator) window.LadderLocator.init();
      if (window.ModuleACalculator) window.ModuleACalculator.init();
      if (window.ModuleBCalculator) window.ModuleBCalculator.init();
      if (window.MicroCalculators) window.MicroCalculators.init();

      // Render Lucide Icons if available
      if (typeof lucide !== "undefined" && lucide.createIcons) {
        lucide.createIcons();
      }

      this.syncActiveNavUI(1);
    },

    initScrollSpy() {
      const progressBar = document.getElementById("scroll-progress-bar");

      const onScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
        if (progressBar) {
          progressBar.style.width = `${pct.toFixed(1)}%`;
        }

        if (!this.onePageMode) return;

        // Determine which section is currently in the upper-middle viewport
        const triggerY = window.innerHeight * 0.34;
        let activeNum = 1;
        document.querySelectorAll(".slide-panel").forEach((panel) => {
          const rect = panel.getBoundingClientRect();
          const num = parseInt(panel.getAttribute("data-slide-num"), 10);
          if (rect.top <= triggerY) {
            activeNum = num;
          }
        });
        if (activeNum !== this.currentSlide) {
          this.currentSlide = activeNum;
          this.syncActiveNavUI(activeNum);
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    },

    syncActiveNavUI(slideNum) {
      this.currentSlide = Math.max(1, Math.min(this.totalSlides, slideNum));

      // Update Header Tab Buttons & Floating TOC Dots
      document.querySelectorAll("[data-slide-target]").forEach((btn) => {
        const num = parseInt(btn.getAttribute("data-slide-target"), 10);
        if (num === this.currentSlide) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      // Update Slide Panels (for Spotlight Mode)
      document.querySelectorAll(".slide-panel").forEach((panel) => {
        const num = parseInt(panel.getAttribute("data-slide-num"), 10);
        if (this.onePageMode || num === this.currentSlide) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });

      // Update Progress Counter & Mode Toggle Button labels
      const counterEl = document.getElementById("slide-progress-text");
      if (counterEl) {
        counterEl.textContent = this.onePageMode
          ? `SCROLLYTELLING EDITION · CHAPTER 0${this.currentSlide} / 0${this.totalSlides}`
          : `DECK EDITION · CHAPTER 0${this.currentSlide} / 0${this.totalSlides}`;
      }

      document.querySelectorAll("[data-toggle-mode]").forEach((btn) => {
        btn.textContent = this.onePageMode ? "切換簡報模式" : "切換長卷模式";
      });
    },

    goToSlide(slideNum, scroll = true) {
      const targetNum = Math.max(1, Math.min(this.totalSlides, slideNum));
      this.syncActiveNavUI(targetNum);

      // Ensure Chart.js canvases are properly sized
      if (targetNum === 8 && window.ModuleACalculator) {
        setTimeout(() => window.ModuleACalculator.calculate(), 40);
      }
      if (targetNum === 9 && window.ModuleBCalculator) {
        setTimeout(() => window.ModuleBCalculator.calculate(), 40);
      }

      if (scroll) {
        if (this.onePageMode) {
          const targetEl = document.getElementById(`slide-${targetNum}`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    },

    toggleViewAll() {
      this.onePageMode = !this.onePageMode;
      document.body.classList.toggle("one-page-mode", this.onePageMode);
      document.body.classList.toggle("spotlight-mode", !this.onePageMode);
      this.syncActiveNavUI(this.currentSlide);

      setTimeout(() => {
        if (window.ModuleACalculator) window.ModuleACalculator.calculate();
        if (window.ModuleBCalculator) window.ModuleBCalculator.calculate();
      }, 60);

      if (this.onePageMode) {
        const targetEl = document.getElementById(`slide-${this.currentSlide}`);
        if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },

    switchSlide3Chart(chartKey) {
      document.querySelectorAll("[data-slide3-chart]").forEach((btn) => {
        const active = btn.getAttribute("data-slide3-chart") === chartKey;
        btn.className = active
          ? "px-3 py-1.5 rounded text-xs font-semibold bg-[#d4af37]/15 text-[#e6c762] border border-[#d4af37]/50 transition-all cursor-pointer"
          : "px-3 py-1.5 rounded text-xs font-medium bg-white/[0.03] text-zinc-400 border border-white/10 hover:text-white transition-all cursor-pointer";
      });

      const panel1 = document.getElementById("slide3-chart-panel-01");
      const panel3 = document.getElementById("slide3-chart-panel-03");
      if (!panel1 || !panel3) return;

      if (chartKey === "01") {
        panel1.classList.remove("hidden");
        panel3.classList.add("hidden");
      } else if (chartKey === "03") {
        panel1.classList.add("hidden");
        panel3.classList.remove("hidden");
      } else {
        panel1.classList.remove("hidden");
        panel3.classList.remove("hidden");
      }
    },

    initLightbox() {
      const modal = document.getElementById("chart-lightbox-modal");
      const modalImg = document.getElementById("chart-lightbox-img");
      const modalCap = document.getElementById("chart-lightbox-caption");
      const closeBtn = document.getElementById("chart-lightbox-close");

      if (!modal || !modalImg) return;

      document.querySelectorAll("[data-zoom-chart], [data-chart-expand]").forEach((frame) => {
        frame.addEventListener("click", () => {
          const img = frame.querySelector("img");
          const caption = frame.getAttribute("data-zoom-caption") || frame.getAttribute("title") || "";
          const imgSrc = frame.getAttribute("data-chart-expand") || (img ? img.getAttribute("src") : "");
          if (imgSrc) {
            modalImg.src = imgSrc;
            if (modalCap) modalCap.textContent = caption;
            modal.classList.remove("hidden");
            modal.classList.add("flex");
          }
        });
      });

      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeLightbox());
      }
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.closeLightbox();
      });
    },

    closeLightbox() {
      const modal = document.getElementById("chart-lightbox-modal");
      if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
    },

    initQrModal() {
      const qrModal = document.getElementById("site-qr-modal");
      const qrImg = document.getElementById("site-qr-img");
      const openBtn = document.getElementById("btn-open-qr-modal");
      const closeBtn = document.getElementById("site-qr-close");
      const styleBtn = document.getElementById("qr-toggle-style-btn");
      const copyBtn = document.getElementById("qr-copy-url-btn");

      if (!qrModal) return;

      const openModal = () => {
        qrModal.classList.remove("hidden");
        qrModal.classList.add("flex");
      };

      if (openBtn) openBtn.addEventListener("click", openModal);
      document.querySelectorAll("[data-trigger-qr]").forEach((el) => {
        el.addEventListener("click", openModal);
      });

      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.closeQrModal());
      }
      qrModal.addEventListener("click", (e) => {
        if (e.target === qrModal) this.closeQrModal();
      });

      // Toggle between Gold and Classic High-Contrast QR Code
      let isGold = true;
      if (styleBtn && qrImg) {
        styleBtn.addEventListener("click", () => {
          isGold = !isGold;
          qrImg.src = isGold
            ? "assets/qr/fire_investment_qr_gold.png"
            : "assets/qr/fire_investment_qr_classic.png";
          styleBtn.textContent = isGold ? "切換黑白版" : "切換金色版";
        });
      }

      // Copy URL button with feedback
      if (copyBtn) {
        copyBtn.addEventListener("click", async () => {
          const url = "https://noeltw.github.io/fire-investment/";
          try {
            await navigator.clipboard.writeText(url);
            copyBtn.textContent = "✓ 網址已複製！";
            copyBtn.classList.add("bg-emerald-500", "text-black");
            setTimeout(() => {
              copyBtn.textContent = "複製網址";
              copyBtn.classList.remove("bg-emerald-500", "text-black");
            }, 2000);
          } catch (err) {
            copyBtn.textContent = "請手動複製";
          }
        });
      }
    },

    closeQrModal() {
      const qrModal = document.getElementById("site-qr-modal");
      if (qrModal) {
        qrModal.classList.add("hidden");
        qrModal.classList.remove("flex");
      }
    },
  };

  window.AppController = AppController;
  document.addEventListener("DOMContentLoaded", () => {
    AppController.init();
  });
})();
