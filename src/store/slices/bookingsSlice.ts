import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import { Booking, PaymentInput } from "../../types";
import { getErrorMessage } from "../../utils/errors";

interface BookingsState {
  items: Booking[];
  current: Booking | null;
  status: "idle" | "loading";
  error: string | null;
}

const initialState: BookingsState = { items: [], current: null, status: "idle", error: null };
type Cfg = { rejectValue: string };

export const createBooking = createAsyncThunk<
  Booking,
  { eventId: string; seatNumbers: number[]; payment?: PaymentInput },
  Cfg
>("bookings/create", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/bookings", body);
    return data.data.booking;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchMyBookings = createAsyncThunk<Booking[], void, Cfg>("bookings/mine", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/bookings/mine");
    return data.data.bookings;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchBooking = createAsyncThunk<Booking, string, Cfg>("bookings/one", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/bookings/${id}`);
    return data.data.booking;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const cancelBooking = createAsyncThunk<Booking, string, Cfg>("bookings/cancel", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/bookings/${id}/cancel`);
    return data.data.booking;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyBookings.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(fetchMyBookings.fulfilled, (s, a) => {
        s.status = "idle";
        s.items = a.payload;
      })
      .addCase(fetchMyBookings.rejected, (s, a) => {
        s.status = "idle";
        s.error = a.payload ?? "Failed to load bookings";
      });

    b.addCase(fetchBooking.pending, (s) => {
      s.status = "loading";
      s.error = null;
      s.current = null;
    })
      .addCase(fetchBooking.fulfilled, (s, a) => {
        s.status = "idle";
        s.current = a.payload;
      })
      .addCase(fetchBooking.rejected, (s, a) => {
        s.status = "idle";
        s.error = a.payload ?? "Failed to load ticket";
      });

    b.addCase(createBooking.fulfilled, (s, a) => {
      s.items.unshift(a.payload);
    });
    b.addCase(cancelBooking.fulfilled, (s, a) => {
      s.items = s.items.map((x) => (x._id === a.payload._id ? { ...x, status: "cancelled" } : x));
    });
  },
});

export default bookingsSlice.reducer;
