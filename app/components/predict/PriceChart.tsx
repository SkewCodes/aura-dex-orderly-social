import { useState, useEffect, useRef, useMemo } from "react";
import { Flex, Text, cn } from "@orderly.network/ui";
import {
  createChart,
  type IChartApi,
  ColorType,
  LineStyle,
  AreaSeries,
  HistogramSeries,
} from "lightweight-charts";
import { useOrderbookStore } from "@/predict/stores";
import type { TradeMessage } from "@/predict/types";

const INTERVALS = ["1m", "3m", "5m", "15m", "30m", "1h", "4h", "12h", "1D", "1W", "1M"] as const;

const INTERVAL_SECONDS: Record<string, number> = {
  "1m": 60, "3m": 180, "5m": 300, "15m": 900, "30m": 1800,
  "1h": 3600, "4h": 14400, "12h": 43200, "1D": 86400, "1W": 604800, "1M": 2592000,
};

interface Props {
  marketId: string;
  historicalTrades?: TradeMessage[];
}

export function PriceChart({ marketId, historicalTrades }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const areaSeriesRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<any>(null);
  const lastBarRef = useRef<{ time: number; close: number } | null>(null);

  const [selectedInterval, setSelectedInterval] = useState("15m");

  const trades = useOrderbookStore((s) => s.trades);
  const lastTrade = useOrderbookStore((s) => s.lastTrade);

  const placeholderData = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const interval = INTERVAL_SECONDS[selectedInterval] || 900;
    const points = 96;
    const area: { time: unknown; value: number }[] = [];
    const volume: { time: unknown; value: number; color: string }[] = [];

    for (let i = 0; i < points; i++) {
      const time = now - (points - i) * interval;
      const value = 50 + 8 * Math.sin((i / points) * Math.PI * 4) + (Math.random() - 0.5) * 3;
      area.push({ time: time as unknown, value: Math.round(value * 100) / 100 });
      volume.push({
        time: time as unknown,
        value: Math.floor(Math.random() * 50 + 10),
        color: value >= 50 ? "rgba(0,181,159,0.15)" : "rgba(255,103,130,0.15)",
      });
    }
    return { area, volume };
  }, [marketId, selectedInterval]); // eslint-disable-line react-hooks/exhaustive-deps

  const chartData = useMemo(() => {
    const allTrades = [...(historicalTrades ?? []), ...trades];
    if (allTrades.length === 0) return { area: [], volume: [] };

    const bucketSize = (INTERVAL_SECONDS[selectedInterval] || 60) * 1000;
    const buckets = new Map<number, { open: number; close: number; high: number; low: number; volume: number }>();

    for (const t of allTrades) {
      const bucket = Math.floor(t.timestamp / bucketSize) * bucketSize;
      const p = t.priceBps;
      const qty = Number(t.quantity);
      const existing = buckets.get(bucket);
      if (existing) {
        existing.close = p;
        existing.high = Math.max(existing.high, p);
        existing.low = Math.min(existing.low, p);
        existing.volume += qty;
      } else {
        buckets.set(bucket, { open: p, close: p, high: p, low: p, volume: qty });
      }
    }

    const sorted = [...buckets.entries()].sort((a, b) => a[0] - b[0]);
    return {
      area: sorted.map(([time, b]) => ({ time: (time / 1000) as unknown as import("lightweight-charts").UTCTimestamp, value: b.close })),
      volume: sorted.map(([time, b]) => ({
        time: (time / 1000) as unknown as import("lightweight-charts").UTCTimestamp,
        value: b.volume,
        color: b.close >= b.open ? "rgba(0,181,159,0.3)" : "rgba(255,103,130,0.3)",
      })),
    };
  }, [historicalTrades, trades, selectedInterval]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(255,255,255,0.35)",
        fontFamily: "ui-monospace, SFMono-Regular, monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        vertLine: { color: "rgba(255,255,255,0.12)", style: LineStyle.Dashed, width: 1, labelBackgroundColor: "#1c2030" },
        horzLine: { color: "rgba(255,255,255,0.12)", style: LineStyle.Dashed, width: 1, labelBackgroundColor: "#1c2030" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.06)", scaleMargins: { top: 0.08, bottom: 0.18 } },
      timeScale: { borderColor: "rgba(255,255,255,0.06)", timeVisible: true, secondsVisible: false },
      handleScale: { axisPressedMouseMove: true },
      handleScroll: { vertTouchDrag: false },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: "rgb(0,181,159)",
      topColor: "rgba(0,181,159,0.2)",
      bottomColor: "rgba(0,181,159,0.0)",
      lineWidth: 2,
      priceFormat: { type: "custom", formatter: (p: number) => `${p}¢` },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    chartRef.current = chart;
    areaSeriesRef.current = areaSeries;
    volumeSeriesRef.current = volumeSeries;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);

    return () => { observer.disconnect(); chart.remove(); chartRef.current = null; areaSeriesRef.current = null; volumeSeriesRef.current = null; };
  }, [marketId]);

  useEffect(() => {
    if (!areaSeriesRef.current || !volumeSeriesRef.current) return;
    const hasRealData = chartData.area.length > 0;
    const data = hasRealData ? chartData : placeholderData;

    if (hasRealData) {
      areaSeriesRef.current.applyOptions({ lineColor: "rgb(0,181,159)", topColor: "rgba(0,181,159,0.2)", bottomColor: "rgba(0,181,159,0.0)", lineWidth: 2 });
    } else {
      areaSeriesRef.current.applyOptions({ lineColor: "rgba(0,181,159,0.25)", topColor: "rgba(0,181,159,0.06)", bottomColor: "rgba(0,181,159,0.0)", lineWidth: 1 });
    }

    areaSeriesRef.current.setData(data.area);
    volumeSeriesRef.current.setData(data.volume);

    if (data.area.length > 0) {
      lastBarRef.current = { time: data.area[data.area.length - 1].time as unknown as number, close: data.area[data.area.length - 1].value };
    }
  }, [chartData, placeholderData]);

  useEffect(() => {
    if (!lastTrade || !areaSeriesRef.current) return;
    const bucketSize = 60;
    const timeSec = Math.floor(lastTrade.timestamp / 1000 / bucketSize) * bucketSize;
    areaSeriesRef.current.update({ time: timeSec as unknown as import("lightweight-charts").UTCTimestamp, value: lastTrade.priceBps });
  }, [lastTrade]);

  const noData = chartData.area.length === 0 && !lastTrade;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }} className="oui-bg-base-9">
      {/* Toolbar — matches Orderly's interval bar */}
      <div style={{ display: "flex", alignItems: "center", height: 32, padding: "0 8px", flexShrink: 0 }} className="oui-border-b oui-border-line-12">
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setSelectedInterval(iv)}
            className={cn(
              "oui-h-[24px] oui-px-2 oui-text-2xs oui-rounded oui-transition-colors oui-font-medium oui-border-0 oui-cursor-pointer",
              selectedInterval === iv
                ? "oui-bg-base-8 oui-text-base-contrast-98"
                : "oui-bg-transparent oui-text-base-contrast-36 hover:oui-text-base-contrast-54",
            )}
          >
            {iv}
          </button>
        ))}
        <div className="oui-w-px oui-h-3 oui-bg-line-12 oui-mx-1" />
        <button className="oui-h-[24px] oui-px-1.5 oui-text-base-contrast-36 hover:oui-text-base-contrast-98 oui-transition-colors oui-rounded oui-border-0 oui-bg-transparent oui-cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 6-8" /></svg>
        </button>
        <button className="oui-h-[24px] oui-px-1.5 oui-text-base-contrast-36 hover:oui-text-base-contrast-98 oui-transition-colors oui-rounded oui-border-0 oui-bg-transparent oui-cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="8" width="4" height="12" /><rect x="10" y="4" width="4" height="16" /><rect x="17" y="1" width="4" height="19" /></svg>
        </button>
        <div className="oui-w-px oui-h-3 oui-bg-line-12 oui-mx-1" />
        <button className="oui-h-[24px] oui-px-1.5 oui-text-base-contrast-36 hover:oui-text-base-contrast-98 oui-transition-colors oui-rounded oui-border-0 oui-bg-transparent oui-cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18M3 12h18" /></svg>
        </button>
        <button className="oui-h-[24px] oui-px-1.5 oui-text-base-contrast-36 hover:oui-text-base-contrast-98 oui-transition-colors oui-rounded oui-border-0 oui-bg-transparent oui-cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
        </button>
        <button className="oui-h-[24px] oui-px-1.5 oui-text-base-contrast-36 hover:oui-text-base-contrast-98 oui-transition-colors oui-rounded oui-border-0 oui-bg-transparent oui-cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
        </button>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <div ref={containerRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        {/* TradingView watermark */}
        <div className="oui-absolute oui-top-2 oui-left-3 oui-z-10 oui-pointer-events-none">
          <div className="oui-w-[18px] oui-h-[18px] oui-rounded-full oui-bg-[#2962FF] oui-flex oui-items-center oui-justify-center">
            <span className="oui-text-[8px] oui-font-bold oui-text-white">TV</span>
          </div>
        </div>
        {noData && (
          <Flex itemAlign="center" justify="center" className="oui-absolute oui-inset-0 oui-z-10 oui-pointer-events-none">
            <div className="oui-text-center oui-bg-base-9/80 oui-px-6 oui-py-3 oui-rounded-lg">
              <Text size="sm" intensity={36}>Simulated price data</Text>
              <Text size="2xs" intensity={20} className="oui-mt-0.5 oui-block">Live chart will populate when trades occur</Text>
            </div>
          </Flex>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 24, padding: "0 12px", flexShrink: 0 }} className="oui-border-t oui-border-line-12">
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-mono">5y 1y 6m 3m 1m 5d 1d</span>
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-mono">
          {new Date().toLocaleTimeString()} (UTC{new Date().getTimezoneOffset() > 0 ? "-" : "+"}
          {Math.abs(Math.floor(new Date().getTimezoneOffset() / 60))})
        </span>
        <span className="oui-text-2xs oui-text-base-contrast-36 oui-font-mono">
          % log <span className="oui-text-primary">auto</span>
        </span>
      </div>
    </div>
  );
}
