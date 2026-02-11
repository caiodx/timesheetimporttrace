import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { EnvironmentKey } from "../../services/timesheetApi";

export interface EnvironmentState {
  current: EnvironmentKey;
  customHost: string;
}

const initialState: EnvironmentState = {
  current: "develop",
  customHost: ""
};

const environmentSlice = createSlice({
  name: "environment",
  initialState,
  reducers: {
    setEnvironment(state, action: PayloadAction<EnvironmentKey>) {
      state.current = action.payload;
    },
    setLocalHost(state, action: PayloadAction<string>) {
      state.customHost = action.payload;
    }
  }
});

export const { setEnvironment, setLocalHost } = environmentSlice.actions;
export const environmentReducer = environmentSlice.reducer;
