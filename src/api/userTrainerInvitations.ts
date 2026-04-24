import type { TrainerInvitationDto } from "./model";
import { getApiErrorMessage } from "./trainerInvitations";

type ApiEnvelope<TData> = {
  data: TData;
  status: number;
  headers: Headers;
};

const parseJsonResponse = async <TData>(response: Response): Promise<TData> => {
  const body = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();

  if (!body) return {} as TData;

  return JSON.parse(body) as TData;
};

export const getTraineeInvitations = async (): Promise<
  ApiEnvelope<TrainerInvitationDto[] | { msg?: string; message?: string }>
> => {
  const response = await fetch("/api/trainee/invitations", {
    method: "GET",
  });

  const data = await parseJsonResponse<
    TrainerInvitationDto[] | { msg?: string; message?: string }
  >(response);

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
};

export { getApiErrorMessage };
