# QA Case Study Lab Test Plan

## Scope

QA Case Study Lab demonstrates a recruiter-friendly checkout testing workflow:

- risk-based test case table
- priority and status filtering
- release quality signals
- selected linked bug report with evidence
- simulated focused test run
- generated QA suggestions
- markdown report preview and browser download

## Manual Test Cases

## TC-01: Dashboard renders case study context

**Priority:** P0
**Area:** First screen

### Steps

1. Open the app.
2. Review the left navigation, top command bar, test case table, and bug inspector.

### Expected Result

The first screen shows the E-commerce Checkout case study, visible metrics, release quality signals, test cases, and BUG-016 details without scrolling horizontally on desktop.

## TC-02: Search narrows test cases

**Priority:** P0
**Area:** Search

### Steps

1. Type `PayPal` in the search input.
2. Review the test table.

### Expected Result

Only matching test cases are shown, and the visible count updates.

## TC-03: Priority filter highlights P0 risk

**Priority:** P1
**Area:** Filtering

### Steps

1. Click the `P0` segmented control.
2. Review the table rows.

### Expected Result

Only P0 test cases remain visible.

## TC-04: Run focused tests

**Priority:** P0
**Area:** Test runs

### Steps

1. Click **Run Tests**.
2. Review the latest test runs panel and report preview.

### Expected Result

A new focused run appears as `Run #29`, and the report preview confirms how many visible cases were included.

## TC-05: Export report preview and download

**Priority:** P1
**Area:** Reporting

### Steps

1. Click **Export Report**.
2. Review the right-side report preview.
3. Confirm the browser downloads `qa-case-study-report.md`.

### Expected Result

The preview and downloaded markdown contain summary metrics, BUG-016, not-run count, and top risk test cases.

## TC-06: Select linked bug report

**Priority:** P1
**Area:** Bug inspector

### Steps

1. Click `Expiration date in the past` in the test case table.
2. Review the right-side bug inspector.

### Expected Result

The inspector switches from BUG-016 to BUG-017 and shows that the defect is linked to TC-038.

## TC-07: Use AI suggestion

**Priority:** P2
**Area:** AI suggestions

### Steps

1. Click **Use** on any AI suggestion.
2. Click the same control again.

### Expected Result

The suggestion toggles between `Use` and `Used` without changing unrelated UI state.
