# CloudPath

**Cloud Readiness & Modernization Assessment**

CloudPath assesses how ready an existing application is for cloud modernization. A user describes an application's architecture, hosting model, deployment process, and engineering capabilities through a short form, and the backend returns a 0–100 readiness score, a readiness level, a recommended modernization strategy (RETAIN / REHOST / REPLATFORM / REFACTOR), identified strengths and gaps, and prioritized recommendations.

The entire application runs locally for demo purposes. There is no authentication, no persistent database, no external LLM calls, and no real cloud infrastructure provisioning.

---

## Features

- Weighted cloud-readiness scoring (0–100) based on 9 engineering capabilities
- Readiness classification: `LOW` / `MODERATE` / `HIGH` / `CLOUD READY`
- Deterministic modernization strategy selection: `RETAIN` / `REHOST` / `REPLATFORM` / `REFACTOR`
- Strength identification from positive capabilities
- Modernization gap identification from missing capabilities
- Prioritized recommendations (HIGH before MEDIUM) derived directly from gaps
- In-memory assessment history for the current server session
- Results dashboard built for a short, live demo

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 (Create React App), single-page app, port 3000 |
| Backend | Node.js 20, Express 4, REST API under `/api`, port 4000 |
| Storage | In-memory array (no database, resets on restart) |
| Testing | Jest + Supertest, ≥80% backend coverage |
| CI (optional) | GitHub Actions |

---

## Local Setup

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs the API at `http://localhost:4000`. Verify with:

```bash
curl http://localhost:4000/api/health
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs the app at `http://localhost:3000`. The CRA dev server proxies `/api` requests to `http://localhost:4000` (configured via `"proxy"` in `frontend/package.json`) — no backend origin is hardcoded in the frontend code.

### Tests

```bash
cd backend
npm test              # runs Jest with coverage
npm test -- --coverage # explicit coverage report
```

---

## Application Architecture

```text
Browser
   |
   v
React SPA :3000
   |
   | REST /api
   v
Express API :4000
   |
   v
Modernization Recommendation Engine
   |
   v
In-Memory Assessment Store
```

Backend structure:

```text
backend/
├── src/
│   ├── app.js              # Express app + middleware + routes, no listen()
│   ├── server.js           # starts the server on port 4000
│   ├── routes/
│   │   └── assessments.js  # thin route handlers: validate, call service, respond
│   ├── services/
│   │   └── assessmentService.js  # Modernization Recommendation Engine
│   └── data/
│       └── assessments.js  # in-memory store
└── tests/
```

Frontend structure:

```text
frontend/
├── src/
│   ├── components/
│   │   ├── AssessmentForm.jsx
│   │   ├── AssessmentResults.jsx
│   │   ├── ReadinessScore.jsx
│   │   ├── StrategyCard.jsx
│   │   └── RecommendationCard.jsx
│   ├── App.jsx
│   ├── index.js
│   └── styles.css
```

---

## Modernization Recommendation Engine

All scoring and recommendation logic is deterministic and lives in `backend/src/services/assessmentService.js`, fully unit-testable without Express.

**Weighted readiness score (max 100):**

| Capability | Weight |
| --- | ---: |
| Containerized | 15 |
| Externalized state | 15 |
| Externalized secrets | 10 |
| Health checks | 10 |
| Centralized logging | 10 |
| Infrastructure as Code | 10 |
| CI/CD | 15 |
| Horizontal scaling | 10 |
| Monitoring / observability | 5 |

**Readiness levels:** `LOW` (0–39), `MODERATE` (40–69), `HIGH` (70–89), `CLOUD READY` (90–100).

**Modernization strategies** (chosen from score + architecture + hosting + deployment process + externalized state + horizontal scaling + containerization):

- **RETAIN** — significant foundational gaps; deployment and observability need to mature before any cloud migration.
- **REHOST** — on-premises/traditional VMs, low-to-moderate readiness, lift-and-shift without a redesign.
- **REPLATFORM** — moderate readiness with several modern capabilities already present; the most common outcome.
- **REFACTOR** — architectural constraints (monolith, local state, no horizontal scaling) block cloud-native benefits until the architecture changes.

Strengths, gaps, and recommendations are all generated directly from the boolean readiness answers, with recommendations sorted HIGH priority before MEDIUM.

---

## What AI Accelerated

AI (GitHub Copilot) assisted with:

- Project scaffolding and initial file/folder structure for both frontend and backend
- Implementing the Express REST API and route validation
- Implementing the Modernization Recommendation Engine (scoring, classification, strategy selection, strengths/gaps/recommendation generation)
- Building the React assessment form and results dashboard components
- Generating Jest unit and API tests
- Writing this documentation

The engineer remained responsible for:

- Defining the business problem and assessment criteria
- All architecture decisions (stack, folder structure, API shape)
- Validating and adjusting scoring weights and modernization strategy rules
- Reviewing all AI-generated code
- Running and verifying tests, coverage, and the live demo scenario
- Prioritizing scope and deciding what stayed in/out of the project
