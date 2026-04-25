import baseApi from "../api/baseApi";

export type AdminUserListItem = {
  id: string;
  userName: string;
  email: string;
  subscription: string;
  roadmapType: string;
  sessionProgress: string;
  status: string;
  joinedDate: string;
};

export type AdminUsersPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminUsersListResponse = {
  users: AdminUserListItem[];
  pagination: AdminUsersPagination;
};

export type AdminUserDetails = {
  userId: string;
  email: string;
  roadmapType: string;
  sessionsCompleted: number;
  subscriptionPlan: string;
  status: string;
  joinedDate: string;
  lastActive: string;
  overallProgress: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    timestamp?: string;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const readNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizeListItem = (item: unknown): AdminUserListItem => {
  if (!isRecord(item)) {
    return {
      id: "",
      userName: "",
      email: "",
      subscription: "",
      roadmapType: "",
      sessionProgress: "0%",
      status: "",
      joinedDate: "",
    };
  }

  return {
    id: readString(item.id),
    userName: readString(item.userName),
    email: readString(item.email),
    subscription: readString(item.subscription),
    roadmapType: readString(item.roadmapType),
    sessionProgress: readString(item.sessionProgress, "0%"),
    status: readString(item.status),
    joinedDate: readString(item.joinedDate),
  };
};

const normalizeUsersListResponse = (payload: unknown): AdminUsersListResponse => {
  const data = isRecord(payload) ? payload : {};
  const pagination = isRecord(data.pagination) ? data.pagination : {};

  return {
    users: Array.isArray(data.users) ? data.users.map((item) => normalizeListItem(item)) : [],
    pagination: {
      total: readNumber(pagination.total),
      page: readNumber(pagination.page, 1),
      limit: readNumber(pagination.limit, 10),
      totalPages: readNumber(pagination.totalPages, 1),
    },
  };
};

const normalizeUserDetails = (payload: unknown): AdminUserDetails => {
  const data = isRecord(payload) ? payload : {};

  return {
    userId: readString(data.userId),
    email: readString(data.email),
    roadmapType: readString(data.roadmapType),
    sessionsCompleted: readNumber(data.sessionsCompleted),
    subscriptionPlan: readString(data.subscriptionPlan),
    status: readString(data.status),
    joinedDate: readString(data.joinedDate),
    lastActive: readString(data.lastActive),
    overallProgress: readString(data.overallProgress, "0%"),
  };
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query<
      AdminUsersListResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/admin/users",
        method: "GET",
        params: {
          page,
          limit,
          search,
        },
      }),
      transformResponse: (response: ApiEnvelope<AdminUsersListResponse>) =>
        normalizeUsersListResponse(response.data),
    }),
    getAdminUserById: builder.query<AdminUserDetails, string>({
      query: (userId) => ({
        url: `/api/admin/users/${userId}`,
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<AdminUserDetails>) =>
        normalizeUserDetails(response.data),
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminUsersQuery, useLazyGetAdminUserByIdQuery } = usersApi;
