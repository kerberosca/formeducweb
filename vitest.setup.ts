import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  Object.defineProperty(window, "scrollTo", {
    value: () => undefined,
    writable: true
  });
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined") {
  Object.defineProperty(window, "ResizeObserver", {
    value: ResizeObserverMock,
    writable: true
  });
}
