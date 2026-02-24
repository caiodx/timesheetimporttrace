import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Tooltip,
  TextField,
  Stack
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setEnvironment, setLocalHost } from "./environmentSlice";
import type { EnvironmentKey } from "../../services/timesheetApi";

const ENV_STORAGE_KEY = "timesheet-environment";
const HOST_STORAGE_KEY = "timesheet-custom-host";

const labels: Record<EnvironmentKey, string> = {
  develop: "Develop",
  qa: "Qualidade",
  prod: "Produção",
  local: "Local"
};

export const EnvironmentSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const current = useAppSelector(state => state.environment.current);
  const customHost = useAppSelector(state => state.environment.customHost);

  React.useEffect(() => {
    try {
      const savedEnv = localStorage.getItem(ENV_STORAGE_KEY) as EnvironmentKey | null;
      const savedHost = localStorage.getItem(HOST_STORAGE_KEY);

      if (savedEnv) {
        dispatch(setEnvironment(savedEnv));
      }

      if (savedHost) {
        dispatch(setLocalHost(savedHost));
      }
    } catch {
      // Ignora falhas de acesso ao localStorage
    }
  }, [dispatch]);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as EnvironmentKey;
    dispatch(setEnvironment(value));
    try {
      localStorage.setItem(ENV_STORAGE_KEY, value);
    } catch {
      // Ignora falhas de acesso ao localStorage
    }
  };

  const handleHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    dispatch(setLocalHost(value));
    try {
      localStorage.setItem(HOST_STORAGE_KEY, value);
    } catch {
      // Ignora falhas de acesso ao localStorage
    }
  };

  const isLocal = current === "local";

  return (
      <Box sx={{ minWidth: 220 }}>
        <Stack direction="column" spacing={1}>
          <FormControl size="small" fullWidth variant="outlined">
            <InputLabel id="environment-label">Ambiente</InputLabel>
            <Select
              labelId="environment-label"
              id="environment-select"
              value={current}
              label="Ambiente"
              onChange={handleChange as any}
            >
              {Object.entries(labels).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isLocal && (
            <TextField
              size="small"
              fullWidth
              placeholder="http://localhost:5000"
              value={customHost}
              onChange={handleHostChange}
            />
          )}
        </Stack>
      </Box>
  );
};
