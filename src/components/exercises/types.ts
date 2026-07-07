import type { ExerciseEloFormula } from "../../api/model";

export type RoleMode = "admin" | "trainer" | "user";
export type SourceFilter = "all" | "global" | "user";
export type ExerciseSource = Exclude<SourceFilter, "all">;

export type ExerciseCard = {
  id: string;
  ownerUserId: string;
  name: string;
  source: ExerciseSource;
  bodyPart: string;
  bodyPartValue: string;
  description: string;
  imageUrl: string;
};

export type ExerciseDraft = {
  id: string | null;
  source: ExerciseSource;
  name: string;
  bodyPart: string;
  eloFormula: ExerciseEloFormula;
  description: string;
  image: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type TranslationLocaleOption = SelectOption & {
  flag: string;
};
