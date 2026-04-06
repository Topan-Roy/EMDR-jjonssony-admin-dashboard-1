import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "./api/baseApi";
import { loadStoredAuth, persistAuthState } from "./authStorage";
import authReducer, { hydrateAuthState } from "./features/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

const storedAuth = loadStoredAuth();

if (storedAuth) {
  store.dispatch(hydrateAuthState(storedAuth));
}

setupListeners(store.dispatch);

if (typeof window !== "undefined") {
  let currentAuthState = store.getState().auth;

  store.subscribe(() => {
    const nextAuthState = store.getState().auth;

    if (nextAuthState === currentAuthState) {
      return;
    }

    currentAuthState = nextAuthState;
    persistAuthState(nextAuthState);
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
