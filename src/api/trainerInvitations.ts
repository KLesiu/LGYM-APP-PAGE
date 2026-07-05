import type {
  CreateTrainerInvitationByEmailRequest,
  PaginatedTrainerInvitationRequest,
  PaginatedTrainerInvitationResult,
  ResponseMessageDto,
  TrainerInvitationDto,
} from "./model";

type ApiEnvelope<TData> = {
  data: TData;
  status: number;
  headers: Headers;
};

type ErrorMessagePayload = ResponseMessageDto & {
  message?: string | null;
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

export const postTrainerInvitationsByEmail = (
  payload: CreateTrainerInvitationByEmailRequest,
) =>
  postJson<
    TrainerInvitationDto | ErrorMessagePayload,
    CreateTrainerInvitationByEmailRequest
  >("/api/trainer/invitations/by-email", payload);

export const postTrainerInvitationsPaginated = (
  payload: PaginatedTrainerInvitationRequest,
) =>
  postJson<
    PaginatedTrainerInvitationResult | ErrorMessagePayload,
    PaginatedTrainerInvitationRequest
  >("/api/trainer/invitations/paginated", payload);

export const postTrainerInvitationRevoke = (invitationId: string) =>
  postJson<ResponseMessageDto | ErrorMessagePayload>(
    `/api/trainer/invitations/${invitationId}/revoke`,
  );

export const getApiErrorMessage = (value: unknown): string | null => {
  if (!value || typeof value !== "object") return null;

  const candidate = value as {
    msg?: unknown;
    message?: unknown;
  };

  if (typeof candidate.msg === "string" && candidate.msg.trim().length > 0) {
    return candidate.msg.trim();
  }

  if (
    typeof candidate.message === "string" &&
    candidate.message.trim().length > 0
  ) {
    return candidate.message.trim();
  }

  return null;
};
