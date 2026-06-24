import type { ResponseMessageDto } from "./model";

type ApiEnvelope<TData> = {
  data: TData;
  status: number;
  headers: Headers;
};

export type DietMealDto = {
  _id?: string | null;
  name?: string | null;
  order?: number;
  description?: string | null;
  estimatedCalories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
};

export type DietPlanDto = {
  _id?: string | null;
  trainerId?: string | null;
  traineeId?: string | null;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  estimatedCalories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
  notes?: string | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  meals?: DietMealDto[] | null;
};

export type DietPlanHistoryDto = {
  _id?: string | null;
  dietPlanId?: string | null;
  changedByUserId?: string | null;
  changeDate?: string | null;
  changeType?: string | null;
  snapshotJson?: string | null;
};

export type UpsertDietMealRequest = {
  name: string;
  order: number;
  description?: string | null;
  estimatedCalories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
};

export type UpsertDietPlanRequest = {
  name: string;
  startDate: string;
  endDate?: string | null;
  estimatedCalories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
  notes?: string | null;
  isActive: boolean;
  meals: UpsertDietMealRequest[];
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

export const getTrainerDietPlans = (traineeId: string) =>
  requestJson<DietPlanDto[] | ResponseMessageDto>(
    `/api/trainer/trainees/${traineeId}/diet-plans`,
    "GET",
  );

export const createTrainerDietPlan = (
  traineeId: string,
  payload: UpsertDietPlanRequest,
) =>
  requestJson<DietPlanDto | ResponseMessageDto, UpsertDietPlanRequest>(
    `/api/trainer/trainees/${traineeId}/diet-plans`,
    "POST",
    payload,
  );

export const updateTrainerDietPlan = (
  traineeId: string,
  dietPlanId: string,
  payload: UpsertDietPlanRequest,
) =>
  requestJson<DietPlanDto | ResponseMessageDto, UpsertDietPlanRequest>(
    `/api/trainer/trainees/${traineeId}/diet-plans/${dietPlanId}/update`,
    "POST",
    payload,
  );

export const activateTrainerDietPlan = (traineeId: string, dietPlanId: string) =>
  requestJson<ResponseMessageDto>(
    `/api/trainer/trainees/${traineeId}/diet-plans/${dietPlanId}/activate`,
    "POST",
  );

export const deleteTrainerDietPlan = (traineeId: string, dietPlanId: string) =>
  requestJson<ResponseMessageDto>(
    `/api/trainer/trainees/${traineeId}/diet-plans/${dietPlanId}/delete`,
    "POST",
  );

export const getTrainerDietPlanHistory = (
  traineeId: string,
  dietPlanId: string,
) =>
  requestJson<DietPlanHistoryDto[] | ResponseMessageDto>(
    `/api/trainer/trainees/${traineeId}/diet-plans/${dietPlanId}/history`,
    "GET",
  );
