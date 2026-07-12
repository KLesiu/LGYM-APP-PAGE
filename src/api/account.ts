import {
  getApiAccountExternalLogins as generatedGetApiAccountExternalLogins,
  postApiAccountLinkGoogle as generatedPostApiAccountLinkGoogle,
  postApiAccountUnlinkGoogle as generatedPostApiAccountUnlinkGoogle,
} from "./generated/demo";
import type { ExternalLoginDto, ResponseMessageDto } from "./model";
import { getApiErrorMessage } from "./auth";

type ApiEnvelope<TData> = {
  data: TData;
  status: number;
  headers: Headers;
};

type ErrorMessagePayload = ResponseMessageDto & {
  message?: string | null;
};

const toApiEnvelope = <TData>(response: {
  data: TData;
  status: number;
  headers: Headers;
}): ApiEnvelope<TData> => response;

export const postApiAccountLinkGoogle = (idToken: string, accessToken?: string) =>
  generatedPostApiAccountLinkGoogle({ idToken, accessToken }).then(
    toApiEnvelope<ResponseMessageDto | ErrorMessagePayload>,
  );

export const postApiAccountUnlinkGoogle = () =>
  generatedPostApiAccountUnlinkGoogle().then(
    toApiEnvelope<ResponseMessageDto | ErrorMessagePayload>,
  );

export const getApiAccountExternalLogins = () =>
  generatedGetApiAccountExternalLogins().then(
    toApiEnvelope<ExternalLoginDto[] | ErrorMessagePayload>,
  );

export { getApiErrorMessage, type ExternalLoginDto };
