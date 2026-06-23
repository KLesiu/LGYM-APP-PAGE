import type { ReportRequestDto, ReportTemplateDto, ResponseMessageDto } from "./model";

type ApiEnvelope<TData> = {
  data: TData;
  status: number;
  headers: Headers;
};

type ErrorMessagePayload = ResponseMessageDto & {
  message?: string | null;
};

export type RecurringReportIntervalUnit = "Day" | "Week" | "Month";

export type RecurringReportAssignmentDto = {
  _id: string;
  trainerId: string;
  traineeId: string;
  templateId: string;
  intervalValue: number;
  intervalUnit: RecurringReportIntervalUnit;
  startsAt: string;
  endsAt?: string | null;
  isActive: boolean;
  note?: string | null;
  currentReportRequestId?: string | null;
  lastRequestCreatedAt?: string | null;
  nextEligibleAt?: string | null;
  createdAt: string;
  template: ReportTemplateDto;
  currentReportRequest?: ReportRequestDto | null;
};

export type UpsertRecurringReportAssignmentRequest = {
  templateId: string;
  intervalValue: number;
  intervalUnit: RecurringReportIntervalUnit;
  startsAt: string;
  endsAt?: string | null;
  note?: string | null;
};

const parseJsonResponse = async <TData>(response: Response): Promise<TData> => {
  const body = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();

  if (!body) return {} as TData;
  return JSON.parse(body) as TData;
};

const postJson = async <TData, TBody = unknown>(url: string, body?: TBody): Promise<ApiEnvelope<TData>> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return {
    data: await parseJsonResponse<TData>(response),
    status: response.status,
    headers: response.headers,
  };
};

const getJson = async <TData>(url: string): Promise<ApiEnvelope<TData>> => {
  const response = await fetch(url);

  return {
    data: await parseJsonResponse<TData>(response),
    status: response.status,
    headers: response.headers,
  };
};

export const getRecurringReportAssignments = (traineeId: string) =>
  getJson<RecurringReportAssignmentDto[] | ErrorMessagePayload>(
    `/api/trainer/trainees/${traineeId}/recurring-report-assignments`,
  );

export const postRecurringReportAssignment = (traineeId: string, payload: UpsertRecurringReportAssignmentRequest) =>
  postJson<RecurringReportAssignmentDto | ErrorMessagePayload, UpsertRecurringReportAssignmentRequest>(
    `/api/trainer/trainees/${traineeId}/recurring-report-assignments`,
    payload,
  );

export const postRecurringReportAssignmentUpdate = (
  traineeId: string,
  assignmentId: string,
  payload: UpsertRecurringReportAssignmentRequest,
) =>
  postJson<RecurringReportAssignmentDto | ErrorMessagePayload, UpsertRecurringReportAssignmentRequest>(
    `/api/trainer/trainees/${traineeId}/recurring-report-assignments/${assignmentId}/update`,
    payload,
  );

export const postRecurringReportAssignmentPause = (traineeId: string, assignmentId: string) =>
  postJson<RecurringReportAssignmentDto | ErrorMessagePayload>(
    `/api/trainer/trainees/${traineeId}/recurring-report-assignments/${assignmentId}/pause`,
  );

export const postRecurringReportAssignmentResume = (traineeId: string, assignmentId: string) =>
  postJson<RecurringReportAssignmentDto | ErrorMessagePayload>(
    `/api/trainer/trainees/${traineeId}/recurring-report-assignments/${assignmentId}/resume`,
  );

export const postRecurringReportAssignmentDelete = (traineeId: string, assignmentId: string) =>
  postJson<ResponseMessageDto | ErrorMessagePayload>(
    `/api/trainer/trainees/${traineeId}/recurring-report-assignments/${assignmentId}/delete`,
  );
