import React, { useId } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "warning" | "danger" | "ok";
  helpText?: string;
}

export function MetricCard({ label, value, tone = "neutral", helpText }: MetricCardProps) {
  const tooltipId = useId();

  return (
    <article className={`metric-card tone-${tone}`}>
      <div className="metric-header">
        <p className="metric-label">{label}</p>
        {helpText ? (
          <span className="metric-help-wrap">
            <button
              type="button"
              className="metric-help"
              aria-describedby={tooltipId}
              aria-label={`Explain ${label}`}
            >
              ?
            </button>
            <span id={tooltipId} role="tooltip" className="metric-tooltip">
              {helpText}
            </span>
          </span>
        ) : null}
      </div>
      <p className="metric-value">{value}</p>
    </article>
  );
}
