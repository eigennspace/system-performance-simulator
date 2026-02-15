import React from "react";

interface HistoryPoint {
  timestamp: number;
  utilizationPct: number;
  latencyMs: number;
}

interface HistoryChartProps {
  points: HistoryPoint[];
  savedPoints: HistoryPoint[];
  onResetSnapshots: () => void;
}

const TIMELINE_MODE_STORAGE_KEY = "simulator.timeline-mode.v1";
const TIMELINE_SOURCE_STORAGE_KEY = "simulator.timeline-source.v1";

export function HistoryChart({ points, savedPoints, onResetSnapshots }: HistoryChartProps) {
  const [mode, setMode] = React.useState<"absolute" | "normalized">(() => {
    if (typeof window === "undefined") {
      return "absolute";
    }
    const stored = window.localStorage.getItem(TIMELINE_MODE_STORAGE_KEY);
    return stored === "normalized" ? "normalized" : "absolute";
  });
  const [source, setSource] = React.useState<"snapshots" | "saved">(() => {
    if (typeof window === "undefined") {
      return "snapshots";
    }
    const stored = window.localStorage.getItem(TIMELINE_SOURCE_STORAGE_KEY);
    return stored === "saved" ? "saved" : "snapshots";
  });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(TIMELINE_MODE_STORAGE_KEY, mode);
  }, [mode]);
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(TIMELINE_SOURCE_STORAGE_KEY, source);
  }, [source]);

  const activePoints = source === "saved" ? savedPoints : points;

  if (activePoints.length < 2) {
    return (
      <section className="panel">
        <header className="panel-header">
          <div className="timeline-head">
            <div className="panel-title-row">
              <h3>Utilization Timeline</h3>
              <span className="panel-help-wrap">
                <button type="button" className="panel-help" aria-label="Explain utilization timeline">?</button>
                <span className="panel-tooltip" role="tooltip">
                  Choose data source: Snapshots (manual Run/Save captures) or Saved Scenarios (persisted records). Absolute mode shows thresholds; Normalized shows relative movement.
                </span>
              </span>
            </div>
            <div className="timeline-controls">
              <div className="timeline-mode-toggle">
                <button
                  className={source === "snapshots" ? "is-active" : ""}
                  onClick={() => setSource("snapshots")}
                >
                  Snapshots
                </button>
                <button
                  className={source === "saved" ? "is-active" : ""}
                  onClick={() => setSource("saved")}
                >
                  Saved
                </button>
              </div>
              <button className="timeline-reset-btn" onClick={onResetSnapshots}>
                Reset Timeline
              </button>
            </div>
          </div>
        </header>
        <p className="empty-note">
          {source === "saved"
            ? "Save at least two scenarios to view saved timeline trends."
            : "Run or save at least two simulations to populate snapshots timeline."}
        </p>
      </section>
    );
  }

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));
  const leftPadding = 12;
  const rightPadding = 6;
  const topPadding = 8;
  const bottomPadding = 14;
  const chartWidth = 100 - leftPadding - rightPadding;
  const chartHeight = 100 - topPadding - bottomPadding;
  const isNormalized = mode === "normalized";
  const utilValues = activePoints.map((point) => point.utilizationPct);
  const latencyValues = activePoints.map((point) => point.latencyMs);

  const utilMin = isNormalized ? Math.min(...utilValues) : 0;
  const utilMax = isNormalized
    ? Math.max(...utilValues, utilMin + 1)
    : 140;
  const latencyMin = isNormalized ? Math.min(...latencyValues) : 0;
  const observedLatencyMax = Math.max(...latencyValues, 1);
  const latencyMax = isNormalized
    ? Math.max(...latencyValues, latencyMin + 1)
    : clamp(Math.ceil(observedLatencyMax / 100) * 100 + 100, 500, 5000);
  const utilTicks = isNormalized
    ? [0.2, 0.4, 0.6, 0.8, 1.0]
    : [40, 80, 100, 120, 140];

  const projectX = (index: number) =>
    leftPadding + (index / (activePoints.length - 1)) * chartWidth;
  const projectUtilY = (utilPct: number) =>
    topPadding +
    (1 - clamp((utilPct - utilMin) / Math.max(utilMax - utilMin, 1), 0, 1)) *
      chartHeight;
  const projectLatencyY = (latencyMs: number) =>
    topPadding +
    (1 -
      clamp(
        (latencyMs - latencyMin) / Math.max(latencyMax - latencyMin, 1),
        0,
        1,
      )) *
      chartHeight;

  const utilPath = activePoints
    .map((point, index) => {
      const x = projectX(index);
      const y = projectUtilY(point.utilizationPct);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const latencyPath = activePoints
    .map((point, index) => {
      const x = projectX(index);
      const y = projectLatencyY(point.latencyMs);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const latest = activePoints[activePoints.length - 1];
  const previous = activePoints[activePoints.length - 2];
  const utilDelta = latest ? latest.utilizationPct - (previous?.utilizationPct ?? latest.utilizationPct) : 0;
  const latencyDelta = latest ? latest.latencyMs - (previous?.latencyMs ?? latest.latencyMs) : 0;
  const formatDelta = (value: number, suffix = "") =>
    `${value >= 0 ? "+" : ""}${value.toFixed(1)}${suffix}`;

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="timeline-head">
          <div className="panel-title-row">
            <h3>Utilization Timeline</h3>
            <span className="panel-help-wrap">
              <button type="button" className="panel-help" aria-label="Explain utilization timeline">?</button>
              <span className="panel-tooltip" role="tooltip">
                Choose data source: Snapshots (manual Run/Save captures) or Saved Scenarios (persisted records). Absolute mode shows thresholds; Normalized shows relative movement.
              </span>
            </span>
          </div>
          <div className="timeline-controls">
            <div className="timeline-mode-toggle">
              <button
                className={source === "snapshots" ? "is-active" : ""}
                onClick={() => setSource("snapshots")}
              >
                Snapshots
              </button>
              <button
                className={source === "saved" ? "is-active" : ""}
                onClick={() => setSource("saved")}
              >
                Saved
              </button>
            </div>
            <div className="timeline-mode-toggle">
              <button
                className={mode === "absolute" ? "is-active" : ""}
                onClick={() => setMode("absolute")}
              >
                Absolute
              </button>
              <button
                className={mode === "normalized" ? "is-active" : ""}
                onClick={() => setMode("normalized")}
              >
                Normalized
              </button>
            </div>
            <button className="timeline-reset-btn" onClick={onResetSnapshots}>
              Reset Timeline
            </button>
          </div>
        </div>
      </header>
      <svg className="timeline-chart" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {utilTicks.map((tick) => {
          const y = isNormalized
            ? topPadding + (1 - tick) * chartHeight
            : projectUtilY(tick);
          return (
            <g key={`tick-${tick}`}>
              <line x1={leftPadding} y1={y} x2={100 - rightPadding} y2={y} className="timeline-grid-line" />
              <text x={leftPadding - 1.5} y={y + 1.5} textAnchor="end" className="timeline-axis-label">
                {isNormalized ? `${Math.round(tick * 100)}` : tick}
              </text>
            </g>
          );
        })}

        <text x={leftPadding} y={5.5} textAnchor="start" className="timeline-axis-title">
          {isNormalized ? "Normalized Util" : "Util (%)"}
        </text>
        <text x={100 - rightPadding} y={5.5} textAnchor="end" className="timeline-axis-title">
          {isNormalized ? "Normalized Latency" : `Lat (${latencyMax}ms max)`}
        </text>

        <path d={utilPath} className="timeline-util" />
        <path d={latencyPath} className="timeline-latency" />
      </svg>
      <div className="timeline-legend">
        <span className="timeline-legend-item">
          <i className="timeline-legend-swatch timeline-legend-swatch-util" />
          Utilization
        </span>
        <span className="timeline-legend-item">
          <i className="timeline-legend-swatch timeline-legend-swatch-latency" />
          Latency
        </span>
      </div>
      <div className="timeline-meta">
        <span>
          Latest Util: <strong>{latest?.utilizationPct.toFixed(1)}%</strong> ({formatDelta(utilDelta, "%")})
        </span>
        <span>
          Latest Latency: <strong>{latest?.latencyMs.toFixed(0)}ms</strong> ({formatDelta(latencyDelta, "ms")})
        </span>
      </div>
    </section>
  );
}
