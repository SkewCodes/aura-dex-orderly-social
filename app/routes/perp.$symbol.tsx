import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { useOrderlyConfig } from "@/utils/config";
import {
  useMarkets, useMarketsStore,
  MarketsStorageKey,
  MarketsType,
  useMarkPrice
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { TradingPageModifiers } from '@/components/trading/TradingPageModifiers';


export default function PerpPage() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: price } = useMarkPrice(symbol);
  const { i18n } = useTranslation();

  const [markets, { favorites, updateFavorites }] = useMarkets(MarketsType.FAVORITES);
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
    let t: number | undefined;


    try {
      // For desktop orderbook - set to quote (USDC)
      localStorage.setItem("orderbook_coin_type", '"USDC"');
      // For mobile orderbook - set to "quote"
      localStorage.setItem("orderbook_mobile_coin_unit", '"quote"');

      // localStorage.getItem("orderbook_coin_type")
      // localStorage.getItem("orderbook_mobile_coin_unit")
    } catch (e) {
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [location.pathname]);


  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  useEffect(() => {
    if (price && typeof price === 'number') {
      const formattedSymbol = symbol.split("_")[1];
      const formattedPrice = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 20,
        maximumSignificantDigits: 5,
      }).format(price);

      const platformName = 'Aura';
      document.title = `${formattedPrice} ${formattedSymbol} | ${platformName}`;
    }
  }, [price, symbol, i18n.language]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      setSymbol(symbol);

      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : '';

      navigate(`/perp/${symbol}${queryString}`);
    },
    [navigate, searchParams]
  );

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
