import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import { EventFilters, EventInput, EventItem } from "../../types";
import { getErrorMessage } from "../../utils/errors";

interface EventsState {
  items: EventItem[];
  page: number;
  pages: number;
  total: number;
  current: EventItem | null;
  mine: EventItem[];
  status: "idle" | "loading";
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  page: 1,
  pages: 1,
  total: 0,
  current: null,
  mine: [],
  status: "idle",
  error: null,
};

type Cfg = { rejectValue: string };

export const fetchEvents = createAsyncThunk<
  { events: EventItem[]; page: number; pages: number; total: number },
  EventFilters,
  Cfg
>("events/list", async (filters, { rejectWithValue }) => {
  try {
    const params: Record<string, string | number> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== "all") params[k] = v as string | number;
    });
    const { data } = await api.get("/events", { params });
    return data.data;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchEvent = createAsyncThunk<EventItem, string, Cfg>("events/one", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/events/${id}`);
    return data.data.event;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const fetchMyEvents = createAsyncThunk<EventItem[], void, Cfg>("events/mine", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/events/mine");
    return data.data.events;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const createEvent = createAsyncThunk<EventItem, EventInput, Cfg>("events/create", async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/events", body);
    return data.data.event;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const updateEvent = createAsyncThunk<EventItem, { id: string; body: Partial<EventInput> }, Cfg>(
  "events/update",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/events/${id}`, body);
      return data.data.event;
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const cancelEvent = createAsyncThunk<EventItem, string, Cfg>("events/cancel", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/events/${id}/cancel`);
    return data.data.event;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

export const deleteEvent = createAsyncThunk<string, string, Cfg>("events/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/events/${id}`);
    return id;
  } catch (e) {
    return rejectWithValue(getErrorMessage(e));
  }
});

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchEvents.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(fetchEvents.fulfilled, (s, a) => {
        s.status = "idle";
        s.items = a.payload.events;
        s.page = a.payload.page;
        s.pages = a.payload.pages;
        s.total = a.payload.total;
      })
      .addCase(fetchEvents.rejected, (s, a) => {
        s.status = "idle";
        s.error = a.payload ?? "Failed to load events";
      });

    b.addCase(fetchEvent.pending, (s) => {
      s.status = "loading";
      s.error = null;
      s.current = null;
    })
      .addCase(fetchEvent.fulfilled, (s, a) => {
        s.status = "idle";
        s.current = a.payload;
      })
      .addCase(fetchEvent.rejected, (s, a) => {
        s.status = "idle";
        s.error = a.payload ?? "Failed to load event";
      });

    b.addCase(fetchMyEvents.fulfilled, (s, a) => {
      s.mine = a.payload;
    });
    b.addCase(createEvent.fulfilled, (s, a) => {
      s.mine.unshift(a.payload);
    });
    b.addCase(updateEvent.fulfilled, (s, a) => {
      s.mine = s.mine.map((e) => (e._id === a.payload._id ? a.payload : e));
    });
    b.addCase(cancelEvent.fulfilled, (s, a) => {
      s.mine = s.mine.map((e) => (e._id === a.payload._id ? a.payload : e));
    });
    b.addCase(deleteEvent.fulfilled, (s, a) => {
      s.mine = s.mine.filter((e) => e._id !== a.payload);
    });
  },
});

export const { clearCurrent } = eventsSlice.actions;
export default eventsSlice.reducer;
