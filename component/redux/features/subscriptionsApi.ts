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

export const { useGetSubscriptionPlansQuery, useUpdateSubscriptionPlanMutation } =
  subscriptionsApi;
