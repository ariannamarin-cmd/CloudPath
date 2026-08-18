# CloudPath — Copilot Project Instructions

## Summary

CloudPath is a **Cloud Readiness & Modernization Assessment** app. Users fill out a form describing an existing application's architecture, hosting, deployment process, and engineering capabilities. The backend calculates a 0–100 readiness score, classifies a readiness level, recommends a modernization strategy (RETAIN / REHOST / REPLATFORM / REFACTOR), and returns strengths, gaps, and prioritized recommendations. Everything runs locally — no real cloud infrastructure, no persistent database, no auth.

**Stack:** React 18 (frontend, port 3000) + Node.js 20 / Express 4 (backend, port 4000, REST under `/api`, in-memory store) + Jest (backend tests, ≥80% coverage).

**Do not implement:** auth, persistent DB, external LLM calls, real AWS provisioning (ECS/ECR/ALB/API Gateway/Lambda/K8s), microservices, multiple frontend pages, Redux.

Work through the phases below in order. Each phase includes a verification checkpoint — run it before moving to the next phase.

---

## Phase 1 — Repository & Backend Foundation

**Goal:** Express app boots, health check works, test harness configured.

Structure:

```text
backend/
├── src/
│   ├── app.js          # creates Express app, middleware, mounts routes, exports app
│   ├── server.js        # imports app, listens on port 4000
│   ├── routes/
│   │   └── assessments.js
│   ├── services/
│   │   └── assessmentService.js
│   └── data/
│       └── assessments.js   # in-memory array/store
├── tests/
│   ├── assessmentService.test.js
│   └── assessments.test.js
└── package.json
```

Rules:
- `app.js` only wires things up and exports the app (no `listen()` here) so tests can import it directly with `supertest`.
- `server.js` is the only place that calls `app.listen(4000, ...)`.
- Keep route handlers thin — validation + calling the service + shaping the response only.

Implement `GET /api/health`:

```json
{
  "status": "ok",
  "service": "cloudpath-api"
}
```

**Checkpoint:** Run `cd backend && npm install && npm run dev`, then `curl http://localhost:4000/api/health` and confirm the JSON above. Run `npm test` and confirm the health test passes.

---

## Phase 2 — Modernization Recommendation Engine

**Goal:** Pure, deterministic business logic in `services/assessmentService.js`, fully unit-testable without Express.

### Inputs

```json
{
  "architecture": "monolith",
  "hosting": "virtual-machines",
  "deploymentProcess": "manual",
  "containerized": false,
  "externalizedState": false,
  "externalizedSecrets": true,
  "healthCheck": true,
  "centralizedLogging": false,
  "infrastructureAsCode": true,
  "cicd": true,
  "horizontalScaling": false,
  "observability": true
}
```

Normalized option values:
- `architecture`: `monolith` | `modular-monolith` | `microservices`
- `hosting`: `on-premises` | `virtual-machines` | `cloud-vms` | `containers` | `managed-cloud-platform`
- `deploymentProcess`: `manual` | `scripted` | `cicd`
- All readiness fields (`containerized`, `externalizedState`, etc.) are booleans.

### Scoring (weighted, max 100)

| Capability | Weight |
| --- | ---: |
| `containerized` | 15 |
| `externalizedState` | 15 |
| `externalizedSecrets` | 10 |
| `healthCheck` | 10 |
| `centralizedLogging` | 10 |
| `infrastructureAsCode` | 10 |
| `cicd` | 15 |
| `horizontalScaling` | 10 |
| `observability` | 5 |

Only `true` values add their weight. `architecture`, `hosting`, `deploymentProcess` do **not** affect the score — they only affect strategy selection.

### Readiness levels

| Range | Level | Description |
| --- | --- | --- |
| 0–39 | `LOW` | Significant foundational modernization work is recommended before migration. |
| 40–69 | `MODERATE` | The application has some cloud-ready capabilities but requires targeted modernization. |
| 70–89 | `HIGH` | The application is largely cloud-ready with a limited number of modernization gaps. |
| 90–100 | `CLOUD READY` | The application demonstrates strong cloud-ready engineering practices. |

### Modernization strategies

Pick exactly one of `RETAIN`, `REHOST`, `REPLATFORM`, `REFACTOR` using score + architecture + hosting + deploymentProcess + externalizedState + horizontalScaling + containerized. Keep the logic deterministic (plain if/else or a rules table — no randomness, no ML).

- **RETAIN** — very low score, manual deployment, little automation, limited observability, multiple missing foundational capabilities.
  > The application requires foundational engineering improvements before migration. Focus first on repeatable deployment, configuration management, observability, and operational readiness.

- **REHOST** — on-premises or traditional VMs, low-to-moderate readiness, no major architectural redesign currently needed.
  > The application can initially move to cloud infrastructure with minimal architectural change while modernization continues incrementally.

- **REPLATFORM** — moderate readiness, several modern capabilities already present, containerization/managed platform adoption would clearly help, no full rewrite needed. (Expect this to be the most common outcome.)
  > A full rewrite is unnecessary. Focus on containerization, externalized state and configuration, automated deployment, observability, and managed cloud infrastructure.

- **REFACTOR** — architectural constraints block cloud-native benefits: monolithic architecture, local state, cannot scale horizontally, tight coupling.
  > Architectural changes are recommended before the application can fully benefit from cloud-native scalability, resilience, and independent service evolution.

### Strengths (generate only for `true` answers)

- Application is containerized
- Application state is externalized
- Secrets are externalized
- Health checks are implemented
- Centralized logging is configured
- Infrastructure is managed as code
- Automated CI/CD pipeline exists
- Application supports horizontal scaling
- Monitoring and observability are configured

### Gaps (generate only for `false` answers)

- Application is not containerized
- Application state is stored locally
- Secrets are embedded in application configuration
- Health checks are missing
- Centralized logging is missing
- Infrastructure is not managed as code
- Deployment is not automated
- Application cannot scale horizontally
- Monitoring and observability are missing

### Recommendations

Derive directly from gaps. Shape:

```json
{
  "priority": "HIGH",
  "action": "Containerize the application",
  "reason": "Creates a consistent runtime and prepares the workload for modern cloud platforms."
}
```

| Gap | Priority | Action | Reason |
| --- | --- | --- | --- |
| Not containerized | HIGH | Containerize the application | Creates a consistent runtime environment and prepares the workload for managed container platforms. |
| State not externalized | HIGH | Externalize application state | Stateless application instances can be replaced or scaled independently. |
| Secrets not externalized | HIGH | Externalize application secrets | Separates sensitive credentials from source code and application configuration. |
| No CI/CD | HIGH | Implement automated CI/CD | Creates repeatable deployments and reduces manual release risk. |
| No horizontal scaling | HIGH | Enable horizontal scaling | Allows additional application instances to handle increased demand and improves resilience. |
| No IaC | MEDIUM | Manage infrastructure using Infrastructure as Code | Makes cloud infrastructure repeatable, reviewable, version-controlled, and easier to reproduce. |
| No health checks | MEDIUM | Implement application health checks | Allows infrastructure and orchestration platforms to automatically identify unhealthy application instances. |
| No centralized logging | MEDIUM | Centralize application logging | Improves troubleshooting and operational visibility across environments. |
| No monitoring/observability | MEDIUM | Implement monitoring and observability | Provides visibility into application health, performance, reliability, and failures. |

Sort output so all `HIGH` items appear before all `MEDIUM` items.

**Checkpoint:** Write and run unit tests for: score calculation, each of the 4 readiness classifications, each of the 4 strategies, strengths generation, gap generation, recommendation generation/ordering. All must pass (`npm test`) before Phase 3.

---

## Phase 3 — Assessment API

**Goal:** Wire the engine up to REST endpoints with validation.

### `POST /api/assessments`

Request body: same shape as the Phase 2 inputs example.

Success response (`201`):

```json
{
  "id": "assessment-1",
  "readinessScore": 50,
  "readinessLevel": "MODERATE",
  "modernizationStrategy": "REPLATFORM",
  "summary": "The application has several cloud-ready capabilities but requires targeted modernization.",
  "strengths": ["..."],
  "gaps": ["..."],
  "recommendations": [{ "priority": "HIGH", "action": "...", "reason": "..." }]
}
```

Validation — return `400` for malformed/incomplete requests:

```json
{
  "error": "Invalid assessment request",
  "details": ["architecture is required"]
}
```

Validate:
- `architecture`, `hosting`, `deploymentProcess` are one of the supported normalized values
- all 9 readiness properties are present and are booleans

Keep validation lightweight — plain JS checks are fine, don't add a validation library unless the codebase already has one.

### `GET /api/assessments`

Returns all assessments created so far this server run (in-memory, no persistence needed across restarts):

```json
[
  {
    "id": "assessment-1",
    "readinessScore": 50,
    "readinessLevel": "MODERATE",
    "modernizationStrategy": "REPLATFORM"
  }
]
```

**Checkpoint:** Add API tests (successful POST, invalid POST → 400, GET returns stored assessments). Run `npm test -- --coverage` and confirm backend coverage ≥80%.

---

## Phase 4 — React Assessment Form

**Goal:** Working form that posts to the backend.

Build in `frontend/src/components/AssessmentForm.jsx` (extend existing file):
- Header: `CloudPath` / subtitle `Cloud Readiness & Modernization Assessment` / supporting text: "Evaluate an existing application, identify cloud-modernization gaps, and determine the most appropriate modernization path."
- **Application Profile** section: Architecture, Hosting, Deployment Process (dropdowns/radio using the normalized values from Phase 2)
- **Cloud Engineering Readiness** section: Yes/No controls for all 9 readiness questions
- Primary action button: **Assess Application**
- Loading state while the request is in flight
- Error state if the API call fails

Frontend calls should hit `/api` and rely on the CRA dev-server proxy to forward to `http://localhost:4000` — do not hardcode the backend origin.

**Checkpoint:** Run `cd frontend && npm install && npm start`, submit the form, confirm a network request to `/api/assessments` succeeds and the backend logs/receives it.

---

## Phase 5 — Results Dashboard

**Goal:** Clear, demo-ready results view. This is the most important UI surface.

Suggested new components (only split out if it improves readability):

```text
frontend/src/components/
├── AssessmentResults.jsx
├── ReadinessScore.jsx
├── StrategyCard.jsx
└── RecommendationCard.jsx
```

Must display, in order:
1. Readiness score, prominently (e.g. `58%` + `MODERATE CLOUD READINESS` label, visually distinct per level)
2. Readiness level
3. Modernization strategy (e.g. `Recommended Modernization Strategy` / `REPLATFORM`) + its explanation text
4. Strengths — success indicators, e.g. `✓ CI/CD automation exists`
5. Modernization gaps — plain list
6. Top 3 recommendations prominently (priority badge + action + reason); remaining recommendations below if any exist. HIGH before MEDIUM always.

Reset behavior: after showing results, provide an **Assess Another Application** button that clears state and returns to the form.

Status/priority styling: use distinct visual treatment (not color alone) for LOW/MODERATE/HIGH/CLOUD READY and for HIGH/MEDIUM priority badges — include readable text labels, not just color.

**Checkpoint:** Manually run the demo scenario below and confirm all 6 result sections render correctly and reset works.

---

## Phase 6 — Validation and Demo Polish

Run the full app locally (frontend :3000, backend :4000) and verify with this demo scenario:

```text
Architecture: Monolith
Hosting: Virtual Machines
Deployment Process: Scripted
Containerized: No | Externalized State: No | Externalized Secrets: Yes
Health Checks: Yes | Centralized Logging: No | Infrastructure as Code: Yes
CI/CD: Yes | Horizontal Scaling: No | Observability: Yes
```

Expected outcome shape: a moderate score, multiple strengths, multiple gaps, several prioritized recommendations, and a coherent strategy (likely REPLATFORM or REFACTOR given monolith + no horizontal scaling).

**Checkpoint before continuing:**
- [ ] Frontend/backend integration works end-to-end
- [ ] UI has no visual glitches for this scenario
- [ ] No API errors in console/network tab
- [ ] Reset button returns to a clean form
- [ ] `npm test` passes in `backend/`
- [ ] Coverage ≥80% (`npm test -- --coverage`)

---

## Phase 7 — Supporting Engineering Artifacts (optional, do last)

Only after Phase 6 is fully green. Do not let these block a working app.

1. **README.md** (root) — Project Overview, Features, Tech Stack, Local Setup (backend/frontend/tests commands), Application Architecture diagram, Modernization Recommendation Engine summary, and a **"What AI Accelerated"** section (AI helped with scaffolding, frontend/backend implementation, scoring logic, test generation, docs; engineer owned business requirements, architecture decisions, scoring-weight validation, strategy rules, code review, and testing).
2. Optional: `backend/Dockerfile` (Node 20), `frontend/Dockerfile` (Node build stage + nginx runtime), `docker-compose.yml` — local only, no AWS.
3. Optional: lightweight GitHub Actions CI (install, lint, test, coverage check, security scan) — no AWS deployment steps.

---

## Priority Order When Time-Constrained

1. Modernization Recommendation Engine
2. REST API
3. React assessment form
4. Results dashboard
5. Frontend/backend integration
6. Jest tests
7. Visual polish
8. README
9. CI workflow

Never sacrifice the working local application to finish optional Phase 7 artifacts.

## Definition of Done

- [ ] React app runs locally, Express backend runs locally
- [ ] Assessment form works and talks to the backend via `/api`
- [ ] Score, readiness level, and strategy are calculated correctly
- [ ] Strengths, gaps, and prioritized recommendations are generated
- [ ] Results display clearly; reset works
- [ ] Backend Jest tests pass with ≥80% coverage
- [ ] Full demo runs entirely from `localhost`
