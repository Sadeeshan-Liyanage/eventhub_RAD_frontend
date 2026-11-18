import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import { AnalyticsOverview, CheckInResult, ParticipantsData } from "../../types";
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

export const checkInTicket = createAsyncThunk<CheckInResult, { eventId: string; ticketCode: string }, Cfg>(
  "analytics/checkIn",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/checkin", body);
      return data.data;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const undoCheckIn = createAsyncThunk<string, string, Cfg>("analytics/undoCheckIn", async (bookingId, { rejectWithValue }) => {
  try {
    await api.post("/checkin/undo", { bookingId });
    return bookingId;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

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

    b.addCase(fetchParticipants.pending, (s, a) => {
      s.status = "loading";
      s.error = null;
      // keep the table on screen when the same event is reloaded
      if (s.participants?.event.id !== a.meta.arg) s.participants = null;
    })
      .addCase(fetchParticipants.fulfilled, (s, a) => {
        s.status = "idle";
        s.participants = a.payload;
      })
      .addCase(fetchParticipants.rejected, (s, a) => {
        s.status = "idle";
        s.error = a.payload ?? "Failed to load participants";
      });

    // keep the attendee list in step with check-ins without reloading it
    b.addCase(checkInTicket.fulfilled, (s, a) => {
      const t = a.payload.ticket;
      if (a.payload.status !== "admitted" || !t || !s.participants) return;
      const row = s.participants.participants.find((p) => p.bookingId === t.bookingId);
      if (row) row.checkedInAt = t.checkedInAt;
      s.participants.event.checkedIn += t.quantity;
    });
    b.addCase(undoCheckIn.fulfilled, (s, a) => {
      const row = s.participants?.participants.find((p) => p.bookingId === a.payload);
      if (!s.participants || !row || !row.checkedInAt) return;
      row.checkedInAt = null;
      s.participants.event.checkedIn -= row.quantity;
    });
  },
});

export default analyticsSlice.reducer;
