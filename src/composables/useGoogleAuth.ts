import { computed, ref } from "vue";
import { useToast } from "./useToast";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_SCOPES = ["openid", "email", "profile"];
const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 640;
const POPUP_TIMEOUT_MS = 120000;
const POLL_INTERVAL_MS = 400;

export type GoogleAuthSuccess = {
  success: true;
  idToken: string;
  accessToken?: string;
  state?: string;
};

export type GoogleAuthFailureReason =
  | "missing_client_id"
  | "popup_blocked"
  | "popup_closed"
  | "timeout"
  | "oauth_error"
  | "invalid_response";

export type GoogleAuthFailure = {
  success: false;
  reason: GoogleAuthFailureReason;
  error?: string;
  errorDescription?: string;
  state?: string;
};

type GoogleAuthMessage = GoogleAuthSuccess | (GoogleAuthFailure & { error?: string });

const isLoading = ref(false);
let activePopup: Window | null = null;
let activeRequest: Promise<GoogleAuthSuccess> | null = null;
let isAuthInProgress = false;

const randomString = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const getGoogleClientId = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return typeof clientId === "string" ? clientId.trim() : "";
};

const buildPopupFeatures = () => {
  const left = Math.max(window.screenX + (window.outerWidth - POPUP_WIDTH) / 2, 0);
  const top = Math.max(window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2, 0);

  return [
    `width=${POPUP_WIDTH}`,
    `height=${POPUP_HEIGHT}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
};

const buildGoogleAuthUrl = (state: string, nonce: string) => {
  const redirectUri = `${window.location.origin}/google-callback.html`;
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: redirectUri,
    response_type: "id_token token",
    scope: GOOGLE_SCOPES.join(" "),
    prompt: "select_account",
    nonce,
    state,
  });

  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
};

const toFailure = (
  reason: GoogleAuthFailureReason,
  partial?: Omit<GoogleAuthFailure, "success" | "reason">,
): GoogleAuthFailure => ({
  success: false,
  reason,
  ...partial,
});

const normalizeMessage = (data: unknown, expectedState: string): GoogleAuthMessage => {
  if (!data || typeof data !== "object") {
    return toFailure("invalid_response");
  }

  const message = data as {
    success?: unknown;
    idToken?: unknown;
    accessToken?: unknown;
    error?: unknown;
    errorDescription?: unknown;
    state?: unknown;
  };

  const state = typeof message.state === "string" ? message.state : undefined;
  if (state && state !== expectedState) {
    return toFailure("invalid_response", { state });
  }

  if (message.success === true && typeof message.idToken === "string") {
    return {
      success: true,
      idToken: message.idToken,
      accessToken:
        typeof message.accessToken === "string" ? message.accessToken : undefined,
      state,
    };
  }

  if (message.success === false || typeof message.error === "string") {
    return toFailure("oauth_error", {
      error: typeof message.error === "string" ? message.error : "oauth_error",
      errorDescription:
        typeof message.errorDescription === "string"
          ? message.errorDescription
          : undefined,
      state,
    });
  }

  return toFailure("invalid_response", { state });
};

const cleanup = () => {
  if (activePopup && !activePopup.closed) {
    activePopup.close();
  }

  activePopup = null;
  activeRequest = null;
  isLoading.value = false;
  isAuthInProgress = false;
};

export const useGoogleAuth = () => {
  const toast = useToast();

  const getGoogleIdToken = () => {
    if (isAuthInProgress) {
      return activeRequest || Promise.reject(toFailure("invalid_response"));
    }
    if (activeRequest) return activeRequest;

    const clientId = getGoogleClientId();
    if (!clientId) {
      return Promise.reject(toFailure("missing_client_id"));
    }

    isAuthInProgress = true;
    isLoading.value = true;

    activeRequest = new Promise<GoogleAuthSuccess>((resolve, reject) => {
      const state = randomString();
      const nonce = randomString();
      const authUrl = buildGoogleAuthUrl(state, nonce);
      const popup = window.open(authUrl, "lgym-google-auth", buildPopupFeatures());

      if (!popup) {
        activeRequest = null;
        isLoading.value = false;
        isAuthInProgress = false;
        reject(toFailure("popup_blocked"));
        return;
      }

      activePopup = popup;

      const startedAt = Date.now();

      const teardown = () => {
        window.removeEventListener("message", onMessage);
        window.clearInterval(pollTimer);
        cleanup();
      };

      const fail = (failure: GoogleAuthFailure) => {
        teardown();
        reject(failure);
      };

      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.source !== popup) return;

        const result = normalizeMessage(event.data, state);
        if (result.success) {
          teardown();
          resolve(result);
          return;
        }

        fail(result);
      };

      const pollTimer = window.setInterval(() => {
        if (popup.closed) {
          fail(toFailure("popup_closed"));
          return;
        }

        if (Date.now() - startedAt >= POPUP_TIMEOUT_MS) {
          fail(toFailure("timeout"));
        }
      }, POLL_INTERVAL_MS);

      window.addEventListener("message", onMessage);
    });

    return activeRequest;
  };

  const handleGoogleAuthFailure = (error: GoogleAuthFailure) => {
    switch (error.reason) {
      case "missing_client_id":
        toast.error("auth.google.feedback.missingClientId");
        break;
      case "popup_blocked":
        toast.error("auth.google.feedback.popupBlocked");
        break;
      case "popup_closed":
        toast.info("auth.google.feedback.popupClosed");
        break;
      case "timeout":
        toast.error("auth.google.feedback.timeout");
        break;
      case "oauth_error":
        if (error.error === "access_denied") {
          toast.info("auth.google.feedback.accessDenied");
        } else if (error.errorDescription) {
          toast.errorMessage(error.errorDescription);
        } else {
          toast.error("auth.google.feedback.failed");
        }
        break;
      default:
        toast.error("auth.google.feedback.invalidResponse");
        break;
    }
  };

  return {
    isLoading: computed(() => isLoading.value),
    getGoogleIdToken,
    signInWithGoogle: getGoogleIdToken,
    handleGoogleAuthFailure,
  };
};
