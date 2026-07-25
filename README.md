# QA Case Study Lab

QA Case Study Lab is a portfolio dashboard for demonstrating practical QA, bug analysis, risk-based testing, and AI-assisted test design.

The app presents a realistic e-commerce checkout case study: journey map, test case table, priority/status filters, release quality signals, latest test runs, linked bug reports, evidence notes, AI-generated suggestions, and markdown report export.

[Live demo](https://madara66613.github.io/qa-case-study-lab/) | [Test plan](docs/test-plan.md) | [Bug report template](docs/bug-report-template.md)

![QA Case Study Lab dashboard](output/playwright/qa-case-study-dashboard.png)

## Why This Project Helps

Hiring managers can quickly see that the candidate understands:

- test case design and prioritization
- P0/P1 risk thinking
- defect reporting with reproduction steps
- expected vs actual result writing
- evidence-driven QA work
- regression and smoke test runs
- small AI-assisted workflow ideas
- React, TypeScript, component state, filtering, tests, and CI

## Features

- Interactive checkout QA dashboard
- Case study navigation and skill tags
- Journey map for checkout steps
- Release quality signals calculated from test and defect data
- Explicit GO, CONDITIONAL, or NO-GO release decision derived from quality signals
- Test case table with priority and status filtering
- Search across test IDs, titles, status, type, stage, and owner
- Linked bug report inspector with metadata, steps, evidence, expected result, and actual result
- AI suggestion panel with adoptable actions
- Simulated focused test runs
- Markdown report preview and browser download
- Unit and UI tests with Vitest and Testing Library
- GitHub Actions CI workflow

## Tech Stack

- React
- TypeScript
- Vite
- Vitest
- Testing Library
- Playwright
- Oxlint
- Lucide React

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run check
```

## Project Structure

```text
.github/workflows/ci.yml       GitHub Actions verification workflow
.github/workflows/deploy-pages.yml  GitHub Pages live demo deployment
docs/
  bug-report-template.md       Reusable bug report template
  design-concept.png           Original UI concept used for implementation
  test-plan.md                 Manual QA test plan
output/playwright/
  qa-case-study-dashboard.png  Verified desktop product screenshot
src/
  App.tsx                      Main application composition and UI states
  App.css                      Product dashboard design system
  App.test.tsx                 Render and interaction tests
  data.ts                      Case study, test case, run, and bug report data
  qa.ts                        Filtering, summary, risk, report, and suggestion logic
  qa.test.ts                   Domain logic tests
  types.ts                     Shared TypeScript types
e2e/
  dashboard.spec.ts            Playwright smoke and responsive checks
```

## Quality Notes

- `npm run check` runs lint, typecheck, unit tests, e2e smoke tests, and build.
- The dashboard is data-driven from typed fixtures.
- QA metrics and release signals are calculated from test case and defect data rather than hardcoded in the UI.
- The release recommendation is deterministic, explainable, and covered by unit tests.
- AI suggestions are deterministic and testable, so the project works without an API key.
- The design concept is included to show product/design process, not only code.

## CV Description

QA Case Study Lab - built a deployed React and TypeScript QA dashboard for an e-commerce checkout case study. Implemented risk-based filtering, explainable release decisions, linked defect inspection, markdown report export, simulated test runs, deterministic AI test suggestions, unit tests, Playwright smoke tests, QA docs, CI, and GitHub Pages deployment.

## Recruiter Demo Flow

1. Search for `PayPal` and run the focused test set.
2. Select `Expiration date in the past` to inspect its linked defect.
3. Adopt an AI regression suggestion.
4. Export the markdown report and review the NO-GO decision.
