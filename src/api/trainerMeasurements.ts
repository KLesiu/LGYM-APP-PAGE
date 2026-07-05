import type {
  MeasurementTrendDto,
  MeasurementsHistoryDto,
  MeasurementsListDto,
  ResponseMessageDto,
} from "./model";

export type TrainerMeasurementsQueryParams = {
  BodyPart?: string;
  Unit?: string;
};

type ApiResponse<TSuccess> = {
  data: TSuccess | ResponseMessageDto | Record<string, never>;
  status: number;
  headers: Headers;
};

const buildUrl = (path: string, params?: Record<string, unknown>) => {
  const normalizedParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      normalizedParams.append(key, value === null ? "null" : String(value));
    }
  });

  const query = normalizedParams.toString();
  return query.length > 0 ? `${path}?${query}` : path;
};

const fetchTrainerMeasurementResource = async <TSuccess>(
  traineeId: string,
  resourcePath: string,
  params?: Record<string, unknown>,
): Promise<ApiResponse<TSuccess>> => {
  const response = await fetch(
    buildUrl(`/api/measurements/${traineeId}/${resourcePath}`, params),
    {
      method: "GET",
    },
  );

  const body = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();

  const data = body ? (JSON.parse(body) as TSuccess | ResponseMessageDto) : {};

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
};

export const getApiTrainerTraineesTraineeIdMeasurementsList = (
  traineeId: string,
  params?: TrainerMeasurementsQueryParams,
) =>
  fetchTrainerMeasurementResource<MeasurementsListDto>(
    traineeId,
    "list",
    params,
  );

export const getApiTrainerTraineesTraineeIdMeasurementsHistory = (
  traineeId: string,
  params?: TrainerMeasurementsQueryParams,
) =>
  fetchTrainerMeasurementResource<MeasurementsHistoryDto>(
    traineeId,
    "getHistory",
    params,
  );

export const getApiTrainerTraineesTraineeIdMeasurementsTrend = (
  traineeId: string,
  params?: TrainerMeasurementsQueryParams,
) =>
  fetchTrainerMeasurementResource<MeasurementTrendDto>(
    traineeId,
    "trend",
    params,
  );
