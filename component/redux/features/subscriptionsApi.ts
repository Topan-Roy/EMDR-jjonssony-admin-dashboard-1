import baseApi from "../api/baseApi";

export type SubscriptionPlan = {
  _id: string;
  name: string;
  type?: string;
  price: number;
  currency: string;
  interval: string;
  tagline: string;
  features: string[];
  isActive: boolean;
  isCommunityAccess?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SubscriptionRequestUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type SubscriptionRequestPlan = {
  _id: string;
  name: string;
};

export type SubscriptionAccessRequest = {
  _id: string;
  userId: SubscriptionRequestUser;
  planId: SubscriptionRequestPlan;
  status: string;
  createdAt: string;
  updatedAt: string;
  adminComment: string;
  __v?: number;
};

export type UpdateSubscriptionRequestStatusRequest = {
  requestId: string;
  status: string;
  comment: string;
};

export type UpdateSubscriptionRequestStatusResponse = {
  requestId: string;
  status: string;
  adminComment: string;
  message: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    timestamp?: string;
  };
};

type UpdateSubscriptionPlanBody = {
  name: string;
  tagline: string;
  price: number;
  interval: string;
  features: string[];
  isActive: boolean;
};

export type UpdateSubscriptionPlanRequest = {
  id: string;
  payload: UpdateSubscriptionPlanBody;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const readNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const normalizePlan = (plan: Partial<SubscriptionPlan>): SubscriptionPlan => ({
  _id: typeof plan._id === "string" ? plan._id : "",
  name: typeof plan.name === "string" ? plan.name : "",
  type: typeof plan.type === "string" ? plan.type : "",
  price:
    typeof plan.price === "number" && Number.isFinite(plan.price)
      ? plan.price
      : Number(plan.price) || 0,
  currency: typeof plan.currency === "string" ? plan.currency : "\u00A3",
  interval: typeof plan.interval === "string" ? plan.interval : "monthly",
  tagline: typeof plan.tagline === "string" ? plan.tagline : "",
  features: Array.isArray(plan.features)
    ? plan.features.filter((feature): feature is string => typeof feature === "string")
    : [],
  isActive: Boolean(plan.isActive),
  isCommunityAccess: Boolean(plan.isCommunityAccess),
  createdAt: typeof plan.createdAt === "string" ? plan.createdAt : undefined,
  updatedAt: typeof plan.updatedAt === "string" ? plan.updatedAt : undefined,
});

const normalizeRequestUser = (payload: unknown): SubscriptionRequestUser => {
  const user = isRecord(payload) ? payload : {};

  return {
    _id: readString(user._id),
    firstName: readString(user.firstName),
    lastName: readString(user.lastName),
    email: readString(user.email),
  };
};

const normalizeRequestPlan = (payload: unknown): SubscriptionRequestPlan => {
  const plan = isRecord(payload) ? payload : {};

  return {
    _id: readString(plan._id),
    name: readString(plan.name),
  };
};

const normalizeSubscriptionRequest = (payload: unknown): SubscriptionAccessRequest => {
  const request = isRecord(payload) ? payload : {};

  return {
    _id: readString(request._id),
    userId: normalizeRequestUser(request.userId),
    planId: normalizeRequestPlan(request.planId),
    status: readString(request.status),
    createdAt: readString(request.createdAt),
    updatedAt: readString(request.updatedAt),
    adminComment: readString(request.adminComment),
    __v: readNumber(request.__v),
  };
};

const normalizeRequestStatusResponse = (
  payload: unknown,
): UpdateSubscriptionRequestStatusResponse => {
  const response = isRecord(payload) ? payload : {};

  return {
    requestId: readString(response.requestId),
    status: readString(response.status),
    adminComment: readString(response.adminComment),
    message: readString(response.message),
  };
};

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => ({
        url: "/api/subscriptions/admin/plans",
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<SubscriptionPlan[] | SubscriptionPlan>) => {
        if (Array.isArray(response.data)) {
          return response.data.map((plan) => normalizePlan(plan));
        }

        if (response.data && typeof response.data === "object") {
          return [normalizePlan(response.data as SubscriptionPlan)];
        }

        return [];
      },
      providesTags: (result) => {
        if (!result) {
          return [{ type: "SubscriptionPlan" as const, id: "LIST" }];
        }

        return [
          { type: "SubscriptionPlan" as const, id: "LIST" },
          ...result.map((plan) => ({ type: "SubscriptionPlan" as const, id: plan._id })),
        ];
      },
    }),
    getSubscriptionRequests: builder.query<SubscriptionAccessRequest[], void>({
      query: () => ({
        url: "/api/subscriptions/admin/requests",
        method: "GET",
      }),
      transformResponse: (
        response: ApiEnvelope<SubscriptionAccessRequest[] | SubscriptionAccessRequest>,
      ) => {
        if (Array.isArray(response.data)) {
          return response.data.map((request) => normalizeSubscriptionRequest(request));
        }

        if (response.data && typeof response.data === "object") {
          return [normalizeSubscriptionRequest(response.data)];
        }

        return [];
      },
      providesTags: (result) => {
        if (!result) {
          return [{ type: "SubscriptionRequest" as const, id: "LIST" }];
        }

        return [
          { type: "SubscriptionRequest" as const, id: "LIST" },
          ...result.map((request) => ({
            type: "SubscriptionRequest" as const,
            id: request._id,
          })),
        ];
      },
    }),
    updateSubscriptionRequestStatus: builder.mutation<
      UpdateSubscriptionRequestStatusResponse,
      UpdateSubscriptionRequestStatusRequest
    >({
      query: ({ requestId, status, comment }) => ({
        url: `/api/subscriptions/admin/requests/${requestId}`,
        method: "PATCH",
        body: {
          status,
          comment,
        },
      }),
      transformResponse: (response: ApiEnvelope<UpdateSubscriptionRequestStatusResponse>) =>
        normalizeRequestStatusResponse(response.data),
      invalidatesTags: (_result, _error, { requestId }) => [
        { type: "SubscriptionRequest", id: "LIST" },
        { type: "SubscriptionRequest", id: requestId },
      ],
    }),
    updateSubscriptionPlan: builder.mutation<SubscriptionPlan, UpdateSubscriptionPlanRequest>({
      query: ({ id, payload }) => ({
        url: `/api/subscriptions/admin/plans/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: ApiEnvelope<SubscriptionPlan>) => normalizePlan(response.data),
      async onQueryStarted({ id, payload }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          subscriptionsApi.util.updateQueryData(
            "getSubscriptionPlans",
            undefined,
            (draft) => {
              const target = draft.find((plan) => plan._id === id);

              if (!target) {
                return;
              }

              target.name = payload.name;
              target.tagline = payload.tagline;
              target.price = payload.price;
              target.interval = payload.interval;
              target.features = payload.features;
              target.isActive = payload.isActive;
            },
          ),
        );

        try {
          const { data } = await queryFulfilled;

          dispatch(
            subscriptionsApi.util.updateQueryData(
              "getSubscriptionPlans",
              undefined,
              (draft) => {
                const targetIndex = draft.findIndex((plan) => plan._id === id);

                if (targetIndex === -1) {
                  return;
                }

                draft[targetIndex] = data;
              },
            ),
          );
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionRequestsQuery,
  useUpdateSubscriptionRequestStatusMutation,
  useUpdateSubscriptionPlanMutation,
} = subscriptionsApi;
