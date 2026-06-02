/**
 * Manually added until OpenAPI client regeneration includes trainer feedback endpoint.
 */
export interface UpdateReportSubmissionFeedbackRequest {
  /** @nullable */
  trainerOverallComment?: string | null;
  /** @nullable */
  trainerFieldComments?: { [key: string]: string | null; } | null;
}
