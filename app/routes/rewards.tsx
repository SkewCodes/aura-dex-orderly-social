import { useEffect } from "react";
import { Outlet } from "@remix-run/react";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";

export default function RewardsPage() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();

  useEffect(() => {
    document.title = "Rewards Hub | Aura";
  }, []);

  return (
    <Scaffold
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/rewards",
      }}
      footerProps={config.scaffold.footerProps}
      routerAdapter={{
        onRouteChange,
      }}
    >
      <Outlet />
    </Scaffold>
  );
}
