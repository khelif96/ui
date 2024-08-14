import { trace } from "@opentelemetry/api";
import { parseQueryString } from "../utils/query-string";
import { ActionType, AnalyticsProperties } from "./types";

const sendEventTrace = <A extends ActionType>(
  { name, ...actionProps }: A,
  properties: AnalyticsProperties,
) => {
  const tracer = trace.getTracer("analytics");
  tracer.startActiveSpan(name, (span) => {
    // use span.setAttribute to set any relevant attributes
    span.setAttributes({
      ...properties,
      ...actionProps,
    });
    console.log("Sending event trace", name, properties);
    span.end();
  });
};

export { sendEventTrace };

/**
 * `addNewRelicPageAction` is a function that sends an event to our analytics provider
 * @param action - The action to send to our analytics provider
 * @param action.name - The name of the action to send to our analytics provider
 * @param properties - The properties to send with the event
 */
export const addNewRelicPageAction = <A extends ActionType>(
  { name, ...actionProps }: A,
  properties: AnalyticsProperties,
) => {
  const { newrelic } = window;
  const { search } = window.location;
  const attributesToSend = {
    ...properties,
    ...parseQueryString(search),
    ...actionProps,
  };

  if (typeof newrelic !== "object") {
    // These will only print when new relic is not available such as during local development
    console.debug("ANALYTICS EVENT ", { name, attributesToSend });
    return;
  }

  newrelic.addPageAction(name, attributesToSend);
};