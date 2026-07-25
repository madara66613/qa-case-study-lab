import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("QA Case Study Lab app", () => {
  it("renders the primary dashboard content", () => {
    render(<App />);

    expect(screen.getByText("QA Case Study Lab")).toBeInTheDocument();
    expect(screen.getAllByText("E-commerce Checkout").length).toBeGreaterThan(0);
    expect(screen.getByText("Checkout journey map")).toBeInTheDocument();
    expect(screen.getByText("Release quality signals")).toBeInTheDocument();
    expect(screen.getByText("NO-GO")).toBeInTheDocument();
    expect(screen.getByText("BUG-016")).toBeInTheDocument();
  });

  it("filters the table with the global search input", () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Search cases, bugs, notes..."), {
      target: { value: "PayPal" },
    });

    expect(screen.getByText("Place order with PayPal")).toBeInTheDocument();
    expect(
      screen.queryByText("Declined card shows error message"),
    ).not.toBeInTheDocument();
  });

  it("adds a focused run from the current filters", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /run tests/i }));

    expect(screen.getByText("Run #29")).toBeInTheDocument();
    expect(
      screen.getByText("Focused run created from 12 visible test cases."),
    ).toBeInTheDocument();
  });

  it("opens details for a completed test run", () => {
    render(<App />);

    fireEvent.click(
      screen.getAllByRole("button", { name: "View Details" })[0]!,
    );

    expect(screen.getByText("Report preview")).toBeInTheDocument();
    expect(screen.getByText(/Scope: Checkout/)).toBeInTheDocument();
  });

  it("shows the linked bug report for the selected failed test", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Expiration date in the past"));

    expect(screen.getByRole("heading", { name: "BUG-017" })).toBeInTheDocument();
    expect(
      screen.getByText("Past expiration date keeps payment form submittable"),
    ).toBeInTheDocument();
  });

  it("shows an empty table state when filters have no matches", () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Search cases, bugs, notes..."), {
      target: { value: "no such checkout case" },
    });

    expect(
      screen.getByText("No test cases match the current filters."),
    ).toBeInTheDocument();
  });
});
