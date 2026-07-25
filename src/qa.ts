import type {
  BugReport,
  Priority,
  SummaryMetrics,
  TestCase,
  TestRun,
  TestStatus,
} from "./types";

export type PriorityFilter = Priority | "All";
export type StatusFilter = TestStatus | "All";

export interface QualitySignals {
  passRate: number;
  releaseBlockers: number;
  automationCandidates: number;
  regressionDebt: number;
}

export interface ReleaseDecision {
  status: "GO" | "CONDITIONAL" | "NO-GO";
  tone: "success" | "warning" | "danger";
  reason: string;
}

const priorityWeights: Record<Priority, number> = {
  P0: 4,
  P1: 3,
  P2: 2,
  P3: 1,
};

export function calculateSummary(testCases: TestCase[]): SummaryMetrics {
  const summary: SummaryMetrics = {
    total: testCases.length,
    executed: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
    notRun: 0,
  };

  for (const testCase of testCases) {
    if (testCase.status !== "Not Run") {
      summary.executed += 1;
    }

    if (testCase.status === "Passed") {
      summary.passed += 1;
    } else if (testCase.status === "Failed") {
      summary.failed += 1;
    } else if (testCase.status === "Blocked") {
      summary.blocked += 1;
    } else {
      summary.notRun += 1;
    }
  }

  return summary;
}

export function filterTestCases(
  testCases: TestCase[],
  options: {
    priority: PriorityFilter;
    status: StatusFilter;
    query: string;
  },
) {
  const query = options.query.trim().toLowerCase();

  return testCases.filter((testCase) => {
    if (options.priority !== "All" && testCase.priority !== options.priority) {
      return false;
    }

    if (options.status !== "All" && testCase.status !== options.status) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      testCase.id,
      testCase.title,
      testCase.type,
      testCase.priority,
      testCase.status,
      testCase.stage,
      testCase.owner,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

export function calculateRiskScore(testCase: TestCase) {
  const statusWeight =
    testCase.status === "Failed" ? 3 : testCase.status === "Blocked" ? 2 : 1;

  return priorityWeights[testCase.priority] * statusWeight;
}

export function sortByRisk(testCases: TestCase[]) {
  return [...testCases].sort(
    (first, second) => calculateRiskScore(second) - calculateRiskScore(first),
  );
}

export function findBugForTest(
  testCaseId: string,
  bugReports: BugReport[],
) {
  return bugReports.find((bug) => bug.linkedTestCaseId === testCaseId);
}

export function calculateQualitySignals(
  testCases: TestCase[],
  bugReports: BugReport[],
): QualitySignals {
  const summary = calculateSummary(testCases);
  const passRate =
    summary.executed === 0 ? 0 : Math.round((summary.passed / summary.executed) * 100);
  const releaseBlockers = bugReports.filter(
    (bug) => bug.priority === "P0" || bug.severity === "Critical",
  ).length;
  const automationCandidates = testCases.filter(
    (testCase) =>
      (testCase.type === "E2E" || testCase.type === "API") &&
      (testCase.priority === "P0" || testCase.priority === "P1"),
  ).length;

  return {
    passRate,
    releaseBlockers,
    automationCandidates,
    regressionDebt: summary.failed + summary.blocked + summary.notRun,
  };
}

export function calculateReleaseDecision(
  signals: QualitySignals,
): ReleaseDecision {
  if (signals.releaseBlockers > 0) {
    return {
      status: "NO-GO",
      tone: "danger",
      reason: `${signals.releaseBlockers} release blocker must be resolved before production.`,
    };
  }

  if (signals.passRate < 80) {
    return {
      status: "NO-GO",
      tone: "danger",
      reason: `Pass rate is ${signals.passRate}%, below the 80% release threshold.`,
    };
  }

  if (signals.regressionDebt > 0) {
    return {
      status: "CONDITIONAL",
      tone: "warning",
      reason: `${signals.regressionDebt} regression items still need triage.`,
    };
  }

  return {
    status: "GO",
    tone: "success",
    reason: "No release blockers or regression debt remain.",
  };
}

export function generateAiSuggestions(
  bug: BugReport,
  testCases: TestCase[],
) {
  const linkedTest = testCases.find(
    (testCase) => testCase.id === bug.linkedTestCaseId,
  );
  const affectedStage = linkedTest?.stage ?? "affected";
  const scenario = linkedTest?.title.toLowerCase() ?? bug.title.toLowerCase();
  const contractCheck =
    bug.id === "BUG-016"
      ? "Add API contract check for gateway decline reason before UI rendering."
      : `Add API contract check for ${affectedStage.toLowerCase()} validation response before UI rendering.`;
  const regressionFocus =
    bug.id === "BUG-016"
      ? "AVS and CVV mismatch"
      : bug.type === "UI"
        ? "slow network recovery"
        : "boundary values";
  const failedP0Count = testCases.filter(
    (testCase) => testCase.status === "Failed" && testCase.priority === "P0",
  ).length;

  const suggestions = [
    `Add assertion that ${scenario} shows the expected user-facing state on ${affectedStage} step.`,
    contractCheck,
    `Add regression case for ${affectedStage} stage with ${regressionFocus}.`,
  ];

  if (failedP0Count > 0) {
    suggestions.push(
      `Keep ${failedP0Count} failed P0 case${failedP0Count === 1 ? "" : "s"} in the next smoke run.`,
    );
  }

  return suggestions;
}

export function createSimulatedRun(
  currentRuns: TestRun[],
  testCases: TestCase[],
): TestRun {
  const summary = calculateSummary(testCases);
  const nextNumber =
    Math.max(
      ...currentRuns.map((run) => Number(run.id.replace(/\D/g, ""))),
      0,
    ) + 1;

  return {
    id: `Run #${nextNumber}`,
    name: "Focused",
    startedAt: "Just now",
    scope: "Selected filters",
    passed: summary.passed,
    failed: summary.failed,
    blocked: summary.blocked,
    total: summary.total,
  };
}

export function buildReportMarkdown(
  bug: BugReport,
  summary: SummaryMetrics,
  highRiskTests: TestCase[],
  adoptedSuggestions: string[] = [],
) {
  const topRisks = sortByRisk(highRiskTests)
    .slice(0, 3)
    .map((testCase) => `- ${testCase.id}: ${testCase.title}`)
    .join("\n");
  const usedSuggestions =
    adoptedSuggestions.length === 0
      ? "- No suggestions adopted yet"
      : adoptedSuggestions.map((suggestion) => `- ${suggestion}`).join("\n");

  return [
    "# QA Case Study Report",
    "",
    "## Summary",
    `Executed: ${summary.executed}/${summary.total}`,
    `Passed: ${summary.passed}`,
    `Failed: ${summary.failed}`,
    `Blocked: ${summary.blocked}`,
    `Not Run: ${summary.notRun}`,
    "",
    "## Featured Bug",
    `${bug.id}: ${bug.title}`,
    `Severity: ${bug.severity}`,
    `Priority: ${bug.priority}`,
    `Environment: ${bug.environment}`,
    `Linked test: ${bug.linkedTestCaseId}`,
    "",
    "## Release Recommendation",
    bug.priority === "P0" || bug.severity === "Critical"
      ? "NO-GO: resolve the featured release blocker before production."
      : "CONDITIONAL: complete regression triage before production.",
    "",
    "## Top Risks",
    topRisks,
    "",
    "## Adopted Suggestions",
    usedSuggestions,
  ].join("\n");
}
