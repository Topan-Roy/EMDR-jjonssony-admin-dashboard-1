import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = Record<string, unknown> | null;

export interface AuthState {
  user: AuthUser;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

type SetLoginPayload = {
  user: AuthUser;
  token: string;
  refreshToken?: string | null;
};

type SetTokensPayload = {
  token: string;
  refreshToken?: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuthState: (state, action: PayloadAction<AuthState | null>) => {
      if (!action.payload) {
        return state;
      }

      return action.payload;
    },
    setLogin: (state, action: PayloadAction<SetLoginPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = Boolean(action.payload.token);
    },
    setTokens: (state, action: PayloadAction<SetTokensPayload>) => {
      state.token = action.payload.token;

      if ("refreshToken" in action.payload) {
        state.refreshToken = action.payload.refreshToken ?? null;
      }

      state.isAuthenticated = Boolean(action.payload.token);
    },
    updateUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    logout: () => initialState,
  },
});

export const { hydrateAuthState, setLogin, setTokens, updateUser, logout } = authSlice.actions;

export default authSlice.reducer;
