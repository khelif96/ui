import { renderHook } from "../test_utils";
import { usePageViewDuration } from "./hooks";
import * as utils from "./utils";

vi.mock("@opentelemetry/api", () => ({
  trace: {
    getTracer: vi.fn(() => ({
      startActiveSpan: vi.fn((name, callback) => {
        const span = {
          setAttributes: vi.fn(),
          end: vi.fn(),
        };
        callback(span);
      }),
    })),
  },
}));

describe("usePageViewDuration", () => {
  let sendEventTraceSpy: ReturnType<typeof vi.spyOn>;
  let dateNowSpy: ReturnType<typeof vi.spyOn>;
  let visibilityChangeListeners: ((event: Event) => void)[] = [];

  beforeEach(() => {
    window.AttributeStore = {
      getGlobalAttributes: vi.fn(() => ({})),
    } as any;

    visibilityChangeListeners = [];

    let hiddenValue = false;

    // Mock document.hidden with getter
    Object.defineProperty(document, "hidden", {
      get() {
        return hiddenValue;
      },
      set(value: boolean) {
        hiddenValue = value;
      },
      configurable: true,
    });

    // Mock addEventListener and removeEventListener
    vi.spyOn(document, "addEventListener").mockImplementation(
      (event: string, listener: any) => {
        if (event === "visibilitychange") {
          visibilityChangeListeners.push(listener);
        }
      },
    );

    vi.spyOn(document, "removeEventListener").mockImplementation(
      (event: string, listener: any) => {
        if (event === "visibilitychange") {
          const index = visibilityChangeListeners.indexOf(listener);
          if (index > -1) {
            visibilityChangeListeners.splice(index, 1);
          }
        }
      },
    );

    sendEventTraceSpy = vi.spyOn(utils, "sendEventTrace");
    dateNowSpy = vi.spyOn(Date, "now");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).AttributeStore;
  });

  const setDocumentHidden = (hidden: boolean) => {
    (document as any).hidden = hidden;
  };

  const triggerVisibilityChange = () => {
    visibilityChangeListeners.forEach((listener) => {
      listener(new Event("visibilitychange"));
    });
  };

  it("should send analytics event on unmount with correct duration when page is visible", () => {
    const mountTime = 1000000;
    const unmountTime = 1005500; // 5.5 seconds later
    const expectedDurationMs = 5500;
    const expectedDurationSeconds = 6; // rounded

    dateNowSpy.mockReturnValueOnce(mountTime); // useEffect mount - initialize visibleStartTime
    dateNowSpy.mockReturnValueOnce(unmountTime); // useEffect cleanup - calculate duration

    const { unmount } = renderHook(() => usePageViewDuration("Test Page"));

    expect(sendEventTraceSpy).not.toHaveBeenCalled();

    unmount();

    expect(sendEventTraceSpy).toHaveBeenCalledTimes(1);
    expect(sendEventTraceSpy).toHaveBeenCalledWith(
      { name: "Viewed page" },
      {
        "analytics.identifier": "Test Page",
        "page.view_duration_ms": expectedDurationMs,
        "page.view_duration_seconds": expectedDurationSeconds,
      },
    );
  });

  it("should include additional attributes in the analytics event", () => {
    const mountTime = 2000000;
    const unmountTime = 2003000; // 3 seconds later

    dateNowSpy.mockReturnValueOnce(mountTime); // useEffect mount
    dateNowSpy.mockReturnValueOnce(unmountTime); // useEffect cleanup

    const additionalAttributes = {
      "page.type": "dashboard",
      "user.id": "123",
    };

    const { unmount } = renderHook(() =>
      usePageViewDuration("Dashboard Page", additionalAttributes),
    );

    unmount();

    expect(sendEventTraceSpy).toHaveBeenCalledWith(
      { name: "Viewed page" },
      {
        "analytics.identifier": "Dashboard Page",
        "page.view_duration_ms": 3000,
        "page.view_duration_seconds": 3,
        ...additionalAttributes,
      },
    );
  });

  it("should round duration seconds correctly", () => {
    dateNowSpy.mockReturnValueOnce(0); // useEffect mount
    dateNowSpy.mockReturnValueOnce(1499); // useEffect cleanup - 1.499 seconds

    const { unmount } = renderHook(() => usePageViewDuration("Test Page"));
    unmount();

    expect(sendEventTraceSpy).toHaveBeenCalledWith(
      { name: "Viewed page" },
      expect.objectContaining({
        "page.view_duration_seconds": 1, // rounds down from 1.499
      }),
    );
  });

  it("should handle zero duration", () => {
    const timestamp = 5000000;
    dateNowSpy.mockReturnValue(timestamp);

    const { unmount } = renderHook(() => usePageViewDuration("Test Page"));
    unmount();

    expect(sendEventTraceSpy).toHaveBeenCalledWith(
      { name: "Viewed page" },
      expect.objectContaining({
        "page.view_duration_ms": 0,
        "page.view_duration_seconds": 0,
      }),
    );
  });

  it("should not send event if component never unmounts", () => {
    dateNowSpy.mockReturnValue(1000000);

    renderHook(() => usePageViewDuration("Test Page"));

    expect(sendEventTraceSpy).not.toHaveBeenCalled();
  });

  it("should not track time when page is hidden", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000000);

    const { unmount } = renderHook(() => usePageViewDuration("Test Page"));

    // Advance time by 2 seconds while visible
    vi.advanceTimersByTime(2000);

    // Simulate page becoming hidden
    setDocumentHidden(true);
    triggerVisibilityChange();

    // Advance time by 6 seconds while hidden (shouldn't be counted)
    vi.advanceTimersByTime(6000);

    // Simulate page becoming visible again
    setDocumentHidden(false);
    triggerVisibilityChange();

    // Advance time by 2 more seconds while visible
    vi.advanceTimersByTime(2000);

    unmount();

    // Should only count 2 seconds (before hide) + 2 seconds (after show) = 4 seconds
    expect(sendEventTraceSpy).toHaveBeenCalledWith(
      { name: "Viewed page" },
      {
        "analytics.identifier": "Test Page",
        "page.view_duration_ms": 4000,
        "page.view_duration_seconds": 4,
      },
    );

    vi.useRealTimers();
  });

  it("should handle page starting as hidden", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000000);

    setDocumentHidden(true);

    const { unmount } = renderHook(() => usePageViewDuration("Test Page"));

    // Page starts hidden, advance time (shouldn't be counted)
    vi.advanceTimersByTime(5000);

    // Now make it visible
    setDocumentHidden(false);
    triggerVisibilityChange();

    // Advance time by 3 seconds while visible
    vi.advanceTimersByTime(3000);

    unmount();

    // Should only count time from when page became visible
    expect(sendEventTraceSpy).toHaveBeenCalledWith(
      { name: "Viewed page" },
      {
        "analytics.identifier": "Test Page",
        "page.view_duration_ms": 3000,
        "page.view_duration_seconds": 3,
      },
    );

    vi.useRealTimers();
  });

  it("should handle unmounting while page is hidden", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000000);

    const { unmount } = renderHook(() => usePageViewDuration("Test Page"));

    // Advance time by 3 seconds while visible
    vi.advanceTimersByTime(3000);

    // Simulate page becoming hidden
    setDocumentHidden(true);
    triggerVisibilityChange();

    // Advance time while hidden (shouldn't be counted)
    vi.advanceTimersByTime(7000);

    unmount();

    // Should only count time before page was hidden
    expect(sendEventTraceSpy).toHaveBeenCalledWith(
      { name: "Viewed page" },
      {
        "analytics.identifier": "Test Page",
        "page.view_duration_ms": 3000,
        "page.view_duration_seconds": 3,
      },
    );

    vi.useRealTimers();
  });
});
