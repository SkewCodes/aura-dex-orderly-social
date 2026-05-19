import { create } from "zustand";
import type {
  PriceLevel,
  Market,
  Order,
  Position,
  Balance,
  TradeMessage,
} from "./types";

// ---------------------------------------------------------------------------
// Orderbook store
// ---------------------------------------------------------------------------

interface OrderbookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  lastTrade: TradeMessage | null;
  trades: TradeMessage[];
  lastUpdate: number;
  setOrderbook: (bids: PriceLevel[], asks: PriceLevel[]) => void;
  addTrade: (trade: TradeMessage) => void;
  clear: () => void;
}

export const useOrderbookStore = create<OrderbookState>((set) => ({
  bids: [],
  asks: [],
  lastTrade: null,
  trades: [],
  lastUpdate: 0,
  setOrderbook: (bids, asks) => set({ bids, asks, lastUpdate: Date.now() }),
  addTrade: (trade) =>
    set((s) => ({
      lastTrade: trade,
      trades: [...s.trades.slice(-199), trade],
    })),
  clear: () =>
    set({ bids: [], asks: [], lastTrade: null, trades: [], lastUpdate: 0 }),
}));

// ---------------------------------------------------------------------------
// Market store
// ---------------------------------------------------------------------------

interface MarketState {
  market: Market | null;
  markets: Market[];
  loading: boolean;
  error: string | null;
  setMarket: (m: Market | null) => void;
  setMarkets: (ms: Market[]) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  market: null,
  markets: [],
  loading: false,
  error: null,
  setMarket: (market) => set({ market }),
  setMarkets: (markets) => set({ markets }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ---------------------------------------------------------------------------
// User store (positions, orders, balance)
// ---------------------------------------------------------------------------

interface UserState {
  positions: Position[];
  orders: Order[];
  balance: Balance;
  setPositions: (p: Position[]) => void;
  setOrders: (o: Order[]) => void;
  setBalance: (b: Balance) => void;
  removeOrder: (id: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  positions: [],
  orders: [],
  balance: { available: 0, locked: 0 },
  setPositions: (positions) => set({ positions }),
  setOrders: (orders) => set({ orders }),
  setBalance: (balance) => set({ balance }),
  removeOrder: (id) =>
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
}));
