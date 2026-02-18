import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Chip,
  Collapse
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs from "dayjs";
import type { TimesheetSyncJobInfo } from "../../services/timesheetApi";

interface Props {
  job?: TimesheetSyncJobInfo | null;
  open: boolean;
  onClose: () => void;
}

interface JsonTreeNodeProps {
  name: string;
  value: any;
  level?: number;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({ name, value, level = 0 }) => {
  const [expanded, setExpanded] = useState(false); // Todos os nós começam colapsados

  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const getValueDisplay = () => {
    if (value === null)
      return (
        <Box component="span" sx={{ color: "text.secondary", fontStyle: "italic" }}>
          null
        </Box>
      );
    if (value === undefined)
      return (
        <Box component="span" sx={{ color: "text.secondary", fontStyle: "italic" }}>
          undefined
        </Box>
      );
    if (typeof value === "string")
      return (
        <Box component="span" sx={{ color: "#1976d2" }}>
          "{value}"
        </Box>
      );
    if (typeof value === "number")
      return (
        <Box component="span" sx={{ color: "#d32f2f" }}>
          {value}
        </Box>
      );
    if (typeof value === "boolean")
      return (
        <Box component="span" sx={{ color: "#388e3c" }}>
          {String(value)}
        </Box>
      );
    return null;
  };

  const renderChildren = () => {
    if (isObject) {
      return Object.entries(value).map(([key, val]) => (
        <JsonTreeNode key={key} name={key} value={val} level={level + 1} />
      ));
    }
    if (isArray) {
      return value.map((item: any, index: number) => (
        <JsonTreeNode key={index} name={String(index)} value={item} level={level + 1} />
      ));
    }
    return null;
  };

  return (
    <Box sx={{ ml: level * 1.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: isExpandable ? "pointer" : "default",
          "&:hover": isExpandable ? { bgcolor: "action.hover" } : {},
          py: 0.25,
          px: 0.5,
          borderRadius: 0.5,
          fontFamily: "monospace",
          fontSize: 12
        }}
        onClick={() => isExpandable && setExpanded(!expanded)}
      >
        {isExpandable ? (
          expanded ? (
            <ExpandMoreIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
          )
        ) : (
          <Box sx={{ width: 16, mr: 0.5 }} />
        )}
        <Box
          component="span"
          sx={{
            fontWeight: isExpandable ? 600 : 400,
            color: isExpandable ? "text.primary" : "text.secondary",
            mr: 1,
            minWidth: 110,
            display: "inline-block"
          }}
        >
          {name}:
        </Box>
        {!isExpandable && getValueDisplay()}
        {isExpandable && (
          <Box component="span" sx={{ color: "text.secondary" }}>
            {isArray ? `[${value.length}]` : `{${Object.keys(value).length}}`}
          </Box>
        )}
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ ml: 1 }}>
          {renderChildren()}
        </Box>
      </Collapse>
    </Box>
  );
};

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

        <Stack spacing={0.5} mb={2}>
          <Typography variant="caption" color="text.secondary" display="block">
            Data TS:{" "}
            {(() => {
              const value =
                (job as TimesheetSyncJobInfo).timeSheetDate ??
                (job as TimesheetSyncJobInfo).TimeSheetDate;
              const d = value ? dayjs(value as any) : null;
              return d && d.isValid() ? d.format("DD/MM/YYYY") : "—";
            })()}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Criado em:{" "}
            {(() => {
              const value =
                (job as TimesheetSyncJobInfo).createdAtUtc ??
                (job as TimesheetSyncJobInfo).CreatedAtUtc;
              const d = value ? dayjs(value as any) : null;
              return d && d.isValid() ? d.format("DD/MM/YYYY HH:mm") : "—";
            })()}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Atualizado em:{" "}
            {(() => {
              const value =
                (job as TimesheetSyncJobInfo).lastUpdatedAtUtc ??
                (job as TimesheetSyncJobInfo).LastUpdatedAtUtc;
              const d = value ? dayjs(value as any) : null;
              return d && d.isValid() ? d.format("DD/MM/YYYY HH:mm") : "—";
            })()}
          </Typography>
        </Stack>

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
          Mensagem
        </Typography>
        <Typography
          variant="body2"
          color={job.message ?? (job as any).Message ? "text.primary" : "text.secondary"}
          gutterBottom
        >
          {job.message ?? (job as any).Message ?? "Sem mensagem informada."}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Erro
        </Typography>
        <Typography
          variant="body2"
          color={job.errorMessage ?? (job as any).ErrorMessage ? "error" : "text.secondary"}
          gutterBottom
        >
          {job.errorMessage ?? (job as any).ErrorMessage ?? "Sem erro informado."}
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
          {JSON.stringify(job.payload, null, 2)}
        </Box>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          Tree View
        </Typography>
        <Box
          sx={{
            mt: 1,
            p: 1.5,
            bgcolor: "grey.50",
            borderRadius: 1,
            maxHeight: 300,
            overflow: "auto",
            fontSize: 12,
            fontFamily: "monospace"
          }}
        >
          <JsonTreeNode name="payload" value={job.payload} />
        </Box>
      </Box>
    </Drawer>
  );
};

