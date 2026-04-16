import {
  getAuthToken,
  getAuthUserId,
  getStoredRole,
  getStoredRoles,
} from "./useAuthSession";

const CLAIM_KEYS_NAME = [
  "name",
  "given_name",
  "preferred_username",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
];

const CLAIM_KEYS_EMAIL = [
  "email",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
];

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  roles: string[];
  initials: string;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4;
    const padded =
      padding === 0 ? normalized : `${normalized}${"=".repeat(4 - padding)}`;

    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const findClaim = (
  payload: Record<string, unknown> | null,
  keys: string[],
): string => {
  if (!payload) return "";

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
};

const deriveInitials = (name: string, email: string): string => {
  const source = name || email;
  if (!source) return "?";

  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.charAt(0).toUpperCase();
};

export const getCurrentUser = (): CurrentUser | null => {
  const token = getAuthToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const id = getAuthUserId();
  const role = getStoredRole();
  const roles = getStoredRoles();
  const name = findClaim(payload, CLAIM_KEYS_NAME) || role || "User";
  const email = findClaim(payload, CLAIM_KEYS_EMAIL);
  const avatar = findClaim(payload, ["picture", "avatar"]);
  const initials = deriveInitials(name, email);

  return { id, name, email, avatar, role, roles, initials };
};
