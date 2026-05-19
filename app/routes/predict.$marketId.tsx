import { useEffect } from "react";
import { useParams, useNavigate } from "@remix-run/react";

export default function PredictMarketRedirect() {
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/perp/PREDICT_${params.marketId}`, { replace: true });
  }, [navigate, params.marketId]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.36)", fontSize: 14 }}>
      Redirecting...
    </div>
  );
}
