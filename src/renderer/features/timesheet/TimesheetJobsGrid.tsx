import React from "react";
import { Paper, Chip, Tooltip, Typography, Box, Skeleton } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import type { TimesheetSyncJobInfo, TimesheetSyncJobPage } from "../../services/timesheetApi";

interface Props {
  data?: TimesheetSyncJobPage;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading: boolean;
  fetching: boolean;
  onSelectJob: (job: TimesheetSyncJobInfo) => void;
}

const statusColor: Record<string, "default" | "success" | "error" | "warning" | "info"> = {
  Enqueued: "info",
  Processing: "warning",
  Completed: "success",
  Failed: "error"
};

const formatDateTime = (value: unknown) => {
  if (!value) return "—";
  const d = dayjs(value as any);
  if (!d.isValid()) return "—";
  return d.format("DD/MM/YYYY HH:mm");
};

const formatDateOnly = (value: unknown) => {
  if (!value) return "—";
  const d = dayjs(value as any);
  if (!d.isValid()) return "—";
  return d.format("DD/MM/YYYY");
};

export const TimesheetJobsGrid: React.FC<Props> = ({
  data,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  fetching,
  onSelectJob
}) => {
  const totalCount = data?.totalCount ?? 0;
  const rows = data?.items ?? [];

  const columns: GridColDef[] = [
    {
      field: "jobId",
      headerName: "Job",
      flex: 1.4,
      minWidth: 160,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>
            {params.value?.substring(0, 8)}...
          </Typography>
        </Tooltip>
      )
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Chip
          label={params.value}
          size="small"
          color={statusColor[params.value ?? ""] ?? "default"}
          variant="outlined"
        />
      )
    },
    {
      field: "driver",
      headerName: "Motorista",
      flex: 1.4,
      minWidth: 180,
      renderCell: params => {
        const name = params.row?.payload?.driver?.driverName ?? "—";
        const email = params.row?.payload?.driver?.email ?? "";
        return (
          <Box>
            <Typography variant="body2" noWrap>
              {name}
            </Typography>
            {email && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {email}
              </Typography>
            )}
          </Box>
        );
      }
    },
    {
      field: "driverInternalNumber",
      headerName: "Cód. interno",
      flex: 0.8,
      minWidth: 120
    },
    {
      field: "timeSheetDate",
      headerName: "Data TS",
      flex: 0.9,
      minWidth: 120,
      renderCell: params => (
        <Typography variant="body2">
          {formatDateOnly(
            (params.row as TimesheetSyncJobInfo).timeSheetDate ??
              (params.row as TimesheetSyncJobInfo).TimeSheetDate
          )}
        </Typography>
      )
    },
    {
      field: "createdAtUtc",
      headerName: "Criado em",
      flex: 1.1,
      minWidth: 160,
      renderCell: params => (
        <Typography variant="body2">
          {formatDateTime(
            (params.row as TimesheetSyncJobInfo).createdAtUtc ??
              (params.row as TimesheetSyncJobInfo).CreatedAtUtc
          )}
        </Typography>
      )
    },
    {
      field: "lastUpdatedAtUtc",
      headerName: "Atualizado em",
      flex: 1.1,
      minWidth: 160,
      renderCell: params => (
        <Typography variant="body2">
          {formatDateTime(
            (params.row as TimesheetSyncJobInfo).lastUpdatedAtUtc ??
              (params.row as TimesheetSyncJobInfo).LastUpdatedAtUtc
          )}
        </Typography>
      )
    },
    {
      field: "errorMessage",
      headerName: "Erro",
      flex: 1.4,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<string | null>) =>
        params.value ? (
          <Tooltip title={params.value}>
            <Typography
              variant="body2"
              noWrap
              color="error"
              sx={{ fontWeight: 500, maxWidth: "100%" }}
            >
              {params.value}
            </Typography>
          </Tooltip>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        )
    }
  ];

  if (loading && !rows.length) {
    return (
      <Paper sx={{ p: 2.5 }}>
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="rectangular" height={280} sx={{ mt: 2, borderRadius: 2 }} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: 420, p: 1.5 }}>
      <DataGrid
        rows={rows}
        getRowId={(row: TimesheetSyncJobInfo) => row.jobId}
        columns={columns}
        page={page - 1}
        onPageChange={newPage => onPageChange(newPage + 1)}
        pageSizeOptions={[10, 25, 50]}
        paginationMode="server"
        rowCount={totalCount}
        paginationModel={{ page: page - 1, pageSize }}
        onPaginationModelChange={model => {
          if (model.pageSize !== pageSize) {
            onPageSizeChange(model.pageSize);
          }
          if (model.page + 1 !== page) {
            onPageChange(model.page + 1);
          }
        }}
        loading={loading || fetching}
        disableRowSelectionOnClick
        onRowClick={(params: GridRowParams) => onSelectJob(params.row as TimesheetSyncJobInfo)}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "grey.50"
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: "action.hover",
            cursor: "pointer"
          }
        }}
      />
      <Box mt={1} display="flex" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          {totalCount
            ? `Mostrando página ${page} – ${totalCount} registros no total`
            : "Nenhum registro encontrado para os filtros atuais."}
        </Typography>
        {fetching && !loading && (
          <Typography variant="caption" color="text.secondary">
            Atualizando...
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

