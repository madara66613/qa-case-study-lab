# QA Case Study Lab

[![CI](https://github.com/madara66613/qa-case-study-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/madara66613/qa-case-study-lab/actions/workflows/ci.yml)

An interactive checkout QA case study with test coverage, linked defects, risk sorting, release recommendations, and Markdown reporting. Test runs, people, defects, and evidence metadata are fictional fixtures.

[Live demo](https://madara66613.github.io/qa-case-study-lab/) · [Test plan](docs/test-plan.md)

![QA dashboard](output/playwright/qa-case-study-dashboard.png)

## Functionality

- Search and filter cases by priority/status, then inspect linked defects and reproduction steps.
- Calculate execution totals, blockers, regression debt, and `GO`/`CONDITIONAL`/`NO-GO` recommendations from fixture data.
- Create simulated focused-run records for the visible case set.
- Review rule-based regression suggestions and include adopted suggestions in a downloaded Markdown report.

Pure functions in [qa.ts](src/qa.ts) handle risk, release decisions, suggestions, and reporting. React manages selection, filters, and report preview.

## Quick start

Requires Node.js 22+ and npm.

```bash
git clone https://github.com/madara66613/qa-case-study-lab.git
cd qa-case-study-lab
npm ci
npx playwright install chromium
npm run dev
```

Open [localhost:5173](http://localhost:5173).

## Tests and delivery

```bash
npm run check
```

This runs Oxlint, TypeScript validation, Vitest unit/component tests, Playwright, and a Vite build. Browser tests check dashboard rendering, filtering, focused-run creation, linked defects, report download, and mobile overflow. Playwright starts its development server automatically.

GitHub Actions runs verification; a separate workflow builds and deploys GitHub Pages. Stack: React, TypeScript, Vite, Vitest, Testing Library, and Playwright.

## Limits

The interface's **Run Tests** button creates a simulated run; it does not execute Playwright. Suggestions use rules rather than an AI provider. Defect screenshot/log labels are illustrative metadata, not committed incident artifacts. The app has no backend, persistence, or issue-tracker integration.

[Bug-report template](docs/bug-report-template.md). No LICENSE file is included.
