import { useState, useEffect, useCallback } from "react";
import { Flex, Text, cn } from "@orderly.network/ui";
import { useAccount } from "@orderly.network/hooks";
import { useUserStore } from "@/predict/stores";
import { fetchPositions, fetchOrders, fetchBalance, cancelOrder } from "@/predict/api";
import type { Order, Position } from "@/predict/types";

type Tab = "positions" | "pending" | "tp-sl" | "filled" | "position-history" | "order-history" | "liquidation" | "assets";

interface Props {
  marketId: string;
}

export function PositionsPanel({ marketId }: Props) {
  const { account } = useAccount();
  const address = (account as { address?: string })?.address ?? null;

  const positions = useUserStore((s) => s.positions);
  const orders = useUserStore((s) => s.orders);
  const setPositions = useUserStore((s) => s.setPositions);
  const setOrders = useUserStore((s) => s.setOrders);
  const setBalance = useUserStore((s) => s.setBalance);
  const removeOrder = useUserStore((s) => s.removeOrder);

  const [tab, setTab] = useState<Tab>("positions");
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [hideOther, setHideOther] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!address) return;
    try {
      const [pos, ord, bal] = await Promise.all([
        fetchPositions(address),
        fetchOrders(address, marketId),
        fetchBalance(address),
      ]);
      setPositions(pos);
      setOrders(ord);
      setBalance(bal);
    } catch { /* silent */ }
  }, [address, marketId, setPositions, setOrders, setBalance]);

  useEffect(() => {
    loadUserData();
    const interval = setInterval(loadUserData, 10_000);
    return () => clearInterval(interval);
  }, [loadUserData]);

  const handleCancel = useCallback(async (orderId: string) => {
    if (!address) return;
    setCancelling(orderId);
    try { await cancelOrder(orderId, address); removeOrder(orderId); }
    catch { /* silent */ }
    finally { setCancelling(null); }
  }, [address, removeOrder]);

  const openOrders = orders.filter((o) => o.status === "OPEN" || o.status === "PARTIALLY_FILLED");
  const filledOrders = orders.filter((o) => o.status === "FILLED");
  const orderHistory = orders.filter((o) => o.status === "FILLED" || o.status === "CANCELLED");

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "positions", label: "Positions", count: positions.length },
    { id: "pending", label: "Pending", count: openOrders.length },
    { id: "tp-sl", label: "TP/SL" },
    { id: "filled", label: "Filled", count: filledOrders.length },
    { id: "position-history", label: "Position history" },
    { id: "order-history", label: "Order history" },
    { id: "liquidation", label: "Liquidation" },
    { id: "assets", label: "Assets" },
  ];

  return (
    <Flex direction="column" className="oui-h-full oui-bg-base-9">
      {/* Tab bar */}
      <Flex itemAlign="center" justify="between" className="oui-border-b oui-border-line-12 oui-flex-shrink-0">
        <Flex itemAlign="center" className="oui-overflow-x-auto oui-hide-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "oui-relative oui-px-3 oui-h-[36px] oui-text-xs oui-font-medium oui-transition-colors oui-whitespace-nowrap oui-flex-shrink-0 oui-border-0 oui-bg-transparent oui-cursor-pointer",
                tab === t.id ? "oui-text-base-contrast-98" : "oui-text-base-contrast-36 hover:oui-text-base-contrast-54",
              )}
            >
              <span className="oui-flex oui-items-center oui-gap-1">
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span className="oui-text-3xs oui-bg-base-8 oui-px-1 oui-rounded oui-font-mono">{t.count}</span>
                )}
              </span>
              {tab === t.id && <div className="oui-absolute oui-bottom-0 oui-left-3 oui-right-3 oui-h-[2px] oui-bg-base-contrast-98 oui-rounded-t" />}
            </button>
          ))}
        </Flex>
        <Flex itemAlign="center" gap={2} className="oui-pr-3 oui-flex-shrink-0">
          <label className="oui-flex oui-items-center oui-gap-1.5 oui-text-2xs oui-text-base-contrast-36 oui-cursor-pointer oui-whitespace-nowrap">
            <input type="checkbox" checked={hideOther} onChange={(e) => setHideOther(e.target.checked)} className="oui-w-3 oui-h-3 oui-accent-primary oui-rounded" />
            Hide other symbols
          </label>
          <button className="oui-text-base-contrast-36 hover:oui-text-base-contrast-98 oui-transition-colors oui-border-0 oui-bg-transparent oui-cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
          </button>
        </Flex>
      </Flex>

      {/* Content */}
      <div className="oui-flex-1 oui-overflow-auto">
        {!address ? (
          <EmptyState icon={<WalletIcon />} text="Connect wallet to view" />
        ) : tab === "positions" ? (
          <PositionsTab positions={positions} />
        ) : tab === "pending" ? (
          <OpenOrdersTab orders={openOrders} onCancel={handleCancel} cancelling={cancelling} />
        ) : tab === "order-history" || tab === "filled" ? (
          <OrderHistoryTab orders={tab === "filled" ? filledOrders : orderHistory} />
        ) : (
          <EmptyState text={`No ${tabs.find((t) => t.id === tab)?.label?.toLowerCase() ?? "data"}`} />
        )}
      </div>
    </Flex>
  );
}

function WalletIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="oui-text-base-contrast-12">
      <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M2 10h20" />
    </svg>
  );
}

function EmptyState({ text, icon }: { text: string; icon?: React.ReactNode }) {
  return (
    <Flex direction="column" itemAlign="center" justify="center" className="oui-h-full oui-min-h-[80px]" gap={2}>
      {icon}
      <Text size="xs" intensity={36}>{text}</Text>
    </Flex>
  );
}

function PositionsTab({ positions }: { positions: Position[] }) {
  if (positions.length === 0) return <EmptyState text="No positions" />;
  return (
    <table className="oui-w-full oui-text-xs">
      <thead className="oui-sticky oui-top-0 oui-bg-base-9 oui-z-10">
        <tr className="oui-text-2xs oui-text-base-contrast-36">
          <th className="oui-text-left oui-px-3 oui-py-1.5 oui-font-normal">Market</th>
          <th className="oui-text-left oui-px-3 oui-py-1.5 oui-font-normal">Side</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Qty</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Avg Entry</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">P&amp;L</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((p, i) => (
          <tr key={p.id} className={cn("oui-h-[28px] hover:oui-bg-base-8 oui-transition-colors", i % 2 !== 0 && "oui-bg-base-10")}>
            <td className="oui-px-3 oui-text-base-contrast-98 oui-truncate oui-max-w-[200px]">{p.markets?.question ?? p.market_id.slice(0, 8)}</td>
            <td className="oui-px-3"><span className={cn("oui-text-2xs oui-font-bold oui-px-1.5 oui-py-0.5 oui-rounded", p.side === "YES" ? "oui-bg-trade-profit/10 oui-text-trade-profit" : "oui-bg-trade-loss/10 oui-text-trade-loss")}>{p.side}</span></td>
            <td className="oui-px-3 oui-text-right oui-text-base-contrast-98 oui-font-mono oui-tabular-nums">{p.quantity}</td>
            <td className="oui-px-3 oui-text-right oui-text-base-contrast-98 oui-font-mono oui-tabular-nums">{p.avg_entry_bps}¢</td>
            <td className={cn("oui-px-3 oui-text-right oui-font-mono oui-tabular-nums", p.realized_pnl >= 0 ? "oui-text-trade-profit" : "oui-text-trade-loss")}>{p.realized_pnl >= 0 ? "+" : ""}{p.realized_pnl}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OpenOrdersTab({ orders, onCancel, cancelling }: { orders: Order[]; onCancel: (id: string) => void; cancelling: string | null }) {
  if (orders.length === 0) return <EmptyState text="No pending orders" />;
  return (
    <table className="oui-w-full oui-text-xs">
      <thead className="oui-sticky oui-top-0 oui-bg-base-9 oui-z-10">
        <tr className="oui-text-2xs oui-text-base-contrast-36">
          <th className="oui-text-left oui-px-3 oui-py-1.5 oui-font-normal">Side</th>
          <th className="oui-text-left oui-px-3 oui-py-1.5 oui-font-normal">Type</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Price</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Qty</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Filled</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Action</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o, i) => (
          <tr key={o.id} className={cn("oui-h-[28px] hover:oui-bg-base-8 oui-transition-colors", i % 2 !== 0 && "oui-bg-base-10")}>
            <td className="oui-px-3"><span className={cn("oui-text-2xs oui-font-bold oui-px-1.5 oui-py-0.5 oui-rounded", o.side === "YES" ? "oui-bg-trade-profit/10 oui-text-trade-profit" : "oui-bg-trade-loss/10 oui-text-trade-loss")}>{o.side}</span></td>
            <td className="oui-px-3 oui-text-base-contrast-54">{o.order_type}</td>
            <td className="oui-px-3 oui-text-right oui-text-base-contrast-98 oui-font-mono oui-tabular-nums">{o.price_bps != null ? `${o.price_bps}¢` : "MKT"}</td>
            <td className="oui-px-3 oui-text-right oui-text-base-contrast-98 oui-font-mono oui-tabular-nums">{o.quantity}</td>
            <td className="oui-px-3 oui-text-right oui-text-base-contrast-54 oui-font-mono oui-tabular-nums">{o.filled_quantity}</td>
            <td className="oui-px-3 oui-text-right">
              <button onClick={() => onCancel(o.id)} disabled={cancelling === o.id} className="oui-text-2xs oui-text-trade-loss hover:oui-text-trade-loss/80 oui-transition-colors disabled:oui-opacity-50 oui-font-medium oui-border-0 oui-bg-transparent oui-cursor-pointer">
                {cancelling === o.id ? "..." : "Cancel"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OrderHistoryTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return <EmptyState text="No order history" />;
  return (
    <table className="oui-w-full oui-text-xs">
      <thead className="oui-sticky oui-top-0 oui-bg-base-9 oui-z-10">
        <tr className="oui-text-2xs oui-text-base-contrast-36">
          <th className="oui-text-left oui-px-3 oui-py-1.5 oui-font-normal">Time</th>
          <th className="oui-text-left oui-px-3 oui-py-1.5 oui-font-normal">Side</th>
          <th className="oui-text-left oui-px-3 oui-py-1.5 oui-font-normal">Type</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Price</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Qty</th>
          <th className="oui-text-right oui-px-3 oui-py-1.5 oui-font-normal">Status</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o, i) => (
          <tr key={o.id} className={cn("oui-h-[28px] hover:oui-bg-base-8 oui-transition-colors", i % 2 !== 0 && "oui-bg-base-10")}>
            <td className="oui-px-3 oui-text-base-contrast-54 oui-font-mono oui-tabular-nums">{new Date(o.created_at).toLocaleTimeString()}</td>
            <td className="oui-px-3"><span className={cn("oui-text-2xs oui-font-bold oui-px-1.5 oui-py-0.5 oui-rounded", o.side === "YES" ? "oui-bg-trade-profit/10 oui-text-trade-profit" : "oui-bg-trade-loss/10 oui-text-trade-loss")}>{o.side}</span></td>
            <td className="oui-px-3 oui-text-base-contrast-54">{o.order_type}</td>
            <td className="oui-px-3 oui-text-right oui-text-base-contrast-98 oui-font-mono oui-tabular-nums">{o.price_bps != null ? `${o.price_bps}¢` : "MKT"}</td>
            <td className="oui-px-3 oui-text-right oui-text-base-contrast-98 oui-font-mono oui-tabular-nums">{o.filled_quantity}/{o.quantity}</td>
            <td className="oui-px-3 oui-text-right">
              <span className={cn("oui-text-2xs oui-font-medium oui-px-1.5 oui-py-0.5 oui-rounded", o.status === "FILLED" ? "oui-bg-trade-profit/10 oui-text-trade-profit" : "oui-bg-base-8 oui-text-base-contrast-54")}>{o.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
