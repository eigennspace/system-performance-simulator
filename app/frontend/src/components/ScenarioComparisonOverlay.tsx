import React from "react";
import type { SimulationScenarioRecord } from "@sim/shared-types";

interface ComparisonPreset {
  id: string;
  name: string;
  baselineScenarioId: number;
  candidateScenarioId: number;
  createdAt: string;
  starred: boolean;
}

interface ScenarioComparisonOverlayProps {
  isOpen: boolean;
  scenarios: SimulationScenarioRecord[];
  baselineId: number | null;
  candidateId: number | null;
  presets: ComparisonPreset[];
  onBaselineChange: (id: number) => void;
  onCandidateChange: (id: number) => void;
  onSavePreset: (name: string) => void;
  onApplyPreset: (presetId: string) => void;
  onTogglePresetStar: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  onClose: () => void;
  onApplyCandidate: () => void;
}

function formatDelta(value: number, digits = 2): string {
  if (Math.abs(value) < 0.0001) {
    return "0.00";
  }
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function findScenario(
  scenarios: SimulationScenarioRecord[],
  id: number | null,
): SimulationScenarioRecord | null {
  if (id === null) {
    return null;
  }
  return scenarios.find((scenario) => scenario.id === id) ?? null;
}

export function ScenarioComparisonOverlay({
  isOpen,
  scenarios,
  baselineId,
  candidateId,
  presets,
  onBaselineChange,
  onCandidateChange,
  onSavePreset,
  onApplyPreset,
  onTogglePresetStar,
  onDeletePreset,
  onClose,
  onApplyCandidate,
}: ScenarioComparisonOverlayProps) {
  const [presetName, setPresetName] = React.useState("");

  if (!isOpen) {
    return null;
  }

  const baseline = findScenario(scenarios, baselineId);
  const candidate = findScenario(scenarios, candidateId);

  const baselineWarnings = new Set(baseline?.output.warnings ?? []);
  const candidateWarnings = new Set(candidate?.output.warnings ?? []);
  const introducedWarnings = [...candidateWarnings].filter(
    (warning) => !baselineWarnings.has(warning),
  );
  const resolvedWarnings = [...baselineWarnings].filter(
    (warning) => !candidateWarnings.has(warning),
  );

  return (
    <section className="comparison-overlay panel">
      <header className="comparison-header">
        <h3>Scenario Comparison Overlay</h3>
        <button onClick={onClose}>Close</button>
      </header>

      <div className="comparison-controls">
        <label>
          Baseline
          <select
            value={baselineId ?? ""}
            onChange={(event) => onBaselineChange(Number(event.target.value))}
          >
            {scenarios.map((scenario) => (
              <option key={`baseline-${scenario.id}`} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Candidate
          <select
            value={candidateId ?? ""}
            onChange={(event) => onCandidateChange(Number(event.target.value))}
          >
            {scenarios.map((scenario) => (
              <option key={`candidate-${scenario.id}`} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="preset-controls">
        <input
          value={presetName}
          onChange={(event) => setPresetName(event.target.value)}
          placeholder="Preset label (e.g. Peak vs baseline)"
        />
        <button
          onClick={() => {
            const name = presetName.trim();
            if (!name) {
              return;
            }
            onSavePreset(name);
            setPresetName("");
          }}
          disabled={!baseline || !candidate}
        >
          Pin Preset
        </button>
      </div>

      <div className="preset-list">
        {presets.length === 0 ? (
          <p className="empty-note">No pinned presets yet.</p>
        ) : (
          presets.map((preset) => (
            <div key={preset.id} className="preset-item">
              <div className="preset-item-main">
                <button
                  className="preset-star-btn"
                  onClick={() => onTogglePresetStar(preset.id)}
                  title={preset.starred ? "Unfavorite preset" : "Favorite preset"}
                >
                  {preset.starred ? "★" : "☆"}
                </button>
                <button
                  className="preset-open-btn"
                  onClick={() => onApplyPreset(preset.id)}
                >
                  <span>{preset.name}</span>
                  <small>{new Date(preset.createdAt).toLocaleString()}</small>
                </button>
              </div>
              <button
                className="preset-delete-btn"
                onClick={() => onDeletePreset(preset.id)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {!baseline || !candidate ? (
        <p className="empty-note">Select two scenarios to compare.</p>
      ) : (
        <>
          <div className="comparison-grid">
            <div className="compare-col-head">Metric</div>
            <div className="compare-col-head">Baseline</div>
            <div className="compare-col-head">Candidate</div>
            <div className="compare-col-head">Delta</div>

            <div>Concurrency Required</div>
            <div>{baseline.output.metrics.concurrencyRequired.toFixed(2)}</div>
            <div>{candidate.output.metrics.concurrencyRequired.toFixed(2)}</div>
            <div>{formatDelta(candidate.output.metrics.concurrencyRequired - baseline.output.metrics.concurrencyRequired)}</div>

            <div>Utilization %</div>
            <div>{baseline.output.metrics.utilizationPct.toFixed(2)}%</div>
            <div>{candidate.output.metrics.utilizationPct.toFixed(2)}%</div>
            <div>{formatDelta(candidate.output.metrics.utilizationPct - baseline.output.metrics.utilizationPct)}%</div>

            <div>Queue Pressure</div>
            <div>{baseline.output.metrics.queuePressure.toFixed(2)}</div>
            <div>{candidate.output.metrics.queuePressure.toFixed(2)}</div>
            <div>{formatDelta(candidate.output.metrics.queuePressure - baseline.output.metrics.queuePressure)}</div>

            <div>Throughput Limit (rps)</div>
            <div>{baseline.output.metrics.throughputLimit.toFixed(2)}</div>
            <div>{candidate.output.metrics.throughputLimit.toFixed(2)}</div>
            <div>{formatDelta(candidate.output.metrics.throughputLimit - baseline.output.metrics.throughputLimit)}</div>

            <div>Saturation Probability</div>
            <div>{(baseline.output.metrics.saturationProbability * 100).toFixed(2)}%</div>
            <div>{(candidate.output.metrics.saturationProbability * 100).toFixed(2)}%</div>
            <div>{formatDelta((candidate.output.metrics.saturationProbability - baseline.output.metrics.saturationProbability) * 100)}%</div>

            <div>Recommended Threads</div>
            <div>{baseline.output.autoscalingAdvisor.recommendedThreadPoolSize}</div>
            <div>{candidate.output.autoscalingAdvisor.recommendedThreadPoolSize}</div>
            <div>{formatDelta(candidate.output.autoscalingAdvisor.recommendedThreadPoolSize - baseline.output.autoscalingAdvisor.recommendedThreadPoolSize, 0)}</div>

            <div>Estimated Min Instances</div>
            <div>{baseline.output.autoscalingAdvisor.estimatedMinInstances}</div>
            <div>{candidate.output.autoscalingAdvisor.estimatedMinInstances}</div>
            <div>{formatDelta(candidate.output.autoscalingAdvisor.estimatedMinInstances - baseline.output.autoscalingAdvisor.estimatedMinInstances, 0)}</div>
          </div>

          <div className="comparison-summary-row">
            <article className="comparison-summary-card">
              <h4>Bottleneck Transition</h4>
              <p>
                {baseline.output.bottleneck.replaceAll("_", " ")} {"->"} {candidate.output.bottleneck.replaceAll("_", " ")}
              </p>
              <p>
                Queue risk: {baseline.output.queueExplosionRisk} {"->"} {candidate.output.queueExplosionRisk}
              </p>
            </article>

            <article className="comparison-summary-card">
              <h4>Recommendation Diff</h4>
              <p className="rec-line">
                <strong>Baseline:</strong> {baseline.output.scalingRecommendation}
              </p>
              <p className="rec-line">
                <strong>Candidate:</strong> {candidate.output.scalingRecommendation}
              </p>
            </article>

            <article className="comparison-summary-card">
              <h4>Warning Diff</h4>
              <p>
                Introduced: {introducedWarnings.length === 0 ? "None" : introducedWarnings.join(", ")}
              </p>
              <p>
                Resolved: {resolvedWarnings.length === 0 ? "None" : resolvedWarnings.join(", ")}
              </p>
            </article>
          </div>

          <div className="comparison-actions">
            <button onClick={onApplyCandidate}>Load Candidate Into Simulator</button>
          </div>
        </>
      )}
    </section>
  );
}
