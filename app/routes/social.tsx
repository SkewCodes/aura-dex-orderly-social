import { useEffect } from "react";
import { Outlet } from "@remix-run/react";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";
import { useTranslation } from "@orderly.network/i18n";

export default function SocialPage() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();
  const { t } = useTranslation();

  useEffect(() => {
    document.title = "Social Hub | Aura";
  }, []);

  return (
    <Scaffold
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/social",
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
