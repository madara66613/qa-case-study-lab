import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("QA Case Study Lab app", () => {
  it("renders the primary dashboard content", () => {
    render(<App />);

    expect(screen.getByText("QA Case Study Lab")).toBeInTheDocument();
    expect(screen.getAllByText("E-commerce Checkout").length).toBeGreaterThan(0);
    expect(screen.getByText("Checkout journey map")).toBeInTheDocument();
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
});
