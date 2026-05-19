import { useState, useMemo, useCallback } from "react";
import { Flex, Text, cn } from "@orderly.network/ui";
import { useOrderbookStore } from "@/predict/stores";
import type { PriceLevel } from "@/predict/types";

interface Props {
  onPriceClick?: (priceBps: number) => void;
}

type ViewMode = "both" | "bids" | "asks";

export function OrderbookPanel({ onPriceClick }: Props) {
  const bids = useOrderbookStore((s) => s.bids);
  const asks = useOrderbookStore((s) => s.asks);
  const lastTrade = useOrderbookStore((s) => s.lastTrade);
  const [viewMode, setViewMode] = useState<ViewMode>("both");

  const maxQty = useMemo(() => {
    const all = [...bids, ...asks];
    if (all.length === 0) return 1;
    return Math.max(...all.map((l) => Number(l.quantity)));
  }, [bids, asks]);

  const bestBid = bids[0]?.priceBps ?? null;
  const bestAsk = asks[asks.length - 1]?.priceBps ?? null;
  const spread = bestBid != null && bestAsk != null ? bestAsk - bestBid : null;
  const midPrice =
    bestBid != null && bestAsk != null
      ? ((bestBid + bestAsk) / 2).toFixed(1)
      : bestBid?.toString() ?? bestAsk?.toString() ?? "—";
  const spreadPct =
    spread != null && bestBid != null && bestBid > 0
      ? ((spread / bestBid) * 100).toFixed(4)
      : null;

  const bidTotal = useMemo(() => bids.reduce((s, l) => s + Number(l.quantity), 0), [bids]);
  const askTotal = useMemo(() => asks.reduce((s, l) => s + Number(l.quantity), 0), [asks]);
  const totalVol = bidTotal + askTotal || 1;
  const bidPct = ((bidTotal / totalVol) * 100).toFixed(1);
  const askPct = ((askTotal / totalVol) * 100).toFixed(1);

  const displayAsks = useMemo(() => {
    const sorted = [...asks].slice(-12);
    let cumulative = 0;
    return sorted.map((l) => {
      cumulative += Number(l.quantity);
      return { ...l, total: cumulative };
    });
  }, [asks]);

  const displayBids = useMemo(() => {
    const sorted = bids.slice(0, 12);
    let cumulative = 0;
    return sorted.map((l) => {
      cumulative += Number(l.quantity);
      return { ...l, total: cumulative };
    });
  }, [bids]);

  const handleClick = useCallback(
    (priceBps: number) => onPriceClick?.(priceBps),
    [onPriceClick],
  );

  return (
    <Flex direction="column" className="oui-h-full oui-bg-base-9" id="oui-orderbook-desktop">
      {/* Header */}
      <Flex itemAlign="center" justify="between" px={3} className="oui-h-[36px] oui-border-b oui-border-line-12 oui-flex-shrink-0">
        <Text size="xs" weight="semibold">Order Book</Text>
        <Flex itemAlign="center" gap={1}>
          <select className="oui-bg-base-8 oui-border oui-border-line-12 oui-rounded oui-text-2xs oui-text-base-contrast-54 oui-px-1.5 oui-py-0.5 oui-outline-none oui-cursor-pointer">
            <option>0.01</option>
            <option>0.1</option>
            <option>1</option>
          </select>
          <Flex itemAlign="center" gap={0}>
            {(["both", "bids", "asks"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "oui-w-[18px] oui-h-[18px] oui-rounded oui-flex oui-items-center oui-justify-center oui-transition-colors",
                  viewMode === mode ? "oui-bg-base-8" : "hover:oui-bg-base-8",
                )}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  {mode === "both" ? (
                    <>
                      <rect y="0" width="10" height="4" rx="1" className={viewMode === mode ? "oui-fill-trade-loss" : "oui-fill-base-contrast-20"} />
                      <rect y="6" width="10" height="4" rx="1" className={viewMode === mode ? "oui-fill-trade-profit" : "oui-fill-base-contrast-20"} />
                    </>
                  ) : mode === "bids" ? (
                    <rect width="10" height="10" rx="1" className={viewMode === mode ? "oui-fill-trade-profit" : "oui-fill-base-contrast-20"} />
                  ) : (
                    <rect width="10" height="10" rx="1" className={viewMode === mode ? "oui-fill-trade-loss" : "oui-fill-base-contrast-20"} />
                  )}
                </svg>
              </button>
            ))}
          </Flex>
          <button className="oui-text-base-contrast-36 hover:oui-text-base-contrast-80 oui-text-sm oui-leading-none">···</button>
        </Flex>
      </Flex>

      {/* Column headers */}
      <Flex itemAlign="center" px={3} className="oui-py-1 oui-text-2xs oui-text-base-contrast-36 oui-flex-shrink-0">
        <span className="oui-flex-1">Price(¢)</span>
        <span className="oui-w-[72px] oui-text-right">Qty(USDC)</span>
        <span className="oui-w-[72px] oui-text-right">Total(USDC) ▼</span>
      </Flex>

      <Flex direction="column" className="oui-flex-1 oui-overflow-hidden">
        {/* Asks */}
        {viewMode !== "bids" && (
          <div className={cn(
            "oui-flex oui-flex-col oui-justify-end oui-overflow-hidden",
            viewMode === "both" ? "oui-flex-1" : "oui-flex-[2]",
          )}>
            {displayAsks.length === 0 ? (
              <Flex direction="column" itemAlign="center" justify="end" className="oui-flex-1 oui-pb-3" gap={1}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="oui-text-base-contrast-12">
                  <path d="M3 3h18v18H3zM3 9h18M9 3v18" />
                </svg>
                <Text size="2xs" intensity={20}>No asks</Text>
              </Flex>
            ) : displayAsks.map((level) => (
              <LevelRow key={`a-${level.priceBps}`} level={level} total={level.total} maxQty={maxQty} side="ask" onClick={handleClick} />
            ))}
          </div>
        )}

        {/* Spread / Mid */}
        <Flex itemAlign="center" justify="between" px={3} className="oui-h-[28px] oui-border-y oui-border-line-12 oui-flex-shrink-0 oui-bg-base-10">
          <Flex itemAlign="center" gap={2}>
            <Text size="sm" weight="bold" className="oui-font-mono oui-tabular-nums">{midPrice}{midPrice !== "—" && "¢"}</Text>
            {lastTrade && (
              <Text size="xs" className={lastTrade.side === "YES" ? "oui-text-trade-profit" : "oui-text-trade-loss"}>
                {lastTrade.side === "YES" ? "↑" : "↓"}
              </Text>
            )}
          </Flex>
          <Text size="2xs" intensity={36} className="oui-font-mono">{spreadPct != null ? `${spreadPct}%` : ""}</Text>
        </Flex>

        {/* Bids */}
        {viewMode !== "asks" && (
          <div className={cn(
            "oui-overflow-hidden",
            viewMode === "both" ? "oui-flex-1" : "oui-flex-[2]",
          )}>
            {displayBids.length === 0 ? (
              <Flex direction="column" itemAlign="center" justify="start" className="oui-flex-1 oui-pt-3" gap={1}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="oui-text-base-contrast-12">
                  <path d="M3 3h18v18H3zM3 9h18M9 3v18" />
                </svg>
                <Text size="2xs" intensity={20}>No bids</Text>
              </Flex>
            ) : displayBids.map((level) => (
              <LevelRow key={`b-${level.priceBps}`} level={level} total={level.total} maxQty={maxQty} side="bid" onClick={handleClick} />
            ))}
          </div>
        )}
      </Flex>

      {/* Buy/sell pressure */}
      <Flex itemAlign="center" px={3} className="oui-h-[20px] oui-border-t oui-border-line-12 oui-flex-shrink-0 oui-text-2xs" gap={1}>
        <Text intensity={54}>B</Text>
        <Text className="oui-text-trade-profit oui-font-mono">{bidPct}%</Text>
        <div className="oui-flex-1 oui-h-1 oui-rounded-full oui-overflow-hidden oui-flex">
          <div className="oui-h-full oui-bg-trade-profit" style={{ width: `${bidPct}%` }} />
          <div className="oui-h-full oui-bg-trade-loss" style={{ width: `${askPct}%` }} />
        </div>
        <Text className="oui-text-trade-loss oui-font-mono">{askPct}%</Text>
        <Text intensity={54}>S</Text>
      </Flex>
    </Flex>
  );
}

function LevelRow({
  level, total, maxQty, side, onClick,
}: {
  level: PriceLevel; total: number; maxQty: number; side: "bid" | "ask"; onClick: (p: number) => void;
}) {
  const qty = Number(level.quantity);
  const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;

  return (
    <button
      onClick={() => onClick(level.priceBps)}
      className="oui-relative oui-flex oui-items-center oui-px-3 oui-h-[22px] oui-w-full oui-text-left oui-transition-colors hover:oui-bg-base-8 oui-border-0 oui-bg-transparent oui-cursor-pointer"
    >
      <div
        className="oui-absolute oui-inset-y-0 oui-right-0 oui-pointer-events-none"
        style={{
          width: `${pct}%`,
          background: side === "bid"
            ? "linear-gradient(to left, rgba(0,181,159,0.15), transparent)"
            : "linear-gradient(to left, rgba(255,103,130,0.15), transparent)",
        }}
      />
      <span className={cn(
        "oui-flex-1 oui-relative oui-text-xs oui-font-mono oui-tabular-nums",
        side === "bid" ? "oui-text-trade-profit" : "oui-text-trade-loss",
      )}>
        {level.priceBps}
      </span>
      <span className="oui-w-[72px] oui-text-right oui-relative oui-text-xs oui-font-mono oui-tabular-nums oui-text-base-contrast-80">
        {qty.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className="oui-w-[72px] oui-text-right oui-relative oui-text-xs oui-font-mono oui-tabular-nums oui-text-base-contrast-54">
        {total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </span>
    </button>
  );
}
