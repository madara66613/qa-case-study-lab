export type CaseStatus = "In Progress" | "Draft" | "Ready";
export type JourneyStatus = "done" | "current" | "queued";
export type Priority = "P0" | "P1" | "P2" | "P3";
export type TestStatus = "Passed" | "Failed" | "Blocked" | "Not Run";
export type TestType =
  | "E2E"
  | "Functional"
  | "API"
  | "Accessibility"
  | "UI"
  | "Performance";

export interface CaseStudy {
  id: string;
  title: string;
  platform: string;
  version: string;
  status: CaseStatus;
  signal: "green" | "gray";
}

export interface SkillTag {
  label: string;
  count: number;
}

export interface JourneyStep {
  id: string;
  label: string;
  status: JourneyStatus;
}

export interface TestCase {
  id: string;
  title: string;
  type: TestType;
  priority: Priority;
  status: TestStatus;
  stage: string;
  owner: string;
  lastRun: string;
}

export interface EvidenceItem {
  label: string;
  meta: string;
  kind: "screenshot" | "log";
}

export interface BugReport {
  id: string;
  title: string;
  severity: "Critical" | "Major" | "Minor";
  priority: Priority;
  type: TestType;
  reportedBy: string;
  reportedOn: string;
  environment: string;
  steps: string[];
  expected: string;
  actual: string;
  evidence: EvidenceItem[];
  linkedTestCaseId: string;
}

export interface TestRun {
  id: string;
  name: string;
  startedAt: string;
  scope: string;
  passed: number;
  total: number;
  failed: number;
  blocked: number;
}

export interface SummaryMetrics {
  total: number;
  executed: number;
  passed: number;
  failed: number;
  blocked: number;
  notRun: number;
}
