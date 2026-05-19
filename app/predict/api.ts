import type {
  Market,
  Order,
  Position,
  Balance,
  Fill,
  OrderbookSnapshot,
  PlaceOrderRequest,
  PlaceOrderResponse,
} from "./types";

const API_URL =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_PREDICT_API_URL ?? "http://localhost:8787")
    : "http://localhost:8787";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function authHeaders(address: string): Record<string, string> {
  return { "x-user-address": address };
}

export async function fetchMarkets(
  status: string = "TRADING",
): Promise<Market[]> {
  const data = await apiFetch<{ markets: Market[] }>(
    `/markets?status=${status}`,
  );
  return data.markets;
}

export async function fetchMarket(id: string): Promise<Market> {
  const data = await apiFetch<{ market: Market }>(`/markets/${id}`);
  return data.market;
}

export async function fetchOrderbook(
  marketId: string,
): Promise<OrderbookSnapshot> {
  return apiFetch<OrderbookSnapshot>(`/orderbook/${marketId}`);
}

export async function placeOrder(
  req: PlaceOrderRequest,
  userAddress: string,
): Promise<PlaceOrderResponse> {
  return apiFetch<PlaceOrderResponse>("/orders", {
    method: "POST",
    headers: authHeaders(userAddress),
    body: JSON.stringify({
      marketId: req.marketId,
      side: req.side,
      orderType: req.orderType,
      priceBps: req.priceBps,
      quantity: req.quantity,
    }),
  });
}

export async function cancelOrder(
  orderId: string,
  userAddress: string,
): Promise<{ cancelled: boolean; orderId: string }> {
  return apiFetch(`/orders/${orderId}`, {
    method: "DELETE",
    headers: authHeaders(userAddress),
  });
}

export async function fetchOrders(
  address?: string,
  marketId?: string,
): Promise<Order[]> {
  const params = new URLSearchParams();
  if (address) params.set("address", address);
  if (marketId) params.set("market_id", marketId);
  const data = await apiFetch<{ orders: Order[] }>(
    `/orders?${params.toString()}`,
  );
  return data.orders;
}

export async function fetchPositions(address: string): Promise<Position[]> {
  const data = await apiFetch<{ positions: Position[] }>(
    `/positions?address=${address}`,
  );
  return data.positions;
}

export async function fetchBalance(address: string): Promise<Balance> {
  const data = await apiFetch<{ balance: Balance }>(
    `/positions/balance?address=${address}`,
  );
  return data.balance;
}

export function getWsUrl(marketId: string): string {
  const base = API_URL.replace(/^http/, "ws");
  return `${base}/ws/${marketId}`;
}
