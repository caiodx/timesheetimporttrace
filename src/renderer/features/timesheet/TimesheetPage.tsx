import React, { useMemo, useState } from "react";
import { Stack, Snackbar, Alert, Slide } from "@mui/material";
import { useGetQueueJobsQuery } from "../../services/timesheetApi";
import { TimesheetFilters, TimesheetFiltersValues } from "./TimesheetFilters";
import { TimesheetJobsGrid } from "./TimesheetJobsGrid";
import { JobDetailsDrawer } from "./JobDetailsDrawer";
import type { TimesheetSyncJobInfo, TimesheetSyncJobStatus } from "../../services/timesheetApi";

const SlideUp = (props: any) => <Slide {...props} direction="up" />;

export const TimesheetPage: React.FC = () => {
  const todayDate = new Date();
  const today = todayDate.toISOString().slice(0, 10); // yyyy-MM-dd
  const endOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const [filters, setFilters] = useState<TimesheetFiltersValues>({
    status: undefined,
    driverName: "",
    email: "",
    timeSheetDateIni: today,
    timeSheetDateEnd: endOfMonth
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [selectedJob, setSelectedJob] = useState<TimesheetSyncJobInfo | null>(null);
  const [showError, setShowError] = useState(false);

  const queryParams = useMemo(
    () => ({
      status: (filters.status as TimesheetSyncJobStatus | undefined) ?? undefined,
      driverName: filters.driverName || undefined,
      email: filters.email || undefined,
      timeSheetDateIni: filters.timeSheetDateIni
        ? `${filters.timeSheetDateIni}T00:00:00`
        : undefined,
      timeSheetDateEnd: filters.timeSheetDateEnd
        ? `${filters.timeSheetDateEnd}T23:59:59`
        : undefined,
      page,
      pageSize,
      _ts: searchTrigger
    }),
    [filters, page, pageSize, searchTrigger]
  );

  const { data, isLoading, isFetching, isError, error } = useGetQueueJobsQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });

  const handleSearch = () => {
    setPage(1);
    setSearchTrigger(x => x + 1);
  };

  const handleClear = () => {
    setFilters({
      status: undefined,
      driverName: "",
      email: "",
      timeSheetDateIni: today,
      timeSheetDateEnd: endOfMonth
    });
    setPage(1);
    setSearchTrigger(x => x + 1);
  };

  const handleErrorOpen = () => {
    if (isError) setShowError(true);
  };

  React.useEffect(() => {
    handleErrorOpen();
  }, [isError]);

  return (
    <>
      <Stack spacing={2.5}>
        <TimesheetFilters
          values={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          onClear={handleClear}
          loading={isLoading || isFetching}
        />

        <TimesheetJobsGrid
          data={data}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setPage(1);
          }}
          loading={isLoading}
          fetching={isFetching}
          onSelectJob={setSelectedJob}
        />
      </Stack>

      <JobDetailsDrawer
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={SlideUp}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setShowError(false)}
          sx={{ width: "100%" }}
        >
          Falha ao carregar os jobs de timesheet.
          {error && typeof (error as any).status !== "undefined" && (
            <> Código: {(error as any).status}</>
          )}
        </Alert>
      </Snackbar>
    </>
  );
};

