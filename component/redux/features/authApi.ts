import baseApi from "../api/baseApi";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
};

export type LoginSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export type LoginResponseData = {
  message: string;
  user: LoginUser;
  session: LoginSession;
};

export type SendVerificationOtpRequest = {
  email: string;
};

export type SendVerificationOtpResponseData = {
  message: string;
  _dev_otp?: string;
};

export type VerifyRecoveryOtpRequest = {
  email: string;
  otp: string;
};

export type VerifyRecoveryOtpResponseData = {
  message: string;
  accessToken: string;
};

export type RecoverAccountRequest = {
  accessToken: string;
  newPassword: string;
  confirmPassword: string;
};

export type RecoverAccountResponseData = {
  message: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    timestamp?: string;
  };
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginRequest>({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiEnvelope<LoginResponseData>) => response.data,
      invalidatesTags: ["Auth"],
    }),
    sendVerificationOtp: builder.mutation<SendVerificationOtpResponseData, SendVerificationOtpRequest>({
      query: (payload) => ({
        url: "/api/auth/send-verification-otp",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiEnvelope<SendVerificationOtpResponseData>) => response.data,
    }),
    verifyRecoveryOtp: builder.mutation<VerifyRecoveryOtpResponseData, VerifyRecoveryOtpRequest>({
      query: (payload) => ({
        url: "/api/auth/send-verification-otp",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiEnvelope<VerifyRecoveryOtpResponseData>) => response.data,
    }),
    recoverAccount: builder.mutation<RecoverAccountResponseData, RecoverAccountRequest>({
      query: ({ accessToken, newPassword, confirmPassword }) => ({
        url: "/api/auth/recover-account",
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        body: { newPassword, confirmPassword },
      }),
      transformResponse: (response: ApiEnvelope<RecoverAccountResponseData>) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useSendVerificationOtpMutation,
  useVerifyRecoveryOtpMutation,
  useRecoverAccountMutation,
} = authApi;
