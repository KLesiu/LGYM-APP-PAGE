const AUTH_TOKEN_KEY = "lgym.auth.token";
const AUTH_ROLE_KEY = "lgym.auth.role";
const AUTH_ROLES_KEY = "lgym.auth.roles";
const AUTH_PERMISSION_CLAIMS_KEY = "lgym.auth.permissionClaims";

const ADMIN_ROLE = "Admin";
const ADMIN_ACCESS_CLAIM = "admin.access";
const MANAGE_USER_ROLES_CLAIM = "users.roles.manage";
const MANAGE_APP_CONFIG_CLAIM = "appconfig.manage";

const safeWindow = () => (typeof window === "undefined" ? null : window);

const decodeJwtPayload = (token: string) => {
  if (!token) return null;

  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalizedPayload.length % 4;
    const paddedPayload =
      padding === 0
        ? normalizedPayload
        : `${normalizedPayload}${"=".repeat(4 - padding)}`;
    const decodedPayload = atob(paddedPayload);

    return JSON.parse(decodedPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const parseStoredArray = (value: string | null) => {
  if (!value) return [] as string[];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
};

export interface AuthSessionPayload {
  token: string;
  role: string;
  roles?: string[] | null;
  permissionClaims?: string[] | null;
}

export const saveAuthSession = (payload: AuthSessionPayload) => {
  const currentWindow = safeWindow();
  if (!currentWindow) return;

  currentWindow.localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
  currentWindow.localStorage.setItem(AUTH_ROLE_KEY, payload.role);
  currentWindow.localStorage.setItem(
    AUTH_ROLES_KEY,
    JSON.stringify(payload.roles ?? []),
  );
  currentWindow.localStorage.setItem(
    AUTH_PERMISSION_CLAIMS_KEY,
    JSON.stringify(payload.permissionClaims ?? []),
  );
};

export const clearAuthSession = () => {
  const currentWindow = safeWindow();
  if (!currentWindow) return;

  currentWindow.localStorage.removeItem(AUTH_TOKEN_KEY);
  currentWindow.localStorage.removeItem(AUTH_ROLE_KEY);
  currentWindow.localStorage.removeItem(AUTH_ROLES_KEY);
  currentWindow.localStorage.removeItem(AUTH_PERMISSION_CLAIMS_KEY);
};

export const getAuthToken = () =>
  safeWindow()?.localStorage.getItem(AUTH_TOKEN_KEY) ?? "";

export const getAuthUserId = () => {
  const payload = decodeJwtPayload(getAuthToken());
  if (!payload) return "";

  const candidateKeys = [
    "sub",
    "userId",
    "nameid",
    "nameidentifier",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  ];

  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
};

export const getStoredRole = () =>
  safeWindow()?.localStorage.getItem(AUTH_ROLE_KEY) ?? "";

export const getStoredRoles = () =>
  parseStoredArray(safeWindow()?.localStorage.getItem(AUTH_ROLES_KEY) ?? null);

export const getStoredPermissionClaims = () =>
  parseStoredArray(
    safeWindow()?.localStorage.getItem(AUTH_PERMISSION_CLAIMS_KEY) ?? null,
  );

export const hasAdminAccess = () => {
  const token = getAuthToken();
  if (!token) return false;

  const roles = getStoredRoles().map((role) => role.toLowerCase());
  const permissionClaims = getStoredPermissionClaims().map((claim) =>
    claim.toLowerCase(),
  );

  return (
    roles.includes(ADMIN_ROLE.toLowerCase()) ||
    permissionClaims.includes(ADMIN_ACCESS_CLAIM) ||
    permissionClaims.includes(MANAGE_USER_ROLES_CLAIM) ||
    permissionClaims.includes(MANAGE_APP_CONFIG_CLAIM)
  );
};

export const hasTrainerAccess = () => {
  const token = getAuthToken();
  if (!token) return false;

  const storedRole = getStoredRole().toLowerCase();
  const roles = getStoredRoles().map((role) => role.toLowerCase());

  return storedRole === "trainer" || roles.includes("trainer");
};
