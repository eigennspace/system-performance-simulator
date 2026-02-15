import React from "react";
import type { AutoscalingAdvisor } from "@sim/shared-types";

interface AutoscalingPanelProps {
  advisor: AutoscalingAdvisor | null;
}

export function AutoscalingPanel({ advisor }: AutoscalingPanelProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div className="panel-title-row">
          <h3>Autoscaling Advisor</h3>
          <span className="panel-help-wrap">
            <button type="button" className="panel-help" aria-label="Explain autoscaling advisor">?</button>
            <span className="panel-tooltip" role="tooltip">
              Heuristic advisor using service rate and traffic intensity to estimate queue wait and suggest thread pool and minimum instance counts.
            </span>
          </span>
        </div>
      </header>
      {!advisor ? (
        <p className="empty-note">Run a simulation to see autoscaling guidance.</p>
      ) : (
        <div className="autoscale-grid">
          <div>
            <small>Traffic Intensity (rho)</small>
            <p>{advisor.trafficIntensity.toFixed(2)}</p>
          </div>
          <div>
            <small>Service Rate</small>
            <p>{advisor.currentServiceRateRps.toFixed(1)} rps</p>
          </div>
          <div>
            <small>Estimated Queue Wait</small>
            <p>
              {advisor.estimatedQueueWaitMs === null
                ? "Unbounded"
                : `${advisor.estimatedQueueWaitMs.toFixed(1)} ms`}
            </p>
          </div>
          <div>
            <small>Recommended Threads</small>
            <p>{advisor.recommendedThreadPoolSize}</p>
          </div>
          <div>
            <small>Min Instances</small>
            <p>{advisor.estimatedMinInstances}</p>
          </div>
        </div>
      )}
    </section>
  );
}
