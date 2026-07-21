import { describe, expect, it } from "vitest";
import { bugReport, testCases, testRuns } from "./data";
import {
  buildReportMarkdown,
  calculateRiskScore,
  calculateSummary,
  createSimulatedRun,
  filterTestCases,
  generateAiSuggestions,
  sortByRisk,
} from "./qa";

describe("QA analytics", () => {
  it("calculates execution summary from test case statuses", () => {
    expect(calculateSummary(testCases)).toEqual({
      total: 12,
      executed: 9,
      passed: 6,
      failed: 2,
      blocked: 1,
      notRun: 3,
    });
  });

  it("filters by priority, status, and searchable test text", () => {
    const filtered = filterTestCases(testCases, {
      priority: "P0",
      status: "Failed",
      query: "declined",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("TC-041");
  });

  it("sorts the riskiest failed P0 test first", () => {
    const sorted = sortByRisk(testCases);

    expect(sorted[0]?.id).toBe("TC-041");
    expect(calculateRiskScore(sorted[0]!)).toBeGreaterThan(
      calculateRiskScore(testCases.find((testCase) => testCase.id === "TC-034")!),
    );
  });

  it("generates actionable AI suggestions from a bug report", () => {
    const suggestions = generateAiSuggestions(bugReport, testCases);

    expect(suggestions).toContain(
      "Add API contract check for gateway decline reason before UI rendering.",
    );
    expect(suggestions.some((item) => item.includes("failed P0"))).toBe(true);
  });

  it("creates the next simulated run from visible test cases", () => {
    const visibleCases = filterTestCases(testCases, {
      priority: "P0",
      status: "All",
      query: "",
    });
    const run = createSimulatedRun(testRuns, visibleCases);

    expect(run.id).toBe("Run #29");
    expect(run.total).toBe(2);
    expect(run.passed).toBe(1);
    expect(run.failed).toBe(1);
  });

  it("builds a compact markdown report", () => {
    const report = buildReportMarkdown(
      bugReport,
      calculateSummary(testCases),
      testCases,
    );

    expect(report).toContain("# QA Case Study Report");
    expect(report).toContain("BUG-016");
    expect(report).toContain("TC-041");
  });
});
