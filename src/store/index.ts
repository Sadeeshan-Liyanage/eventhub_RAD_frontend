import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import auth from "./slices/authSlice";
import events from "./slices/eventsSlice";
import bookings from "./slices/bookingsSlice";
import analytics from "./slices/analyticsSlice";

export const store = configureStore({ reducer: { auth, events, bookings, analytics } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
