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

export function generateAiSuggestions(
  bug: BugReport,
  testCases: TestCase[],
) {
  const linkedTest = testCases.find(
    (testCase) => testCase.id === bug.linkedTestCaseId,
  );
  const failedP0Count = testCases.filter(
    (testCase) => testCase.status === "Failed" && testCase.priority === "P0",
  ).length;

  const suggestions = [
    `Add assertion that the declined-card error is visible on ${bug.title.includes("Payment") ? "Payment" : "the affected"} step.`,
    `Add API contract check for gateway decline reason before UI rendering.`,
    `Add regression case for ${linkedTest?.stage ?? "affected"} stage with AVS and CVV mismatch.`,
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
) {
  const topRisks = sortByRisk(highRiskTests)
    .slice(0, 3)
    .map((testCase) => `- ${testCase.id}: ${testCase.title}`)
    .join("\n");

  return [
    "# QA Case Study Report",
    "",
    `## Summary`,
    `Executed: ${summary.executed}/${summary.total}`,
    `Passed: ${summary.passed}`,
    `Failed: ${summary.failed}`,
    `Blocked: ${summary.blocked}`,
    "",
    `## Featured Bug`,
    `${bug.id}: ${bug.title}`,
    "",
    `## Top Risks`,
    topRisks,
  ].join("\n");
}
