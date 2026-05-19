import { useEffect, useRef } from "react";
import { useOrderbookStore } from "./stores";
import { getWsUrl } from "./api";
import type { WsMessage } from "./types";

export function useOrderbookWs(marketId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const setOrderbook = useOrderbookStore((s) => s.setOrderbook);
  const addTrade = useOrderbookStore((s) => s.addTrade);
  const clear = useOrderbookStore((s) => s.clear);

  useEffect(() => {
    if (!marketId) {
      clear();
      return;
    }

    let reconnectTimer: ReturnType<typeof setTimeout>;
    let ws: WebSocket;

    function connect() {
      ws = new WebSocket(getWsUrl(marketId!));
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsMessage;
          if (msg.type === "orderbook") {
            setOrderbook(msg.bids, msg.asks);
          } else if (msg.type === "trade") {
            addTrade(msg);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clear();
    };
  }, [marketId, setOrderbook, addTrade, clear]);
}
