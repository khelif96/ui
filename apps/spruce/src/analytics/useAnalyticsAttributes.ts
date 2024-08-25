import { useEffect } from "react";

export const useAnalyticsAttributes = () => {
  const userId = localStorage.getItem("userId");
  const { openTelemetry } = window;

  useEffect(() => {
    if (userId !== null && openTelemetry) {
      openTelemetry.setGlobalAttribute("user.id", userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
};
