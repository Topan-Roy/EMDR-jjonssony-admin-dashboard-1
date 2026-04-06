import baseApi from "../api/baseApi";

export type AboutSection = {
  title: string;
  content: string;
  order: number;
};

export type AboutUsData = {
  _id: string;
  overview: string;
  sections: AboutSection[];
  createdAt?: string;
  updatedAt?: string;
  aboutUs?: string;
};

export type UpdateAboutUsRequest = {
  overview: string;
  sections: AboutSection[];
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    timestamp?: string;
  };
};

const sanitizeSection = (section: Partial<AboutSection>, fallbackOrder: number): AboutSection => ({
  title: typeof section.title === "string" ? section.title : "",
  content: typeof section.content === "string" ? section.content : "",
  order:
    typeof section.order === "number" && Number.isFinite(section.order)
      ? section.order
      : fallbackOrder,
});

const normalizeAboutData = (payload: AboutUsData): AboutUsData => {
  const fallbackOverview =
    typeof payload.aboutUs === "string" ? payload.aboutUs : "";
  const normalizedOverview =
    typeof payload.overview === "string" ? payload.overview : fallbackOverview;

  const normalizedSections = Array.isArray(payload.sections)
    ? payload.sections.map((section, index) =>
        sanitizeSection(section, index + 1),
      )
    : [];

  return {
    ...payload,
    overview: normalizedOverview,
    sections: normalizedSections,
  };
};

export const aboutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAboutUs: builder.query<AboutUsData, void>({
      query: () => ({
        url: "/api/about",
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<AboutUsData>) =>
        normalizeAboutData(response.data),
      providesTags: ["AboutUs"],
    }),
    updateAboutUs: builder.mutation<AboutUsData, UpdateAboutUsRequest>({
      query: (payload) => ({
        url: "/api/about",
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: ApiEnvelope<AboutUsData>) =>
        normalizeAboutData(response.data),
      invalidatesTags: ["AboutUs"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAboutUsQuery, useUpdateAboutUsMutation } = aboutApi;
