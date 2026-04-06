import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import { clearStoredAuth, getStoredTokens, loadStoredAuth } from "../authStorage";
import { logout, setLogin, setTokens } from "../features/authSlice";

type AuthStateShape = {
  token: string | null;
  refreshToken: string | null;
};

type RootStateShape = {
  auth?: Partial<AuthStateShape>;
};

const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VITE_BASE_URL || "";
const refreshPath = process.env.NEXT_PUBLIC_REFRESH_TOKEN_PATH || "/api/auth/refresh-auth";
const loginPath = "/login";
const loginApiPath = "/api/auth/login";
const sendVerificationOtpPath = "/api/auth/send-verification-otp";
const recoverAccountPath = "/api/auth/recover-account";

const BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const unwrapResponse = (response: unknown): Record<string, unknown> => {
  if (!isRecord(response)) {
    return {};
  }

  const firstLayer = response.data ?? response;

  if (!isRecord(firstLayer)) {
    return {};
  }

  return isRecord(firstLayer.data) ? firstLayer.data : firstLayer;
};

const getAccessToken = (response: unknown): string | null => {
  const payload = unwrapResponse(response);
  const session = isRecord(payload.session) ? payload.session : null;
  const tokens = isRecord(payload.tokens) ? payload.tokens : null;

  return (
    readString(session?.accessToken) ||
    readString(tokens?.accessToken) ||
    readString(payload.accessToken) ||
    readString(payload.token) ||
    null
  );
};

const getRefreshToken = (response: unknown): string | null => {
  const payload = unwrapResponse(response);
  const session = isRecord(payload.session) ? payload.session : null;
  const tokens = isRecord(payload.tokens) ? payload.tokens : null;

  return (
    readString(session?.refreshToken) ||
    readString(tokens?.refreshToken) ||
    readString(payload.refreshToken) ||
    null
  );
};

const getUser = (response: unknown): Record<string, unknown> | null => {
  const payload = unwrapResponse(response);

  if (isRecord(payload.user)) {
    return payload.user;
  }

  return readString(payload.email) ? payload : null;
};

const clearAuthAndRedirect = (api: { dispatch: (action: unknown) => void }) => {
  api.dispatch(logout());
  clearStoredAuth();

  if (typeof window !== "undefined") {
    window.location.replace(loginPath);
  }
};

const getRequestUrl = (args: string | FetchArgs): string => (typeof args === "string" ? args : args.url);

const shouldBypassReauth = (url: string): boolean =>
  [loginApiPath, refreshPath, sendVerificationOtpPath, recoverAccountPath].some((path) =>
    url.includes(path)
  );

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootStateShape;
    const token = state?.auth?.token || getStoredTokens().token || loadStoredAuth()?.token;

    if (token && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("accept", "application/json");

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status !== 401) {
    return result;
  }

  if (shouldBypassReauth(getRequestUrl(args))) {
    return result;
  }

  const state = api.getState() as RootStateShape;
  const refreshToken =
    state?.auth?.refreshToken || getStoredTokens().refreshToken || loadStoredAuth()?.refreshToken;

  if (!refreshToken) {
    clearAuthAndRedirect(api);
    return result;
  }

  const refreshResult = await baseQuery(
    {
      url: refreshPath,
      method: "POST",
      body: { refreshToken },
    },
    api,
    extraOptions
  );

  const nextToken = getAccessToken(refreshResult?.data);
  const nextRefreshToken = getRefreshToken(refreshResult?.data) || refreshToken;
  const user = getUser(refreshResult?.data);

  if (!nextToken) {
    clearAuthAndRedirect(api);
    return refreshResult?.error ? { error: refreshResult.error } : result;
  }

  if (user) {
    api.dispatch(
      setLogin({
        user,
        token: nextToken,
        refreshToken: nextRefreshToken,
      })
    );
  } else {
    api.dispatch(
      setTokens({
        token: nextToken,
        refreshToken: nextRefreshToken,
      })
    );
  }

  result = await baseQuery(args, api, extraOptions);

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "FAQ", "AdminProfile"],
  endpoints: () => ({}),
});

export { BASE_URL };

export default baseApi;
