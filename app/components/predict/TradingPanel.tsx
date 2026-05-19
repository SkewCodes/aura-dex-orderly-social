import { useState, useEffect, useCallback } from "react";
import { Flex, Text, Switch, cn } from "@orderly.network/ui";
import { useAccount } from "@orderly.network/hooks";
import { useOrderbookStore, useUserStore } from "@/predict/stores";
import { placeOrder } from "@/predict/api";
import type { Market } from "@/predict/types";

interface Props {
  market: Market;
  initialPrice?: number | null;
}

function triggerWalletConnect() {
  const btn = document.querySelector<HTMLButtonElement>(
    'button[class*="connect" i], button[class*="Connect" i]'
  );
  if (btn && btn.textContent?.toLowerCase().includes("connect")) btn.click();
}

export function TradingPanel({ market, initialPrice }: Props) {
  const { account } = useAccount();
  const address = (account as { address?: string })?.address ?? null;
  const balance = useUserStore((s) => s.balance);

  const bestBid = useOrderbookStore((s) => s.bids[0]?.priceBps ?? null);
  const bestAsk = useOrderbookStore(
    (s) => s.asks[s.asks.length - 1]?.priceBps ?? null,
  );

  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [price, setPrice] = useState(50);
  const [amount, setAmount] = useState("");
  const [sliderPct, setSliderPct] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [soundNotif, setSoundNotif] = useState(true);

  useEffect(() => {
    if (initialPrice != null) setPrice(Math.max(1, Math.min(99, initialPrice)));
  }, [initialPrice]);

  useEffect(() => {
    const mid = bestBid != null && bestAsk != null ? Math.round((bestBid + bestAsk) / 2) : bestBid ?? bestAsk ?? 50;
    if (side === "YES") setPrice(mid);
    else setPrice(100 - mid);
  }, [market.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const parsedAmount = Number(amount) || 0;
  const effectivePrice = orderType === "LIMIT" ? price : 99;
  const cost = parsedAmount > 0 ? ((parsedAmount * effectivePrice) / 100).toFixed(2) : "0.00";
  const potentialReturn = parsedAmount > 0 ? (parsedAmount - Number(cost)).toFixed(2) : "0.00";
  const maxBuy = balance.available > 0 ? Math.floor((balance.available / effectivePrice) * 100) : 0;

  const handleSubmit = useCallback(async () => {
    if (!address) return;
    if (parsedAmount <= 0) { setError("Enter an amount"); return; }
    if (orderType === "LIMIT" && (price < 1 || price > 99)) { setError("Price must be 1¢–99¢"); return; }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await placeOrder(
        { marketId: market.id, side, orderType, priceBps: orderType === "LIMIT" ? price : null, quantity: String(parsedAmount) },
        address,
      );
      setSuccess(`Order placed — ${res.fills.length} fill(s)`);
      setAmount("");
      setSliderPct(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  }, [address, parsedAmount, orderType, price, market.id, side]);

  const isYes = side === "YES";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
      {/* Connect wallet banner */}
      {!address && (
        <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Text weight="semibold" size="sm">Connect wallet</Text>
            <Text size="xs" intensity={36} className="oui-text-center">Please connect wallet before starting to trade</Text>
            <button
              onClick={triggerWalletConnect}
              style={{
                width: "100%",
                height: 40,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              }}
            >
              Connect wallet
            </button>
          </div>
        </div>
      )}

      {/* Buy Yes / Buy No tabs */}
      <div style={{ display: "flex", flexShrink: 0 }}>
        <button
          onClick={() => setSide("YES")}
          className={cn(
            "oui-flex-1 oui-h-[40px] oui-text-sm oui-font-semibold oui-border-0 oui-cursor-pointer oui-transition-all",
            isYes
              ? "oui-bg-trade-profit/20 oui-text-trade-profit"
              : "oui-bg-transparent oui-text-base-contrast-36 hover:oui-text-base-contrast-54",
          )}
        >
          Buy Yes
        </button>
        <button
          onClick={() => setSide("NO")}
          className={cn(
            "oui-flex-1 oui-h-[40px] oui-text-sm oui-font-semibold oui-border-0 oui-cursor-pointer oui-transition-all",
            !isYes
              ? "oui-bg-trade-loss/20 oui-text-trade-loss"
              : "oui-bg-transparent oui-text-base-contrast-36 hover:oui-text-base-contrast-54",
          )}
        >
          Buy No
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: 12 }} className="oui-hide-scrollbar oui-space-y-3">
        {/* Order type */}
        <Flex itemAlign="center" gap={2}>
          <div className="oui-h-[32px] oui-flex oui-items-center oui-cursor-pointer oui-border oui-border-line-12 oui-rounded-md oui-px-2 oui-bg-base-8">
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as "LIMIT" | "MARKET")}
              className="oui-bg-transparent oui-text-base-contrast-98 oui-text-xs oui-font-medium oui-outline-none oui-cursor-pointer oui-appearance-none oui-pr-3"
            >
              <option value="LIMIT">Limit</option>
              <option value="MARKET">Market</option>
            </select>
            <svg width="8" height="5" viewBox="0 0 8 5" className="oui-fill-base-contrast-36 oui--ml-1"><path d="M4 5L0 0h8L4 5z" /></svg>
          </div>
        </Flex>

        {/* Available */}
        <Flex itemAlign="center" justify="between">
          <Text size="xs" intensity={54}>Available</Text>
          <Text size="xs" className="oui-font-mono">{balance.available.toLocaleString()} USDC</Text>
        </Flex>

        {/* Price input */}
        {orderType === "LIMIT" && (
          <div>
            <Flex itemAlign="center" justify="between" className="oui-mb-1">
              <Text size="xs" intensity={54}>Price (¢)</Text>
              <Text size="2xs" intensity={36} className="oui-font-mono">1¢ – 99¢</Text>
            </Flex>
            <Flex itemAlign="center" className="oui-h-[36px] oui-bg-base-10 oui-border oui-border-line-12 oui-rounded-md oui-overflow-hidden">
              <button
                onClick={() => setPrice((p) => Math.max(1, p - 1))}
                className="oui-w-[36px] oui-h-full oui-flex oui-items-center oui-justify-center oui-text-base-contrast-54 hover:oui-text-base-contrast-98 hover:oui-bg-base-8 oui-transition-colors oui-text-lg oui-font-light oui-border-0 oui-bg-transparent oui-cursor-pointer"
              >−</button>
              <input
                type="number" min={1} max={99} value={price}
                onChange={(e) => setPrice(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                className="oui-flex-1 oui-h-full oui-bg-transparent oui-text-center oui-text-sm oui-font-mono oui-text-base-contrast-98 oui-outline-none oui-border-0 [&::-webkit-inner-spin-button]:oui-appearance-none [&::-webkit-outer-spin-button]:oui-appearance-none"
              />
              <button
                onClick={() => setPrice((p) => Math.min(99, p + 1))}
                className="oui-w-[36px] oui-h-full oui-flex oui-items-center oui-justify-center oui-text-base-contrast-54 hover:oui-text-base-contrast-98 hover:oui-bg-base-8 oui-transition-colors oui-text-lg oui-font-light oui-border-0 oui-bg-transparent oui-cursor-pointer"
              >+</button>
            </Flex>
            <Flex justify="end" gap={2} className="oui-mt-1">
              <button onClick={() => { if (bestBid) setPrice(bestBid); }} className="oui-text-2xs oui-font-medium oui-text-primary hover:oui-text-primary-light oui-border-0 oui-bg-transparent oui-cursor-pointer">BBO</button>
              <button
                onClick={() => { const mid = bestBid != null && bestAsk != null ? Math.round((bestBid + bestAsk) / 2) : 50; setPrice(mid); }}
                className="oui-text-2xs oui-font-medium oui-text-primary hover:oui-text-primary-light oui-border-0 oui-bg-transparent oui-cursor-pointer"
              >Mid</button>
            </Flex>
          </div>
        )}

        {/* Qty input */}
        <div>
          <Flex itemAlign="center" justify="between" className="oui-mb-1">
            <Text size="xs" intensity={54}>Shares</Text>
          </Flex>
          <div style={{ display: "flex", gap: 6, height: 36 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }} className="oui-h-full oui-bg-base-10 oui-border oui-border-line-12 oui-rounded-md oui-px-2">
              <input
                type="number" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="oui-flex-1 oui-h-full oui-bg-transparent oui-text-sm oui-font-mono oui-text-base-contrast-98 oui-outline-none oui-border-0 oui-placeholder-base-contrast-20 [&::-webkit-inner-spin-button]:oui-appearance-none [&::-webkit-outer-spin-button]:oui-appearance-none"
                style={{ minWidth: 0 }}
              />
              <span className="oui-text-xs oui-text-base-contrast-36 oui-flex-shrink-0 oui-ml-1">Shares</span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div>
          <input
            type="range" min={0} max={100} value={sliderPct}
            onChange={(e) => setSliderPct(Number(e.target.value))}
            className="oui-w-full oui-h-1 oui-appearance-none oui-rounded-full oui-cursor-pointer oui-outline-none oui-accent-primary"
            style={{ background: `linear-gradient(to right, var(--oui-color-primary, #7c3aed) ${sliderPct}%, var(--oui-color-base-8, rgba(255,255,255,0.08)) ${sliderPct}%)` }}
          />
          <Flex justify="between" className="oui-mt-0.5">
            <Text size="2xs" intensity={36} className="oui-font-mono">{sliderPct}%</Text>
            <Text size="2xs" intensity={36} className="oui-font-mono">Max buy {maxBuy}</Text>
          </Flex>
        </div>

        {/* Submit */}
        <button
          onClick={address ? handleSubmit : triggerWalletConnect}
          disabled={submitting}
          className={cn(
            "oui-w-full oui-h-[44px] oui-rounded-md oui-text-sm oui-font-bold oui-transition-all oui-border-0 oui-cursor-pointer",
            submitting ? "oui-opacity-40 oui-cursor-not-allowed" : "hover:oui-opacity-90",
            isYes ? "oui-bg-trade-profit oui-text-white" : "oui-bg-trade-loss oui-text-white",
          )}
        >
          {!address ? "Connect wallet" : submitting ? "Placing..." : `Buy ${side === "YES" ? "Yes" : "No"}`}
        </button>

        {/* Feedback */}
        {error && <Text size="xs" color="danger" className="oui-text-center">{error}</Text>}
        {success && <Text size="xs" color="success" className="oui-text-center">{success}</Text>}

        {/* Cost breakdown */}
        <div className="oui-space-y-1.5 oui-border-t oui-border-line-12 oui-pt-3">
          <Flex justify="between">
            <Text size="xs" intensity={36}>Cost</Text>
            <Text size="xs" className="oui-font-mono">{cost} USDC</Text>
          </Flex>
          <Flex justify="between">
            <Text size="xs" intensity={36}>Potential return</Text>
            <Text size="xs" className={cn("oui-font-mono", Number(potentialReturn) > 0 ? "oui-text-trade-profit" : "")}>
              {Number(potentialReturn) > 0 ? `+${potentialReturn}` : potentialReturn} USDC
            </Text>
          </Flex>
          <Flex justify="between">
            <Text size="xs" intensity={36}>Fees</Text>
            <Text size="xs" intensity={54} className="oui-font-mono">0%</Text>
          </Flex>
        </div>

        {/* Sound toggle */}
        <div className="oui-border-t oui-border-line-12 oui-pt-3">
          <Flex itemAlign="center" justify="between">
            <Text size="xs" intensity={80}>Sound notification</Text>
            <Switch checked={soundNotif} onCheckedChange={setSoundNotif} />
          </Flex>
        </div>
      </div>
    </div>
  );
}
