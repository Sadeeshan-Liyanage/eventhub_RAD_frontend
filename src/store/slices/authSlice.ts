import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import { User, Role } from "../../types";
import { clearSession, getStoredUser, saveSession } from "../../utils/storage";
import { getErrorMessage } from "../../utils/errors";

interface AuthState {
  user: User | null;
  status: "idle" | "loading";
  error: string | null;
}

const initialState: AuthState = { user: getStoredUser(), status: "idle", error: null };

export const login = createAsyncThunk<User, { email: string; password: string }, { rejectValue: string }>(
  "auth/login",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", body);
      saveSession(data.data);
      return data.data.user as User;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const register = createAsyncThunk<
  User,
  { name: string; email: string; password: string; role: Role },
  { rejectValue: string }
>("auth/register", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", body);
    saveSession(data.data);
    return data.data.user as User;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});



export const fetchMe = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      return data.data.user as User;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch {


  }
  clearSession();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionExpired(state) {
      state.user = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    const pending = (s: AuthState) => {
      s.status = "loading";
      s.error = null;
    };
    const fulfilled = (s: AuthState, a: { payload: User }) => {
      s.status = "idle";
      s.user = a.payload;
    };
    const rejected = (s: AuthState, a: { payload?: string }) => {
      s.status = "idle";
      s.error = a.payload ?? "Request failed";
    };
    b.addCase(login.pending, pending).addCase(login.fulfilled, fulfilled).addCase(login.rejected, rejected);
    b.addCase(register.pending, pending).addCase(register.fulfilled, fulfilled).addCase(register.rejected, rejected);
    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.user = a.payload;
    });
    b.addCase(logout.fulfilled, (s) => {
      s.user = null;
    });
  },
});

export const { sessionExpired, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
