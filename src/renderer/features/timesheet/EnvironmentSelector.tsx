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
  const [hydrated, setHydrated] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    dispatch(setEnvironment(event.target.value as EnvironmentKey));
  };

  const handleHostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setLocalHost(event.target.value));
  };

  const isLocal = current === "local";

  React.useEffect(() => {
    if (!window.electronAPI?.getEnvironment) {
      setHydrated(true);
      return;
    }

    window.electronAPI
      .getEnvironment()
      .then(saved => {
        if (saved?.current) {
          dispatch(setEnvironment(saved.current as EnvironmentKey));
        }
        if (typeof saved?.customHost === "string") {
          dispatch(setLocalHost(saved.customHost));
        }
      })
      .catch(() => {
        // silencioso: se falhar, segue com defaults
      })
      .finally(() => {
        setHydrated(true);
      });
  }, [dispatch]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!window.electronAPI?.setEnvironment) return;

    window.electronAPI
      .setEnvironment({ current, customHost })
      .catch(() => {
        // silencioso: não bloquear UI
      });
  }, [current, customHost, hydrated]);

  return (
    <Tooltip title="Selecione o ambiente de chamada da API">
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
    </Tooltip>
  );
};
