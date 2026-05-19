export interface Market {
  id: string;
  question: string;
  category: "crypto" | "macro" | "protocol" | "other";
  expiry_at: string;
  oracle_source: string;
  resolution_condition: {
    type: "price_above" | "price_below" | "manual";
    asset?: string;
    targetPrice?: number;
    description?: string;
  };
  status: "OPEN" | "TRADING" | "RESOLVING" | "SETTLED";
  outcome: "YES" | "NO" | null;
  contract_address: string | null;
  collateral_pool: number;
  created_at: string;
}

export interface PriceLevel {
  priceBps: number;
  quantity: string;
  orderCount: number;
}

export interface OrderbookSnapshot {
  marketId: string;
  bids: PriceLevel[];
  asks: PriceLevel[];
  timestamp?: number;
}

export interface TradeMessage {
  type: "trade";
  marketId: string;
  priceBps: number;
  quantity: string;
  side: "YES" | "NO";
  timestamp: number;
}

export type WsMessage =
  | { type: "orderbook"; marketId: string; bids: PriceLevel[]; asks: PriceLevel[]; timestamp: number }
  | TradeMessage;

export interface Order {
  id: string;
  market_id: string;
  user_address: string;
  side: "YES" | "NO";
  order_type: "LIMIT" | "MARKET";
  price_bps: number | null;
  quantity: number;
  filled_quantity: number;
  status: "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
  created_at: string;
}

export interface Position {
  id: string;
  market_id: string;
  user_address: string;
  side: "YES" | "NO";
  quantity: number;
  avg_entry_bps: number;
  realized_pnl: number;
  markets?: {
    question: string;
    status: string;
    outcome: string | null;
    expiry_at: string;
  };
}

export interface Balance {
  available: number;
  locked: number;
}

export interface Fill {
  id: string;
  market_id: string;
  maker_order_id: string;
  taker_order_id: string;
  maker_address: string;
  taker_address: string;
  price_bps: number;
  quantity: number;
  fee_amount: number;
  created_at: string;
}

export interface PlaceOrderRequest {
  marketId: string;
  side: "YES" | "NO";
  orderType: "LIMIT" | "MARKET";
  priceBps: number | null;
  quantity: string;
}

export interface PlaceOrderResponse {
  orderId: string;
  status: string;
  fills: Array<{ quantity: string; priceBps: number; feeAmount: string }>;
}
