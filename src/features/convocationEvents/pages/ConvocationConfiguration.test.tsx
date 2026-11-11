import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConvocationConfiguration from "./ConvocationConfiguration";
import { eventService } from "../services/eventService";

describe("Convocation configuration interactions", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("min-width"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => vi.unstubAllGlobals());
  const mount = () =>
    render(
      <MemoryRouter initialEntries={["/convocation/events"]}>
        <Routes>
          <Route
            path="/convocation/events"
            element={<ConvocationConfiguration />}
          />
          <Route
            path="/convocation/events/:eventId/edit"
            element={<ConvocationConfiguration />}
          />
        </Routes>
      </MemoryRouter>,
    );
  it("opens event data in a read-only modal", async () => {
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Annual Convocation" }));
    const modal = await screen.findByRole("dialog", {
      name: "View Convocation Event",
    });
    expect(within(modal).getByLabelText(/Event Name/)).toHaveValue(
      "Annual Convocation",
    );
    expect(within(modal).getByLabelText(/Event Name/)).toBeDisabled();
    expect(
      within(modal).getByRole("switch", { name: "Is Registration Open" }),
    ).toBeDisabled();
    expect(
      within(modal).getByRole("switch", { name: "Is Registration Open" }),
    ).toBeChecked();
    expect(
      within(modal).queryByRole("button", { name: "Save Changes" }),
    ).not.toBeInTheDocument();
  });
  it("loads the edit action into the top form and scrolls to it", async () => {
    const target = eventService
      .load()
      .events.find((e) => e.name === "Annual Convocation")!;
    mount();
    const row = screen
      .getByRole("button", { name: "Annual Convocation" })
      .closest("tr")!;
    fireEvent.click(
      within(row).getByRole("button", {
        name: "Edit Event Annual Convocation",
      }),
    );
    expect(
      screen.getByLabelText(/Event Name/, { selector: "input" }),
    ).toHaveValue(target.name);
    expect(
      screen.getByRole("button", { name: "Save Changes" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "start",
      }),
    );
  });
  it("omits filters that are not specified for event configuration", () => {
    mount();
    expect(screen.queryByRole("form", { name: "Filters" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Show filters|Hide filters/ })).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Convocation Events" })).toBeInTheDocument();
  });
});
