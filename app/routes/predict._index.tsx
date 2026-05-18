import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ChevronDown,
  Clock,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  BarChart3,
  Globe,
  Cpu,
  DollarSign,
  Trophy,
  X,
} from "lucide-react";

type MarketCategory = "Crypto" | "Sports" | "Politics" | "Tech" | "Economics";
type OrderType = "LIMIT" | "MARKET";

interface Market {
  id: string;
  question: string;
  shortName: string;
  category: MarketCategory;
  expiryAt: string;
  yesPrice: number;
  noPrice: number;
  volume24h: number;
  totalVolume: number;
  priceHistory: number[];
}

interface OrderbookLevel {
  price: number;
  quantity: number;
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

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

const CATEGORY_COLORS: Record<MarketCategory, string> = {
  Crypto: "#F7931A",
  Sports: "#00E676",
  Politics: "#2196F3",
  Tech: "#9C27B0",
  Economics: "#FF9800",
};

function generatePriceHistory(basePrice: number): number[] {
  const points: number[] = [];
  let p = basePrice - 15 + Math.random() * 10;
  for (let i = 0; i < 60; i++) {
    p += (Math.random() - 0.48) * 3;
    p = Math.max(2, Math.min(98, p));
    points.push(Math.round(p * 10) / 10);
  }
  points.push(basePrice);
  return points;
}

const MOCK_MARKETS: Market[] = [
  {
    id: "m1",
    question: "Will BTC exceed $150,000 by end of Q3 2026?",
    shortName: "BTC > $150K",
    category: "Crypto",
    expiryAt: "2026-09-30T23:59:59Z",
    yesPrice: 62,
    noPrice: 38,
    volume24h: 245_000,
    totalVolume: 3_420_000,
    priceHistory: generatePriceHistory(62),
  },
  {
    id: "m2",
    question: "Will ETH flip BTC market cap before 2027?",
    shortName: "ETH Flippening",
    category: "Crypto",
    expiryAt: "2026-12-31T23:59:59Z",
    yesPrice: 8,
    noPrice: 92,
    volume24h: 128_000,
    totalVolume: 1_850_000,
    priceHistory: generatePriceHistory(8),
  },
  {
    id: "m3",
    question: "Will the US pass stablecoin legislation in 2026?",
    shortName: "US Stablecoin Bill",
    category: "Politics",
    expiryAt: "2026-12-31T23:59:59Z",
    yesPrice: 74,
    noPrice: 26,
    volume24h: 89_000,
    totalVolume: 2_100_000,
    priceHistory: generatePriceHistory(74),
  },
  {
    id: "m4",
    question: "Will SOL reach $500 before July 2026?",
    shortName: "SOL > $500",
    category: "Crypto",
    expiryAt: "2026-07-01T00:00:00Z",
    yesPrice: 23,
    noPrice: 77,
    volume24h: 167_000,
    totalVolume: 980_000,
    priceHistory: generatePriceHistory(23),
  },
  {
    id: "m5",
    question: "Will Apple announce an AI-native device at WWDC 2026?",
    shortName: "Apple AI Device",
    category: "Tech",
    expiryAt: "2026-06-15T00:00:00Z",
    yesPrice: 55,
    noPrice: 45,
    volume24h: 52_000,
    totalVolume: 420_000,
    priceHistory: generatePriceHistory(55),
  },
  {
    id: "m6",
    question: "Will Fed cut rates below 3% by end of 2026?",
    shortName: "Fed < 3%",
    category: "Economics",
    expiryAt: "2026-12-31T23:59:59Z",
    yesPrice: 41,
    noPrice: 59,
    volume24h: 73_000,
    totalVolume: 1_560_000,
    priceHistory: generatePriceHistory(41),
  },
];

function generateMockOrderbook(yesPrice: number): {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
} {
  const bids: OrderbookLevel[] = [];
  const asks: OrderbookLevel[] = [];
  for (let i = 0; i < 10; i++) {
    const bidPrice = Math.max(1, yesPrice - i - 1);
    const askPrice = Math.min(99, yesPrice + i + 1);
    bids.push({
      price: bidPrice,
      quantity: Math.floor(500 + Math.random() * 8000),
    });
    asks.push({
      price: askPrice,
      quantity: Math.floor(500 + Math.random() * 8000),
    });
  }
  return { bids, asks: asks.reverse() };
}

// ============================================================================
// Probability Chart (Canvas)
// ============================================================================

function ProbabilityChart({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 50, bottom: 30, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    // Grid lines and y-axis labels
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    for (let pct = 0; pct <= 100; pct += 25) {
      const y = padding.top + chartH - (pct / 100) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${pct}%`, w - padding.right + 30, y + 3);
    }

    // Price line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, color + "30");
    gradient.addColorStop(1, "transparent");

    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - (val / 100) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill area under line
    const lastX = padding.left + chartW;
    const lastY = padding.top + chartH - (data[data.length - 1] / 100) * chartH;
    ctx.lineTo(lastX, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Current price dot
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Current price label
    ctx.fillStyle = color;
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${data[data.length - 1]}%`, lastX + 8, lastY + 4);
  }, [data, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ============================================================================
// Market Selector Dropdown
// ============================================================================

function MarketSelector({
  markets,
  selected,
  onSelect,
}: {
  markets: Market[];
  selected: Market;
  onSelect: (m: Market) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"All" | MarketCategory>("All");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    let list = markets;
    if (catFilter !== "All") list = list.filter((m) => m.category === catFilter);
    if (search.trim())
      list = list.filter(
        (m) =>
          m.shortName.toLowerCase().includes(search.toLowerCase()) ||
          m.question.toLowerCase().includes(search.toLowerCase()),
      );
    return list;
  }, [markets, catFilter, search]);

  return (
    <div ref={ref} className="oui-relative">
      <button
        onClick={() => setOpen(!open)}
        className="oui-flex oui-items-center oui-gap-2 oui-px-3 oui-py-2 hover:oui-bg-base-8 oui-rounded-lg oui-transition-colors"
      >
        <span
          className="oui-w-2 oui-h-2 oui-rounded-full"
          style={{ backgroundColor: CATEGORY_COLORS[selected.category] }}
        />
        <span className="oui-text-sm oui-font-bold oui-text-white">
          {selected.shortName}
        </span>
        <ChevronDown
          className={cn(
            "oui-w-4 oui-h-4 oui-text-base-contrast-36 oui-transition-transform",
            open && "oui-rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="oui-absolute oui-top-full oui-left-0 oui-mt-1 oui-z-50 oui-w-[420px] oui-bg-[#131722] oui-border oui-border-line oui-rounded-xl oui-shadow-2xl oui-overflow-hidden">
          {/* Search */}
          <div className="oui-p-3 oui-border-b oui-border-line">
            <div className="oui-flex oui-items-center oui-gap-2 oui-px-3 oui-py-2 oui-bg-base-7 oui-rounded-lg">
              <Search className="oui-w-4 oui-h-4 oui-text-base-contrast-36" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search market"
                className="oui-flex-1 oui-bg-transparent oui-text-sm oui-text-white oui-placeholder-base-contrast-20 focus:oui-outline-none"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="oui-w-3 oui-h-3 oui-text-base-contrast-36" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="oui-flex oui-items-center oui-gap-1 oui-px-3 oui-pt-2 oui-pb-1 oui-overflow-x-auto">
            {(["All", "Crypto", "Politics", "Tech", "Economics", "Sports"] as const).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={cn(
                    "oui-px-3 oui-py-1 oui-text-xs oui-font-medium oui-rounded-md oui-whitespace-nowrap oui-transition-colors",
                    catFilter === cat
                      ? "oui-bg-base-6 oui-text-white"
                      : "oui-text-base-contrast-36 hover:oui-text-white",
                  )}
                >
                  {cat}
                </button>
              ),
            )}
          </div>

          {/* Column Headers */}
          <div className="oui-flex oui-items-center oui-px-4 oui-py-2 oui-text-[10px] oui-text-base-contrast-36 oui-uppercase oui-tracking-wider oui-border-b oui-border-line">
            <span className="oui-flex-1">Market</span>
            <span className="oui-w-16 oui-text-right">YES</span>
            <span className="oui-w-20 oui-text-right">Volume</span>
          </div>

          {/* Market List */}
          <div className="oui-max-h-[360px] oui-overflow-y-auto">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onSelect(m);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "oui-w-full oui-flex oui-items-center oui-px-4 oui-py-2.5 hover:oui-bg-base-8 oui-transition-colors oui-text-left",
                  m.id === selected.id && "oui-bg-base-8",
                )}
              >
                <div className="oui-flex-1 oui-min-w-0">
                  <div className="oui-flex oui-items-center oui-gap-2">
                    <span
                      className="oui-w-1.5 oui-h-1.5 oui-rounded-full oui-flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[m.category] }}
                    />
                    <span className="oui-text-sm oui-font-medium oui-text-white oui-truncate">
                      {m.shortName}
                    </span>
                    <span
                      className="oui-text-[9px] oui-font-bold oui-px-1 oui-rounded oui-flex-shrink-0"
                      style={{
                        backgroundColor: CATEGORY_COLORS[m.category] + "20",
                        color: CATEGORY_COLORS[m.category],
                      }}
                    >
                      {m.category}
                    </span>
                  </div>
                  <div className="oui-text-[10px] oui-text-base-contrast-36 oui-truncate oui-mt-0.5 oui-pl-3.5">
                    {m.question}
                  </div>
                </div>
                <span
                  className={cn(
                    "oui-w-16 oui-text-right oui-text-sm oui-font-bold oui-tabular-nums",
                    m.yesPrice >= 50 ? "oui-text-[#29DFA9]" : "oui-text-[#F5618B]",
                  )}
                >
                  {m.yesPrice}¢
                </span>
                <span className="oui-w-20 oui-text-right oui-text-xs oui-text-base-contrast-54 oui-tabular-nums">
                  {formatNumber(m.volume24h)}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="oui-py-8 oui-text-center oui-text-sm oui-text-base-contrast-36">
                No markets found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Orderbook
// ============================================================================

function Orderbook({
  orderbook,
  yesPrice,
}: {
  orderbook: { bids: OrderbookLevel[]; asks: OrderbookLevel[] };
  yesPrice: number;
}) {
  const maxQty = Math.max(
    ...orderbook.asks.map((l) => l.quantity),
    ...orderbook.bids.map((l) => l.quantity),
  );

  return (
    <div className="oui-flex oui-flex-col oui-h-full">
      <div className="oui-flex oui-items-center oui-justify-between oui-px-3 oui-py-2 oui-border-b oui-border-line">
        <span className="oui-text-xs oui-font-semibold oui-text-white">Order Book</span>
      </div>

      <div className="oui-flex oui-items-center oui-justify-between oui-px-3 oui-py-1.5 oui-text-[10px] oui-text-base-contrast-36 oui-uppercase oui-tracking-wider">
        <span>Price(¢)</span>
        <span>Qty(USDC)</span>
      </div>

      <div className="oui-flex-1 oui-overflow-hidden oui-flex oui-flex-col">
        {/* Asks */}
        <div className="oui-flex-1 oui-flex oui-flex-col oui-justify-end oui-overflow-hidden">
          {orderbook.asks.map((level, i) => {
            const pct = (level.quantity / maxQty) * 100;
            return (
              <div
                key={`a-${i}`}
                className="oui-relative oui-flex oui-items-center oui-justify-between oui-px-3 oui-py-[3px] oui-text-xs"
              >
                <div
                  className="oui-absolute oui-inset-y-0 oui-right-0 oui-bg-[#F5618B]/8"
                  style={{ width: `${pct}%` }}
                />
                <span className="oui-relative oui-text-[#F5618B] oui-font-mono oui-tabular-nums">
                  {level.price}
                </span>
                <span className="oui-relative oui-text-base-contrast-54 oui-font-mono oui-tabular-nums">
                  {level.quantity.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spread */}
        <div className="oui-flex oui-items-center oui-justify-between oui-px-3 oui-py-1.5 oui-border-y oui-border-line">
          <span className="oui-text-sm oui-font-bold oui-text-white oui-tabular-nums">
            {yesPrice}¢
          </span>
          <span className="oui-text-[10px] oui-text-base-contrast-36">
            Spread: {orderbook.asks[orderbook.asks.length - 1].price - orderbook.bids[0].price}¢
          </span>
        </div>

        {/* Bids */}
        <div className="oui-flex-1 oui-overflow-hidden">
          {orderbook.bids.map((level, i) => {
            const pct = (level.quantity / maxQty) * 100;
            return (
              <div
                key={`b-${i}`}
                className="oui-relative oui-flex oui-items-center oui-justify-between oui-px-3 oui-py-[3px] oui-text-xs"
              >
                <div
                  className="oui-absolute oui-inset-y-0 oui-right-0 oui-bg-[#29DFA9]/8"
                  style={{ width: `${pct}%` }}
                />
                <span className="oui-relative oui-text-[#29DFA9] oui-font-mono oui-tabular-nums">
                  {level.price}
                </span>
                <span className="oui-relative oui-text-base-contrast-54 oui-font-mono oui-tabular-nums">
                  {level.quantity.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Trading Panel
// ============================================================================

function TradingPanel({ market }: { market: Market }) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [orderType, setOrderType] = useState<OrderType>("LIMIT");
  const [price, setPrice] = useState(market.yesPrice);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setPrice(market.yesPrice);
    setSide("YES");
    setAmount("");
  }, [market.id]);

  const parsedAmount = Number(amount) || 0;
  const effectivePrice = price;
  const cost = orderType === "LIMIT" ? (parsedAmount * effectivePrice) / 100 : parsedAmount;
  const potentialProfit = orderType === "LIMIT" ? parsedAmount - cost : 0;

  return (
    <div className="oui-flex oui-flex-col oui-h-full">
      {/* Connect Wallet prompt */}
      <div className="oui-px-3 oui-py-3 oui-border-b oui-border-line oui-text-center">
        <p className="oui-text-xs oui-text-base-contrast-54 oui-mb-2">
          Connect wallet to trade
        </p>
        <button className="oui-w-full oui-py-2 oui-text-sm oui-font-semibold oui-text-white oui-bg-[#00d4ff] oui-rounded-lg hover:oui-opacity-90 oui-transition-opacity">
          Connect wallet
        </button>
      </div>

      {/* Side Toggle — Higher / Lower */}
      <div className="oui-flex oui-border-b oui-border-line">
        <button
          onClick={() => {
            setSide("YES");
            setPrice(market.yesPrice);
          }}
          className={cn(
            "oui-flex-1 oui-py-2.5 oui-text-sm oui-font-bold oui-transition-colors oui-text-center",
            side === "YES"
              ? "oui-text-[#29DFA9] oui-border-b-2"
              : "oui-text-base-contrast-36 hover:oui-text-white",
          )}
          style={side === "YES" ? { borderColor: "#29DFA9" } : undefined}
        >
          Higher
        </button>
        <button
          onClick={() => {
            setSide("NO");
            setPrice(market.noPrice);
          }}
          className={cn(
            "oui-flex-1 oui-py-2.5 oui-text-sm oui-font-bold oui-transition-colors oui-text-center",
            side === "NO"
              ? "oui-text-[#F5618B] oui-border-b-2"
              : "oui-text-base-contrast-36 hover:oui-text-white",
          )}
          style={side === "NO" ? { borderColor: "#F5618B" } : undefined}
        >
          Lower
        </button>
      </div>

      <div className="oui-flex-1 oui-overflow-y-auto oui-px-3 oui-py-3 oui-space-y-3">
        {/* Order Type */}
        <div className="oui-flex oui-items-center oui-gap-1 oui-border-b oui-border-line oui-pb-3">
          <button
            onClick={() => setOrderType("LIMIT")}
            className={cn(
              "oui-px-3 oui-py-1 oui-text-xs oui-font-medium oui-rounded oui-transition-colors",
              orderType === "LIMIT"
                ? "oui-bg-base-6 oui-text-white"
                : "oui-text-base-contrast-36 hover:oui-text-white",
            )}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType("MARKET")}
            className={cn(
              "oui-px-3 oui-py-1 oui-text-xs oui-font-medium oui-rounded oui-transition-colors",
              orderType === "MARKET"
                ? "oui-bg-base-6 oui-text-white"
                : "oui-text-base-contrast-36 hover:oui-text-white",
            )}
          >
            Market
          </button>
        </div>

        {/* Price */}
        {orderType === "LIMIT" && (
          <div>
            <div className="oui-flex oui-items-center oui-justify-between oui-mb-1">
              <label className="oui-text-xs oui-text-base-contrast-54">Price</label>
              <span className="oui-text-[10px] oui-text-base-contrast-36">
                Implied: {effectivePrice}%
              </span>
            </div>
            <div className="oui-flex oui-items-center oui-gap-1">
              <button
                onClick={() => setPrice((p) => Math.max(1, p - 1))}
                className="oui-w-8 oui-h-8 oui-flex oui-items-center oui-justify-center oui-bg-base-7 oui-border oui-border-line oui-rounded oui-text-white oui-text-sm hover:oui-bg-base-6"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={99}
                value={price}
                onChange={(e) =>
                  setPrice(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
                }
                className="oui-flex-1 oui-h-8 oui-px-2 oui-bg-base-7 oui-border oui-border-line oui-rounded oui-text-center oui-text-sm oui-font-mono oui-text-white focus:oui-border-[#00d4ff] focus:oui-outline-none"
              />
              <button
                onClick={() => setPrice((p) => Math.min(99, p + 1))}
                className="oui-w-8 oui-h-8 oui-flex oui-items-center oui-justify-center oui-bg-base-7 oui-border oui-border-line oui-rounded oui-text-white oui-text-sm hover:oui-bg-base-6"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <div className="oui-flex oui-items-center oui-justify-between oui-mb-1">
            <label className="oui-text-xs oui-text-base-contrast-54">
              Amount
            </label>
            <span className="oui-text-[10px] oui-text-base-contrast-36">
              Avail: 0.00 USDC
            </span>
          </div>
          <div className="oui-relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="oui-w-full oui-h-8 oui-px-2 oui-pr-14 oui-bg-base-7 oui-border oui-border-line oui-rounded oui-text-sm oui-font-mono oui-text-white oui-placeholder-base-contrast-20 focus:oui-border-[#00d4ff] focus:oui-outline-none"
            />
            <span className="oui-absolute oui-right-2 oui-top-1/2 -oui-translate-y-1/2 oui-text-[10px] oui-text-base-contrast-36">
              USDC
            </span>
          </div>
          <div className="oui-flex oui-gap-1.5 oui-mt-1.5">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                className="oui-flex-1 oui-py-1 oui-text-[10px] oui-text-base-contrast-54 oui-bg-base-7 oui-rounded oui-border oui-border-line hover:oui-border-[#00d4ff]/40 oui-transition-colors"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        {parsedAmount > 0 && orderType === "LIMIT" && (
          <div className="oui-bg-base-7 oui-rounded-lg oui-p-2.5 oui-space-y-1.5 oui-text-xs">
            <div className="oui-flex oui-justify-between">
              <span className="oui-text-base-contrast-54">Est. cost</span>
              <span className="oui-text-white oui-font-mono">{cost.toFixed(2)} USDC</span>
            </div>
            <div className="oui-flex oui-justify-between">
              <span className="oui-text-base-contrast-54">Potential profit</span>
              <span className="oui-text-[#29DFA9] oui-font-mono">
                +{potentialProfit.toFixed(2)} USDC
              </span>
            </div>
            <div className="oui-flex oui-justify-between">
              <span className="oui-text-base-contrast-54">Max return</span>
              <span className="oui-text-[#29DFA9] oui-font-mono">
                {cost > 0 ? `+${((potentialProfit / cost) * 100).toFixed(1)}%` : "—"}
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          className={cn(
            "oui-w-full oui-py-2.5 oui-text-sm oui-font-bold oui-rounded-lg oui-transition-all",
            side === "YES"
              ? "oui-bg-[#29DFA9] hover:oui-bg-[#29DFA9]/90 oui-text-black"
              : "oui-bg-[#F5618B] hover:oui-bg-[#F5618B]/90 oui-text-white",
          )}
        >
          {side === "YES" ? "Buy Higher" : "Buy Lower"}
          {orderType === "LIMIT" ? ` — ${effectivePrice}¢` : " — Market"}
        </button>

        <p className="oui-text-[10px] oui-text-base-contrast-36 oui-text-center">
          0.5% trading fee applies
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function PredictIndexPage() {
  const [selectedMarketId, setSelectedMarketId] = useState(MOCK_MARKETS[0].id);

  const selectedMarket = useMemo(
    () => MOCK_MARKETS.find((m) => m.id === selectedMarketId) ?? MOCK_MARKETS[0],
    [selectedMarketId],
  );

  const orderbook = useMemo(
    () => generateMockOrderbook(selectedMarket.yesPrice),
    [selectedMarket],
  );

  const chartColor = selectedMarket.yesPrice >= 50 ? "#29DFA9" : "#F5618B";
  const change24h = selectedMarket.yesPrice - selectedMarket.priceHistory[0];
  const changePct = ((change24h / selectedMarket.priceHistory[0]) * 100).toFixed(2);

  return (
    <div
      className="oui-flex oui-flex-col"
      style={{ height: "calc(100vh - 49px)" }}
    >
      {/* Top Bar — Market Selector + Price Info */}
      <div className="oui-flex oui-items-center oui-gap-4 oui-px-3 oui-py-1.5 oui-border-b oui-border-line oui-bg-base-8/50 oui-flex-shrink-0">
        <MarketSelector
          markets={MOCK_MARKETS}
          selected={selectedMarket}
          onSelect={(m) => setSelectedMarketId(m.id)}
        />

        <div className="oui-h-5 oui-w-px oui-bg-line" />

        <div className="oui-flex oui-items-center oui-gap-6 oui-text-xs">
          <div>
            <span className="oui-text-lg oui-font-bold oui-text-white oui-tabular-nums">
              {selectedMarket.yesPrice}¢
            </span>
          </div>
          <div>
            <div className="oui-text-base-contrast-36">24h Change</div>
            <div
              className={cn(
                "oui-font-mono oui-tabular-nums",
                change24h >= 0 ? "oui-text-[#29DFA9]" : "oui-text-[#F5618B]",
              )}
            >
              {change24h >= 0 ? "+" : ""}
              {change24h.toFixed(1)}¢ / {change24h >= 0 ? "+" : ""}
              {changePct}%
            </div>
          </div>
          <div>
            <div className="oui-text-base-contrast-36">24h Volume</div>
            <div className="oui-text-white oui-font-mono oui-tabular-nums">
              ${formatNumber(selectedMarket.volume24h)}
            </div>
          </div>
          <div>
            <div className="oui-text-base-contrast-36">Total Volume</div>
            <div className="oui-text-white oui-font-mono oui-tabular-nums">
              ${formatNumber(selectedMarket.totalVolume)}
            </div>
          </div>
          <div>
            <div className="oui-text-base-contrast-36">Expires</div>
            <div className="oui-text-white oui-flex oui-items-center oui-gap-1">
              <Clock className="oui-w-3 oui-h-3" />
              {formatCountdown(selectedMarket.expiryAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Question Bar */}
      <div className="oui-px-3 oui-py-1.5 oui-border-b oui-border-line oui-flex-shrink-0 oui-flex oui-items-center oui-gap-3">
        <span className="oui-text-xs oui-text-base-contrast-54">
          {selectedMarket.question}
        </span>
        <div className="oui-flex oui-items-center oui-gap-2 oui-ml-auto">
          <span className="oui-text-xs oui-font-bold oui-text-[#29DFA9]">
            YES {selectedMarket.yesPrice}¢
          </span>
          <span className="oui-text-xs oui-text-base-contrast-20">|</span>
          <span className="oui-text-xs oui-font-bold oui-text-[#F5618B]">
            NO {selectedMarket.noPrice}¢
          </span>
        </div>
      </div>

      {/* Main Grid — Chart | Orderbook | Trading Panel */}
      <div className="oui-flex oui-flex-1 oui-overflow-hidden">
        {/* Chart */}
        <div className="oui-flex-1 oui-border-r oui-border-line oui-bg-[#0a0e17] oui-min-w-0">
          <ProbabilityChart data={selectedMarket.priceHistory} color={chartColor} />
        </div>

        {/* Orderbook */}
        <div className="oui-border-r oui-border-line" style={{ width: 220 }}>
          <Orderbook orderbook={orderbook} yesPrice={selectedMarket.yesPrice} />
        </div>

        {/* Trading Panel */}
        <div style={{ width: 260 }}>
          <TradingPanel market={selectedMarket} />
        </div>
      </div>
    </div>
  );
}
