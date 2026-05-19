import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@remix-run/react";
import { Flex, Text, cn } from "@orderly.network/ui";
import { fetchMarkets } from "@/predict/api";
import type { Market } from "@/predict/types";

const MOCK_MARKETS: Market[] = [
  { id: "btc-above-80k-may-25", question: "BTC above $80,000 on May 25?", category: "crypto", expiry_at: "2026-05-25T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "BTC", targetPrice: 80000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 142500, created_at: "2026-05-01T00:00:00Z" },
  { id: "eth-above-4k-jun-01", question: "ETH above $4,000 on Jun 1?", category: "crypto", expiry_at: "2026-06-01T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "ETH", targetPrice: 4000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 89300, created_at: "2026-05-01T00:00:00Z" },
  { id: "btc-above-100k-jul-01", question: "BTC above $100,000 by Jul 1?", category: "crypto", expiry_at: "2026-07-01T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "BTC", targetPrice: 100000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 312700, created_at: "2026-05-01T00:00:00Z" },
  { id: "sol-above-200-jun-15", question: "SOL above $200 on Jun 15?", category: "crypto", expiry_at: "2026-06-15T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "SOL", targetPrice: 200 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 56200, created_at: "2026-05-01T00:00:00Z" },
  { id: "fed-rate-cut-jun", question: "Fed rate cut in June 2026?", category: "macro", expiry_at: "2026-06-30T00:00:00Z", oracle_source: "Manual", resolution_condition: { type: "manual", description: "Fed announces rate cut" }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 203100, created_at: "2026-05-01T00:00:00Z" },
  { id: "eth-etf-inflows-1b", question: "ETH ETF inflows exceed $1B this week?", category: "crypto", expiry_at: "2026-05-25T00:00:00Z", oracle_source: "Manual", resolution_condition: { type: "manual", description: "ETH ETF weekly inflow > $1B" }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 67800, created_at: "2026-05-01T00:00:00Z" },
  { id: "nasdaq-above-20k-jun", question: "Nasdaq above 20,000 by Jun 30?", category: "macro", expiry_at: "2026-06-30T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "NAS100", targetPrice: 20000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 178400, created_at: "2026-05-01T00:00:00Z" },
  { id: "arb-above-2-jun", question: "ARB above $2.00 on Jun 1?", category: "protocol", expiry_at: "2026-06-01T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "ARB", targetPrice: 2 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 34100, created_at: "2026-05-01T00:00:00Z" },
  { id: "btc-halving-effect", question: "BTC +50% from halving price by Dec?", category: "crypto", expiry_at: "2026-12-31T00:00:00Z", oracle_source: "Pyth", resolution_condition: { type: "price_above", asset: "BTC", targetPrice: 100000 }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 425900, created_at: "2026-05-01T00:00:00Z" },
  { id: "trump-crypto-exec-order", question: "New crypto executive order by Jul?", category: "macro", expiry_at: "2026-07-31T00:00:00Z", oracle_source: "Manual", resolution_condition: { type: "manual", description: "New crypto executive order signed" }, status: "TRADING", outcome: null, contract_address: null, collateral_pool: 89600, created_at: "2026-05-01T00:00:00Z" },
];

const CATEGORIES = ["All", "Crypto", "Macro", "Protocol"] as const;

function formatExpiry(expiryAt: string): string {
  const diff = new Date(expiryAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  if (days > 30) return `${Math.floor(days / 30)}mo`;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function mockYesPrice(market: Market): number {
  let hash = 0;
  for (let i = 0; i < market.id.length; i++) hash = (hash * 31 + market.id.charCodeAt(i)) & 0x7fffffff;
  return 20 + (hash % 60);
}

export default function PredictIndexPage() {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMarkets("TRADING")
      .then((m) => setMarkets(m.length > 0 ? m : MOCK_MARKETS))
      .catch(() => setMarkets(MOCK_MARKETS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = markets;
    if (category !== "All") list = list.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.question.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
    }
    return list;
  }, [markets, category, search]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Text size="xl" weight="bold" className="oui-text-base-contrast-98">
          Prediction Markets
        </Text>
        <Text size="sm" intensity={36} className="oui-mt-1 oui-block">
          Trade on the outcome of real-world events
        </Text>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "oui-h-[32px] oui-px-4 oui-text-xs oui-font-medium oui-rounded-lg oui-border-0 oui-cursor-pointer oui-transition-colors",
                category === cat
                  ? "oui-bg-primary oui-text-white"
                  : "oui-bg-base-8 oui-text-base-contrast-54 hover:oui-text-base-contrast-80 hover:oui-bg-base-7",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ position: "relative", width: 280 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} className="oui-text-base-contrast-36">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", height: 32, paddingLeft: 32, paddingRight: 12, borderRadius: 8, border: "none", outline: "none", fontSize: 13 }}
            className="oui-bg-base-8 oui-text-base-contrast-98 oui-placeholder-base-contrast-20"
          />
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 100px 100px 80px", gap: 8, padding: "0 16px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-medium">Market</span>
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-medium oui-text-right">Yes</span>
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-medium oui-text-right">No</span>
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-medium oui-text-right">Volume</span>
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-medium oui-text-right">Expires</span>
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-medium oui-text-right">Status</span>
      </div>

      {/* Loading */}
      {loading && (
        <Flex itemAlign="center" justify="center" style={{ padding: 60 }}>
          <div className="oui-w-6 oui-h-6 oui-border-2 oui-border-line-12 oui-border-t-primary oui-rounded-full oui-animate-spin" />
        </Flex>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <Flex direction="column" itemAlign="center" justify="center" style={{ padding: 60 }} gap={2}>
          <Text size="sm" intensity={36}>No markets found</Text>
          {search && (
            <button onClick={() => setSearch("")} className="oui-text-xs oui-text-primary oui-border-0 oui-bg-transparent oui-cursor-pointer">
              Clear search
            </button>
          )}
        </Flex>
      )}

      {/* Market rows */}
      {filtered.map((market) => {
        const yes = mockYesPrice(market);
        const no = 100 - yes;
        const volume = (market.collateral_pool / 1000).toFixed(1) + "K";
        const categoryColor = market.category === "crypto" ? "oui-text-primary" : market.category === "macro" ? "oui-text-warning" : "oui-text-trade-profit";

        return (
          <button
            key={market.id}
            onClick={() => navigate(`/perp/PREDICT_${market.id}`)}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 100px 100px 100px 80px",
              gap: 8,
              padding: "12px 16px",
              width: "100%",
              border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            className="oui-bg-transparent hover:oui-bg-base-9"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span className="oui-text-sm oui-text-base-contrast-98 oui-font-medium" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {market.question}
              </span>
              <span className={cn("oui-text-2xs oui-font-medium", categoryColor)} style={{ textTransform: "capitalize" }}>
                {market.category}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span className="oui-text-sm oui-font-mono oui-tabular-nums oui-text-trade-profit oui-font-semibold">{yes}¢</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span className="oui-text-sm oui-font-mono oui-tabular-nums oui-text-trade-loss oui-font-semibold">{no}¢</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span className="oui-text-sm oui-font-mono oui-tabular-nums oui-text-base-contrast-80">{volume}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span className="oui-text-xs oui-text-base-contrast-54">{formatExpiry(market.expiry_at)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <span className="oui-text-2xs oui-px-2 oui-py-0.5 oui-rounded oui-bg-trade-profit/10 oui-text-trade-profit oui-font-medium">
                Live
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
