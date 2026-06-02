import type { ResponseMessageDto } from "./model";
import { getApiErrorMessage } from "./auth";

type ApiEnvelope<TData> = {
  data: TData;
  status: number;
  headers: Headers;
};

type ErrorMessagePayload = ResponseMessageDto & {
  message?: string | null;
};

export type ExternalLoginDto = {
  provider?: string | null;
  providerEmail?: string | null;
};

const parseJsonResponse = async <TData>(response: Response): Promise<TData> => {
  const body = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();

  if (!body) return {} as TData;

  return JSON.parse(body) as TData;
};

const postJson = async <TData, TBody = unknown>(
  url: string,
  body?: TBody,
): Promise<ApiEnvelope<TData>> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseJsonResponse<TData>(response);

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
};

const getJson = async <TData>(url: string): Promise<ApiEnvelope<TData>> => {
  const response = await fetch(url, {
    method: "GET",
  });

  const data = await parseJsonResponse<TData>(response);

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
};

export const postApiAccountLinkGoogle = (idToken: string, accessToken?: string) =>
  postJson<ResponseMessageDto | ErrorMessagePayload, { idToken: string; accessToken?: string }>(
    "/api/account/link-google",
    { idToken, accessToken },
  );

export const getApiAccountExternalLogins = () =>
  getJson<ExternalLoginDto[] | ErrorMessagePayload>(
    "/api/account/external-logins",
  );

export { getApiErrorMessage };
