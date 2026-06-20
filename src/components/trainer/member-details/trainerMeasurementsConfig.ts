export type TrainerMeasurementBodyPart =
  | "ALL"
  | "Unknown"
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Abs"
  | "Quads"
  | "Hamstrings"
  | "Calves"
  | "Glutes"
  | "BodyWeight"
  | "Neck"
  | "Waist"
  | "Hips"
  | "Thigh"
  | "BodyFat"
  | "Bmi";

export type TrainerMeasurementUnit =
  | "Unknown"
  | "Kilograms"
  | "Pounds"
  | "Meters"
  | "Centimeters"
  | "Millimeters"
  | "Percent"
  | "Bmi";

export type TrainerMeasurementsTabKey = "trend" | "latest" | "history";

export type MeasurementTypeOption = {
  value: TrainerMeasurementBodyPart;
  labelKey: string;
};

export type MeasurementUnitOption = {
  value: TrainerMeasurementUnit;
  labelKey: string;
};

export const measurementTypeOptions: MeasurementTypeOption[] = [
  { value: "ALL", labelKey: "trainerMemberDetails.measurements.filters.allBodyParts" },
  { value: "BodyWeight", labelKey: "trainerMemberDetails.measurements.bodyParts.BodyWeight" },
  { value: "Neck", labelKey: "trainerMemberDetails.measurements.bodyParts.Neck" },
  { value: "Chest", labelKey: "trainerMemberDetails.measurements.bodyParts.Chest" },
  { value: "Waist", labelKey: "trainerMemberDetails.measurements.bodyParts.Waist" },
  { value: "Abs", labelKey: "trainerMemberDetails.measurements.bodyParts.Abs" },
  { value: "Hips", labelKey: "trainerMemberDetails.measurements.bodyParts.Hips" },
  { value: "Thigh", labelKey: "trainerMemberDetails.measurements.bodyParts.Thigh" },
  { value: "Calves", labelKey: "trainerMemberDetails.measurements.bodyParts.Calves" },
  { value: "Biceps", labelKey: "trainerMemberDetails.measurements.bodyParts.Biceps" },
  { value: "BodyFat", labelKey: "trainerMemberDetails.measurements.bodyParts.BodyFat" },
  { value: "Bmi", labelKey: "trainerMemberDetails.measurements.bodyParts.Bmi" },
  { value: "Shoulders", labelKey: "trainerMemberDetails.measurements.bodyParts.Shoulders" },
];

const lengthUnits: MeasurementUnitOption[] = [
  {
    value: "Centimeters",
    labelKey: "trainerMemberDetails.measurements.units.Centimeters",
  },
  { value: "Meters", labelKey: "trainerMemberDetails.measurements.units.Meters" },
  {
    value: "Millimeters",
    labelKey: "trainerMemberDetails.measurements.units.Millimeters",
  },
];

export const unitOptionsByType: Record<
  Exclude<TrainerMeasurementBodyPart, "ALL">,
  MeasurementUnitOption[]
> = {
  Unknown: [],
  BodyWeight: [
    {
      value: "Kilograms",
      labelKey: "trainerMemberDetails.measurements.units.Kilograms",
    },
    { value: "Pounds", labelKey: "trainerMemberDetails.measurements.units.Pounds" },
  ],
  BodyFat: [
    { value: "Percent", labelKey: "trainerMemberDetails.measurements.units.Percent" },
  ],
  Bmi: [{ value: "Bmi", labelKey: "trainerMemberDetails.measurements.units.Bmi" }],
  Neck: lengthUnits,
  Chest: lengthUnits,
  Waist: lengthUnits,
  Abs: lengthUnits,
  Hips: lengthUnits,
  Thigh: lengthUnits,
  Calves: lengthUnits,
  Biceps: lengthUnits,
  Shoulders: lengthUnits,
  Back: lengthUnits,
  Triceps: lengthUnits,
  Forearms: lengthUnits,
  Quads: lengthUnits,
  Hamstrings: lengthUnits,
  Glutes: lengthUnits,
};

export const getDefaultUnitForBodyPart = (
  bodyPart: TrainerMeasurementBodyPart,
): TrainerMeasurementUnit | null => {
  if (bodyPart === "ALL") return null;

  return unitOptionsByType[bodyPart][0]?.value ?? null;
};
