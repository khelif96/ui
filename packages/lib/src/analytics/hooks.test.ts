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

  beforeEach(() => {
    window.AttributeStore = {
      getGlobalAttributes: vi.fn(() => ({})),
    } as any;
    sendEventTraceSpy = vi.spyOn(utils, "sendEventTrace");
    dateNowSpy = vi.spyOn(Date, "now");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).AttributeStore;
  });

  it("should send analytics event on unmount with correct duration", () => {
    const mountTime = 1000000;
    const unmountTime = 1005500; // 5.5 seconds later
    const expectedDurationMs = 5500;
    const expectedDurationSeconds = 6; // rounded

    // Hook calls Date.now() 3 times: useRef init, useEffect mount, useEffect cleanup
    dateNowSpy.mockReturnValueOnce(mountTime); // useRef initializer
    dateNowSpy.mockReturnValueOnce(mountTime); // useEffect mount
    dateNowSpy.mockReturnValueOnce(unmountTime); // useEffect cleanup

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

    dateNowSpy.mockReturnValueOnce(mountTime); // useRef initializer
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
    dateNowSpy.mockReturnValueOnce(0); // useRef initializer
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
});
