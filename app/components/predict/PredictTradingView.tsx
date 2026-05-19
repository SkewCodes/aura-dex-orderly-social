import { useState, useEffect, useCallback, useRef } from "react";
import { Text } from "@orderly.network/ui";
import { Clock } from "lucide-react";
import { useNavigate } from "@remix-run/react";
import { useOrderbookWs } from "@/predict/useOrderbookWs";
import { useOrderbookStore, useMarketStore } from "@/predict/stores";
import { fetchMarket, fetchMarkets } from "@/predict/api";
import type { Market } from "@/predict/types";
import { OrderbookPanel } from "./OrderbookPanel";
import { TradingPanel } from "./TradingPanel";
import { PriceChart } from "./PriceChart";
import { PositionsPanel } from "./PositionsPanel";
import { LastTradesPanel } from "./LastTradesPanel";

function formatCountdown(expiryAt: string): string {
  const diff = new Date(expiryAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days > 30) return `${Math.floor(days / 30)}mo`;
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  return `${hours}h ${mins}m`;
}

const MOCK_MARKETS: Record<string, Market> = {
  "btc-above-80k-may-25": { id: "btc-above-80k-may-25", question: "BTC above $80,000 on May 25?", category: "crypto", expiry_at: "2026-05-25T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "BTC", targetPrice: 80000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 142500, created_at: "2026-05-01T00:00:00Z" },
  "eth-above-4k-jun-01": { id: "eth-above-4k-jun-01", question: "ETH above $4,000 on Jun 1?", category: "crypto", expiry_at: "2026-06-01T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "ETH", targetPrice: 4000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 89300, created_at: "2026-05-01T00:00:00Z" },
  "btc-above-100k-jul-01": { id: "btc-above-100k-jul-01", question: "BTC above $100,000 by Jul 1?", category: "crypto", expiry_at: "2026-07-01T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "BTC", targetPrice: 100000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 312700, created_at: "2026-05-01T00:00:00Z" },
  "sol-above-200-jun-15": { id: "sol-above-200-jun-15", question: "SOL above $200 on Jun 15?", category: "crypto", expiry_at: "2026-06-15T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "SOL", targetPrice: 200 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 56200, created_at: "2026-05-01T00:00:00Z" },
  "fed-rate-cut-jun": { id: "fed-rate-cut-jun", question: "Fed rate cut in June 2026?", category: "macro", expiry_at: "2026-06-30T00:00:00Z", oracle_source: "Manual", resolution_condition: { type: "manual", description: "Fed announces rate cut" }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 203100, created_at: "2026-05-01T00:00:00Z" },
  "eth-etf-inflows-1b": { id: "eth-etf-inflows-1b", question: "ETH ETF inflows exceed $1B this week?", category: "crypto", expiry_at: "2026-05-25T00:00:00Z", oracle_source: "Manual", resolution_condition: { type: "manual", description: "ETH ETF weekly inflow > $1B" }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 67800, created_at: "2026-05-01T00:00:00Z" },
  "nasdaq-above-20k-jun": { id: "nasdaq-above-20k-jun", question: "Nasdaq above 20,000 by Jun 30?", category: "macro", expiry_at: "2026-06-30T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "NAS100", targetPrice: 20000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 178400, created_at: "2026-05-01T00:00:00Z" },
  "arb-above-2-jun": { id: "arb-above-2-jun", question: "ARB above $2.00 on Jun 1?", category: "protocol", expiry_at: "2026-06-01T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "ARB", targetPrice: 2 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 34100, created_at: "2026-05-01T00:00:00Z" },
  "btc-halving-effect": { id: "btc-halving-effect", question: "BTC +50% from halving price by Dec?", category: "crypto", expiry_at: "2026-12-31T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "BTC", targetPrice: 100000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 425900, created_at: "2026-05-01T00:00:00Z" },
  "trump-crypto-exec-order": { id: "trump-crypto-exec-order", question: "New crypto executive order by Jul?", category: "macro", expiry_at: "2026-07-31T00:00:00Z", oracle_source: "Manual", resolution_condition: { type: "manual", description: "New crypto executive order signed" }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 89600, created_at: "2026-05-01T00:00:00Z" },
};

interface Props {
  marketId: string;
}

export function PredictTradingView({ marketId }: Props) {
  const market = useMarketStore((s) => s.market);
  const setMarket = useMarketStore((s) => s.setMarket);
  const loading = useMarketStore((s) => s.loading);
  const setLoading = useMarketStore((s) => s.setLoading);
  const setError = useMarketStore((s) => s.setError);

  const bids = useOrderbookStore((s) => s.bids);
  const asks = useOrderbookStore((s) => s.asks);

  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [allMarkets, setAllMarkets] = useState<Market[]>([]);
  const selectorRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useOrderbookWs(marketId);

  useEffect(() => {
    fetchMarkets("TRADING")
      .then((m) => setAllMarkets(m.length > 0 ? m : Object.values(MOCK_MARKETS)))
      .catch(() => setAllMarkets(Object.values(MOCK_MARKETS)));
  }, []);

  useEffect(() => {
    if (!selectorOpen) return;
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) setSelectorOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectorOpen]);

  useEffect(() => {
    if (!marketId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMarket(marketId)
      .then((m) => { if (!cancelled) setMarket(m); })
      .catch(() => {
        if (!cancelled) {
          const mock = MOCK_MARKETS[marketId];
          if (mock) {
            setMarket(mock);
          } else {
            setMarket({
              id: marketId,
              question: marketId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
              category: "other",
              expiry_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
              oracle_source: "Manual",
              resolution_condition: { type: "manual", description: "TBD" },
              status: "TRADING",
              outcome: null,
              contract_address: null,
              collateral_pool: 0,
              created_at: new Date().toISOString(),
            });
          }
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [marketId, setMarket, setLoading, setError]);

  useEffect(() => { return () => { setMarket(null); }; }, [setMarket]);

  const handlePriceClick = useCallback((priceBps: number) => {
    setSelectedPrice(priceBps);
  }, []);

  if (loading || !market) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 48px - 29px)" }} className="oui-bg-base-10">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div className="oui-w-8 oui-h-8 oui-border-2 oui-border-line-12 oui-border-t-primary oui-rounded-full oui-animate-spin" />
          <Text size="sm" intensity={36}>Loading market...</Text>
        </div>
      </div>
    );
  }

  const bestBid = bids[0]?.priceBps ?? null;
  const bestAsk = asks[asks.length - 1]?.priceBps ?? null;
  const yesPrice =
    bestBid != null && bestAsk != null
      ? Math.round((bestBid + bestAsk) / 2)
      : bestBid ?? bestAsk ?? null;
  const noPrice = yesPrice != null ? 100 - yesPrice : null;
  const volume = (market.collateral_pool / 1000).toFixed(2) + "K";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 48px - 29px)",
        width: "100%",
        padding: 8,
        gap: 8,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
      className="oui-bg-base-10"
    >
      {/* Row 1: Symbol info bar + Risk rate */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {/* Symbol bar - takes remaining width */}
        <div
          style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, padding: "0 16px", minHeight: 48, borderRadius: 16 }}
          className="oui-bg-base-9"
        >
          <div ref={selectorRef} style={{ position: "relative", flexShrink: 0 }}>
            <div
              onClick={() => setSelectorOpen((o) => !o)}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
            >
              <span className="oui-text-sm oui-font-bold oui-text-primary" style={{ whiteSpace: "nowrap" }}>
                {market.question}
              </span>
              <svg width="8" height="5" viewBox="0 0 8 5" className="oui-fill-base-contrast-36" style={{ transform: selectorOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M4 5L0 0h8L4 5z" /></svg>
            </div>
            {selectorOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: 380, maxHeight: 320, overflowY: "auto", borderRadius: 12, padding: 4, zIndex: 50 }} className="oui-bg-base-8 oui-border oui-border-line-12 oui-shadow-lg oui-hide-scrollbar">
                {allMarkets.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectorOpen(false); navigate(`/perp/PREDICT_${m.id}`); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 12px", border: "none", borderRadius: 8, cursor: "pointer", textAlign: "left" }}
                    className={m.id === marketId ? "oui-bg-base-7" : "oui-bg-transparent hover:oui-bg-base-7"}
                  >
                    <span className="oui-text-xs oui-text-base-contrast-98" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.question}</span>
                    <span className="oui-text-xs oui-text-base-contrast-54 oui-font-mono oui-ml-3 oui-flex-shrink-0">{formatCountdown(m.expiry_at)}</span>
                  </button>
                ))}
                {allMarkets.length === 0 && (
                  <div style={{ padding: "12px", textAlign: "center" }}>
                    <span className="oui-text-xs oui-text-base-contrast-36">No markets available</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="oui-text-lg oui-font-bold oui-font-mono oui-tabular-nums oui-text-base-contrast-98" style={{ flexShrink: 0 }}>
            {yesPrice != null ? `${yesPrice}¢` : "—"}
          </span>

          <div style={{ width: 1, height: 24, flexShrink: 0 }} className="oui-bg-line-12" />

          <StatCol label="24h change" value={<span className="oui-text-trade-profit">+0.00/+0.00%</span>} />
          <StatCol label="Yes" value={<span className="oui-text-trade-profit oui-font-bold">{yesPrice != null ? `${yesPrice}¢` : "—"}</span>} />
          <StatCol label="No" value={<span className="oui-text-trade-loss oui-font-bold">{noPrice != null ? `${noPrice}¢` : "—"}</span>} />
          <StatCol label="24h volume" value={<span className="oui-text-base-contrast-80">{volume}</span>} />
          <StatCol label="Expires" value={
            <span className="oui-text-base-contrast-80" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={10} className="oui-text-base-contrast-36" />
              {formatCountdown(market.expiry_at)}
            </span>
          } />

          <div style={{ flex: 1 }} />

          <span className="oui-text-2xs oui-text-base-contrast-36">▸</span>
          <div
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 8, cursor: "pointer" }}
            className="oui-bg-base-8 hover:oui-bg-base-7 oui-transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="oui-text-base-contrast-54"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            <span className="oui-text-xs oui-text-base-contrast-98">Layout</span>
          </div>
        </div>

        {/* Risk rate - fixed width to match order entry below */}
        <div
          style={{ width: 280, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderRadius: 16 }}
          className="oui-bg-base-9"
        >
          <span className="oui-text-xs oui-text-base-contrast-54">Risk rate</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 100, height: 4, borderRadius: 2 }} className="oui-bg-trade-profit" />
            <span className="oui-text-xs oui-text-base-contrast-36">--</span>
          </div>
        </div>
      </div>

      {/* Row 2: Chart + Orderbook/Trades + Order entry */}
      <div style={{ display: "flex", gap: 8, flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left: Chart above, Orderbook + Trades below */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
          {/* Chart */}
          <div style={{ flex: "5 1 0", minHeight: 180, borderRadius: 16, overflow: "hidden", position: "relative" }} className="oui-bg-base-9">
            <PriceChart marketId={market.id} />
          </div>

          {/* Orderbook + Last trades */}
          <div style={{ display: "flex", gap: 8, flex: "6 1 0", minHeight: 240 }}>
            <div style={{ flex: 1, minWidth: 0, borderRadius: 16, overflow: "hidden" }} className="oui-bg-base-9">
              <OrderbookPanel onPriceClick={handlePriceClick} />
            </div>
            <div style={{ flex: 1, minWidth: 0, borderRadius: 16, overflow: "hidden" }} className="oui-bg-base-9">
              <LastTradesPanel />
            </div>
          </div>
        </div>

        {/* Right: Order entry (280px fixed) */}
        <div style={{ width: 280, flexShrink: 0, borderRadius: 16, overflow: "hidden", overflowY: "auto" }} className="oui-bg-base-9 oui-hide-scrollbar">
          <TradingPanel market={market} initialPrice={selectedPrice} />
        </div>
      </div>

      {/* Row 3: Positions */}
      <div style={{ height: 100, flexShrink: 0, borderRadius: 16, overflow: "hidden", padding: 8 }} className="oui-bg-base-9">
        <PositionsPanel marketId={market.id} />
      </div>
    </div>
  );
}

function StatCol({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <span className="oui-text-2xs oui-text-base-contrast-36" style={{ lineHeight: 1.2 }}>{label}</span>
      <span className="oui-text-xs oui-font-mono oui-tabular-nums" style={{ lineHeight: 1.2 }}>{value}</span>
    </div>
  );
}
