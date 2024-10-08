import { act, renderHook, waitFor } from "@evg-ui/lib/test_utils";
import {
  AuthProvider,
  useAuthDispatchContext,
  useAuthStateContext,
} from "./Auth";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const useAuthHook = () => {
  const { devLogin, dispatchAuthenticated, logoutAndRedirect } =
    useAuthDispatchContext();
  const { isAuthenticated } = useAuthStateContext();
  return {
    devLogin,
    dispatchAuthenticated,
    logoutAndRedirect,
    isAuthenticated,
  };
};

describe("auth", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("useAuthDispatchContext should error when rendered outside of AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuthDispatchContext())).toThrow(
      "useAuthDispatchContext must be used within an auth context provider",
    );
  });

  it("useAuthStateContext should error when rendered outside of AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuthStateContext())).toThrow(
      "useAuthStateContext must be used within an auth context provider",
    );
  });

  describe("devLogin", () => {
    it("should authenticate when the response is successful", async () => {
      const mockFetchPromise = vi.fn().mockResolvedValue({ ok: true });
      vi.spyOn(global, "fetch").mockImplementation(mockFetchPromise);

      const { result } = renderHook(() => useAuthHook(), {
        wrapper,
      });

      expect(result.current.isAuthenticated).toBe(false);
      result.current.devLogin({
        password: "password",
        username: "username",
      });
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("should not authenticate when the response is unsuccessful", () => {
      const mockFetchPromise = vi.fn().mockResolvedValue({ ok: false });
      vi.spyOn(global, "fetch").mockImplementation(mockFetchPromise);

      const { result } = renderHook(() => useAuthHook(), {
        wrapper,
      });

      expect(result.current.isAuthenticated).toBe(false);
      result.current.devLogin({
        password: "password",
        username: "username",
      });
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("dispatchAuthenticated", () => {
    it("authenticates the user", () => {
      const { result } = renderHook(() => useAuthHook(), {
        wrapper,
      });
      expect(result.current.isAuthenticated).toBe(false);
      act(() => {
        result.current.dispatchAuthenticated();
      });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("logoutAndRedirect", () => {
    beforeEach(() => {
      Object.defineProperty(window, "location", {
        value: {
          href: "https://just-a-placeholder.com",
        },
        writable: true,
      });
    });

    it("should redirect to the Spruce /login page locally", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("REACT_APP_SPRUCE_URL", "spruce-url");
      const mockFetchPromise = vi.fn().mockResolvedValue({});
      vi.spyOn(global, "fetch").mockImplementation(mockFetchPromise);

      const { result } = renderHook(() => useAuthHook(), {
        wrapper,
      });

      result.current.logoutAndRedirect();
      expect(result.current.isAuthenticated).toBe(false);
      await waitFor(() => {
        expect(window.location.href).toBe("spruce-url/login");
      });
    });

    it("should redirect to the Evergreen /login page otherwise", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("REACT_APP_UI_URL", "evergreen-url");
      const mockFetchPromise = vi.fn().mockResolvedValue({});
      vi.spyOn(global, "fetch").mockImplementation(mockFetchPromise);

      const { result } = renderHook(() => useAuthHook(), {
        wrapper,
      });

      result.current.logoutAndRedirect();
      expect(result.current.isAuthenticated).toBe(false);
      await waitFor(() => {
        expect(window.location.href).toBe("evergreen-url/login");
      });
    });
  });
});
