import baseApi from "../api/baseApi";

export type TermsSection = {
  title: string;
  content: string;
  bullets: string[];
  order: number;
};

export type TermsPolicy = {
  _id: string;
  version?: string;
  lastUpdated?: string;
  effectiveDate?: string;
  changelog?: string;
  sections?: TermsSection[];
  contactEmail?: string;
  contactName?: string;
  isActive?: boolean;
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

type UpdateTermsBody = Partial<{
  version: string;
  effectiveDate: string;
  changelog: string;
  sections: TermsSection[];
  contactEmail: string;
  contactName: string;
  isActive: boolean;
}>;

export type UpdateTermsRequest = {
  id: string;
  payload: UpdateTermsBody;
};

const sanitizeSection = (
  section: Partial<TermsSection>,
  fallbackOrder: number,
): TermsSection => ({
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

const normalizeTermsPolicy = (policy: TermsPolicy): TermsPolicy => ({
  ...policy,
  version: typeof policy.version === "string" ? policy.version : "",
  changelog: typeof policy.changelog === "string" ? policy.changelog : "",
  contactEmail: typeof policy.contactEmail === "string" ? policy.contactEmail : "",
  contactName: typeof policy.contactName === "string" ? policy.contactName : "",
  sections: Array.isArray(policy.sections)
    ? policy.sections.map((section, index) =>
        sanitizeSection(section, index + 1),
      )
    : [],
});

export const termsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveTermsPolicy: builder.query<TermsPolicy | null, void>({
      query: () => ({
        url: "/api/terms/active",
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<TermsPolicy | TermsPolicy[] | null>) => {
        if (Array.isArray(response.data)) {
          const activePolicy = response.data[0];
          return activePolicy ? normalizeTermsPolicy(activePolicy) : null;
        }

        if (response.data && typeof response.data === "object") {
          return normalizeTermsPolicy(response.data as TermsPolicy);
        }

        return null;
      },
      providesTags: (result) => {
        if (!result) {
          return [{ type: "TermsPolicy" as const, id: "ACTIVE" }];
        }

        return [
          { type: "TermsPolicy" as const, id: "ACTIVE" },
          { type: "TermsPolicy" as const, id: result._id },
        ];
      },
    }),
    updateTermsPolicy: builder.mutation<TermsPolicy, UpdateTermsRequest>({
      query: ({ id, payload }) => ({
        url: `/api/terms/${id}`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: ApiEnvelope<TermsPolicy>) =>
        normalizeTermsPolicy(response.data),
      invalidatesTags: (_result, _error, arg) => [
        { type: "TermsPolicy", id: "ACTIVE" },
        { type: "TermsPolicy", id: arg.id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetActiveTermsPolicyQuery, useUpdateTermsPolicyMutation } = termsApi;
