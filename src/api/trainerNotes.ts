import type { ResponseMessageDto } from "./model";

type ApiEnvelope<TData> = {
  data: TData;
  status: number;
  headers: Headers;
};

export type TraineeNoteDto = {
  _id?: string | null;
  trainerId?: string | null;
  traineeId?: string | null;
  title?: string | null;
  content?: string | null;
  visibleToTrainee?: boolean;
  isPinned?: boolean;
  lastUpdatedByUserId?: string | null;
  lastUpdatedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type TraineeNoteHistoryDto = {
  _id?: string | null;
  traineeNoteId?: string | null;
  changedByUserId?: string | null;
  changedAt?: string | null;
  previousContent?: string | null;
  newContent?: string | null;
  changeType?: string | null;
};

export type UpsertTraineeNoteRequest = {
  title?: string | null;
  content: string;
  visibleToTrainee: boolean;
  isPinned: boolean;
};

const parseJsonResponse = async <TData>(response: Response): Promise<TData> => {
  const body = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();

  if (!body) return {} as TData;
  return JSON.parse(body) as TData;
};

const requestJson = async <TData, TBody = unknown>(
  url: string,
  method: string,
  body?: TBody,
): Promise<ApiEnvelope<TData>> => {
  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return {
    data: await parseJsonResponse<TData>(response),
    status: response.status,
    headers: response.headers,
  };
};

export const getTrainerTraineeNotes = (traineeId: string) =>
  requestJson<TraineeNoteDto[] | ResponseMessageDto>(`/api/trainer/trainees/${traineeId}/notes`, "GET");

export const createTrainerTraineeNote = (traineeId: string, payload: UpsertTraineeNoteRequest) =>
  requestJson<TraineeNoteDto | ResponseMessageDto, UpsertTraineeNoteRequest>(`/api/trainer/trainees/${traineeId}/notes`, "POST", payload);

export const updateTrainerTraineeNote = (traineeId: string, noteId: string, payload: UpsertTraineeNoteRequest) =>
  requestJson<TraineeNoteDto | ResponseMessageDto, UpsertTraineeNoteRequest>(`/api/trainer/trainees/${traineeId}/notes/${noteId}/update`, "POST", payload);

export const deleteTrainerTraineeNote = (traineeId: string, noteId: string) =>
  requestJson<ResponseMessageDto>(`/api/trainer/trainees/${traineeId}/notes/${noteId}/delete`, "POST");

export const getTrainerTraineeNoteHistory = (traineeId: string, noteId: string) =>
  requestJson<TraineeNoteHistoryDto[] | ResponseMessageDto>(`/api/trainer/trainees/${traineeId}/notes/${noteId}/history`, "GET");
