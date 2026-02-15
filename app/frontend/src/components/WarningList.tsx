import React from "react";

interface WarningListProps {
  warnings: string[];
  recommendation: string;
}

export function WarningList({ warnings, recommendation }: WarningListProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div className="panel-title-row">
          <h3>Operational Insights</h3>
          <span className="panel-help-wrap">
            <button type="button" className="panel-help" aria-label="Explain operational insights">?</button>
            <span className="panel-tooltip" role="tooltip">
              Rule-based warnings and recommendation generated from utilization, queue pressure, and timeout proximity thresholds.
            </span>
          </span>
        </div>
      </header>
      <ul className="warnings">
        {warnings.length === 0 ? <li>No active warnings</li> : warnings.map((w) => <li key={w}>{w}</li>)}
      </ul>
      <p className="recommendation">{recommendation}</p>
    </section>
  );
}
