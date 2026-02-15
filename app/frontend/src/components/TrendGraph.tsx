import React from "react";

interface TrendGraphProps {
  rps: number;
  latencyMs: number;
  throughputLimit?: number;
}

export function TrendGraph({ rps, latencyMs, throughputLimit }: TrendGraphProps) {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const mu = Math.max(throughputLimit ?? rps * 1.8, rps * 1.05, 1);
  const operatingRho = clamp(rps / mu, 0.05, 0.97);

  // Calibrate service time to match current observed operating point.
  const serviceTimeSec = Math.max(0.001, (latencyMs / 1000) * (1 - operatingRho));

  const pointCount = 28;
  const rhoStart = 0.12;
  const rhoEnd = 0.985;
  const rawSeries = Array.from({ length: pointCount }, (_, index) => {
    const t = index / (pointCount - 1);
    const rho = rhoStart + t * (rhoEnd - rhoStart);
    const predictedLatencyMs = (serviceTimeSec / (1 - rho)) * 1000;
    return {
      x: t * 100,
      yMs: predictedLatencyMs,
    };
  });

  const minRaw = Math.min(...rawSeries.map((point) => point.yMs));
  const maxRaw = Math.max(...rawSeries.map((point) => point.yMs));
  const logDenominator = Math.log((maxRaw + 1) / (minRaw + 1)) || 1;
  const topPadding = 10;
  const bottomPadding = 10;
  const drawableHeight = 100 - topPadding - bottomPadding;

  const points = rawSeries.map((point) => {
    const normalized =
      logDenominator > 0
        ? Math.log((point.yMs + 1) / (minRaw + 1)) / logDenominator
        : 0.5;
    const y = bottomPadding + clamp(normalized, 0, 1) * drawableHeight;
    return {
      x: point.x,
      y,
    };
  });

  const operatingYMs = (serviceTimeSec / (1 - operatingRho)) * 1000;
  const operatingNormalized =
    logDenominator > 0
      ? Math.log((operatingYMs + 1) / (minRaw + 1)) / logDenominator
      : 0.5;
  const operatingPoint = {
    x: ((operatingRho - rhoStart) / (rhoEnd - rhoStart)) * 100,
    y: bottomPadding + clamp(operatingNormalized, 0, 1) * drawableHeight,
  };

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${100 - point.y}`)
    .join(" ");
  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="panel-title-row">
          <h3>RPS vs Latency Curve</h3>
          <span className="panel-help-wrap">
            <button type="button" className="panel-help" aria-label="Explain RPS vs latency curve">?</button>
            <span className="panel-tooltip" role="tooltip">
              Queueing-style response curve. As utilization approaches service capacity, latency rises non-linearly (knee behavior).
            </span>
          </span>
        </div>
      </header>
      <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#3ef6b1" />
            <stop offset="100%" stopColor="#ff9757" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="url(#lineGradient)" strokeWidth="2" />
        {startPoint ? (
          <circle
            className="trend-point trend-point-start"
            cx={startPoint.x}
            cy={100 - startPoint.y}
            r="1.8"
          />
        ) : null}
        {endPoint ? (
          <circle
            className="trend-point trend-point-end"
            cx={endPoint.x}
            cy={100 - endPoint.y}
            r="2.1"
          />
        ) : null}
        <circle
          className="trend-point trend-point-operating"
          cx={clamp(operatingPoint.x, 0, 100)}
          cy={100 - clamp(operatingPoint.y, bottomPadding, 100 - topPadding)}
          r="2.3"
        />
      </svg>
    </section>
  );
}
