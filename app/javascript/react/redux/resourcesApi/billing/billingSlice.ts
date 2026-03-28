import { transcriberApi } from '../transcriberService';
import { toCamelCase } from '../../utils';

export interface Plan {
  id: number;
  name: string;
  priceMonthyCents: number;
  priceYearlyCents: number;
  transcriptionMinutesLimit: number;
  maxFileSizeMb: number;
  videoAllowed: boolean;
  maxConcurrentJobs: number;
  features: Record<string, unknown>;
  position: number;
  free: boolean;
  unlimitedMinutes: boolean;
}

export interface SubscriptionData {
  stripeStatus: string;
  billingInterval: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface CurrentPeriodUsage {
  periodStart: string;
  minutesUsed: number;
  minutesLimit: number;
  unlimited: boolean;
  percentageUsed: number;
}

export interface UsageHistoryItem {
  month: string;
  minutesUsed: number;
  periodStart: string;
}

export interface UsageResponse {
  plan: Plan & { unlimitedMinutes: boolean };
  subscription: SubscriptionData | null;
  currentPeriod: CurrentPeriodUsage;
  history: UsageHistoryItem[];
}

export const billingSlice = transcriberApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<Plan[], void>({
      query: () => 'billing/plans',
      transformResponse: (response: Plan[]) => toCamelCase(response),
    }),
    createCheckoutSession: builder.mutation<
      { checkoutUrl: string },
      { planId: number; interval: 'month' | 'year' }
    >({
      query: (body) => ({
        url: 'billing/subscriptions',
        method: 'POST',
        body: { plan_id: body.planId, interval: body.interval },
      }),
      transformResponse: (r: { checkoutUrl: string }) => toCamelCase(r),
    }),
    createPortalSession: builder.mutation<{ portalUrl: string }, void>({
      query: () => ({
        url: 'billing/portal',
        method: 'POST',
      }),
      transformResponse: (r: { portalUrl: string }) => toCamelCase(r),
    }),
    getUsage: builder.query<UsageResponse, void>({
      query: () => 'billing/usage',
      transformResponse: (r: UsageResponse) => toCamelCase(r),
    }),
  }),
});

export const {
  useGetPlansQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
  useGetUsageQuery,
} = billingSlice;
