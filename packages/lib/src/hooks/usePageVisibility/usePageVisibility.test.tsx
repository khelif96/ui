import { act, renderHook } from "../../test_utils";
import { usePageVisibility } from ".";

describe("usePageVisibility", () => {
  const updatePageVisibility = (status: string) => {
    act(() => {
      Object.defineProperty(document, "visibilityState", {
        value: status,
      });
      document.dispatchEvent(new window.Event("visibilitychange"));
    });
  };

  it("usePageVisibility should return true when user is viewing document", () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);
  });

  it("usePageVisibility should return false when user is not viewing document", () => {
    const { result } = renderHook(() => usePageVisibility());
    updatePageVisibility("hidden");
    expect(result.current).toBe(false);
  });
});
