import { useCallback } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { RouteOption } from "@orderly.network/ui-scaffold";
import { getSymbol } from "@/utils/storage";

export function useNav() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onRouteChange = useCallback(
    (option: RouteOption) => {
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : "";

      if (option.target === "_blank") {
        window.open(option.href);
        return;
      }

      if (option.href === "/") {
        const symbol = getSymbol();
        navigate(`/perp/${symbol}${queryString}`);
        return;
      }

      const routeMap = {
        "/portfolio/feeTier": "/portfolio/fee",
        "/portfolio/apiKey": "/portfolio/api-key",
        "/affiliate": "/referral",
        "/tradingRewards": "/referral",
      } as Record<string, string>;

      const path = routeMap[option.href] || option.href;

      navigate(`${path}${queryString}`);
    },
    [navigate, searchParams]
  );

  return { onRouteChange };
}
