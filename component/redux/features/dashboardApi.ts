import baseApi from "../api/baseApi";

export type DashboardOverviewMetric = {
  count?: number;
  active?: number;
  inactive?: number;
  growth?: string;
  conversionRate?: string;
  ai?: number;
  psychologist?: number;
  rate?: string;
};

export type DashboardOverview = {
  totalUsers?: DashboardOverviewMetric;
  activeSubscriptions?: DashboardOverviewMetric;
  roadmapsCreated?: DashboardOverviewMetric;
  sessionCompletion?: DashboardOverviewMetric;
};

export type DashboardTrendPoint = {
  name: string;
  value: number;
};

export type DashboardRevenue = {
  mrr: number;
  currency: string;
  growth: string;
  trend: DashboardTrendPoint[];
};

export type DashboardSubscriptionDistributionItem = {
  _id: string;
  userCount: number;
  planName: string;
  pricePerMonth: string;
};

export type DashboardData = {
  overview: DashboardOverview;
  revenue: DashboardRevenue;
  subscriptionDistribution: DashboardSubscriptionDistributionItem[];
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

const readNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const readString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const normalizeTrendPoint = (point: unknown, index: number): DashboardTrendPoint => {
  if (!isRecord(point)) {
    return {
      name: `Point ${index + 1}`,
      value: 0,
    };
  }

  return {
    name:
      readString(point.name) ||
      readString(point.label) ||
      readString(point.month) ||
      readString(point.period) ||
      `Point ${index + 1}`,
    value:
      readNumber(point.value) ||
      readNumber(point.amount) ||
      readNumber(point.revenue) ||
      readNumber(point.mrr),
  };
};

const normalizeMetric = (metric: unknown): DashboardOverviewMetric => {
  if (!isRecord(metric)) {
    return {};
  }

  return {
    count: readNumber(metric.count),
    active: readNumber(metric.active),
    inactive: readNumber(metric.inactive),
    growth: readString(metric.growth),
    conversionRate: readString(metric.conversionRate),
    ai: readNumber(metric.ai),
    psychologist: readNumber(metric.psychologist),
    rate: readString(metric.rate),
  };
};

const normalizeDashboardData = (payload: DashboardData): DashboardData => {
  const overview = isRecord(payload.overview) ? payload.overview : {};
  const revenue = isRecord(payload.revenue) ? payload.revenue : {};

  return {
    overview: {
      totalUsers: normalizeMetric(overview.totalUsers),
      activeSubscriptions: normalizeMetric(overview.activeSubscriptions),
      roadmapsCreated: normalizeMetric(overview.roadmapsCreated),
      sessionCompletion: normalizeMetric(overview.sessionCompletion),
    },
    revenue: {
      mrr: readNumber(revenue.mrr),
      currency: readString(revenue.currency),
      growth: readString(revenue.growth),
      trend: Array.isArray(revenue.trend)
        ? revenue.trend.map((point, index) => normalizeTrendPoint(point, index))
        : [],
    },
    subscriptionDistribution: Array.isArray(payload.subscriptionDistribution)
      ? payload.subscriptionDistribution.map((item) => ({
          _id: readString(item?._id),
          userCount: readNumber(item?.userCount),
          planName: readString(item?.planName),
          pricePerMonth: readString(item?.pricePerMonth),
        }))
      : [],
  };
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, void>({
      query: () => ({
        url: "/api/admin/dashboard",
        method: "GET",
      }),
      transformResponse: (response: ApiEnvelope<DashboardData>) =>
        normalizeDashboardData(response.data),
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardQuery } = dashboardApi;
