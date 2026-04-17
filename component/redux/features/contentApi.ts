import baseApi from "../api/baseApi";

export type ContentCategory = {
  id: string;
  name: string;
  slug?: string;
  isActive: boolean;
};

export type CreateMediaPayload = {
  image: File;
  name: string;
  categoryId: string;
  status: "Active" | "Inactive";
};

export type UpdateMediaPayload = {
  mediaId: string;
  categoryId: string;
  status: "Active" | "Inactive";
};

export type CreatedMedia = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug?: string;
  name?: string;
  url: string;
  mediaType: string;
  originalName: string;
  size: number;
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
};

type DeleteMediaApiResponse = {
  success: boolean;
  data?: {
    message?: string;
  };
  message?: string;
  meta?: {
    timestamp?: string;
  };
};

type UpdateMediaApiResponse = {
  success: boolean;
  data: {
    _id?: string;
    categoryId?:
      | string
      | {
          _id?: string;
          categoryName?: string;
          slug?: string;
        };
    url?: string;
    name?: string;
    mediaType?: string;
    originalName?: string;
    size?: number;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  meta?: {
    timestamp?: string;
  };
};

type CategoryApiResponse = {
  success: boolean;
  data: Array<{
    _id?: string;
    categoryName?: string;
    slug?: string;
    isActive?: boolean;
  }>;
  meta?: {
    timestamp?: string;
  };
};

type CreateMediaApiResponse = {
  success: boolean;
  data: {
    _id?: string;
    categoryId?:
      | string
      | {
          _id?: string;
          categoryName?: string;
          slug?: string;
        };
    url?: string;
    name?: string;
    mediaType?: string;
    originalName?: string;
    size?: number;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  meta?: {
    timestamp?: string;
  };
};

type GetMediaApiResponse = {
  success: boolean;
  data: {
    media?: Array<{
      _id?: string;
      categoryId?: {
        _id?: string;
        categoryName?: string;
        slug?: string;
      };
    url?: string;
    name?: string;
    mediaType?: string;
    originalName?: string;
    size?: number;
      status?: string;
      createdAt?: string;
      updatedAt?: string;
    }>;
    pagination?: {
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
      hasNextPage?: boolean;
    };
  };
  meta?: {
    timestamp?: string;
  };
};

const normalizeCategory = (
  category: CategoryApiResponse["data"][number],
  index: number,
): ContentCategory => ({
  id: typeof category._id === "string" && category._id.trim().length > 0
    ? category._id
    : `category-${index}`,
  name:
    typeof category.categoryName === "string" && category.categoryName.trim().length > 0
      ? category.categoryName.trim()
      : `Category ${index + 1}`,
  slug:
    typeof category.slug === "string" && category.slug.trim().length > 0
      ? category.slug.trim()
      : undefined,
  isActive: category.isActive !== false,
});

const normalizeCreatedMedia = (response: CreateMediaApiResponse): CreatedMedia => {
  const media = response.data ?? {};
  const nestedCategory =
    typeof media.categoryId === "object" && media.categoryId !== null ? media.categoryId : null;
  const rawStatus =
    typeof media.status === "string" && media.status.toLowerCase() === "inactive"
      ? "Inactive"
      : "Active";

  return {
    id: typeof media._id === "string" ? media._id : "",
    categoryId:
      typeof nestedCategory?._id === "string"
        ? nestedCategory._id
        : typeof media.categoryId === "string"
          ? media.categoryId
          : "",
    categoryName:
      typeof nestedCategory?.categoryName === "string" && nestedCategory.categoryName.trim().length > 0
        ? nestedCategory.categoryName.trim()
        : "Uncategorized",
    categorySlug:
      typeof nestedCategory?.slug === "string" && nestedCategory.slug.trim().length > 0
        ? nestedCategory.slug.trim()
        : undefined,
    name: typeof media.name === "string" && media.name.trim().length > 0 ? media.name.trim() : undefined,
    url: typeof media.url === "string" ? media.url : "",
    mediaType: typeof media.mediaType === "string" ? media.mediaType : "image",
    originalName: typeof media.originalName === "string" ? media.originalName : "Uploaded file",
    size: typeof media.size === "number" ? media.size : 0,
    status: rawStatus,
    createdAt: typeof media.createdAt === "string" ? media.createdAt : undefined,
    updatedAt: typeof media.updatedAt === "string" ? media.updatedAt : undefined,
  };
};

const normalizeMediaItem = (
  media: NonNullable<GetMediaApiResponse["data"]["media"]>[number],
): CreatedMedia => {
  const nestedCategory = media.categoryId ?? {};
  const rawStatus =
    typeof media.status === "string" && media.status.toLowerCase() === "inactive"
      ? "Inactive"
      : "Active";

  return {
    id: typeof media._id === "string" ? media._id : "",
    categoryId: typeof nestedCategory._id === "string" ? nestedCategory._id : "",
    categoryName:
      typeof nestedCategory.categoryName === "string" && nestedCategory.categoryName.trim().length > 0
        ? nestedCategory.categoryName.trim()
        : "Uncategorized",
    categorySlug:
      typeof nestedCategory.slug === "string" && nestedCategory.slug.trim().length > 0
        ? nestedCategory.slug.trim()
        : undefined,
    name: typeof media.name === "string" && media.name.trim().length > 0 ? media.name.trim() : undefined,
    url: typeof media.url === "string" ? media.url : "",
    mediaType: typeof media.mediaType === "string" ? media.mediaType : "image",
    originalName: typeof media.originalName === "string" ? media.originalName : "Uploaded file",
    size: typeof media.size === "number" ? media.size : 0,
    status: rawStatus,
    createdAt: typeof media.createdAt === "string" ? media.createdAt : undefined,
    updatedAt: typeof media.updatedAt === "string" ? media.updatedAt : undefined,
  };
};

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContentCategories: builder.query<ContentCategory[], void>({
      query: () => ({
        url: "/api/categories",
        method: "GET",
      }),
      transformResponse: (response: CategoryApiResponse) =>
        Array.isArray(response.data)
          ? response.data.map((category, index) => normalizeCategory(category, index))
          : [],
    }),
    getMediaList: builder.query<CreatedMedia[], { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: "/api/media",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      }),
      transformResponse: (response: GetMediaApiResponse) =>
        Array.isArray(response.data?.media)
          ? response.data.media.map((media) => normalizeMediaItem(media))
          : [],
    }),
    createMedia: builder.mutation<CreatedMedia, CreateMediaPayload>({
      query: (payload) => {
        const formData = new FormData();

        formData.append("image", payload.image);
        formData.append("name", payload.name);
        formData.append("categoryId", payload.categoryId);
        formData.append("status", payload.status.toLowerCase());

        return {
          url: "/api/media",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: CreateMediaApiResponse) => normalizeCreatedMedia(response),
    }),
    deleteMedia: builder.mutation<{ message?: string }, string>({
      query: (mediaId) => ({
        url: `/api/media/${mediaId}`,
        method: "DELETE",
      }),
      transformResponse: (response: DeleteMediaApiResponse) => ({
        message:
          (typeof response.data?.message === "string" && response.data.message.trim().length > 0
            ? response.data.message
            : undefined) ||
          (typeof response.message === "string" && response.message.trim().length > 0
            ? response.message
            : undefined),
      }),
    }),
    updateMedia: builder.mutation<CreatedMedia, UpdateMediaPayload>({
      query: ({ mediaId, categoryId, status }) => ({
        url: `/api/media/${mediaId}`,
        method: "PUT",
        body: {
          categoryId,
          status: status.toLowerCase(),
        },
      }),
      transformResponse: (response: UpdateMediaApiResponse) => normalizeCreatedMedia(response),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContentCategoriesQuery,
  useGetMediaListQuery,
  useCreateMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaMutation,
} = contentApi;
