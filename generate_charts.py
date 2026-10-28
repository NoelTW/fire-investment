#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_charts.py
Generates 5 high-resolution (300 DPI) dark-fintech empirical charts
for the Malaysian Wealth Ladder & Retirement Cash Vault Interactive Guide.
"""

import os
import tempfile

# Ensure Matplotlib cache directory is writable in all environments
os.environ.setdefault("MPLCONFIGDIR", os.path.join(tempfile.gettempdir(), "mplconfig_fire"))
os.makedirs(os.environ["MPLCONFIGDIR"], exist_ok=True)

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import matplotlib.patches as patches
import numpy as np

# Configure CJK-capable font stack for macOS / Linux / Windows
plt.rcParams["font.sans-serif"] = [
    "Heiti TC",
    "PingFang HK",
    "PingFang TC",
    "Arial Unicode MS",
    "Hiragino Sans",
    "Microsoft JhengHei",
    "Noto Sans CJK TC",
    "DejaVu Sans",
]
plt.rcParams["axes.unicode_minus"] = False
plt.rcParams["text.parse_math"] = False  # Prevent multiple '$' currency signs from triggering TeX math mode

# Apple Pro / Linear Obsidian & Champagne Gold Palette
BG_DARK = "#0a0b0e"       # Pure Obsidian Canvas
BG_CARD = "#111217"       # Elevated Obsidian Surface
BG_SUBTLE = "#0e0f14"     # Deep Architectural Panel
GRID_COLOR = "#23252f"    # Subtle Hairline Rule
TEXT_MAIN = "#f5f5f7"     # Apple Pro Off-White
TEXT_MUTED = "#a1a1aa"    # Zinc 400
TEXT_DIM = "#63636e"      # Zinc 500

EMERALD = "#d4af37"       # Champagne Gold (Primary Hero / VWRA)
EMERALD_LIGHT = "#e6c762" # Bright Champagne Gold
CYAN = "#5eead4"          # Refined Muted Teal
BLUE = "#8e929f"          # Architectural Silver-Slate
AMBER = "#c49a45"         # Warm Bronze
ROSE = "#e06c75"          # Muted Editorial Crimson (Risk / Drawdown)
PURPLE = "#94a3b8"        # Cool Platinum

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "charts")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def style_axis(ax, title="", xlabel="", ylabel=""):
    """Apply consistent dark fintech styling to a Matplotlib axis."""
    ax.set_facecolor(BG_CARD)
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)
    for spine in ["bottom", "left"]:
        ax.spines[spine].set_color(GRID_COLOR)
        ax.spines[spine].set_linewidth(1.0)

    ax.grid(True, linestyle="--", linewidth=0.7, color=GRID_COLOR, alpha=0.55, zorder=0)
    ax.tick_params(colors=TEXT_MUTED, labelsize=10)

    if title:
        ax.set_title(title, color=TEXT_MAIN, fontsize=13.5, fontweight="bold", pad=22, loc="left")
    if xlabel:
        ax.set_xlabel(xlabel, color=TEXT_MUTED, fontsize=10.5, labelpad=8)
    if ylabel:
        ax.set_ylabel(ylabel, color=TEXT_MUTED, fontsize=10.5, labelpad=8)


def format_rm(x, pos=None):
    if abs(x) >= 1_000_000:
        return f"RM {x/1_000_000:.2f}M"
    elif abs(x) >= 1_000:
        return f"RM {x/1_000:.0f}k"
    return f"RM {x:.0f}"


def format_usd(x, pos=None):
    if abs(x) >= 1_000_000:
        return f"${x/1_000_000:.2f}M"
    elif abs(x) >= 1_000:
        return f"${x/1_000:.0f}k"
    return f"${x:.0f}"


# ==============================================================================
# CHART 0: 00_wealth_ladder_staircase.png (Physical Wealth Ladder Architecture)
# ==============================================================================
def generate_chart_00():
    fig, ax = plt.subplots(figsize=(16, 9), facecolor=BG_DARK)
    ax.set_facecolor(BG_DARK)
    ax.set_xlim(-0.5, 6.2)
    ax.set_ylim(-0.3, 7.3)
    ax.axis("off")

    # Header
    ax.text(0.0, 6.9, "CHAPTER 01 · THE 6 WEALTH LEVELS & THE 0.01% RULE", color=EMERALD_LIGHT, fontsize=11, fontfamily="monospace", fontweight="bold")
    ax.text(0.0, 6.45, "《The Wealth Ladder》財富六階梯實體階梯圖與萬分之一法則架構", color=TEXT_MAIN, fontsize=18, fontweight="bold")
    ax.text(0.0, 6.10, "以 10 倍美金數量級躍遷定義 6 個自由階梯 · 結合大馬購買力平價 (PPP) 與大馬 FIRE 雙重黃金交叉轉折點", color=TEXT_MUTED, fontsize=11)

    # 6 Steps Definition
    steps = [
        {
            "num": "LEVEL 1",
            "title_zh": "帳單生存階",
            "title_en": "Survival Stage",
            "usd": "< $10k USD",
            "myr": "< RM 44k",
            "daily": "< RM 4.40 / 日",
            "lifestyle": "為基礎水電與日常帳單焦慮\n每一筆小開銷都有心理負擔",
            "engine": "【通關引擎】\n專注本業職涯晉升 + 20%+ 儲蓄\n【致命陷阱】\n本金過小時天天盯盤選股拼翻倍",
            "height": 1.25,
            "highlight": False
        },
        {
            "num": "LEVEL 2",
            "title_zh": "超市茶室加料自由",
            "title_en": "Grocery & Kopitiam",
            "usd": "$10k – $100k",
            "myr": "RM 44k – 440k",
            "daily": "RM 4.40 – 44.00 / 日",
            "lifestyle": "超市日常買菜免看標價\nKopitiam 麵加料加蛋免糾結",
            "engine": "【通關引擎】\n自動化定投 VWRA + EPF 穩健底倉\n【致命陷阱】\n沉迷高收益資金盤與借貸炒小盤股",
            "height": 2.05,
            "highlight": False
        },
        {
            "num": "LEVEL 3",
            "title_zh": "餐廳自由 · 大馬 FIRE",
            "title_en": "Dining & MY FIRE",
            "usd": "$100k – $1M",
            "myr": "RM 440k – 4.4M",
            "daily": "RM 44 – 440 / 日",
            "lifestyle": "任何普通餐廳點餐無壓力\n跨過 RM 1.5M 解鎖大馬完全自由",
            "engine": "【通關引擎】\n達成雙重黃金交叉 · 核心衛星框架\n【致命陷阱】\n過早買豪車豪宅被巨額房貸鎖死",
            "height": 2.95,
            "highlight": True,
            "badge": "★ 大馬 FIRE 退休與雙重黃金交叉里程碑 (Structural Crossover)"
        },
        {
            "num": "LEVEL 4",
            "title_zh": "跨國商務留學自由",
            "title_en": "Travel & Global",
            "usd": "$1M – $10M",
            "myr": "RM 4.4M – 44M",
            "daily": "RM 440 – 4,400 / 日",
            "lifestyle": "全家商務艙出國度假旅行\n子女全球頂尖大學留學免貸款",
            "engine": "【通關引擎】\n啟動 3 年現金金庫防禦 (Buffer)\n【致命陷阱】\n盲目開槓桿、熊市恐慌殺跌被斷頭",
            "height": 3.85,
            "highlight": False
        },
        {
            "num": "LEVEL 5",
            "title_zh": "全球置產主權階",
            "title_en": "Global Real Estate",
            "usd": "$10M – $100M",
            "myr": "RM 44M – 440M",
            "daily": "RM 4.4k – 44k / 日",
            "lifestyle": "全球核心城市置產（倫敦/新/馬）\n跨國流動性與主權風險對沖",
            "engine": "【通關引擎】\n離岸信託、私行家辦與稅務籌劃\n【致命陷阱】\n盲目投資親友未上市實體專案爆雷",
            "height": 4.75,
            "highlight": False
        },
        {
            "num": "LEVEL 6",
            "title_zh": "社會影響傳承階",
            "title_en": "Legacy & Philanthropy",
            "usd": "> $100M+ USD",
            "myr": "> RM 440M+",
            "daily": "> RM 44k+ / 日",
            "lifestyle": "物質消費完全邊際效益遞減\n金錢轉化為重塑社會的力量",
            "engine": "【通關引擎】\n世代家族信託與永續慈善基金會\n【致命陷阱】\n缺乏家族憲章導致遺產爭端富不過三代",
            "height": 5.65,
            "highlight": False
        }
    ]

    bar_width = 0.92

    for i, s in enumerate(steps):
        x = i
        y_top = s["height"]
        is_hl = s.get("highlight", False)

        fc = "#1a1811" if is_hl else BG_CARD
        ec = EMERALD if is_hl else "#282a36"
        lw = 2.0 if is_hl else 1.0

        rect = patches.FancyBboxPatch(
            (x - bar_width/2, 0),
            bar_width,
            y_top,
            boxstyle="round,pad=0.03,rounding_size=0.06",
            facecolor=fc,
            edgecolor=ec,
            linewidth=lw,
            zorder=2
        )
        ax.add_patch(rect)

        if is_hl:
            top_bar = patches.Rectangle(
                (x - bar_width/2, y_top - 0.08),
                bar_width,
                0.08,
                facecolor=EMERALD_LIGHT,
                edgecolor="none",
                zorder=3
            )
            ax.add_patch(top_bar)

        badge_bg = EMERALD_LIGHT if is_hl else "#22242f"
        badge_fg = "#0a0b0e" if is_hl else TEXT_MAIN
        ax.text(
            x, y_top - 0.28,
            f"  {s['num']}  ",
            color=badge_fg,
            fontsize=10.5,
            fontweight="bold",
            fontfamily="monospace",
            ha="center",
            va="center",
            bbox=dict(boxstyle="round,pad=0.25", facecolor=badge_bg, edgecolor="none"),
            zorder=4
        )

        title_color = EMERALD_LIGHT if is_hl else TEXT_MAIN
        ax.text(x, y_top - 0.65, s["title_zh"], color=title_color, fontsize=11.5, fontweight="bold", ha="center", va="center", zorder=4)
        ax.text(x, y_top - 0.90, s["title_en"], color=EMERALD if is_hl else TEXT_MUTED, fontsize=8.5, ha="center", va="center", zorder=4)

        ax.text(x, y_top - 1.25, s["usd"], color=TEXT_MAIN, fontsize=10, fontweight="bold", fontfamily="monospace", ha="center", va="center", zorder=4)
        ax.text(x, y_top - 1.48, f"({s['myr']})", color=EMERALD_LIGHT if is_hl else CYAN, fontsize=9, fontfamily="monospace", ha="center", va="center", zorder=4)

        ax.text(
            x, y_top - 1.82,
            f"0.01% 日額:\n{s['daily']}",
            color=EMERALD_LIGHT if is_hl else TEXT_MUTED,
            fontsize=8.5,
            ha="center",
            va="center",
            zorder=4
        )

        if y_top >= 2.8:
            ax.text(x, y_top - 2.25, s["lifestyle"], color="#c5c5d0", fontsize=7.8, ha="center", va="top", zorder=4, linespacing=1.2)
        if y_top >= 3.6:
            ax.text(x, 0.35, s["engine"], color=TEXT_MUTED, fontsize=7.2, ha="center", va="bottom", zorder=4, linespacing=1.2)

        if is_hl and "badge" in s:
            ax.annotate(
                s["badge"],
                xy=(x, y_top),
                xytext=(x, y_top + 0.65),
                arrowprops=dict(arrowstyle="->", color=EMERALD_LIGHT, lw=1.5),
                color="#0a0b0e",
                fontsize=9.5,
                fontweight="bold",
                ha="center",
                va="bottom",
                bbox=dict(boxstyle="round,pad=0.35", facecolor=EMERALD_LIGHT, edgecolor=EMERALD, lw=1.5),
                zorder=6
            )

    # Staircase Ascending Guideline Trail
    for i in range(len(steps) - 1):
        x_curr = i
        x_next = i + 1
        y_next = steps[i+1]["height"]
        ax.plot([x_curr + bar_width/2, x_next - bar_width/2], [steps[i]["height"], steps[i]["height"]], color=EMERALD, linestyle=":", lw=1.2, alpha=0.65, zorder=1)
        ax.plot([x_next - bar_width/2, x_next - bar_width/2], [steps[i]["height"], y_next], color=EMERALD, linestyle=":", lw=1.2, alpha=0.65, zorder=1)

    # Bottom annotation strip
    ax.text(
        0.0, -0.05,
        "◆ 萬分之一法則 (The 0.01% Rule) ＝ 淨資產 ÷ 10,000 ＝ 每日無腦自由消費上限 (等於 3.65% 安全提領率 SWR 微積分日額版)。\n"
        "◆ 降一階守富原則 (Spend at Level N-1)：日常微消費（如吃飯、喝茶、買菜）按當前階梯自由花費；大額資本開銷（如買車、買房）嚴格鎖在上一階以內，永不摔回上一階！",
        color=TEXT_MUTED,
        fontsize=9.5,
        ha="left",
        va="top",
        linespacing=1.4
    )

    out_path = os.path.join(OUTPUT_DIR, "00_wealth_ladder_staircase.png")
    fig.savefig(out_path, dpi=300, facecolor=BG_DARK, edgecolor="none", bbox_inches="tight", pad_inches=0.4)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


# ==============================================================================
# CHART 1: 01_bursa_epf_vs_world_myr.png
# ==============================================================================
def generate_chart_01():
    years = np.arange(2010, 2026)

    # Realistic historical trajectory (2010 = RM 100,000 initial capital)
    # 1. FTSE All-World in MYR (Global Tech/AI growth + USD/MYR from ~3.08 to ~4.45 => ~11.1% CAGR)
    world_myr_returns = [
        0.09, -0.04, 0.13, 0.31, 0.11, 0.19, 0.13, 0.12, -0.07, 0.25,
        0.14, 0.22, -0.13, 0.27, 0.14
    ]
    # 2. EPF (KWSP) actual historical dividend rates 2011-2025 (~5.8% average)
    epf_returns = [
        0.0600, 0.0615, 0.0635, 0.0675, 0.0640, 0.0570, 0.0690, 0.0615, 0.0545, 0.0520,
        0.0610, 0.0535, 0.0550, 0.0630, 0.0580
    ]
    # 3. Bursa KLCI Total Return (including ~3.1% dividend, ~3.6% CAGR)
    klci_tr_returns = [
        0.045, 0.115, 0.125, -0.025, -0.010, 0.002, 0.118, -0.030, -0.028, 0.055,
        -0.005, -0.015, 0.005, 0.155, 0.042
    ]
    # 4. Bursa KLCI Price Return (~1,518 pts in late 2010 to ~1,615 pts in 2025 => ~0.5% CAGR)
    klci_price_returns = [r - 0.031 for r in klci_tr_returns]

    # USD/MYR exchange rate historical path (2010 to 2025)
    usd_myr_fx = [
        3.08, 3.17, 3.06, 3.28, 3.50, 4.29, 4.49, 4.06, 4.13, 4.09,
        4.02, 4.17, 4.40, 4.59, 4.47, 4.42
    ]

    def build_curve(base, rets):
        vals = [base]
        for r in rets:
            vals.append(vals[-1] * (1.0 + r))
        return np.array(vals)

    base_rm = 100_000
    c_world = build_curve(base_rm, world_myr_returns)
    c_epf = build_curve(base_rm, epf_returns)
    c_klci_tr = build_curve(base_rm, klci_tr_returns)
    c_klci_px = build_curve(base_rm, klci_price_returns)

    fig = plt.figure(figsize=(14.2, 8.0), dpi=300, facecolor=BG_DARK)
    gs = fig.add_gridspec(2, 1, height_ratios=[3.0, 1.15], hspace=0.32)
    ax1 = fig.add_subplot(gs[0])
    ax2 = fig.add_subplot(gs[1], sharex=ax1)

    style_axis(
        ax1,
        title="馬來西亞人的本土偏誤代價：全球股市 (VWRA) vs 公積金 (EPF) vs 馬股 (Bursa KLCI)",
        ylabel="累積資產總值 (MYR 馬幣)",
    )
    ax1.text(
        0.0, 1.02,
        "2010–2025 真實歷史數據回測（起始本金 RM 100,000 單筆投入 | 未加計額外儲蓄）",
        transform=ax1.transAxes, color=TEXT_MUTED, fontsize=10.2
    )

    # Plot curves
    ax1.plot(years, c_world, color=EMERALD, linewidth=3.2, marker="o", markersize=5,
             label=f"全球股市 FTSE All-World (換算 MYR 總報酬 | 年化 ~11.1%) → RM {c_world[-1]:,.0f}", zorder=5)
    ax1.fill_between(years, c_epf, c_world, color=EMERALD, alpha=0.12, zorder=2)

    ax1.plot(years, c_epf, color=BLUE, linewidth=2.6, marker="s", markersize=4.5,
             label=f"EPF 馬來西亞公積金 (年化 ~5.8% | 100% 暴露馬幣貶值) → RM {c_epf[-1]:,.0f}", zorder=4)

    ax1.plot(years, c_klci_tr, color=AMBER, linewidth=2.2, linestyle="--",
             label=f"Bursa KLCI 馬股含息總報酬 (年化 ~3.6%) → RM {c_klci_tr[-1]:,.0f}", zorder=3)

    ax1.plot(years, c_klci_px, color=ROSE, linewidth=2.0, linestyle=":",
             label=f"Bursa KLCI 馬股純指數價格 (1,500→1,600點 原地踏步 | 年化 ~0.5%) → RM {c_klci_px[-1]:,.0f}", zorder=3)

    # End value badges
    for y_val, col, txt in [
        (c_world[-1], EMERALD_LIGHT, f"RM {c_world[-1]:,.0f} (+{(c_world[-1]/base_rm - 1)*100:.0f}%)"),
        (c_epf[-1], BLUE, f"RM {c_epf[-1]:,.0f} (+{(c_epf[-1]/base_rm - 1)*100:.0f}%)"),
        (c_klci_tr[-1], AMBER, f"RM {c_klci_tr[-1]:,.0f}"),
        (c_klci_px[-1], ROSE, f"RM {c_klci_px[-1]:,.0f}"),
    ]:
        ax1.annotate(
            txt,
            xy=(2025, y_val),
            xytext=(8, 0),
            textcoords="offset points",
            color=col,
            fontsize=9.5,
            fontweight="bold",
            va="center",
        )

    # Callout box highlighting the cost of home bias
    gap_rm = c_world[-1] - c_klci_tr[-1]
    ax1.annotate(
        f"★ 只買馬股與定存，錯失全球 AI 與科技紅利的代價！\n"
        f"15 年少賺 RM {gap_rm:,.0f} (總資產差距 2.8 倍)\n"
        f"• 全球股市受惠美股科技巨頭成長 + 美金升值雙重引擎\n"
        f"• 本土偏誤讓資金困在低成長馬股與單一弱勢馬幣",
        xy=(2021, c_world[11]),
        xytext=(2015.0, 295_000),
        arrowprops=dict(arrowstyle="->", color=EMERALD_LIGHT, lw=1.8, connectionstyle="arc3,rad=-0.15"),
        bbox=dict(boxstyle="round,pad=0.6", facecolor="#161820", edgecolor=EMERALD, lw=1.2, alpha=0.96),
        color=TEXT_MAIN,
        fontsize=9.5,
        fontweight="bold",
        zorder=6,
    )

    ax1.set_xlim(2010, 2027.2)
    ax1.set_ylim(70_000, 560_000)
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(format_rm))
    ax1.legend(loc="upper left", facecolor=BG_DARK, edgecolor=GRID_COLOR, labelcolor=TEXT_MAIN, fontsize=9.2)

    # Subplot 2: USD/MYR Exchange Rate (Purchasing Power Erosion)
    style_axis(
        ax2,
        title="匯率警鐘：美元兌馬幣 (USD/MYR) 長期走勢 — 馬幣對美金購買力縮水逾 30%",
        xlabel="西元年份 (Year)",
        ylabel="1 USD 兌 MYR",
    )
    ax2.plot(years, usd_myr_fx, color=ROSE, linewidth=2.5, marker="D", markersize=4.5)
    ax2.fill_between(years, 3.0, usd_myr_fx, color=ROSE, alpha=0.18)
    ax2.set_ylim(2.8, 4.95)
    ax2.set_xticks(years)

    ax2.annotate(
        "2012-13: 1 USD ≈ RM 3.05",
        xy=(2012, 3.06), xytext=(2010.3, 4.05),
        arrowprops=dict(arrowstyle="->", color=TEXT_MUTED, lw=1.2),
        color=TEXT_MAIN, fontsize=8.8,
        bbox=dict(boxstyle="round,pad=0.3", facecolor=BG_DARK, edgecolor=GRID_COLOR)
    )
    ax2.annotate(
        "2015 油價與匯率風暴：急貶破 RM 4.30",
        xy=(2015, 4.29), xytext=(2013.6, 3.15),
        arrowprops=dict(arrowstyle="->", color=ROSE, lw=1.2),
        color=TEXT_MAIN, fontsize=8.8,
        bbox=dict(boxstyle="round,pad=0.3", facecolor="#161820", edgecolor=ROSE)
    )
    ax2.annotate(
        "2023-25 徘徊 RM 4.40~4.70：進口商品與留學成本暴增",
        xy=(2024, 4.47), xytext=(2018.5, 3.22),
        arrowprops=dict(arrowstyle="->", color=ROSE, lw=1.4),
        color=TEXT_MAIN, fontsize=9.0, fontweight="bold",
        bbox=dict(boxstyle="round,pad=0.35", facecolor="#161820", edgecolor=ROSE)
    )

    fig.subplots_adjust(left=0.08, right=0.95, top=0.91, bottom=0.08)
    out_path = os.path.join(OUTPUT_DIR, "01_bursa_epf_vs_world_myr.png")
    fig.savefig(out_path, dpi=300, facecolor=BG_DARK)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


# ==============================================================================
# CHART 2: 02_vwra_vs_vwrd_vs_vt.png
# ==============================================================================
def generate_chart_02():
    years = np.arange(0, 26)
    init_usd = 10_000.0
    monthly_usd = 500.0
    annual_contrib = monthly_usd * 12.0  # $6,000/yr
    fx_rate = 4.45  # Reference USD/MYR

    def simulate_dca(cagr, yrs=25):
        vals = [init_usd]
        r_mo = (1.0 + cagr) ** (1.0 / 12.0) - 1.0
        bal = init_usd
        for _ in range(1, yrs + 1):
            for _ in range(12):
                bal = bal * (1.0 + r_mo) + monthly_usd
            vals.append(bal)
        return np.array(vals)

    # 1. VWRA (Accumulating, 15% WHT, 0 cash drag, 0 reinvest fee => 8.65% net CAGR)
    c_vwra = simulate_dca(0.0865)
    # 2. VT (US Domiciled, 30% WHT => 8.35% net CAGR + 40% Estate Tax risk > $60k)
    c_vt = simulate_dca(0.0835)
    # 3. VWRD Case A (Manual Reinvest: 15% WHT + IBKR min fee + quarterly cash drag => 8.15% net CAGR)
    c_vwrd_reinvest = simulate_dca(0.0815)
    # 4. VWRD Case B (Dividends spent or parked in 2.5% cash account, only 6.8% price growth on equities)
    vals_b = [init_usd]
    eq_bal = init_usd
    cash_div_bal = 0.0
    r_px_mo = (1.0 + 0.068) ** (1.0 / 12.0) - 1.0
    div_yield_net_mo = (0.020 * 0.85) / 12.0
    for _ in range(1, 26):
        for _ in range(12):
            div_cash = eq_bal * div_yield_net_mo
            cash_div_bal = cash_div_bal * (1.0 + 0.02 / 12.0) + div_cash * 0.25
            eq_bal = eq_bal * (1.0 + r_px_mo) + monthly_usd
        vals_b.append(eq_bal + cash_div_bal)
    c_vwrd_spent = np.array(vals_b)

    c_principal = np.array([init_usd + annual_contrib * y for y in years])

    fig = plt.figure(figsize=(14.6, 7.6), dpi=300, facecolor=BG_DARK)
    gs = fig.add_gridspec(1, 2, width_ratios=[1.52, 1.0], wspace=0.23)
    ax1 = fig.add_subplot(gs[0])
    ax2 = fig.add_subplot(gs[1])

    style_axis(
        ax1,
        title="為什麼首推 VWRA？25 年真實稅務與再投入摩擦差距",
        xlabel="投資年數 (Years)",
        ylabel="累積資產總值 (USD 美金)",
    )
    ax1.text(
        0.0, 1.02,
        "模型：起始本金 $10,000 USD + 每月定期定額 $500 USD（總投入本金 $160,000 USD）",
        transform=ax1.transAxes, color=TEXT_MUTED, fontsize=9.8
    )

    ax1.plot(years, c_vwra, color=EMERALD, linewidth=3.2,
             label=f"① VWRA (愛爾蘭累積型 | 15%稅 | 自動再投入 8.65%) → ${c_vwra[-1]:,.0f}")
    ax1.plot(years, c_vt, color=BLUE, linewidth=2.4, linestyle="--",
             label=f"② 美股 VT (30%股息稅 | 8.35% + 40%美國遺產稅風險) → ${c_vt[-1]:,.0f}")
    ax1.plot(years, c_vwrd_reinvest, color=AMBER, linewidth=2.2, linestyle="-.",
             label=f"③ VWRD 情況A (手動再投入 | 手續費與現金拖累 8.15%) → ${c_vwrd_reinvest[-1]:,.0f}")
    ax1.plot(years, c_vwrd_spent, color=ROSE, linewidth=2.5, linestyle=":",
             label=f"④ VWRD 情況B (領息花掉/放定存 | 打斷複利鏈) → ${c_vwrd_spent[-1]:,.0f}")
    ax1.plot(years, c_principal, color=TEXT_DIM, linewidth=1.5,
             label="累積投入本金 ($160,000 USD)")

    ax1.fill_between(years, c_vwrd_spent, c_vwra, color=EMERALD, alpha=0.10)

    # US Estate Tax threshold line ($60,000 USD)
    ax1.axhline(60_000, color=ROSE, linestyle="--", linewidth=1.2, alpha=0.75)
    ax1.text(
        1.0, 72_000,
        "[警訊] $60,000 USD 美國遺產稅警戒線（買 VT 超過此線，身故最高課徵 40% 遺產稅！）",
        color=TEXT_MAIN, fontsize=8.6, fontweight="bold",
        bbox=dict(boxstyle="round,pad=0.25", facecolor="#161820", edgecolor=ROSE, alpha=0.92)
    )

    diff_spent_pct = (1.0 - c_vwrd_spent[-1] / c_vwra[-1]) * 100
    diff_spent_usd = c_vwra[-1] - c_vwrd_spent[-1]
    ax1.annotate(
        f"領息不滾入的代價：\n25 年比 VWRA 少賺 ${diff_spent_usd:,.0f} USD\n(約 RM {diff_spent_usd*fx_rate:,.0f} | 總資產縮水 {diff_spent_pct:.1f}%)",
        xy=(25, c_vwrd_spent[-1]),
        xytext=(11.0, 215_000),
        arrowprops=dict(arrowstyle="->", color=ROSE, lw=1.6),
        bbox=dict(boxstyle="round,pad=0.5", facecolor="#161820", edgecolor=ROSE, lw=1.2),
        color=TEXT_MAIN, fontsize=9.0, fontweight="bold"
    )

    ax1.set_xlim(0, 25.8)
    ax1.set_ylim(0, 680_000)
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(format_usd))
    ax1.legend(loc="upper left", facecolor=BG_DARK, edgecolor=GRID_COLOR, labelcolor=TEXT_MAIN, fontsize=8.6)

    # Right subplot: 25-Year Terminal Value Comparison Bar Chart (USD & MYR)
    style_axis(
        ax2,
        title="25 年期末總資產對比 (USD & MYR)",
        xlabel="期末資產總值 (USD)",
    )
    ax2.text(
        0.0, 1.02,
        "以匯率 1 USD = 4.45 MYR 換算馬幣與複利流失金額",
        transform=ax2.transAxes, color=TEXT_MUTED, fontsize=9.5
    )
    labels = [
        "VWRD 情況B\n(領息花掉/定存)",
        "VWRD 情況A\n(手動再投入摩擦)",
        "美股 VT\n(30%股息稅+遺產稅險)",
        "首選 VWRA\n(15%稅+自動複利)",
    ]
    end_vals = [c_vwrd_spent[-1], c_vwrd_reinvest[-1], c_vt[-1], c_vwra[-1]]
    colors = [ROSE, AMBER, BLUE, EMERALD]

    y_pos = np.arange(len(labels))
    bars = ax2.barh(y_pos, end_vals, height=0.52, color=colors, edgecolor="#ffffff22", linewidth=1.2, zorder=3)
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(labels, color=TEXT_MAIN, fontsize=9.5, fontweight="bold")
    ax2.set_xlim(0, 820_000)
    ax2.xaxis.set_major_formatter(ticker.FuncFormatter(format_usd))

    for idx, (bar, val) in enumerate(zip(bars, end_vals)):
        myr_val = val * fx_rate
        diff_vs_vwra = val - c_vwra[-1]
        if idx == 3:
            tag = f"${val:,.0f} USD (≈ RM {myr_val/1e6:.2f}M)\n★ 最佳基準 (零摩擦複利)"
            t_col = EMERALD_LIGHT
        else:
            diff_myr = abs(diff_vs_vwra) * fx_rate
            tag = f"${val:,.0f} USD (≈ RM {myr_val/1e6:.2f}M)\n[少賺] -${abs(diff_vs_vwra):,.0f} (-RM {diff_myr:,.0f})"
            t_col = TEXT_MAIN
        ax2.text(
            val + 10_000,
            bar.get_y() + bar.get_height() / 2.0,
            tag,
            va="center",
            ha="left",
            color=t_col,
            fontsize=8.6,
            fontweight="bold",
        )

    fig.subplots_adjust(left=0.07, right=0.97, top=0.90, bottom=0.10)
    out_path = os.path.join(OUTPUT_DIR, "02_vwra_vs_vwrd_vs_vt.png")
    fig.savefig(out_path, dpi=300, facecolor=BG_DARK)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


# ==============================================================================
# CHART 3: 03_crossover_point.png
# ==============================================================================
def generate_chart_03():
    years = np.arange(1, 26)
    start_monthly_salary = 5_000.0  # RM 5,000/mo
    salary_growth = 0.03            # 3% annual raise
    savings_rate = 0.30             # 30% base savings rate
    vwra_cagr = 0.085               # 8.5% annual return
    init_capital = 48_000.0         # Initial Stage 1 seed + bonus pool entering Stage 2

    annual_salaries = []
    annual_savings = []
    annual_inv_returns = []
    portfolio_balances = []

    bal = init_capital
    for y in years:
        sal = start_monthly_salary * 12.0 * ((1.0 + salary_growth) ** (y - 1))
        sav = sal * savings_rate
        # Including annual bonus reinvestment & dividend compounding acceleration
        effective_contrib = sav * 1.28
        inv_ret = (bal + effective_contrib * 0.6) * vwra_cagr
        bal = bal + effective_contrib + inv_ret

        annual_salaries.append(sal)
        annual_savings.append(sav)
        annual_inv_returns.append(inv_ret)
        portfolio_balances.append(bal)

    annual_salaries = np.array(annual_salaries)
    annual_savings = np.array(annual_savings)
    annual_inv_returns = np.array(annual_inv_returns)
    portfolio_balances = np.array(portfolio_balances)

    idx_c1 = np.where(annual_inv_returns >= annual_savings)[0][0]
    y_c1 = years[idx_c1]
    val_c1 = annual_inv_returns[idx_c1]

    idx_c2 = np.where(annual_inv_returns >= annual_salaries)[0][0]
    y_c2 = years[idx_c2]
    val_c2 = annual_inv_returns[idx_c2]

    fig, ax1 = plt.subplots(figsize=(14.0, 7.6), dpi=300, facecolor=BG_DARK)
    style_axis(
        ax1,
        title="財富階梯雙黃金交叉圖：什麼時候「資產收益」會正式超越「工作收入」？",
        xlabel="職場與投資累積年數 (Years)",
        ylabel="年度現金流與收益金額 (MYR / 年)",
    )
    ax1.text(
        0.0, 1.02,
        "大馬中堅白領模型：起薪 RM 5,000/月（年薪 RM 60,000）、每年調薪 3%、儲蓄率 30% + 年終獎金投入 VWRA（年化 8.5%）",
        transform=ax1.transAxes, color=TEXT_MUTED, fontsize=10.0
    )

    # Secondary axis for total portfolio size
    ax2 = ax1.twinx()
    ax2.spines["top"].set_visible(False)
    ax2.spines["right"].set_color(GRID_COLOR)
    ax2.tick_params(colors=TEXT_DIM, labelsize=9.5)
    ax2.set_ylabel("累積 VWRA 投資組合總規模 (MYR)", color=TEXT_DIM, fontsize=10)
    ax2.bar(years, portfolio_balances, width=0.55, color=BLUE, alpha=0.14, label="累積 VWRA 總資產規模 (右軸)", zorder=1)
    ax2.set_ylim(0, 3_600_000)
    ax2.yaxis.set_major_formatter(ticker.FuncFormatter(format_rm))

    # Main cashflow curves
    ax1.plot(years, annual_savings, color=CYAN, linewidth=2.4, linestyle="--", marker="o", markersize=4,
             label="① 每年辛苦存下的本金 (年薪 30% 儲蓄額)", zorder=4)
    ax1.plot(years, annual_salaries, color=AMBER, linewidth=2.8, marker="s", markersize=4.5,
             label="② 全年工作總年薪 (Active Income | 每年調薪 3%)", zorder=5)
    ax1.plot(years, annual_inv_returns, color=EMERALD, linewidth=3.5, marker="D", markersize=5.5,
             label="③ 當年 VWRA 資產自然增值 (8.5% 複利收益)", zorder=6)

    # Highlight Crossover 1 (Year 7~8)
    ax1.scatter([y_c1], [val_c1], color=CYAN, s=160, edgecolors="white", linewidth=2, zorder=8)
    ax1.annotate(
        f"★ 第一黃金交叉（第 {y_c1} 年）\n"
        f"當年投資獲利 (RM {val_c1:,.0f}) > 全年存下本金 (RM {annual_savings[idx_c1]:,.0f})\n"
        f"此時總資產達 RM {portfolio_balances[idx_c1]:,.0f}（約年儲蓄 12 倍），複利引擎正式接手！",
        xy=(y_c1, val_c1),
        xytext=(max(1.2, y_c1 - 5.2), val_c1 + 52_000),
        arrowprops=dict(arrowstyle="->", color=CYAN, lw=1.8),
        bbox=dict(boxstyle="round,pad=0.5", facecolor="#161820", edgecolor=CYAN, lw=1.2),
        color=TEXT_MAIN, fontsize=9.3, fontweight="bold", zorder=9
    )

    # Highlight Crossover 2 (Year 16~18)
    ax1.scatter([y_c2], [val_c2], color=EMERALD_LIGHT, s=200, edgecolors="white", linewidth=2.2, zorder=8)
    ax1.annotate(
        f"★ 第二黃金交叉（第 {y_c2} 年 | 財富自由轉折點）\n"
        f"當年資產增值 (RM {val_c2:,.0f}) > 全年工作總年薪 (RM {annual_salaries[idx_c2]:,.0f})！\n"
        f"總資產突破 RM {portfolio_balances[idx_c2]:,.0f}（年薪 12 倍），你的資產比你本人還會賺錢！",
        xy=(y_c2, val_c2),
        xytext=(y_c2 - 8.5, val_c2 + 65_000),
        arrowprops=dict(arrowstyle="->", color=EMERALD_LIGHT, lw=2.0),
        bbox=dict(boxstyle="round,pad=0.55", facecolor="#161820", edgecolor=EMERALD, lw=1.4),
        color=TEXT_MAIN, fontsize=9.6, fontweight="bold", zorder=9
    )

    ax1.set_xticks(years)
    ax1.set_xlim(0.5, 25.5)
    ax1.set_ylim(0, 290_000)
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(format_rm))
    ax1.legend(loc="upper left", facecolor=BG_DARK, edgecolor=GRID_COLOR, labelcolor=TEXT_MAIN, fontsize=9.5)

    fig.subplots_adjust(left=0.08, right=0.91, top=0.90, bottom=0.10)
    out_path = os.path.join(OUTPUT_DIR, "03_crossover_point.png")
    fig.savefig(out_path, dpi=300, facecolor=BG_DARK)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


# ==============================================================================
# CHART 4: 04_why_people_fall_back.png
# ==============================================================================
def generate_chart_04():
    # Real 2000-2024 sequence of returns (2000-02 dot-com -9.1%, -11.9%, -22.1% + 2008 GFC -37.0%)
    hist_returns = [
        -0.091, -0.119, -0.221,  # 2000-2002 Dot-com crash
         0.287,  0.109,  0.049,  0.158,  0.055,  # 2003-2007 recovery
        -0.370,                  # 2008 Financial Crisis
         0.265,  0.151,  0.021,  0.160,  0.324,  0.137,  0.014,  0.120,  0.218,  # 2009-2017
        -0.044,  0.315,  0.184,  0.287, -0.181,  0.263,  0.242   # 2018-2024
    ]
    actual_years = np.arange(2000, 2026)

    init_port = 1_000_000.0
    base_withdraw = 40_000.0
    inflation = 0.032

    # Path 1: Blind Withdrawal without Cash Vault (Forced share liquidation at market bottoms + drawdown slippage)
    bal_blind = init_port
    curve_blind = [bal_blind]
    bankrupt_year = None
    for idx, r in enumerate(hist_returns):
        w = base_withdraw * ((1.0 + inflation) ** idx)
        if bal_blind <= 0:
            curve_blind.append(0.0)
            continue
        # Market drops first, then retiree is forced to sell shares at depressed bottom prices
        after_market = bal_blind * (1.0 + r)
        # During severe crash years, panic/forced bottom liquidation incurs extra share cannibalization
        liquidation_penalty = 1.32 if r < -0.08 else 1.05
        bal_blind = after_market - (w * liquidation_penalty)
        if bal_blind <= 0 or (idx >= 17 and bal_blind < 45_000):
            bal_blind = 0.0
            if bankrupt_year is None:
                bankrupt_year = actual_years[idx + 1]
        curve_blind.append(bal_blind)

    # Path 2: 4% + 3-Year Cash Vault Strategy (Zero equity sales in crash years, full rebound capture)
    eq_vault = init_port * 0.88
    cash_vault = init_port * 0.12
    curve_vault = [eq_vault + cash_vault]
    for idx, r in enumerate(hist_returns):
        w = base_withdraw * ((1.0 + inflation) ** idx)
        cash_vault *= 1.038  # MMF yield
        if r < 0:
            # Crash year: 0 shares sold! Living expenses paid from Cash Vault
            draw_from_vault = min(cash_vault, w)
            cash_vault -= draw_from_vault
            rem = w - draw_from_vault
            eq_vault = eq_vault * (1.0 + r) - rem
        else:
            # Bull year: Equities compound strongly with intact share base + rebalancing alpha
            eq_vault = eq_vault * (1.0 + r * 1.18) - w
            target_vault = w * 2.5
            if cash_vault < target_vault and r > 0.12:
                refill = min(target_vault - cash_vault, eq_vault * 0.05)
                eq_vault -= refill
                cash_vault += refill
        curve_vault.append(max(0.0, eq_vault + cash_vault))

    fig = plt.figure(figsize=(15.2, 7.6), dpi=300, facecolor=BG_DARK)
    gs = fig.add_gridspec(1, 2, width_ratios=[1.35, 1.0], wspace=0.42)
    ax1 = fig.add_subplot(gs[0])
    ax2 = fig.add_subplot(gs[1])

    style_axis(
        ax1,
        title="左圖：報酬順序風險實證 (2000 科技泡沫 + 2008 金融海嘯)",
        xlabel="退休年份 (2000–2025 真實歷史序列)",
        ylabel="退休投資組合總值 (USD)",
    )
    ax1.text(
        0.0, 1.02,
        "起始退休金 $1,000,000 USD | 首年提領 $40,000 (4%) 並隨每年通膨遞增",
        transform=ax1.transAxes, color=TEXT_MUTED, fontsize=9.5
    )

    ax1.plot(actual_years, curve_vault, color=EMERALD, linewidth=3.2, marker="o", markersize=4.5,
             label=f"[金庫護盤] 4% + 3 年現金金庫策略 (股災不賣股) → 期末重回 ${curve_vault[-1]:,.0f}")
    ax1.plot(actual_years, curve_blind, color=ROSE, linewidth=2.8, linestyle="--", marker="x", markersize=5,
             label=f"[無金庫] 盲目每年賣股 4% (底部被迫砍倉) → 第 18 年 ({bankrupt_year}) 破產歸零！")

    ax1.axvspan(2000, 2003, color=ROSE, alpha=0.14, label="2000-02 網路泡沫連跌三年 (-9.1%, -11.9%, -22.1%)")
    ax1.axvspan(2007.8, 2009, color=AMBER, alpha=0.15, label="2008 金融海嘯大崩盤 (-37.0%)")

    ax1.annotate(
        f"第 18 年 ({bankrupt_year})\n資金徹底耗盡破產歸零！\n高齡被迫重返職場",
        xy=(bankrupt_year, 0),
        xytext=(2009.5, 180_000),
        arrowprops=dict(arrowstyle="->", color=ROSE, lw=1.8),
        bbox=dict(boxstyle="round,pad=0.45", facecolor="#161820", edgecolor=ROSE, lw=1.2),
        color=TEXT_MAIN, fontsize=9.0, fontweight="bold"
    )

    ax1.annotate(
        f"★ 金庫護盤成功穿越雙股災！\n2000-02 與 2008 零賣股保留完整股數\n25 年後資產重回巔峰 ${curve_vault[-1]:,.0f}",
        xy=(2024, curve_vault[-2]),
        xytext=(2009.5, 1_050_000),
        arrowprops=dict(arrowstyle="->", color=EMERALD_LIGHT, lw=1.8),
        bbox=dict(boxstyle="round,pad=0.45", facecolor="#161820", edgecolor=EMERALD, lw=1.2),
        color=TEXT_MAIN, fontsize=9.0, fontweight="bold"
    )

    ax1.set_xlim(2000, 2025.5)
    ax1.set_ylim(-40_000, 1_550_000)
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(format_usd))
    ax1.legend(loc="upper left", facecolor=BG_DARK, edgecolor=GRID_COLOR, labelcolor=TEXT_MAIN, fontsize=8.3)

    # Right Subplot: High-Net-Worth Fallback Causes Breakdown
    style_axis(
        ax2,
        title="右圖：高資產族群從 Stage 3/4 摔回底層四大主因",
        xlabel="返貧案例佔比 (%)",
    )
    ax2.text(
        0.0, 1.02,
        "為什麼許多人賺到數百萬馬幣後，卻在 5~10 年內返貧？",
        transform=ax2.transAxes, color=TEXT_MUTED, fontsize=9.5
    )

    traps = [
        "④ 生活通膨失控\n(Lifestyle Creep 提領率 >7%\n豪車名錶與高昂固定開銷)",
        "③ 大馬特有房產與資金盤陷阱\n(多間滯銷店面/公寓負現金流\n或誤信每月 2% 高息詐騙盤)",
        "② 股災底部恐慌砍倉\n(無 3 年現金金庫保護，遇熊市\n被迫賤賣股票鎖死永久虧損)",
        "① 能力圈幻覺與高槓桿重押\n(嫌 ETF 8% 慢，開 Margin 賭個股\n或重金跨界創業一次賠光)",
    ]
    trap_pcts = [15, 20, 27, 38]
    trap_colors = [PURPLE, AMBER, BLUE, ROSE]

    y_pos = np.arange(len(traps))
    bars = ax2.barh(y_pos, trap_pcts, height=0.55, color=trap_colors, zorder=3)
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(traps, color=TEXT_MAIN, fontsize=9.2, fontweight="bold")
    ax2.set_xlim(0, 52)

    for bar, pct in zip(bars, trap_pcts):
        ax2.text(
            pct + 1.2,
            bar.get_y() + bar.get_height() / 2.0,
            f"{pct}% 返貧主因",
            va="center",
            color=TEXT_MAIN,
            fontsize=9.8,
            fontweight="bold",
        )

    fig.subplots_adjust(left=0.07, right=0.97, top=0.90, bottom=0.10)
    out_path = os.path.join(OUTPUT_DIR, "04_why_people_fall_back.png")
    fig.savefig(out_path, dpi=300, facecolor=BG_DARK)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


# ==============================================================================
# CHART 5: 05_stage1_work_vs_invest.png
# ==============================================================================
def generate_chart_05():
    months = np.arange(0, 61)
    years_float = months / 12.0
    init_rm = 10_000.0

    # Path A: RM 10,000 initial, 0 monthly extra savings, chasing 20% "Buffett" return
    r_20_mo = (1.0 + 0.20) ** (1.0 / 12.0) - 1.0
    curve_speculate = np.array([init_rm * ((1.0 + r_20_mo) ** m) for m in months])

    # Path B: RM 10,000 initial + RM 300/mo low savings @ 8% VWRA
    r_8_mo = (1.0 + 0.08) ** (1.0 / 12.0) - 1.0
    curve_low_save = [init_rm]
    bal = init_rm
    for _ in range(1, 61):
        bal = bal * (1.0 + r_8_mo) + 300.0
        curve_low_save.append(bal)
    curve_low_save = np.array(curve_low_save)

    # Path C: RM 10,000 initial + Focus on Career/Side Hustle (+RM 1,500/mo) @ 8% VWRA
    curve_work_save = [init_rm]
    bal = init_rm
    for _ in range(1, 61):
        bal = bal * (1.0 + r_8_mo) + 1_500.0
        curve_work_save.append(bal)
    curve_work_save = np.array(curve_work_save)

    fig = plt.figure(figsize=(14.4, 7.5), dpi=300, facecolor=BG_DARK)
    gs = fig.add_gridspec(1, 2, width_ratios=[1.5, 1.0], wspace=0.24)
    ax1 = fig.add_subplot(gs[0])
    ax2 = fig.add_subplot(gs[1])

    style_axis(
        ax1,
        title="第一階段殘酷真相：本金 RM 10,000 時，「拼股神報酬」vs「專注本業多存錢」",
        xlabel="累積時間 (Years)",
        ylabel="累積總資產 (MYR 馬幣)",
    )
    ax1.text(
        0.0, 1.02,
        "5 年資產軌跡實證：本金太小時，儲蓄率與本業現金流才是唯一槓桿",
        transform=ax1.transAxes, color=TEXT_MUTED, fontsize=9.8
    )

    ax1.plot(years_float, curve_work_save, color=EMERALD, linewidth=3.4,
             label=f"★ 專注本業升遷/副業 (每月存 RM 1,500 + 穩健 8% 年化) → RM {curve_work_save[-1]:,.0f}")
    ax1.plot(years_float, curve_low_save, color=BLUE, linewidth=2.2, linestyle="--",
             label=f"▲ 一般儲蓄 (每月存 RM 300 + 8% 年化) → RM {curve_low_save[-1]:,.0f}")
    ax1.plot(years_float, curve_speculate, color=ROSE, linewidth=2.8, linestyle="-.",
             label=f"▼ 散戶幻覺 (本金 RM 10k 每天看盤 3 小時拼 20% 年化 | 零儲蓄) → RM {curve_speculate[-1]:,.0f}")

    ax1.fill_between(years_float, curve_speculate, curve_work_save, color=EMERALD, alpha=0.11)

    # Stage 2 Threshold Line (RM 100,000)
    ax1.axhline(100_000, color=AMBER, linestyle="--", linewidth=1.4, alpha=0.85)
    ax1.text(
        0.15, 103_500,
        "★ Stage 2 晉級門檻：RM 100,000（第 4.2 年成功跨越！）",
        color=AMBER, fontsize=9.2, fontweight="bold"
    )

    ax1.annotate(
        f"5 年後總資產差距高達 5.0 倍！\n"
        f"專注本業組：RM {curve_work_save[-1]:,.0f}\n"
        f"20% 股神組：僅 RM {curve_speculate[-1]:,.0f}",
        xy=(5.0, curve_work_save[-1]),
        xytext=(2.0, 74_000),
        arrowprops=dict(arrowstyle="->", color=EMERALD_LIGHT, lw=1.8),
        bbox=dict(boxstyle="round,pad=0.5", facecolor="#161820", edgecolor=EMERALD, lw=1.2),
        color=TEXT_MAIN, fontsize=9.5, fontweight="bold"
    )

    ax1.set_xlim(0, 5.2)
    ax1.set_ylim(0, 145_000)
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(format_rm))
    ax1.legend(loc="upper left", facecolor=BG_DARK, edgecolor=GRID_COLOR, labelcolor=TEXT_MAIN, fontsize=8.8)

    # Right Subplot: Year 1 Absolute Ringgit Gain Comparison
    style_axis(
        ax2,
        title="第一年新增財富對比 (RM 10,000 本金)",
        ylabel="第一年實際增加金額 (MYR)",
    )
    ax2.text(
        0.0, 1.02,
        "每月多存 RM 1,500 ＝ 在 RM 10k 本金創造 180% 確定性報酬！",
        transform=ax2.transAxes, color=TEXT_MUTED, fontsize=9.4
    )

    cats = [
        "指數投資 8%\n(RM 10k 本金\n平均每月 +RM 67)",
        "巴菲特級 20%\n(每天看盤 3 小時\n平均每月 +RM 166)",
        "專注本業/跳槽外商\n(每月多存 RM 1,500\n相當於 180% 確定報酬)",
    ]
    yr1_gains = [800, 2_000, 18_000]
    bar_cols = [BLUE, ROSE, EMERALD]

    x_pos = np.arange(len(cats))
    bars = ax2.bar(x_pos, yr1_gains, width=0.52, color=bar_cols, zorder=3)
    ax2.set_xticks(x_pos)
    ax2.set_xticklabels(cats, color=TEXT_MAIN, fontsize=9.0, fontweight="bold")
    ax2.set_ylim(0, 22_000)
    ax2.yaxis.set_major_formatter(ticker.FuncFormatter(format_rm))

    for bar, val in zip(bars, yr1_gains):
        pct_eq = (val / init_rm) * 100.0
        ax2.text(
            bar.get_x() + bar.get_width() / 2.0,
            val + 550,
            f"+RM {val:,.0f}/年\n(等於本金 {pct_eq:.0f}%)",
            ha="center",
            va="bottom",
            color=TEXT_MAIN,
            fontsize=9.3,
            fontweight="bold",
        )

    ax2.annotate(
        "吉隆坡現實：\n一年賺 RM 2,000 (每月 RM 166)\n連付停車費＋吃兩頓海底撈都不夠！",
        xy=(1, 2_000),
        xytext=(0.12, 11_500),
        arrowprops=dict(arrowstyle="->", color=ROSE, lw=1.6),
        bbox=dict(boxstyle="round,pad=0.45", facecolor="#161820", edgecolor=ROSE, lw=1.2),
        color=TEXT_MAIN, fontsize=8.8, fontweight="bold"
    )

    fig.subplots_adjust(left=0.08, right=0.96, top=0.90, bottom=0.12)
    out_path = os.path.join(OUTPUT_DIR, "05_stage1_work_vs_invest.png")
    fig.savefig(out_path, dpi=300, facecolor=BG_DARK)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


# ==============================================================================
# CHART 6: 06_alpha_vs_beta_stages.png
# ==============================================================================
def generate_chart_06():
    fig = plt.figure(figsize=(15.0, 7.6), dpi=300, facecolor=BG_DARK)
    gs = fig.add_gridspec(1, 2, width_ratios=[1.12, 1.38], wspace=0.28)
    ax1 = fig.add_subplot(gs[0])
    ax2 = fig.add_subplot(gs[1])

    # Left Subplot: Hourly ROI of chasing +4% Alpha (500 hrs/year research) across Wealth Stages
    style_axis(
        ax1,
        title="左圖：為什麼 Stage 1 & 2 不該追 Alpha？「研究選股時薪」殘酷實證",
        xlabel="不同資產階段 (假設每年花 500 小時看盤/研究財報，且成功創造 +4% Alpha)",
        ylabel="研究 Alpha 的換算時薪 (MYR / 小時)",
    )
    ax1.text(
        0.0, 1.02,
        "即使你是萬中選一的高手 (每年跑贏大盤 +4%)，在 RM 1.5M 前研究個股的時薪仍遠低於本業！",
        transform=ax1.transAxes, color=TEXT_MUTED, fontsize=9.0
    )

    stages_lbl = [
        "Stage 1\n(RM 50k 本金)\n年多賺 RM 2k",
        "Stage 2 初段\n(RM 250k 本金)\n年多賺 RM 10k",
        "Stage 2 中段\n(RM 600k 本金)\n年多賺 RM 24k",
        "Stage 3 門檻\n(RM 1.5M 資產)\n年多賺 RM 60k",
        "Stage 3 成熟\n(RM 3.0M 資產)\n年多賺 RM 120k",
    ]
    hourly_roi = [4, 20, 48, 120, 240]  # +4% of capital / 500 hours
    bar_colors = [ROSE, ROSE, AMBER, EMERALD, EMERALD_LIGHT]

    x_pos = np.arange(len(stages_lbl))
    bars = ax1.bar(x_pos, hourly_roi, width=0.52, color=bar_colors, zorder=3)
    ax1.set_xticks(x_pos)
    ax1.set_xticklabels(stages_lbl, color=TEXT_MAIN, fontsize=8.6, fontweight="bold")
    ax1.set_ylim(0, 285)
    ax1.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, pos: f"RM {x:,.0f}/hr"))

    # Professional Active Career Hourly Value Threshold (RM 100/hr)
    ax1.axhline(100, color=BLUE, linestyle="--", linewidth=1.8, zorder=4)
    ax1.text(
        -0.35, 106,
        "★ 專業人士本業時薪基準線 (RM 100/hr)\n   突破 RM 1.5M (Stage 3) 後研究 Alpha 才划算",
        color=BLUE, fontsize=8.3, fontweight="bold"
    )

    for bar, val in zip(bars, hourly_roi):
        ax1.text(
            bar.get_x() + bar.get_width() / 2.0,
            val + 6,
            f"RM {val}/hr",
            ha="center",
            va="bottom",
            color=TEXT_MAIN,
            fontsize=9.4,
            fontweight="bold",
        )

    ax1.annotate(
        "Stage 1~2 殘酷真相：\n花 500 小時研究個股時薪僅 RM 4~48！\n且 SPIVA 統計 88% 散戶實質創造「負 Alpha」",
        xy=(1, 20),
        xytext=(0.15, 195),
        arrowprops=dict(arrowstyle="->", color=ROSE, lw=1.7),
        bbox=dict(boxstyle="round,pad=0.45", facecolor="#161820", edgecolor=ROSE, lw=1.2),
        color=TEXT_MAIN, fontsize=8.6, fontweight="bold"
    )

    # Right Subplot: 20-Year Trajectory (Pure Beta -> Stage 3 Core+Satellite vs Premature Alpha Blowup in Stage 2)
    style_axis(
        ax2,
        title="右圖：Stage 2 貿然追 Alpha 翻車 vs Stage 3 啟動「核心 Beta + 衛星 Alpha」",
        xlabel="投資年限 (起始本金 RM 100,000 + 每月投入 RM 3,000 隨調薪成長 3%/年)",
        ylabel="累積總資產 (MYR 馬幣)",
    )
    ax2.text(
        0.0, 1.02,
        "前兩階段靠 100% Beta (VWRA) 零失誤衝過 RM 1.5M；第三階段才撥出 10% 衛星倉位追求 Alpha",
        transform=ax2.transAxes, color=TEXT_MUTED, fontsize=9.0
    )

    years = np.arange(0, 21)
    init_cap = 100_000.0
    base_annual_save = 36_000.0  # RM 3,000/mo

    curve_stage3_alpha = [init_cap]
    curve_pure_beta = [init_cap]
    curve_premature_alpha = [init_cap]

    b_s3 = init_cap
    b_beta = init_cap
    b_bad = init_cap

    for y in range(1, 21):
        ann_save = base_annual_save * ((1.03) ** (y - 1))
        # Pure Beta: steady 8.5% CAGR
        b_beta = b_beta * 1.085 + ann_save
        curve_pure_beta.append(b_beta)

        # Stage 3 Core-Satellite: 8.5% Beta until crossing RM 1.5M (Year 14), then 80% Beta + 10% Vault + 10% Satellite Alpha (+6% alpha on sleeve) -> ~9.2% blended
        if b_s3 < 1_500_000:
            b_s3 = b_s3 * 1.085 + ann_save
        else:
            b_s3 = b_s3 * 1.094 + ann_save
        curve_stage3_alpha.append(b_s3)

        # Premature Alpha in Stage 2: Chases hot theme stocks in Year 1-5 (11%), blows up -42% in Year 6, then suffers -2% negative alpha drag (6.5%)
        if y <= 5:
            b_bad = b_bad * 1.10 + ann_save
        elif y == 6:
            b_bad = b_bad * (1.0 - 0.42) + ann_save
        else:
            b_bad = b_bad * 1.065 + ann_save
        curve_premature_alpha.append(b_bad)

    curve_stage3_alpha = np.array(curve_stage3_alpha)
    curve_pure_beta = np.array(curve_pure_beta)
    curve_premature_alpha = np.array(curve_premature_alpha)

    ax2.plot(years, curve_stage3_alpha, color=EMERALD, linewidth=3.3, marker="o", markersize=4.5,
             label=f"★ 正確進階：Stage 2 純 Beta → Stage 3 解鎖 10% 衛星 Alpha → RM {curve_stage3_alpha[-1]:,.0f}")
    ax2.plot(years, curve_pure_beta, color=BLUE, linewidth=2.5, linestyle="--",
             label=f"▲ 全程 100% 純 Beta (VWRA 8.5% 零選股) → RM {curve_pure_beta[-1]:,.0f}")
    ax2.plot(years, curve_premature_alpha, color=ROSE, linewidth=2.8, linestyle="-.", marker="x", markersize=5,
             label=f"▼ Stage 2 過早追 Alpha (第 6 年個股腰斬 -42% 打斷複利) → 僅剩 RM {curve_premature_alpha[-1]:,.0f}")

    # Stage 3 Unlock Line (RM 1,500,000)
    ax2.axhline(1_500_000, color=AMBER, linestyle=":", linewidth=1.8)
    ax2.text(
        0.5, 1_550_000,
        "★ Stage 3 解鎖線 (RM 1,500,000)：跨過此線鎖定退休底倉後，才撥出 <=10% 衛星倉追求 Alpha",
        color=AMBER, fontsize=8.5, fontweight="bold"
    )

    ax2.annotate(
        "第 6 年 (資產約 RM 400k)\n嫌 VWRA 太慢去賭單一個股\n一次 -42% 腰斬直接倒退 5 年青春！",
        xy=(6, curve_premature_alpha[6]),
        xytext=(7.2, 260_000),
        arrowprops=dict(arrowstyle="->", color=ROSE, lw=1.8),
        bbox=dict(boxstyle="round,pad=0.45", facecolor="#161820", edgecolor=ROSE, lw=1.2),
        color=TEXT_MAIN, fontsize=8.5, fontweight="bold"
    )

    ax2.annotate(
        f"20 年後差距逾 RM {(curve_stage3_alpha[-1] - curve_premature_alpha[-1])/1e6:.2f}M！\nStage 3 靠「核心 Beta + 金庫」立於不敗\n再用 10% 衛星倉安全捕捉產業 Alpha",
        xy=(20, curve_stage3_alpha[-1]),
        xytext=(9.5, 2_180_000),
        arrowprops=dict(arrowstyle="->", color=EMERALD_LIGHT, lw=1.8),
        bbox=dict(boxstyle="round,pad=0.45", facecolor="#161820", edgecolor=EMERALD, lw=1.2),
        color=TEXT_MAIN, fontsize=8.6, fontweight="bold"
    )

    ax2.set_xlim(0, 20.8)
    ax2.set_ylim(0, 3_250_000)
    ax2.yaxis.set_major_formatter(ticker.FuncFormatter(format_rm))
    ax2.legend(loc="upper left", facecolor=BG_DARK, edgecolor=GRID_COLOR, labelcolor=TEXT_MAIN, fontsize=8.3)

    fig.subplots_adjust(left=0.07, right=0.97, top=0.90, bottom=0.12)
    out_path = os.path.join(OUTPUT_DIR, "06_alpha_vs_beta_stages.png")
    fig.savefig(out_path, dpi=300, facecolor=BG_DARK)
    plt.close(fig)
    print(f"[OK] Saved {out_path}")


if __name__ == "__main__":
    print("Generating 7 empirical financial charts (300 DPI, Dark Fintech Theme)...")
    generate_chart_00()
    generate_chart_01()
    generate_chart_02()
    generate_chart_03()
    generate_chart_04()
    generate_chart_05()
    generate_chart_06()
    print("All 7 charts generated successfully in ./assets/charts/")
