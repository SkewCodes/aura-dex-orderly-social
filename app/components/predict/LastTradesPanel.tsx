import { Flex, Text, cn } from "@orderly.network/ui";
import { useOrderbookStore } from "@/predict/stores";

export function LastTradesPanel() {
  const trades = useOrderbookStore((s) => s.trades);
  const displayTrades = trades.slice(-20).reverse();

  return (
    <Flex direction="column" className="oui-h-full oui-bg-base-9">
      {/* Header */}
      <Flex itemAlign="center" px={3} className="oui-h-[36px] oui-border-b oui-border-line-12 oui-flex-shrink-0">
        <Text size="xs" weight="semibold">Last trades</Text>
      </Flex>

      {/* Column headers */}
      <Flex itemAlign="center" px={3} className="oui-py-1 oui-text-2xs oui-text-base-contrast-36 oui-flex-shrink-0">
        <span className="oui-flex-1">Time</span>
        <span className="oui-w-[80px] oui-text-right">Price(USDC)</span>
        <span className="oui-w-[72px] oui-text-right">Qty</span>
      </Flex>

      {/* Trades */}
      <div className="oui-flex-1 oui-overflow-y-auto oui-hide-scrollbar">
        {displayTrades.length === 0 ? (
          <Flex direction="column" itemAlign="center" justify="center" className="oui-h-full" gap={2}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="oui-text-base-contrast-12">
              <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
            </svg>
            <Text size="2xs" intensity={20}>No recent trades</Text>
          </Flex>
        ) : displayTrades.map((t, i) => {
          const isYes = t.side === "YES";
          const time = new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          return (
            <Flex
              key={`${t.timestamp}-${i}`}
              itemAlign="center"
              px={3}
              className={cn("oui-h-[22px] oui-text-xs", i % 2 !== 0 && "oui-bg-base-10")}
            >
              <span className="oui-flex-1 oui-font-mono oui-tabular-nums oui-text-base-contrast-54">{time}</span>
              <span className={cn(
                "oui-w-[80px] oui-text-right oui-font-mono oui-tabular-nums oui-font-medium",
                isYes ? "oui-text-trade-profit" : "oui-text-trade-loss",
              )}>
                {t.priceBps}¢
              </span>
              <span className="oui-w-[72px] oui-text-right oui-font-mono oui-tabular-nums oui-text-base-contrast-98">
                {Number(t.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </Flex>
          );
        })}
      </div>
    </Flex>
  );
}
