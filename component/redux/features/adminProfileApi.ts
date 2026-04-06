import baseApi from "../api/baseApi";

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePic: string;
  role: string;
  memberSince?: string;
};

export type UpdateAdminProfileRequest = {
  name: string;
  phoneNumber: string;
  profilePic?: string;
  profilePicFile?: File | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: {
    timestamp?: string;
  };
};

export const adminProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProfile: builder.query<AdminProfile, void>({
      query: () => ({
        url: "/api/admin/profile",
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<AdminProfile>) => response.data,
      providesTags: ["AdminProfile"],
    }),
    updateAdminProfile: builder.mutation<AdminProfile, UpdateAdminProfileRequest>({
      query: ({ name, phoneNumber, profilePic, profilePicFile }) => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("phoneNumber", phoneNumber);

        if (profilePicFile) {
          formData.append("profilePic", profilePicFile);
        } else if (profilePic) {
          formData.append("profilePic", profilePic);
        }

        return {
          url: "/api/admin/profile",
          method: "PATCH",
          body: formData,
        };
      },
      transformResponse: (response: ApiEnvelope<AdminProfile>) => response.data,
      invalidatesTags: ["AdminProfile"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminProfileQuery, useUpdateAdminProfileMutation } = adminProfileApi;
