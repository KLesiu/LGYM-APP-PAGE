import type { ExerciseExtendedFormDto } from "./model";

const jsonRequestHeaders = {
  "Content-Type": "application/json",
};

const parseResponse = async (response: Response) => {
  const body = [204, 205, 304].includes(response.status) ? null : await response.text();
  const data = body ? JSON.parse(body) : {};
  return { data, status: response.status, headers: response.headers };
};

export const postApiExerciseAddExerciseWithFormula = async (
  exerciseFormDto: ExerciseExtendedFormDto,
  options?: RequestInit,
) => {
  const res = await fetch("/api/exercise/addExerciseWithFormula", {
    ...options,
    method: "POST",
    headers: { ...jsonRequestHeaders, ...options?.headers },
    body: JSON.stringify(exerciseFormDto),
  });

  return parseResponse(res);
};

export const postApiExerciseIdAddUserExerciseWithFormula = async (
  id: string,
  exerciseFormDto: ExerciseExtendedFormDto,
  options?: RequestInit,
) => {
  const res = await fetch(`/api/exercise/${id}/addUserExerciseWithFormula`, {
    ...options,
    method: "POST",
    headers: { ...jsonRequestHeaders, ...options?.headers },
    body: JSON.stringify(exerciseFormDto),
  });

  return parseResponse(res);
};

export const postApiExerciseUpdateExerciseWithFormula = async (
  exerciseFormDto: ExerciseExtendedFormDto,
  options?: RequestInit,
) => {
  const res = await fetch("/api/exercise/updateExerciseWithFormula", {
    ...options,
    method: "POST",
    headers: { ...jsonRequestHeaders, ...options?.headers },
    body: JSON.stringify(exerciseFormDto),
  });

  return parseResponse(res);
};
