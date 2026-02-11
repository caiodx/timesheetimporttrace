import React from "react";
import {
  Paper,
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  Button,
  Typography,
  CircularProgress
} from "@mui/material";
import type { TimesheetSyncJobStatus } from "../../services/timesheetApi";

export interface TimesheetFiltersValues {
  status?: TimesheetSyncJobStatus;
  driverName: string;
  email: string;
  timeSheetDate: string;
}

interface Props {
  values: TimesheetFiltersValues;
  onChange: (values: TimesheetFiltersValues) => void;
  onSearch: () => void;
  onClear: () => void;
  loading: boolean;
}

const statusOptions: { value: TimesheetSyncJobStatus; label: string }[] = [
  { value: "Enqueued", label: "Enqueued" },
  { value: "Processing", label: "Processing" },
  { value: "Completed", label: "Completed" },
  { value: "Failed", label: "Failed" }
];

export const TimesheetFilters: React.FC<Props> = ({
  values,
  onChange,
  onSearch,
  onClear,
  loading
}) => {
  const handleFieldChange =
    (field: keyof TimesheetFiltersValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...values, [field]: event.target.value });
    };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange({ ...values, status: event.target.value as TimesheetSyncJobStatus });
  };

  const hasFilters =
    !!values.status || !!values.driverName || !!values.email || !!values.timeSheetDate;

  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack spacing={0.3}>
          <Typography variant="subtitle1" fontWeight={600}>
            Filtros da fila de timesheets
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Refine a busca por status, motorista, e-mail e data da timesheet.
          </Typography>
        </Stack>
        {loading && <CircularProgress size={20} />}
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status-select"
              value={values.status ?? ""}
              label="Status"
              onChange={handleStatusChange as any}
              displayEmpty
            >
              <MenuItem value="">
                <em>Padrão (Enqueued)</em>
              </MenuItem>
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Nome do motorista"
            fullWidth
            size="small"
            value={values.driverName}
            onChange={handleFieldChange("driverName")}
            placeholder="Parte do nome"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="E-mail do motorista"
            fullWidth
            size="small"
            value={values.email}
            onChange={handleFieldChange("email")}
            placeholder="Parte do e-mail"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Data da timesheet"
            type="date"
            fullWidth
            size="small"
            value={values.timeSheetDate}
            onChange={handleFieldChange("timeSheetDate")}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="flex-end"
        alignItems={{ xs: "stretch", sm: "center" }}
        mt={2.5}
      >
        <Button
          variant="outlined"
          color="inherit"
          disabled={!hasFilters || loading}
          onClick={onClear}
        >
          Limpar filtros
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSearch}
          disabled={loading}
        >
          {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
          Buscar
        </Button>
      </Stack>
    </Paper>
  );
};

