import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export type EnvironmentKey = "develop" | "qa" | "prod" | "local";

export interface DriverSyncData {
  email: string;
  personalEmail: string;
  driverName?: string;
  internalNumber?: number;
  isActive?: boolean;
  companyDatabaseId?: number;
  internalId?: number;
  contractId?: number;
  as400contractId?: number;
}

export interface ServicesSyncData {
  clientName: string;
  startDateTime: string;
  endDateTime: string;
  origin: string;
  destination: string;
  startKms: number;
  endKms: number;
  kmsFull?: number;
  kmsEmpty?: number;
  pax: number;
  isClean: boolean;
  timeSheetId: number;
  comments?: string;
  companyDatabaseId?: number;
  reference?: string;
  contract?: string;
  concession?: string;
  internalId?: number;
  isAu?: boolean;
  serviceTypeId?: number;
  seconddriver: boolean;
  isReserve?: boolean;
  continous_service_id?: number;
}

export interface TimesheetSyncData {
  timeSheetDate: string;
  driverId: number;
  startKms: number;
  endKms: number;
  comments?: string;
  submited: boolean;
  completedDateTime?: string;
  internalId?: number;
  companyDatabaseId?: number;
  workTypeId?: number;
  driverPauseTypeId?: number;
  services: ServicesSyncData[];
}

export type SyncActionEnum = "Create" | "Update" | "Delete";

export interface SyncData {
  driver: DriverSyncData;
  timesheets: TimesheetSyncData[];
  action: SyncActionEnum;
}

export type TimesheetSyncJobStatus = "Enqueued" | "Processing" | "Completed" | "Failed";

export interface TimesheetSyncJobInfo {
  jobId: string;
  status: TimesheetSyncJobStatus;
  driverInternalNumber?: number | null;
  timeSheetDate: string;
  createdAtUtc: string;
  lastUpdatedAtUtc: string;
  errorMessage?: string | null;
  payload: SyncData;
  // fallback quando a API retornar em PascalCase (C# default)
  JobId?: string;
  Status?: TimesheetSyncJobStatus;
  DriverInternalNumber?: number | null;
  TimeSheetDate?: string;
  CreatedAtUtc?: string;
  LastUpdatedAtUtc?: string;
  ErrorMessage?: string | null;
  Payload?: SyncData;
}

export interface TimesheetSyncJobPage {
  totalCount: number;
  page: number;
  pageSize: number;
  items: TimesheetSyncJobInfo[];
}

export interface QueueJobsQuery {
  status?: TimesheetSyncJobStatus;
  page: number;
  pageSize: number;
  driverName?: string;
  email?: string;
  timeSheetDateIni?: string;
  timeSheetDateEnd?: string;
  _ts?: number; // Timestamp para forçar refetch
  _env?: string; // Ambiente para forçar refetch quando mudar
}

const hostsByEnv: Record<Exclude<EnvironmentKey, "local">, string> = {
  develop: "https://api-transporter.dev.transporter.brqapps.com",
  qa: "https://api-transporter.qld.transporter.brqapps.com",
  prod: "https://api-transporter.transporter.brqapps.com"
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "",
  prepareHeaders: headers => {
    headers.set("Accept", "application/json");
    return headers;
  }
});

const dynamicBaseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const envKey = state.environment.current as EnvironmentKey;

  const rawBaseUrl =
    envKey === "local"
      ? (state.environment.customHost ?? "")
      : hostsByEnv[envKey as Exclude<EnvironmentKey, "local">];

  // Normaliza baseUrl para evitar problemas com "/" duplicado ou faltando
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  const joinUrl = (base: string, path: string) => {
    const cleanBase = base.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    return `${cleanBase}/${cleanPath}`;
  };

  const adjustedArgs =
    typeof args === "string"
      ? {
          url: args.startsWith("http") ? args : joinUrl(baseUrl, args)
        }
      : {
          ...args,
          url: args.url.startsWith("http") ? args.url : joinUrl(baseUrl, args.url)
        };

  return rawBaseQuery(adjustedArgs, api, extraOptions);
};

export const timesheetApi = createApi({
  reducerPath: "timesheetApi",
  baseQuery: dynamicBaseQuery,
  endpoints: builder => ({
    getQueueJobs: builder.query<TimesheetSyncJobPage, QueueJobsQuery>({
      query: params => {
        const { page, pageSize, status, driverName, email, timeSheetDateIni, timeSheetDateEnd } =
          params;

        const queryParams: Record<string, string | number> = {
          page,
          pageSize
        };

        if (status) queryParams.status = status;
        if (driverName) queryParams.driverName = driverName;
        if (email) queryParams.email = email;
        if (timeSheetDateIni) queryParams.timeSheetDateIni = timeSheetDateIni;
        if (timeSheetDateEnd) queryParams.timeSheetDateEnd = timeSheetDateEnd;

        return {
          url: "/api/v1/Sync/queue-jobs",
          params: queryParams
        };
      }
    })
  })
});

export const { useGetQueueJobsQuery } = timesheetApi;

