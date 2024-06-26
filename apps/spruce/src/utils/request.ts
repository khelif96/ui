import { getUiUrl } from "./environmentVariables";
import { reportError } from "./errorReporting";

export const shouldLogoutAndRedirect = (statusCode: number) =>
  statusCode === 401;

export const post = async (url: string, body: unknown) => {
  try {
    const response = await fetch(`${getUiUrl()}${url}`, {
      method: "POST",
      body: JSON.stringify(body),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(getErrorMessage(response, "POST"));
    }
    return response;
  } catch (e: any) {
    handleError(e);
  }
};

const getErrorMessage = (response: Response, method: string) => {
  const { status, statusText } = response;
  return `${method} Error: ${status} - ${statusText}`;
};

const handleError = (error: string) => {
  reportError(new Error(error)).warning();
};

export const fetchWithRetry = <T = any>(
  url: string,
  options: RequestInit,
  retries: number = 3,
  backoff: number = 150,
): Promise<{ data: T }> =>
  new Promise((resolve, reject) => {
    const attemptFetch = (attempt: number): void => {
      fetch(url, options)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          reject(
            new Error(getErrorMessage(res, "GET"), {
              cause: { statusCode: res.status, message: res.statusText },
            }),
          );
        })
        .then((data) => resolve(data))
        .catch((err) => {
          if (attempt <= retries) {
            setTimeout(() => attemptFetch(attempt + 1), backoff * attempt);
          } else {
            reject(err);
          }
        });
    };
    attemptFetch(1);
  });
