import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { useOrderlyConfig } from "@/utils/config";
import {
  useMarkets,
  MarketsType,
  useMarkPrice
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { TradingPageModifiers } from '@/components/trading/TradingPageModifiers';

const PREDICT_PREFIX = "PREDICT_";

function isPredictSymbol(symbol: string): boolean {
  return symbol.startsWith(PREDICT_PREFIX);
}

function extractMarketId(symbol: string): string {
  return symbol.slice(PREDICT_PREFIX.length);
}

function LazyPredictView({ marketId }: { marketId: string }) {
  const [Component, setComponent] = useState<React.ComponentType<{ marketId: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("@/components/predict/PredictTradingView")
      .then((m) => setComponent(() => m.PredictTradingView))
      .catch((err) => setError(err?.message ?? "Failed to load"));
  }, []);

  useEffect(() => {
    document.title = "Predict | Aura";
  }, []);

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 48px - 29px)", color: "rgba(255,255,255,0.54)", fontSize: 14, gap: 8 }}>
        <div style={{ color: "#F5618B" }}>Error loading prediction market</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.36)" }}>{error}</div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 48px - 29px)", color: "rgba(255,255,255,0.36)", fontSize: 14 }}>
        Loading prediction market...
      </div>
    );
  }

  return <Component marketId={marketId} />;
}

export default function PerpPage() {
  const params = useParams();
  const initialSymbol = params.symbol!;
  const [symbol, setSymbol] = useState(initialSymbol);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();

  const isPredict = isPredictSymbol(symbol);

  const { data: price } = useMarkPrice(isPredict ? "PERP_BTC_USDC" : symbol);

  const [, { favorites, updateFavorites }] = useMarkets(MarketsType.FAVORITES);
  useEffect(() => {
    const btcSymbol = "PERP_BTC_USDC";
    const defaultTab = { name: "Popular", id: 1 };
    if (!favorites.some(fav => fav.name === btcSymbol)) {
      updateFavorites([{ name: btcSymbol, tabs: [defaultTab] }, ...favorites]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("orderbook_coin_type", '"USDC"');
      localStorage.setItem("orderbook_mobile_coin_unit", '"quote"');
    } catch {}
  }, []);

  useEffect(() => {
    if (!isPredict) updateSymbol(symbol);
  }, [symbol, isPredict]);

  useEffect(() => {
    if (isPredict) return;
    if (price && typeof price === 'number') {
      const formattedSymbol = symbol.split("_")[1];
      const formattedPrice = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 20,
        maximumSignificantDigits: 5,
      }).format(price);
      document.title = `${formattedPrice} ${formattedSymbol} | Aura`;
    }
  }, [price, symbol, i18n.language, isPredict]);

  useEffect(() => {
    setSymbol(initialSymbol);
  }, [initialSymbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const sym = data.symbol;
      setSymbol(sym);
      const qs = searchParams.toString();
      navigate(`/perp/${sym}${qs ? `?${qs}` : ''}`);
    },
    [navigate, searchParams]
  );

  if (isPredict) {
    return (
      <>
        <LazyPredictView marketId={extractMarketId(symbol)} />
        <TradingPageModifiers />
      </>
    );
  }

  return (
    <>
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
      <TradingPageModifiers />
    </>
  );
}
