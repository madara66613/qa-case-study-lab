import {
  AlertCircle,
  Bot,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Download,
  FileText,
  Filter,
  FlaskConical,
  Home,
  PackageCheck,
  Play,
  Search,
  ShieldAlert,
  ShoppingCart,
  SlidersHorizontal,
  Smartphone,
  TestTube2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  bugReports,
  caseStudies,
  journeySteps,
  skillTags,
  testCases,
  testRuns,
} from "./data";
import {
  buildReportMarkdown,
  calculateReleaseDecision,
  calculateQualitySignals,
  calculateSummary,
  createSimulatedRun,
  findBugForTest,
  filterTestCases,
  generateAiSuggestions,
  sortByRisk,
  type PriorityFilter,
  type QualitySignals,
  type StatusFilter,
} from "./qa";
import type {
  BugReport,
  CaseStudy,
  JourneyStep,
  Priority,
  TestCase,
  TestRun,
  TestStatus,
} from "./types";
import "./App.css";

const priorityFilters: PriorityFilter[] = ["All", "P0", "P1", "P2", "P3"];
const statusFilters: StatusFilter[] = [
  "All",
  "Passed",
  "Failed",
  "Blocked",
  "Not Run",
];

const reportFileName = "qa-case-study-report.md";

function App() {
  const [selectedCaseId, setSelectedCaseId] = useState("checkout");
  const [selectedTestId, setSelectedTestId] = useState("TC-041");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [runs, setRuns] = useState<TestRun[]>(testRuns);
  const [adoptedSuggestions, setAdoptedSuggestions] = useState<string[]>([]);
  const [reportPreview, setReportPreview] = useState("");

  const filteredTests = useMemo(
    () =>
      filterTestCases(testCases, {
        priority: priorityFilter,
        status: statusFilter,
        query,
      }),
    [priorityFilter, query, statusFilter],
  );
  const summary = useMemo(() => calculateSummary(testCases), []);
  const selectedTest =
    testCases.find((testCase) => testCase.id === selectedTestId) ??
    testCases[0];
  const selectedCase =
    caseStudies.find((caseStudy) => caseStudy.id === selectedCaseId) ??
    caseStudies[0];
  const selectedBug = findBugForTest(selectedTest.id, bugReports);
  const inspectorBug = selectedBug ?? bugReports[0];
  const suggestions = useMemo(
    () => generateAiSuggestions(inspectorBug, testCases),
    [inspectorBug],
  );
  const topRiskTests = useMemo(() => sortByRisk(testCases).slice(0, 4), []);
  const qualitySignals = useMemo(
    () => calculateQualitySignals(testCases, bugReports),
    [],
  );

  function runFocusedTests() {
    const nextRun = createSimulatedRun(runs, filteredTests);
    setRuns((currentRuns) => [nextRun, ...currentRuns].slice(0, 4));
    setReportPreview(
      `Focused run created from ${filteredTests.length} visible test cases.`,
    );
  }

  function exportReport() {
    const markdown = buildReportMarkdown(
      inspectorBug,
      summary,
      topRiskTests,
      adoptedSuggestions,
    );

    setReportPreview(markdown);
    downloadMarkdownReport(reportFileName, markdown);
  }

  function toggleSuggestion(suggestion: string) {
    setAdoptedSuggestions((currentSuggestions) =>
      currentSuggestions.includes(suggestion)
        ? currentSuggestions.filter((item) => item !== suggestion)
        : [...currentSuggestions, suggestion],
    );
  }

  return (
    <main className="app-shell">
      <IconRail />
      <Sidebar
        selectedCase={selectedCase}
        selectedCaseId={selectedCaseId}
        onSelectCase={setSelectedCaseId}
      />

      <section className="workspace" aria-label="QA case study workspace">
        <TopBar
          selectedCase={selectedCase}
          query={query}
          onQueryChange={setQuery}
          onRunTests={runFocusedTests}
          onExportReport={exportReport}
        />

        <div className="workspace-grid">
          <div className="main-column">
            <JourneyMap journeySteps={journeySteps} summary={summary} />
            <QualitySignalPanel signals={qualitySignals} />
            <TestCasePanel
              filteredTests={filteredTests}
              selectedTest={selectedTest}
              priorityFilter={priorityFilter}
              statusFilter={statusFilter}
              onPriorityChange={setPriorityFilter}
              onStatusChange={setStatusFilter}
              onSelectTest={setSelectedTestId}
            />
            <TestRunsPanel
              runs={runs}
              onInspectRun={(run) =>
                setReportPreview(
                  [
                    `# ${run.id}`,
                    "",
                    `Scope: ${run.scope}`,
                    `Started: ${run.startedAt}`,
                    `Passed: ${run.passed}/${run.total}`,
                    `Failed: ${run.failed}`,
                    `Blocked: ${run.blocked}`,
                  ].join("\n"),
                )
              }
            />
          </div>

          <Inspector
            bug={inspectorBug}
            isLinkedToSelectedTest={selectedBug?.id === inspectorBug.id}
            selectedTest={selectedTest}
            suggestions={suggestions}
            adoptedSuggestions={adoptedSuggestions}
            reportPreview={reportPreview}
            onToggleSuggestion={toggleSuggestion}
          />
        </div>
      </section>
    </main>
  );
}

function downloadMarkdownReport(filename: string, content: string) {
  if (typeof window === "undefined" || typeof URL.createObjectURL !== "function") {
    return;
  }

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function IconRail() {
  const navItems = [
    { label: "Overview", href: "#journey-map", Icon: Home },
    { label: "Test cases", href: "#test-cases", Icon: FlaskConical },
    { label: "Bug report", href: "#bug-report", Icon: Bug },
    { label: "AI suggestions", href: "#ai-suggestions", Icon: Bot },
  ];

  return (
    <aside className="icon-rail" aria-label="Primary navigation">
      <div className="brand-mark">
        <PackageCheck size={24} strokeWidth={2.3} />
      </div>
      <nav className="rail-nav">
        {navItems.map(({ label, href, Icon }, index) => (
          <a
            className={index === 0 ? "rail-button is-active" : "rail-button"}
            key={href}
            href={href}
            aria-label={label}
            title={label}
          >
            <Icon size={19} />
          </a>
        ))}
      </nav>
      <div className="rail-bottom">
        <button className="rail-button" type="button" aria-label="Help">
          <AlertCircle size={18} />
        </button>
        <div className="avatar">DD</div>
      </div>
    </aside>
  );
}

function Sidebar({
  selectedCase,
  selectedCaseId,
  onSelectCase,
}: {
  selectedCase: CaseStudy;
  selectedCaseId: string;
  onSelectCase: (id: string) => void;
}) {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <h1>QA Case Study Lab</h1>
      </header>

      <section className="sidebar-section">
        <div className="sidebar-section-title">
          <span>Case studies</span>
        </div>

        <div className="case-list">
          {caseStudies.map((caseStudy) => (
            <button
              className={
                caseStudy.id === selectedCaseId
                  ? "case-item is-selected"
                  : caseStudy.id === "checkout"
                    ? "case-item"
                    : "case-item is-disabled"
              }
              disabled={caseStudy.id !== "checkout"}
              key={caseStudy.id}
              onClick={() => onSelectCase(caseStudy.id)}
              title={
                caseStudy.id === "checkout"
                  ? `Open ${caseStudy.title}`
                  : `${caseStudy.title} is a portfolio roadmap item`
              }
              type="button"
            >
              <CaseIcon title={caseStudy.title} />
              <span>
                <strong>{caseStudy.title}</strong>
                <small>
                  {caseStudy.platform} · {caseStudy.version} · {caseStudy.status}
                </small>
              </span>
              <i className={`signal signal-${caseStudy.signal}`} />
            </button>
          ))}
        </div>
      </section>

      <section className="sidebar-section skill-section">
        <div className="sidebar-section-title">
          <span>Skill tags</span>
        </div>
        {skillTags.map((tag) => (
          <div className="skill-row" key={tag.label}>
            <span>{tag.label}</span>
            <strong>{tag.count}</strong>
          </div>
        ))}
      </section>

      <div className="sidebar-note">
        <strong>{selectedCase.title}</strong>
        <span>Risk-based QA case study with evidence and regression notes.</span>
      </div>
    </aside>
  );
}

function CaseIcon({ title }: { title: string }) {
  if (title.includes("Checkout") || title.includes("Payment")) {
    return <ShoppingCart size={21} />;
  }

  if (title.includes("Mobile")) {
    return <Smartphone size={20} />;
  }

  if (title.includes("Registration")) {
    return <UserRound size={20} />;
  }

  return <ClipboardCheck size={20} />;
}

function TopBar({
  selectedCase,
  query,
  onQueryChange,
  onRunTests,
  onExportReport,
}: {
  selectedCase: CaseStudy;
  query: string;
  onQueryChange: (query: string) => void;
  onRunTests: () => void;
  onExportReport: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <div>
          <h2>{selectedCase.title}</h2>
          <span className="status-pill">{selectedCase.status}</span>
          <span className="version-chip">{selectedCase.version}</span>
        </div>
      </div>

      <label className="search-field">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search cases, bugs, notes..."
        />
      </label>

      <div className="topbar-actions">
        <button className="primary-button" type="button" onClick={onRunTests}>
          <Play size={17} fill="currentColor" />
          Run Tests
        </button>
        <button className="secondary-button" type="button" onClick={onExportReport}>
          <Download size={17} />
          Export Report
        </button>
      </div>
    </header>
  );
}

function JourneyMap({
  journeySteps,
  summary,
}: {
  journeySteps: JourneyStep[];
  summary: ReturnType<typeof calculateSummary>;
}) {
  const metrics = [
    { label: "Total Test Cases", value: summary.total },
    { label: "Executed", value: summary.executed },
    { label: "Passed", value: summary.passed, tone: "success" },
    { label: "Failed", value: summary.failed, tone: "danger" },
    { label: "Blocked", value: summary.blocked, tone: "warning" },
    { label: "Not Run", value: summary.notRun },
  ];

  return (
    <section className="panel journey-panel" id="journey-map">
      <div className="panel-title">Checkout journey map</div>
      <div className="journey">
        {journeySteps.map((step, index) => (
          <div className="journey-item" key={step.id}>
            <div className={`journey-dot ${step.status}`}>
              {step.status === "done" ? <CheckCircle2 size={17} /> : index + 1}
            </div>
            <span>{index + 1}. {step.label}</span>
          </div>
        ))}
      </div>
      <div className="metric-strip">
        {metrics.map((metric) => (
          <div className="metric-cell" key={metric.label}>
            <span>{metric.label}</span>
            <strong className={metric.tone ? `metric-${metric.tone}` : ""}>
              {metric.value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function QualitySignalPanel({ signals }: { signals: QualitySignals }) {
  const decision = calculateReleaseDecision(signals);
  const items = [
    {
      label: "Pass rate",
      value: `${signals.passRate}%`,
      tone: signals.passRate >= 80 ? "success" : "warning",
    },
    {
      label: "Release blockers",
      value: signals.releaseBlockers,
      tone: signals.releaseBlockers > 0 ? "danger" : "success",
    },
    {
      label: "Automation candidates",
      value: signals.automationCandidates,
      tone: "info",
    },
    {
      label: "Regression debt",
      value: signals.regressionDebt,
      tone: signals.regressionDebt > 4 ? "warning" : "success",
    },
  ];

  return (
    <section className="panel quality-panel" aria-label="Quality signals">
      <div>
        <div className="panel-title">Release quality signals</div>
        <span className="panel-subtitle">
          Risk snapshot generated from typed test and defect fixtures
        </span>
        <div className={`release-decision decision-${decision.tone}`}>
          <ShieldAlert size={20} />
          <div>
            <span>Release decision</span>
            <strong>{decision.status}</strong>
            <small>{decision.reason}</small>
          </div>
        </div>
      </div>
      <div className="quality-grid">
        {items.map((item) => (
          <div className={`quality-item quality-${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function TestCasePanel({
  filteredTests,
  selectedTest,
  priorityFilter,
  statusFilter,
  onPriorityChange,
  onStatusChange,
  onSelectTest,
}: {
  filteredTests: TestCase[];
  selectedTest: TestCase;
  priorityFilter: PriorityFilter;
  statusFilter: StatusFilter;
  onPriorityChange: (filter: PriorityFilter) => void;
  onStatusChange: (filter: StatusFilter) => void;
  onSelectTest: (id: string) => void;
}) {
  return (
    <section className="panel test-panel" id="test-cases">
      <div className="panel-heading">
        <div>
          <div className="panel-title">Test cases</div>
          <span className="panel-subtitle">
            Showing {filteredTests.length} visible cases
          </span>
        </div>
        <button className="icon-button" type="button" aria-label="Filters">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <div className="filters-row">
        <div className="segment-control">
          {priorityFilters.map((priority) => (
            <button
              className={priority === priorityFilter ? "is-selected" : ""}
              key={priority}
              onClick={() => onPriorityChange(priority)}
              type="button"
            >
              {priority}
            </button>
          ))}
        </div>

        <label className="select-field">
          <Filter size={16} />
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as StatusFilter)
            }
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status} Statuses
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th aria-label="Selected" />
              <th>ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Last Run</th>
            </tr>
          </thead>
          <tbody>
            {filteredTests.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={7}>No test cases match the current filters.</td>
              </tr>
            ) : null}

            {filteredTests.map((testCase) => (
              <tr
                className={testCase.id === selectedTest.id ? "is-active" : ""}
                key={testCase.id}
                onClick={() => onSelectTest(testCase.id)}
              >
                <td>
                  <input
                    checked={testCase.id === selectedTest.id}
                    onChange={() => onSelectTest(testCase.id)}
                    type="checkbox"
                    aria-label={`Select ${testCase.id}`}
                  />
                </td>
                <td>{testCase.id}</td>
                <td>{testCase.title}</td>
                <td>{testCase.type}</td>
                <td>
                  <PriorityBadge priority={testCase.priority} />
                </td>
                <td>
                  <StatusBadge status={testCase.status} />
                </td>
                <td>{testCase.lastRun}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TestRunsPanel({
  runs,
  onInspectRun,
}: {
  runs: TestRun[];
  onInspectRun: (run: TestRun) => void;
}) {
  return (
    <section className="panel run-panel">
      <div className="panel-title">Test runs (latest)</div>
      <div className="run-list">
        {runs.map((run) => {
          const percent = Math.round((run.passed / run.total) * 100);

          return (
            <article className="run-row" key={run.id}>
              <RunIcon run={run} />
              <div>
                <strong>{run.id}</strong>
                <span>{run.name}</span>
              </div>
              <small>{run.startedAt}</small>
              <div className="progress-track" aria-label={`${percent}% passed`}>
                <i style={{ width: `${percent}%` }} />
              </div>
              <span>
                {run.passed}/{run.total} ({percent}%)
              </span>
              <button type="button" onClick={() => onInspectRun(run)}>
                View Details
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function RunIcon({ run }: { run: TestRun }) {
  if (run.failed > 0) {
    return <XCircle className="run-icon danger" size={22} />;
  }

  if (run.blocked > 0) {
    return <AlertCircle className="run-icon warning" size={22} />;
  }

  return <CheckCircle2 className="run-icon success" size={22} />;
}

function Inspector({
  bug,
  isLinkedToSelectedTest,
  selectedTest,
  suggestions,
  adoptedSuggestions,
  reportPreview,
  onToggleSuggestion,
}: {
  bug: BugReport;
  isLinkedToSelectedTest: boolean;
  selectedTest: TestCase;
  suggestions: string[];
  adoptedSuggestions: string[];
  reportPreview: string;
  onToggleSuggestion: (suggestion: string) => void;
}) {
  return (
    <aside className="inspector">
      <section className="panel bug-card" id="bug-report">
        <div className="inspector-kicker">Bug report</div>
        <div className="bug-head">
          <h2>{bug.id}</h2>
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(bug.id)}
            title={`Copy ${bug.id}`}
          >
            Copy ID
          </button>
        </div>
        <h3>{bug.title}</h3>

        <dl className="bug-meta">
          <MetaRow label="Severity" value={bug.severity} tone="danger" />
          <MetaRow label="Priority" value={bug.priority} tone="danger" />
          <MetaRow label="Type" value={bug.type} />
          <MetaRow label="Reported by" value={bug.reportedBy} />
          <MetaRow label="Reported on" value={bug.reportedOn} />
          <MetaRow label="Environment" value={bug.environment} />
        </dl>

        <InspectorSection title="Reproduction steps">
          <ol className="steps">
            {bug.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </InspectorSection>

        <InspectorSection title="Expected result">
          <p>{bug.expected}</p>
        </InspectorSection>

        <InspectorSection title="Actual result">
          <p>{bug.actual}</p>
        </InspectorSection>

        <InspectorSection title="Evidence">
          <div className="evidence-list">
            {bug.evidence.map((item) => (
              <div className="evidence-item" key={item.label}>
                {item.kind === "screenshot" ? (
                  <FileText size={21} />
                ) : (
                  <Code2 size={22} />
                )}
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.meta}</small>
                </span>
              </div>
            ))}
          </div>
        </InspectorSection>
      </section>

      <section className="panel suggestion-card" id="ai-suggestions">
        <div className="inspector-kicker">AI suggestions</div>
        <div className="suggestion-context">
          <TestTube2 size={18} />
          {isLinkedToSelectedTest
            ? `Linked to ${selectedTest.id}: ${selectedTest.stage}`
            : `Showing highest-risk defect; ${selectedTest.id} has no linked bug`}
        </div>
        <div className="suggestion-list">
          {suggestions.map((suggestion) => {
            const isAdopted = adoptedSuggestions.includes(suggestion);

            return (
              <div className="suggestion-row" key={suggestion}>
                <span>{suggestion}</span>
                <button
                  className={isAdopted ? "is-adopted" : ""}
                  onClick={() => onToggleSuggestion(suggestion)}
                  type="button"
                >
                  {isAdopted ? "Used" : "Use"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {reportPreview && (
        <section className="panel report-preview" aria-live="polite">
          <div className="inspector-kicker">Report preview</div>
          <pre>{reportPreview}</pre>
        </section>
      )}
    </aside>
  );
}

function InspectorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="inspector-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function MetaRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger";
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={tone ? `meta-${tone}` : ""}>{value}</dd>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`priority-badge priority-${priority}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: TestStatus }) {
  return <span className={`status-badge status-${status.replace(" ", "-")}`}>{status}</span>;
}

export default App;
