import { useNavigate } from "@remix-run/react";
import { useRef, useCallback, useEffect, useState } from "react";
import { usePollingEffect } from "@/hooks/usePollingEffect";
import { fetchMarkets } from "@/predict/api";
import type { Market } from "@/predict/types";

const PREDICT_TAB_CLASS = "predict-tab-injected";
const PREDICT_ROWS_CLASS = "predict-rows-injected";
const PREDICT_HIDDEN_ATTR = "data-predict-hidden";

interface PredictMarketRow {
  id: string;
  symbol: string;
  question: string;
  lastPrice: number;
  change24h: number;
  volume: string;
  category: string;
}

const MOCK_MARKETS: PredictMarketRow[] = [
  { id: "btc-above-80k-may-25", symbol: "BTC > 80K", question: "BTC above $80,000 on May 25?", lastPrice: 0.62, change24h: 4.23, volume: "142.5K", category: "crypto" },
  { id: "eth-above-4k-jun-01", symbol: "ETH > 4K", question: "ETH above $4,000 on Jun 1?", lastPrice: 0.38, change24h: -2.14, volume: "89.3K", category: "crypto" },
  { id: "btc-above-100k-jul-01", symbol: "BTC > 100K", question: "BTC above $100,000 by Jul 1?", lastPrice: 0.15, change24h: 1.05, volume: "312.7K", category: "crypto" },
  { id: "sol-above-200-jun-15", symbol: "SOL > 200", question: "SOL above $200 on Jun 15?", lastPrice: 0.71, change24h: 8.42, volume: "56.2K", category: "crypto" },
  { id: "fed-rate-cut-jun", symbol: "FED CUT JUN", question: "Fed rate cut in June 2026?", lastPrice: 0.44, change24h: -0.85, volume: "203.1K", category: "macro" },
  { id: "eth-etf-inflows-1b", symbol: "ETH ETF 1B", question: "ETH ETF inflows exceed $1B this week?", lastPrice: 0.29, change24h: -5.12, volume: "67.8K", category: "crypto" },
  { id: "nasdaq-above-20k-jun", symbol: "NAS > 20K", question: "Nasdaq above 20,000 by Jun 30?", lastPrice: 0.83, change24h: 0.34, volume: "178.4K", category: "macro" },
  { id: "arb-above-2-jun", symbol: "ARB > $2", question: "ARB above $2.00 on Jun 1?", lastPrice: 0.22, change24h: -3.71, volume: "34.1K", category: "protocol" },
  { id: "btc-halving-effect", symbol: "BTC +50%", question: "BTC +50% from halving price by Dec?", lastPrice: 0.57, change24h: 2.18, volume: "425.9K", category: "crypto" },
  { id: "trump-crypto-exec-order", symbol: "CRYPTO EO", question: "New crypto executive order by Jul?", lastPrice: 0.35, change24h: 12.50, volume: "89.6K", category: "macro" },
];

export function PredictTabModifier() {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const marketsRef = useRef<PredictMarketRow[]>(MOCK_MARKETS);
  const [loaded, setLoaded] = useState(true);
  const predictActiveRef = useRef(false);

  useEffect(() => {
    fetchMarkets("TRADING")
      .then((markets) => {
        if (markets.length > 0) {
          marketsRef.current = markets.map((m) => ({
            id: m.id,
            symbol: shortSymbol(m.question),
            question: m.question,
            lastPrice: 0.5,
            change24h: 0,
            volume: "0",
            category: m.category,
          }));
        }
        setLoaded(true);
      })
      .catch(() => {});
  }, []);

  const inject = useCallback(() => {
    const allTriggers = document.querySelectorAll<HTMLElement>(".oui-tab-trigger");
    const visitedContainers = new Set<HTMLElement>();

    for (const trigger of allTriggers) {
      const text = trigger.textContent?.trim() ?? "";
      const isAllTab =
        text === "All" ||
        trigger.getAttribute("data-testid") === "oui-testid-markets-all-tab";
      if (!isAllTab) continue;

      const container = trigger.parentElement;
      if (!container || visitedContainers.has(container)) continue;
      visitedContainers.add(container);

      if (container.querySelector(`.${PREDICT_TAB_CLASS}`)) {
        const predictTab = container.querySelector<HTMLElement>(`.${PREDICT_TAB_CLASS}`);
        if (predictTab) {
          const isActive = predictTab.getAttribute("data-state") === "active";
          if (!isActive && predictActiveRef.current) {
            restoreHiddenContent();
            predictActiveRef.current = false;
          }
        }
        continue;
      }

      const rwaTab = findRwaTab(container);
      const insertAfter = rwaTab ?? trigger;

      const predictTab = createTab(trigger, container);
      insertAfter.parentNode!.insertBefore(predictTab, insertAfter.nextSibling);
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  function createTab(template: HTMLElement, tabContainer: HTMLElement): HTMLElement {
    const tab = template.cloneNode(true) as HTMLElement;
    tab.classList.add(PREDICT_TAB_CLASS);
    tab.removeAttribute("data-testid");
    tab.removeAttribute("data-state");
    tab.setAttribute("data-state", "inactive");
    tab.removeAttribute("aria-selected");
    tab.innerHTML = "";

    const label = document.createElement("span");
    label.textContent = "Predict";
    tab.appendChild(label);

    const badge = document.createElement("span");
    badge.textContent = "New";
    Object.assign(badge.style, {
      fontSize: "9px", fontWeight: "700", lineHeight: "1",
      padding: "1px 4px", borderRadius: "4px", marginLeft: "4px",
      background: "linear-gradient(135deg, rgba(0,212,255,0.25), rgba(138,43,226,0.25))",
      color: "#00d4ff",
    });
    tab.appendChild(badge);
    tab.style.cursor = "pointer";

    tab.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const siblings = tabContainer.querySelectorAll<HTMLElement>(".oui-tab-trigger");
      for (const s of siblings) {
        s.setAttribute("data-state", "inactive");
        s.removeAttribute("aria-selected");
      }
      tab.setAttribute("data-state", "active");
      tab.setAttribute("aria-selected", "true");
      predictActiveRef.current = true;

      showPredictRows(tabContainer);
    });

    const otherTabs = tabContainer.querySelectorAll<HTMLElement>(".oui-tab-trigger");
    for (const ot of otherTabs) {
      if (ot.classList.contains(PREDICT_TAB_CLASS)) continue;
      ot.addEventListener("click", () => {
        tab.setAttribute("data-state", "inactive");
        tab.removeAttribute("aria-selected");
        if (predictActiveRef.current) {
          restoreHiddenContent();
          predictActiveRef.current = false;
        }
      });
    }

    return tab;
  }

  function restoreHiddenContent() {
    document.querySelectorAll<HTMLElement>(`[${PREDICT_HIDDEN_ATTR}]`).forEach((el) => {
      el.style.display = "";
      el.removeAttribute(PREDICT_HIDDEN_ATTR);
    });
    document.querySelectorAll<HTMLElement>(`.${PREDICT_ROWS_CLASS}`).forEach((el) => {
      el.style.display = "none";
    });
  }

  function showPredictRows(tabContainer: HTMLElement) {
    let panel: HTMLElement | null = tabContainer;
    for (let i = 0; i < 6 && panel; i++) {
      panel = panel.parentElement;
      if (!panel) break;
      const children = Array.from(panel.children) as HTMLElement[];
      const hasTabChild = children.some(
        (c) => c === tabContainer || c.contains(tabContainer),
      );
      if (hasTabChild && children.length >= 3) break;
    }
    if (!panel) return;

    const children = Array.from(panel.children) as HTMLElement[];
    let tabAncestorIdx = -1;
    for (let i = 0; i < children.length; i++) {
      if (children[i] === tabContainer || children[i].contains(tabContainer)) {
        tabAncestorIdx = i;
        break;
      }
    }
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.classList.contains(PREDICT_ROWS_CLASS)) continue;
      if (i <= tabAncestorIdx) continue;
      child.setAttribute(PREDICT_HIDDEN_ATTR, "true");
      child.style.display = "none";
    }

    let wrapper = panel.querySelector<HTMLElement>(`.${PREDICT_ROWS_CLASS}`);
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.classList.add(PREDICT_ROWS_CLASS);
      Object.assign(wrapper.style, { overflowY: "auto", flex: "1" });
      panel.appendChild(wrapper);
    }
    wrapper.style.display = "block";
    wrapper.innerHTML = "";

    const markets = marketsRef.current;

    if (markets.length === 0) {
      wrapper.innerHTML = `<div style="padding:32px 12px;text-align:center;color:rgba(255,255,255,0.36);font-size:12px;">
        No prediction markets available
      </div>`;
      return;
    }

    // Header row matching RWA style: Symbol | Last (0-1$) | 24h% | Volume
    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      padding: "8px 12px",
      fontSize: "11px",
      color: "rgba(255,255,255,0.36)",
      gap: "0",
    });
    header.innerHTML = `
      <span style="flex:1;min-width:0;padding-left:28px">Symbol</span>
      <span style="width:72px;text-align:right">Last</span>
      <span style="width:72px;text-align:right">24h%</span>
      <span style="width:72px;text-align:right">Volume</span>
    `;
    wrapper.appendChild(header);

    for (const m of markets) {
      const row = document.createElement("button");
      Object.assign(row.style, {
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "10px 12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        fontSize: "13px",
        color: "white",
        transition: "background 0.15s",
        gap: "0",
      });
      row.addEventListener("mouseenter", () => { row.style.background = "rgba(255,255,255,0.04)"; });
      row.addEventListener("mouseleave", () => { row.style.background = "transparent"; });

      // Star icon placeholder
      const star = document.createElement("span");
      Object.assign(star.style, {
        width: "16px",
        marginRight: "8px",
        color: "rgba(255,255,255,0.2)",
        fontSize: "12px",
        flexShrink: "0",
      });
      star.textContent = "☆";
      row.appendChild(star);

      // Symbol column
      const symbolCol = document.createElement("div");
      Object.assign(symbolCol.style, {
        flex: "1",
        minWidth: "0",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      });

      const dot = document.createElement("span");
      Object.assign(dot.style, {
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: m.lastPrice >= 0.5 ? "#29DFA9" : "#F5618B",
        flexShrink: "0",
      });
      symbolCol.appendChild(dot);

      const nameText = document.createElement("span");
      Object.assign(nameText.style, {
        fontWeight: "500",
        fontSize: "13px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      });
      nameText.textContent = m.symbol;
      symbolCol.appendChild(nameText);

      row.appendChild(symbolCol);

      // Last price column (0-1$)
      const lastCol = document.createElement("span");
      Object.assign(lastCol.style, {
        width: "72px",
        textAlign: "right",
        fontSize: "13px",
        fontWeight: "500",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        flexShrink: "0",
      });
      lastCol.textContent = m.lastPrice.toFixed(2);
      row.appendChild(lastCol);

      // 24h% column
      const changeCol = document.createElement("span");
      const isPositive = m.change24h >= 0;
      Object.assign(changeCol.style, {
        width: "72px",
        textAlign: "right",
        fontSize: "13px",
        fontWeight: "500",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        color: isPositive ? "#29DFA9" : "#F5618B",
        flexShrink: "0",
      });
      changeCol.textContent = `${isPositive ? "+" : ""}${m.change24h.toFixed(2)}%`;
      row.appendChild(changeCol);

      // Volume column
      const volCol = document.createElement("span");
      Object.assign(volCol.style, {
        width: "72px",
        textAlign: "right",
        fontSize: "13px",
        fontWeight: "500",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        flexShrink: "0",
      });
      volCol.textContent = m.volume;
      row.appendChild(volCol);

      row.addEventListener("click", () => {
        navigateRef.current(`/perp/PREDICT_${m.id}`);
      });

      wrapper.appendChild(row);
    }
  }

  usePollingEffect(inject, [inject]);

  return null;
}

function findRwaTab(container: HTMLElement): HTMLElement | null {
  const triggers = container.querySelectorAll<HTMLElement>(".oui-tab-trigger");
  for (const t of triggers) {
    if (t.textContent?.includes("RWA")) return t;
  }
  return null;
}

function shortSymbol(question: string): string {
  const match = question.match(/^(\w+)\s+above\s+\$?([\d,]+)/i);
  if (match) return `${match[1]} > ${match[2].replace(/,/g, "")}`;
  if (question.length <= 20) return question;
  return question.slice(0, 18) + "…";
}
