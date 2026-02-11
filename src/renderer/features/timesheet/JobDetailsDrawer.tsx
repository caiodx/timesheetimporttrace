import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { TimesheetSyncJobInfo } from "../../services/timesheetApi";

interface Props {
  job?: TimesheetSyncJobInfo | null;
  open: boolean;
  onClose: () => void;
}

export const JobDetailsDrawer: React.FC<Props> = ({ job, open, onClose }) => {
  if (!job) return null;

  const driver = job.payload.driver;
  const timesheets = job.payload.timesheets ?? [];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 340, sm: 420 }, p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Detalhes do job
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {job.jobId}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Chip
          label={job.status}
          size="small"
          sx={{ mb: 2 }}
          color={
            job.status === "Completed"
              ? "success"
              : job.status === "Failed"
              ? "error"
              : job.status === "Processing"
              ? "warning"
              : "info"
          }
        />

        <Typography variant="subtitle2" gutterBottom>
          Motorista
        </Typography>
        <Typography variant="body2">
          {driver.driverName ?? "—"}{" "}
          {driver.email && (
            <Typography component="span" variant="body2" color="text.secondary">
              ({driver.email})
            </Typography>
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Código interno: {driver.internalNumber ?? "—"}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Timesheets
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          {timesheets.length} registro(s)
        </Typography>

        <Box
          component="pre"
          sx={{
            mt: 1,
            p: 1.5,
            bgcolor: "grey.50",
            borderRadius: 1,
            maxHeight: 220,
            overflow: "auto",
            fontSize: 11
          }}
        >
          {JSON.stringify(
            {
              payload: job.payload,
              errorMessage: job.errorMessage
            },
            null,
            2
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

