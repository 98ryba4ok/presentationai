import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { authApi } from "../api/authApi";
import type { AuthResponse, RegisterData, LoginData, CodeData, User, Tokens } from "../types/auth";

interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: {
    access: localStorage.getItem("access") || "",
    refresh: localStorage.getItem("refresh") || "",
  },
  isLoading: false,
  error: null,
};

export const changePassword = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("auth/changePassword", async (newPassword, { rejectWithValue }) => {
  try {
    const res = await authApi.changePassword(newPassword);
    return res.data.message;
  } catch (err: unknown) {
    let message = "Ошибка смены пароля";
    if (err instanceof AxiosError)
      message = err.response?.data?.error || message;
    return rejectWithValue(message);
  }
});

export const fetchUserProfile = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.getMe();
      return res.data;
    } catch (err: unknown) {
      let message = "Ошибка загрузки профиля";
      if (err instanceof AxiosError) message = err.response?.data?.error || message;
      return rejectWithValue(message);
    }
  }
);

export const sendRegisterCode = createAsyncThunk<string, RegisterData, { rejectValue: string }>(
  "auth/sendRegisterCode",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.registerSendCode(data);
      return res.data.message;
    } catch (err: unknown) {
      let message = "Ошибка регистрации";
      if (err instanceof AxiosError) message = err.response?.data?.error || message;
      return rejectWithValue(message);
    }
  }
);

export const verifyRegisterCode = createAsyncThunk<AuthResponse, CodeData, { rejectValue: string }>(
  "auth/verifyRegisterCode",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.registerVerifyCode(data);
      return res.data;
    } catch (err: unknown) {
      let message = "Ошибка кода";
      if (err instanceof AxiosError) message = err.response?.data?.error || message;
      return rejectWithValue(message);
    }
  }
);

export const sendLoginCode = createAsyncThunk<string, LoginData, { rejectValue: string }>(
  "auth/sendLoginCode",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.loginSendCode(data);
      return res.data.message;
    } catch (err: unknown) {
      let message = "Ошибка входа";
      if (err instanceof AxiosError) message = err.response?.data?.error || message;
      return rejectWithValue(message);
    }
  }
);

export const verifyLoginCode = createAsyncThunk<AuthResponse, CodeData, { rejectValue: string }>(
  "auth/verifyLoginCode",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.loginVerifyCode(data);
      return res.data;
    } catch (err: unknown) {
      let message = "Ошибка кода входа";
      if (err instanceof AxiosError) message = err.response?.data?.error || message;
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.tokens = null;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    },
    setTokens(state, action: PayloadAction<Tokens>) {
      state.tokens = action.payload;
      localStorage.setItem("access", action.payload.access);
      localStorage.setItem("refresh", action.payload.refresh);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyRegisterCode.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        localStorage.setItem("access", action.payload.tokens.access);
        localStorage.setItem("refresh", action.payload.tokens.refresh);
      })
      .addCase(verifyLoginCode.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        localStorage.setItem("access", action.payload.tokens.access);
        localStorage.setItem("refresh", action.payload.tokens.refresh);
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/pending"),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.isLoading = false;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/rejected"),
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { logout, setTokens } = authSlice.actions;
export default authSlice.reducer;
