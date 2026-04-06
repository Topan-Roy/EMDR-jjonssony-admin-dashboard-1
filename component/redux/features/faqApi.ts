import baseApi from "../api/baseApi";

export type AdminFaq = {
  _id: string;
  question: string;
  answer: string;
  order?: number;
  displayId?: number;
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

type SaveFaqPayload = {
  question: string;
  answer: string;
};

type UpdateFaqPayload = {
  id: string;
  question: string;
  answer: string;
};

type DeleteFaqResponse = {
  message: string;
};

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminFaqs: builder.query<AdminFaq[], void>({
      query: () => ({
        url: "/api/faq/admin/all",
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<AdminFaq[]>) => response.data,
      providesTags: (result) => {
        if (!result) {
          return [{ type: "FAQ" as const, id: "LIST" }];
        }

        return [
          { type: "FAQ" as const, id: "LIST" },
          ...result.map((faq) => ({ type: "FAQ" as const, id: faq._id })),
        ];
      },
    }),
    createFaq: builder.mutation<AdminFaq, SaveFaqPayload>({
      query: (payload) => ({
        url: "/api/faq",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiEnvelope<AdminFaq>) => response.data,
      invalidatesTags: [{ type: "FAQ", id: "LIST" }],
    }),
    updateFaq: builder.mutation<AdminFaq, UpdateFaqPayload>({
      query: ({ id, question, answer }) => ({
        url: `/api/faq/${id}`,
        method: "PATCH",
        body: { question, answer },
      }),
      transformResponse: (response: ApiEnvelope<AdminFaq>) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: "FAQ", id: arg.id },
        { type: "FAQ", id: "LIST" },
      ],
    }),
    deleteFaq: builder.mutation<DeleteFaqResponse, string>({
      query: (id) => ({
        url: `/api/faq/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiEnvelope<DeleteFaqResponse>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: "FAQ", id },
        { type: "FAQ", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;
