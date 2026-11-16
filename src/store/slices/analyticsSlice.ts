import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import { AnalyticsOverview, ParticipantsData } from "../../types";
import { getErrorMessage } from "../../utils/errors";

interface AnalyticsState {
  overview: AnalyticsOverview | null;
  participants: ParticipantsData | null;
  status: "idle" | "loading";
  error: string | null;
}

const initialState: AnalyticsState = { overview: null, participants: null, status: "idle", error: null };
type Cfg = { rejectValue: string };

export const fetchOverview = createAsyncThunk<AnalyticsOverview, void, Cfg>(
  "analytics/overview",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/analytics/overview");
      return data.data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const fetchParticipants = createAsyncThunk<ParticipantsData, string, Cfg>(
  "analytics/participants",
  async (eventId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/analytics/events/${eventId}/participants`);
      return data.data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchOverview.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(fetchOverview.fulfilled, (s, a) => {
        s.status = "idle";
        s.overview = a.payload;
      })
      .addCase(fetchOverview.rejected, (s, a) => {
        s.status = "idle";
        s.error = a.payload ?? "Failed to load analytics";
      });

    b.addCase(fetchParticipants.pending, (s) => {
      s.status = "loading";
      s.error = null;
      s.participants = null;
    })
      .addCase(fetchParticipants.fulfilled, (s, a) => {
        s.status = "idle";
        s.participants = a.payload;
      })
      .addCase(fetchParticipants.rejected, (s, a) => {
        s.status = "idle";
        s.error = a.payload ?? "Failed to load participants";
      });
  },
});

export default analyticsSlice.reducer;

