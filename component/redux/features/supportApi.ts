import baseApi from "../api/baseApi";

export type TicketUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type Ticket = {
  _id: string;
  userId: TicketUser | string;
  category: string;
  message: string;
  status: "open" | "resolved" | "pending";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
};

type GetTicketsResponse = {
  success: boolean;
  data: {
    tickets: Ticket[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

type UpdateTicketRequest = {
  id: string;
  payload: {
    response: string;
    status: string;
  };
};

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportTickets: builder.query<GetTicketsResponse["data"], { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/api/support/admin/tickets",
        method: "GET",
        params: params || { page: 1, limit: 10 },
      }),
      transformResponse: (response: GetTicketsResponse) => response.data,
      providesTags: ["SupportTickets"],
    }),
    updateTicket: builder.mutation<Ticket, UpdateTicketRequest>({
      query: ({ id, payload }) => ({
        url: `/api/support/admin/tickets/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["SupportTickets"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSupportTicketsQuery, useUpdateTicketMutation } = supportApi;
