import { useCallback, useEffect, useMemo, useRef } from "react";
import { Analytics, ActionType, AnalyticsProperties } from "./types";
import { sendEventTrace } from "./utils";

/**
 *
 * This is simply a clever named type to help with the typing of the `useAnalyticsRoot` hook.
 * `AnalyticsIdentifier` is a string that represents the object to send with an event to our analytics provider.
 * @example - "Page Name"
 * @example - "Component Name"
 */
type AnalyticsIdentifier = string;

/**
 * `useAnalyticsRoot` is a hook that returns a function to send an event to our analytics provider
 * @param analyticsIdentifier - The identifier to send with the event this is typically the page name or component name we are tracking
 * @param attributes - The additional properties that will be passed into our analytics event.
 * @returns - The sendEvent function to send an event to our analytics provider
 */
export const useAnalyticsRoot = <
  Action extends ActionType,
  Identifier extends AnalyticsIdentifier,
>(
  analyticsIdentifier: Identifier,
  attributes: AnalyticsProperties = {},
): Analytics<Action> => {
  const sendEvent: Analytics<Action>["sendEvent"] = useCallback(
    (action) => {
      sendEventTrace(action, {
        "analytics.identifier": analyticsIdentifier,
        ...attributes,
      });
    },
    [analyticsIdentifier, attributes],
  );

  return useMemo(() => ({ sendEvent }), [sendEvent]);
};

/**
 * `usePageViewDuration` is a hook that tracks how long a page/component is viewed and sends an analytics event on unmount
 * @param analyticsIdentifier - The identifier for the page/component being tracked
 * @param attributes - Additional properties to include with the analytics event
 * @example
 * ```tsx
 * function MyPage() {
 *   usePageViewDuration("My Page", { "page.type": "dashboard" });
 *   return <div>Page content</div>;
 * }
 * ```
 */
export const usePageViewDuration = (
  analyticsIdentifier: AnalyticsIdentifier,
  attributes: AnalyticsProperties = {},
) => {
  const mountTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Capture mount time
    mountTimeRef.current = Date.now();

    // Send event on unmount with duration
    return () => {
      const durationMs = Date.now() - mountTimeRef.current;
      const durationSeconds = Math.round(durationMs / 1000);

      sendEventTrace(
        { name: "Viewed page" },
        {
          "analytics.identifier": analyticsIdentifier,
          "page.view_duration_ms": durationMs,
          "page.view_duration_seconds": durationSeconds,
          ...attributes,
        },
      );
    };
  }, [analyticsIdentifier, attributes]);
};
