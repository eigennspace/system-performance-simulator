You are operating inside Codex CLI with Context7 enabled.

Use the following skills actively during development:

- context7 (documentation lookup, best practices, architecture references)
- frontend-design skill (UI/UX layout, dashboard ergonomics, developer tooling aesthetics)
- senior-fullstack skill (production-grade architecture, scalability, clean code standards)

Always consult Context7 knowledge when making architectural or framework decisions.

--------------------------------------------------
PROJECT
--------------------------------------------------

Build a professional engineering tool called:

"System Performance Simulator (Little’s Law Tool)"

This is a developer-focused system capacity simulator used by backend engineers for performance engineering and capacity planning.

The tool must feel like an internal platform engineering product, not a demo project.

--------------------------------------------------
CORE PURPOSE
--------------------------------------------------

Simulate backend system behavior using:

- Little’s Law
- Queueing theory intuition
- Capacity planning heuristics

Provide actionable insights about bottlenecks and scaling.

--------------------------------------------------
MATHEMATICAL MODEL
--------------------------------------------------

Implement Little’s Law:

    L = λ × W

Where:
    L = concurrency
    λ = arrival rate (requests/sec)
    W = latency (seconds)

Derived metrics:

- concurrency_required
- utilization_ratio
- queue_pressure
- throughput_limit
- saturation_probability (heuristic)

--------------------------------------------------
USER INPUT PARAMETERS
--------------------------------------------------

Provide interactive inputs:

1. Requests per second (RPS)
2. Average latency (ms)
3. Thread pool size
4. Queue size
5. CPU cores (optional)
6. Target utilization (%)
7. Timeout threshold (ms)

Validate all inputs using senior-fullstack standards.

--------------------------------------------------
OUTPUT ANALYSIS
--------------------------------------------------

Generate:

- Required concurrency
- Thread utilization %
- Bottleneck classification
- Queue explosion risk
- Scaling recommendation

Example insights:

- "Thread pool saturation detected"
- "System operating beyond safe utilization"
- "Horizontal scaling recommended"
- "Latency increase will exponentially increase queue wait"

--------------------------------------------------
FRONTEND REQUIREMENTS
--------------------------------------------------

Use frontend-design skill to produce:

- Developer dashboard UI
- Grafana / Datadog inspired layout
- Real-time recalculation
- Clean visualization panels

Include:

- Utilization gauge
- RPS vs latency graph
- Concurrency visualization
- Warning indicators

Design principles:

- minimal cognitive load
- engineering-first UI
- dark mode friendly
- responsive layout

--------------------------------------------------
TECH STACK (START LIGHTWEIGHT)
--------------------------------------------------

Frontend:
React (preferred) with simple component structure.

Backend:
Node.js (Express) OR Python FastAPI (choose best via Context7 reasoning).

Database:
SQLite for saved simulations.

--------------------------------------------------
ARCHITECTURE REQUIREMENTS
--------------------------------------------------

Apply senior-fullstack skill:

- clean architecture separation
- calculation engine isolated from UI
- typed models
- service layer abstraction
- reusable simulation engine

Structure example:

/app
  /frontend
  /backend
  /simulation-engine
  /shared-types

--------------------------------------------------
PHASED DEVELOPMENT
--------------------------------------------------

Phase 1 (MVP):
- Little’s Law calculator
- Live dashboard
- Instant recalculation

Phase 2:
- Save/load simulation scenarios
- Graph visualization

Phase 3:
- What-if simulator
- Traffic spike modeling

Phase 4 (Advanced Engineering):
- M/M/1 queue model
- M/M/c simulation
- Autoscaling advisor

--------------------------------------------------
EXPECTED OUTPUT FROM YOU
--------------------------------------------------

Start by generating:

1. High-level architecture
2. Folder structure
3. Technology justification (using Context7 reasoning)
4. Phase 1 implementation plan
5. Initial working MVP code

Do not skip reasoning steps.

Act as a senior platform engineer building an internal performance engineering tool.
