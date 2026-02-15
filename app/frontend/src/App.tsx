import { useEffect, useMemo, useState } from "react";
import type { SimulationInput, SimulationOutput, SimulationScenarioRecord } from "@sim/shared-types";
import { AutoscalingPanel } from "./components/AutoscalingPanel";
import { HistoryChart } from "./components/HistoryChart";
import { MetricCard } from "./components/MetricCard";
import { ScenarioComparisonOverlay } from "./components/ScenarioComparisonOverlay";
import { TrendGraph } from "./components/TrendGraph";
import { UtilizationGauge } from "./components/UtilizationGauge";
import { WarningList } from "./components/WarningList";

interface ComparisonPreset {
  id: string;
  name: string;
  baselineScenarioId: number;
  candidateScenarioId: number;
  createdAt: string;
  starred: boolean;
}

const COMPARISON_PRESETS_STORAGE_KEY = "simulator.comparison-presets.v1";

const initialInput: SimulationInput = {
  requestsPerSecond: 220,
  averageLatencyMs: 180,
  threadPoolSize: 64,
  queueSize: 500,
  cpuCores: 8,
  targetUtilizationPct: 72,
  timeoutThresholdMs: 1200,
};

export function App() {
  const [input, setInput] = useState<SimulationInput>(initialInput);
  const [output, setOutput] = useState<SimulationOutput | null>(null);
  const [history, setHistory] = useState<
    Array<{ timestamp: number; utilizationPct: number; latencyMs: number }>
  >([]);
  const [scenarios, setScenarios] = useState<SimulationScenarioRecord[]>([]);
  const [isComparisonOpen, setComparisonOpen] = useState(false);
  const [baselineScenarioId, setBaselineScenarioId] = useState<number | null>(null);
  const [candidateScenarioId, setCandidateScenarioId] = useState<number | null>(null);
  const [comparisonPresets, setComparisonPresets] = useState<ComparisonPreset[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(COMPARISON_PRESETS_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as Array<
        Omit<ComparisonPreset, "starred"> & { starred?: boolean }
      >;
      return parsed.map((preset) => ({
        ...preset,
        starred: preset.starred ?? false,
      }));
    } catch {
      return [];
    }
  });
  const [scenarioName, setScenarioName] = useState("Peak Traffic Baseline");
  const [error, setError] = useState<string | null>(null);

  const appendHistoryPoint = (simulation: SimulationOutput) => {
    setHistory((prev) =>
      [
        ...prev,
        {
          timestamp: Date.now(),
          utilizationPct: simulation.metrics.utilizationPct,
          latencyMs: simulation.input.averageLatencyMs,
        },
      ].slice(-20),
    );
  };

  const requestSimulation = async (
    payload: SimulationInput,
    options?: { recordHistory?: boolean },
  ): Promise<SimulationOutput | null> => {
    const response = await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as SimulationOutput;

    if (!response.ok) {
      throw new Error("Simulation request failed");
    }

    setOutput(data);
    setError(null);
    if (options?.recordHistory) {
      appendHistoryPoint(data);
    }

    return data;
  };

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const data = await requestSimulation(input);
        if (cancelled || !data) {
          return;
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Unknown error");
        }
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [input]);

  async function refreshScenarios() {
    const response = await fetch("/api/scenarios");
    if (!response.ok) {
      return;
    }
    const records = (await response.json()) as SimulationScenarioRecord[];
    setScenarios(records);
  }

  useEffect(() => {
    refreshScenarios().catch(() => {
      setError("Could not load saved scenarios");
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      COMPARISON_PRESETS_STORAGE_KEY,
      JSON.stringify(comparisonPresets),
    );
  }, [comparisonPresets]);

  useEffect(() => {
    if (scenarios.length === 0 || comparisonPresets.length === 0) {
      return;
    }

    const validScenarioIds = new Set(scenarios.map((scenario) => scenario.id));
    setComparisonPresets((previous) =>
      previous.filter(
        (preset) =>
          validScenarioIds.has(preset.baselineScenarioId) &&
          validScenarioIds.has(preset.candidateScenarioId),
      ),
    );
  }, [scenarios, comparisonPresets.length]);

  useEffect(() => {
    if (scenarios.length === 0) {
      return;
    }

    const baseline = scenarios[0];
    const candidate = scenarios[1] ?? scenarios[0];
    if (!baseline || !candidate) {
      return;
    }

    setBaselineScenarioId((previous) => {
      if (previous !== null && scenarios.some((scenario) => scenario.id === previous)) {
        return previous;
      }
      return baseline.id;
    });

    setCandidateScenarioId((previous) => {
      if (previous !== null && scenarios.some((scenario) => scenario.id === previous)) {
        return previous;
      }
      return candidate.id;
    });
  }, [scenarios]);

  async function saveScenario() {
    const response = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: scenarioName, input }),
    });

    if (!response.ok) {
      setError("Failed to save scenario");
      return;
    }

    const saved = (await response.json()) as SimulationScenarioRecord;
    setOutput(saved.output);
    appendHistoryPoint(saved.output);
    setError(null);
    await refreshScenarios();
  }

  async function runSnapshot() {
    try {
      await requestSimulation(input, { recordHistory: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unknown error");
    }
  }

  const bottleneckTone = useMemo(() => {
    if (!output) {
      return "neutral" as const;
    }

    switch (output.bottleneck) {
      case "healthy":
        return "ok" as const;
      case "thread_pool_saturation":
      case "queue_saturation":
      case "timeout_risk":
        return "warning" as const;
      default:
        return "danger" as const;
    }
  }, [output]);

  const queueInactive =
    output !== null &&
    output.metrics.concurrencyRequired <= output.input.threadPoolSize;

  const favoritePresets = useMemo(
    () => comparisonPresets.filter((preset) => preset.starred),
    [comparisonPresets],
  );
  const savedTimelinePoints = useMemo(
    () =>
      scenarios
        .slice()
        .reverse()
        .map((scenario) => ({
          timestamp: new Date(scenario.createdAt).getTime(),
          utilizationPct: scenario.output.metrics.utilizationPct,
          latencyMs: scenario.output.input.averageLatencyMs,
        }))
        .slice(-20),
    [scenarios],
  );

  const setField = <K extends keyof SimulationInput>(key: K, value: SimulationInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const applyPresetPair = (presetId: string) => {
    const preset = comparisonPresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    setBaselineScenarioId(preset.baselineScenarioId);
    setCandidateScenarioId(preset.candidateScenarioId);
  };

  const loadPresetCandidate = (presetId: string) => {
    const preset = comparisonPresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    const candidateScenario = scenarios.find(
      (scenario) => scenario.id === preset.candidateScenarioId,
    );
    if (!candidateScenario) {
      return;
    }
    setInput(candidateScenario.input);
  };

  const loadSavedScenario = (scenario: SimulationScenarioRecord) => {
    setInput(scenario.input);
    setOutput(scenario.output);
    appendHistoryPoint(scenario.output);
    setError(null);
  };

  const deleteScenario = async (id: number) => {
    try {
      const response = await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete scenario");
      }
      await refreshScenarios();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unknown error");
    }
  };

  const toTimestamp = () => {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    if (typeof window === "undefined") {
      return;
    }
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadCurrentReport = () => {
    if (!output) {
      setError("Run a simulation first before exporting report");
      return;
    }

    const report = {
      app: "system-performance-simulator",
      exportedAt: new Date().toISOString(),
      input,
      output,
      snapshots: history,
    };

    downloadFile(
      `simulation-report-${toTimestamp()}.json`,
      JSON.stringify(report, null, 2),
      "application/json",
    );
    setError(null);
  };

  const csvEscape = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) {
      return "";
    }
    const raw = String(value);
    const escaped = raw.replaceAll("\"", "\"\"");
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const downloadScenariosCsv = () => {
    if (scenarios.length === 0) {
      setError("Save at least one scenario before exporting CSV");
      return;
    }

    const header = [
      "id",
      "name",
      "createdAt",
      "rps",
      "avgLatencyMs",
      "threadPoolSize",
      "queueSize",
      "cpuCores",
      "targetUtilizationPct",
      "timeoutThresholdMs",
      "concurrencyRequired",
      "utilizationPct",
      "queuePressure",
      "throughputLimit",
      "saturationProbability",
      "bottleneck",
      "queueExplosionRisk",
      "scalingRecommendation",
      "warnings",
    ];

    const rows = scenarios.map((scenario) => [
      scenario.id,
      scenario.name,
      scenario.createdAt,
      scenario.input.requestsPerSecond,
      scenario.input.averageLatencyMs,
      scenario.input.threadPoolSize,
      scenario.input.queueSize,
      scenario.input.cpuCores ?? "",
      scenario.input.targetUtilizationPct,
      scenario.input.timeoutThresholdMs,
      scenario.output.metrics.concurrencyRequired.toFixed(4),
      scenario.output.metrics.utilizationPct.toFixed(2),
      scenario.output.metrics.queuePressure.toFixed(4),
      scenario.output.metrics.throughputLimit.toFixed(2),
      scenario.output.metrics.saturationProbability.toFixed(4),
      scenario.output.bottleneck,
      scenario.output.queueExplosionRisk,
      scenario.output.scalingRecommendation,
      scenario.output.warnings.join(" | "),
    ]);

    const csvLines = [header, ...rows]
      .map((row) => row.map((cell) => csvEscape(cell)).join(","))
      .join("\n");

    downloadFile(`saved-scenarios-${toTimestamp()}.csv`, csvLines, "text/csv;charset=utf-8");
    setError(null);
  };

  const downloadFullBackup = () => {
    const payload = {
      app: "system-performance-simulator",
      exportedAt: new Date().toISOString(),
      currentInput: input,
      currentOutput: output,
      snapshots: history,
      savedScenarios: scenarios,
      comparisonPresets,
    };

    downloadFile(
      `simulator-backup-${toTimestamp()}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
    setError(null);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <h1>System Performance Simulator</h1>
        <p>Little&apos;s Law Tool for backend capacity engineering</p>
      </header>

      <section className="layout">
        <aside className="panel controls">
          <header className="panel-header">
            <h3>Simulation Inputs</h3>
          </header>
          <label>
            RPS
            <input type="number" value={input.requestsPerSecond} onChange={(e) => setField("requestsPerSecond", Number(e.target.value))} />
          </label>
          <label>
            Avg Latency (ms)
            <input type="number" value={input.averageLatencyMs} onChange={(e) => setField("averageLatencyMs", Number(e.target.value))} />
          </label>
          <label>
            Thread Pool Size
            <input type="number" value={input.threadPoolSize} onChange={(e) => setField("threadPoolSize", Number(e.target.value))} />
          </label>
          <label>
            Queue Size
            <input type="number" value={input.queueSize} onChange={(e) => setField("queueSize", Number(e.target.value))} />
          </label>
          <label>
            CPU Cores (optional)
            <input type="number" value={input.cpuCores ?? ""} onChange={(e) => setField("cpuCores", e.target.value ? Number(e.target.value) : undefined)} />
          </label>
          <label>
            Target Utilization (%)
            <input type="number" value={input.targetUtilizationPct} onChange={(e) => setField("targetUtilizationPct", Number(e.target.value))} />
          </label>
          <label>
            Timeout Threshold (ms)
            <input type="number" value={input.timeoutThresholdMs} onChange={(e) => setField("timeoutThresholdMs", Number(e.target.value))} />
          </label>

          <div className="save-row">
            <input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="Scenario name" />
            <button onClick={runSnapshot}>Run</button>
            <button onClick={saveScenario}>Save</button>
          </div>

          <div className="scenario-list">
            <div className="scenario-list-head">
              <h4>Saved Scenarios</h4>
              <button
                disabled={scenarios.length < 2}
                onClick={() => setComparisonOpen(true)}
              >
                Compare
              </button>
            </div>
            {scenarios.slice(0, 6).map((scenario) => (
              <div key={scenario.id} className="scenario-row">
                <button
                  className="scenario-item"
                  onClick={() => loadSavedScenario(scenario)}
                >
                  <span>{scenario.name}</span>
                  <small>{new Date(scenario.createdAt).toLocaleString()}</small>
                </button>
                <button
                  className="scenario-delete-btn"
                  onClick={() => deleteScenario(scenario.id)}
                  aria-label={`Delete scenario ${scenario.name}`}
                  title="Delete scenario"
                >
                  Del
                </button>
              </div>
            ))}
          </div>

          <div className="favorite-presets">
            <div className="scenario-list-head">
              <h4>Favorite Comparisons</h4>
              <small>{favoritePresets.length}</small>
            </div>
            {favoritePresets.length === 0 ? (
              <p className="empty-note">Star presets in Compare overlay to pin them here.</p>
            ) : (
              favoritePresets.slice(0, 5).map((preset) => (
                <div key={`favorite-${preset.id}`} className="favorite-item">
                  <button
                    className="favorite-open-btn"
                    onClick={() => applyPresetPair(preset.id)}
                    title="Apply preset pair selection"
                  >
                    {preset.name}
                  </button>
                  <button
                    className="favorite-load-btn"
                    onClick={() => loadPresetCandidate(preset.id)}
                    title="Load candidate scenario into simulator"
                  >
                    Load
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="export-box">
            <div className="scenario-list-head">
              <h4>Export / Download</h4>
            </div>
            <div className="export-actions">
              <button onClick={downloadCurrentReport} disabled={!output}>
                Report JSON
              </button>
              <button onClick={downloadScenariosCsv} disabled={scenarios.length === 0}>
                Scenarios CSV
              </button>
              <button onClick={downloadFullBackup}>
                Full Backup JSON
              </button>
            </div>
          </div>
        </aside>

        <section className="dashboard-grid">
          {error ? <div className="error-banner">{error}</div> : null}

          <div className="metrics-row">
            <MetricCard
              label="Required Concurrency"
              value={output ? output.metrics.concurrencyRequired.toFixed(2) : "-"}
              helpText="Little's Law: L = lambda x W. Computed as requestsPerSecond x (averageLatencyMs / 1000)."
            />
            <MetricCard
              label="Thread Utilization"
              value={output ? `${output.metrics.utilizationPct.toFixed(1)}%` : "-"}
              tone={bottleneckTone}
              helpText="Utilization ratio = concurrencyRequired / (threadPoolSize x targetUtilizationPct). Higher values mean less capacity headroom."
            />
            <MetricCard
              label="Queue Pressure"
              value={output ? output.metrics.queuePressure.toFixed(2) : "-"}
              tone={output && output.metrics.queuePressure > 0.8 ? "danger" : "neutral"}
              helpText="Queue pressure = max(0, concurrencyRequired - threadPoolSize) / queueSize. Above ~1 indicates queue exhaustion risk."
            />
            <MetricCard
              label="Throughput Limit"
              value={output ? `${output.metrics.throughputLimit.toFixed(1)} rps` : "-"}
              helpText="Approximate service ceiling: threadPoolSize / latencySec. This is a first-order limit estimate."
            />
            <MetricCard
              label="Saturation Probability"
              value={output ? `${(output.metrics.saturationProbability * 100).toFixed(1)}%` : "-"}
              tone={output && output.metrics.saturationProbability > 0.8 ? "danger" : "warning"}
              helpText="Heuristic blend of utilization, queue pressure, and timeout proximity. Higher means greater instability and tail-latency risk."
            />
            <MetricCard
              label="Bottleneck"
              value={output ? output.bottleneck.replaceAll("_", " ") : "-"}
              tone={bottleneckTone}
              helpText="Rule-based classification from thresholds across utilization, queue pressure, and timeout proximity."
            />
          </div>
          {queueInactive ? (
            <div className="queue-helper">
              Queue inactive until concurrencyRequired &gt; threadPoolSize (
              {output.metrics.concurrencyRequired.toFixed(2)} &lt;= {output.input.threadPoolSize})
            </div>
          ) : null}

          <div className="viz-row">
            <UtilizationGauge utilizationPct={output?.metrics.utilizationPct ?? 0} />
            <TrendGraph
              rps={input.requestsPerSecond}
              latencyMs={input.averageLatencyMs}
              throughputLimit={output?.metrics.throughputLimit}
            />
            <WarningList warnings={output?.warnings ?? []} recommendation={output?.scalingRecommendation ?? "Run a simulation to get recommendation."} />
          </div>

          <div className="viz-row">
            <HistoryChart
              points={history}
              savedPoints={savedTimelinePoints}
              onResetSnapshots={() => setHistory([])}
            />
            <AutoscalingPanel advisor={output?.autoscalingAdvisor ?? null} />
          </div>

          <ScenarioComparisonOverlay
            isOpen={isComparisonOpen}
            scenarios={scenarios}
            baselineId={baselineScenarioId}
            candidateId={candidateScenarioId}
            presets={comparisonPresets}
            onBaselineChange={setBaselineScenarioId}
            onCandidateChange={setCandidateScenarioId}
            onSavePreset={(name) => {
              if (baselineScenarioId === null || candidateScenarioId === null) {
                return;
              }
              const trimmedName = name.trim();
              if (!trimmedName) {
                return;
              }

              setComparisonPresets((previous) => [
                {
                  id: `${Date.now()}-${Math.floor(Math.random() * 10_000)}`,
                  name: trimmedName,
                  baselineScenarioId,
                  candidateScenarioId,
                  createdAt: new Date().toISOString(),
                  starred: false,
                },
                ...previous,
              ].slice(0, 20));
            }}
            onApplyPreset={applyPresetPair}
            onTogglePresetStar={(presetId) => {
              setComparisonPresets((previous) =>
                previous.map((preset) =>
                  preset.id === presetId
                    ? { ...preset, starred: !preset.starred }
                    : preset,
                ),
              );
            }}
            onDeletePreset={(presetId) => {
              setComparisonPresets((previous) =>
                previous.filter((preset) => preset.id !== presetId),
              );
            }}
            onClose={() => setComparisonOpen(false)}
            onApplyCandidate={() => {
              const selected = scenarios.find((scenario) => scenario.id === candidateScenarioId);
              if (selected) {
                setInput(selected.input);
                setComparisonOpen(false);
              }
            }}
          />
        </section>
      </section>
    </main>
  );
}
