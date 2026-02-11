import { configureStore } from "@reduxjs/toolkit";
import { timesheetApi } from "./services/timesheetApi";
import { environmentReducer } from "./features/timesheet/environmentSlice";

export const store = configureStore({
  reducer: {
    [timesheetApi.reducerPath]: timesheetApi.reducer,
    environment: environmentReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(timesheetApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
