import React from "react";

interface UtilizationGaugeProps {
  utilizationPct: number;
}

export function UtilizationGauge({ utilizationPct }: UtilizationGaugeProps) {
  const bounded = Math.max(0, Math.min(utilizationPct, 180));
  const rotation = (bounded / 180) * 180 - 90;
  const tone = bounded > 100 ? "danger" : bounded > 85 ? "warning" : "ok";

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="panel-title-row">
          <h3>Utilization Gauge</h3>
          <span className="panel-help-wrap">
            <button type="button" className="panel-help" aria-label="Explain utilization gauge">?</button>
            <span className="panel-tooltip" role="tooltip">
              Visual indicator of thread utilization percentage. Green is safer headroom, amber is caution, red indicates saturation risk.
            </span>
          </span>
        </div>
      </header>
      <div className="gauge-wrap">
        <div className="gauge-arc" />
        <div className={`gauge-needle ${tone}`} style={{ transform: `rotate(${rotation}deg)` }} />
        <div className="gauge-center" />
      </div>
      <p className={`gauge-value ${tone}`}>{utilizationPct.toFixed(1)}%</p>
    </section>
  );
}
