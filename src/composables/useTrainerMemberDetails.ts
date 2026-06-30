import { computed, ref, watch, type Ref } from "vue";

import {
  getApiTrainerTraineesTraineeIdEloChart,
  getApiTrainerTraineesTraineeIdMainRecordsHistory,
  getApiTrainerTraineesTraineeIdPlans,
  getApiTrainerTraineesTraineeIdReportSubmissions,
  getApiTrainerTraineesTraineeIdTrainingsDates,
} from "../api/generated/demo";
import type {
  EloRegistryBaseChartDto,
  MainRecordResponseDto,
  ReportSubmissionDto,
  TrainerManagedPlanDto,
  TrainerDashboardTraineeDto,
} from "../api/model";
import { getApiErrorMessage } from "../api/trainerInvitations";
import {
  formatTrainerDate,
  formatTrainerDateTime,
  getRememberedMemberSnapshot,
} from "./useTrainerMembers";

export type MemberDetailsTab =
  | "trainings"
  | "plans"
  | "diet"
  | "notes"
  | "reports"
  | "measurements";

export type MemberOverviewState = {
  lastTrainingDate: string | null;
  activePlan: TrainerManagedPlanDto | null;
  latestReportSubmission: ReportSubmissionDto | null;
  latestEloPoint: EloRegistryBaseChartDto | null;
  latestMainRecord: MainRecordResponseDto | null;
};

const sortDatesDescending = (values: string[]) =>
  [...values].sort(
    (left, right) =>
      new Date(right).getTime() - new Date(left).getTime(),
  );

const getLatestByDate = <T>(
  items: T[],
  getValue: (item: T) => string | null | undefined,
) =>
  [...items]
    .filter((item) => Boolean(getValue(item)))
    .sort(
      (left, right) =>
        new Date(getValue(right) ?? 0).getTime() -
        new Date(getValue(left) ?? 0).getTime(),
    )[0] ?? null;

export const useTrainerMemberDetails = (
  traineeId: Ref<string>,
  locale: Ref<string>,
) => {
  const snapshot = computed<TrainerDashboardTraineeDto | null>(() =>
    getRememberedMemberSnapshot(traineeId.value),
  );

  const isLoadingOverview = ref(false);
  const hasOverviewError = ref(false);
  const overview = ref<MemberOverviewState>({
    lastTrainingDate: null,
    activePlan: null,
    latestReportSubmission: null,
    latestEloPoint: null,
    latestMainRecord: null,
  });

  let overviewToken = 0;

  const loadOverview = async () => {
    if (!traineeId.value) return;

    const currentToken = ++overviewToken;
    isLoadingOverview.value = true;
    hasOverviewError.value = false;

    try {
      const [trainingsResponse, plansResponse, reportsResponse, eloResponse, recordsResponse] =
        await Promise.all([
          getApiTrainerTraineesTraineeIdTrainingsDates(traineeId.value),
          getApiTrainerTraineesTraineeIdPlans(traineeId.value),
          getApiTrainerTraineesTraineeIdReportSubmissions(traineeId.value),
          getApiTrainerTraineesTraineeIdEloChart(traineeId.value),
          getApiTrainerTraineesTraineeIdMainRecordsHistory(traineeId.value),
        ]);

      if (currentToken !== overviewToken) return;

      const responses = [
        trainingsResponse,
        plansResponse,
        reportsResponse,
        eloResponse,
        recordsResponse,
      ];
      const firstFailure = responses.find(
        (response) => response.status < 200 || response.status >= 300,
      );

      if (firstFailure) {
        const message = getApiErrorMessage(firstFailure.data);
        if (message) {
          console.error(message);
        }
        hasOverviewError.value = true;
        return;
      }

      const trainingDates =
        trainingsResponse.status === 200
          ? sortDatesDescending(trainingsResponse.data ?? [])
          : [];
      const plans = plansResponse.status === 200 ? (plansResponse.data ?? []) : [];
      const submissions =
        reportsResponse.status === 200 ? (reportsResponse.data ?? []) : [];
      const eloPoints = getLatestByDate(
        eloResponse.status === 200 ? (eloResponse.data ?? []) : [],
        (item) => item.date,
      );
      const latestMainRecord = getLatestByDate(
        recordsResponse.status === 200 ? (recordsResponse.data ?? []) : [],
        (item) => item.date,
      );

      overview.value = {
        lastTrainingDate: trainingDates[0] ?? null,
        activePlan: plans.find((item) => item.isActive) ?? null,
        latestReportSubmission: getLatestByDate(
          submissions,
          (item) => item.submittedAt ?? item.request?.submittedAt ?? item.request?.createdAt,
        ),
        latestEloPoint: eloPoints,
        latestMainRecord,
      };
    } catch (error) {
      if (currentToken !== overviewToken) return;

      console.error(error);
      hasOverviewError.value = true;
    } finally {
      if (currentToken === overviewToken) {
        isLoadingOverview.value = false;
      }
    }
  };

  watch(
    traineeId,
    () => {
      overview.value = {
        lastTrainingDate: null,
        activePlan: null,
        latestReportSubmission: null,
        latestEloPoint: null,
        latestMainRecord: null,
      };
    },
    { immediate: true },
  );

  return {
    snapshot,
    overview,
    isLoadingOverview,
    hasOverviewError,
    formatDateTime: (value: string | null | undefined) =>
      formatTrainerDateTime(locale.value, value),
    formatDate: (value: string | null | undefined) =>
      formatTrainerDate(locale.value, value),
    loadOverview,
  };
};
