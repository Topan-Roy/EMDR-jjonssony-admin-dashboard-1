import baseApi from "../api/baseApi";

export type PrivacySection = {
  title: string;
  content: string;
  bullets: string[];
  order: number;
};

export type PrivacyPolicy = {
  _id: string;
  version: string;
  overview: string;
  effectiveDate?: string;
  changelog?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastUpdated?: string;
  sections?: PrivacySection[];
  contactEmail?: string;
  contactName?: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    timestamp?: string;
  };
};

type UpdatePrivacyBody = Partial<{
  version: string;
  overview: string;
  effectiveDate: string;
  changelog: string;
  isActive: boolean;
  sections: PrivacySection[];
  contactEmail: string;
  contactName: string;
}>;

export type UpdatePrivacyRequest = {
  id: string;
  payload: UpdatePrivacyBody;
};

const sanitizeSection = (
  section: Partial<PrivacySection>,
  fallbackOrder: number,
): PrivacySection => ({
  title: typeof section.title === "string" ? section.title : "",
  content: typeof section.content === "string" ? section.content : "",
  bullets: Array.isArray(section.bullets)
    ? section.bullets.filter((bullet): bullet is string => typeof bullet === "string")
    : [],
  order:
    typeof section.order === "number" && Number.isFinite(section.order)
      ? section.order
      : fallbackOrder,
});

const normalizePrivacyPolicy = (policy: PrivacyPolicy): PrivacyPolicy => ({
  ...policy,
  version: typeof policy.version === "string" ? policy.version : "",
  overview: typeof policy.overview === "string" ? policy.overview : "",
  changelog: typeof policy.changelog === "string" ? policy.changelog : "",
  sections: Array.isArray(policy.sections)
    ? policy.sections.map((section, index) =>
        sanitizeSection(section, index + 1),
      )
    : [],
});

export const privacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivePrivacyPolicy: builder.query<PrivacyPolicy | null, void>({
      query: () => ({
        url: "/api/privacy/active",
        method: "GET",
      }),
      transformResponse: (
        response: ApiEnvelope<PrivacyPolicy[] | PrivacyPolicy | null>,
      ) => {
        if (Array.isArray(response.data)) {
          const activePolicy = response.data[0];
          return activePolicy ? normalizePrivacyPolicy(activePolicy) : null;
        }

        if (response.data && typeof response.data === "object") {
          return normalizePrivacyPolicy(response.data as PrivacyPolicy);
        }

        return null;
      },
      providesTags: (result) => {
        if (!result) {
          return [{ type: "PrivacyPolicy" as const, id: "LIST" }];
        }

        return [
          { type: "PrivacyPolicy" as const, id: "LIST" },
          {
            type: "PrivacyPolicy" as const,
            id: result._id,
          },
        ];
      },
    }),
    updatePrivacyPolicy: builder.mutation<PrivacyPolicy, UpdatePrivacyRequest>({
      query: ({ id, payload }) => ({
        url: `/api/privacy/${id}`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: ApiEnvelope<PrivacyPolicy>) =>
        normalizePrivacyPolicy(response.data),
      invalidatesTags: (_result, _error, arg) => [
        { type: "PrivacyPolicy", id: arg.id },
        { type: "PrivacyPolicy", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetActivePrivacyPolicyQuery, useUpdatePrivacyPolicyMutation } =
  privacyApi;
