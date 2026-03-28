import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { CheckCircleOutline, StarBorderOutlined, RocketLaunchOutlined, ManageAccountsOutlined } from '@mui/icons-material';
import { DS } from '../../theme';
import {
  useGetPlansQuery,
  useGetUsageQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
  Plan,
} from '../../redux/resourcesApi/billing/billingSlice';
import { useNotification } from '../../contexts/NotificationContext';

const sectionCard = {
  bgcolor: DS.surfaceLow,
  borderRadius: '12px',
  p: 3,
  mb: 3,
};

const PLAN_ICONS: Record<string, React.ElementType> = {
  Free: StarBorderOutlined,
  Pro: RocketLaunchOutlined,
  Business: ManageAccountsOutlined,
};

const PLAN_COLORS: Record<string, string> = {
  Free: DS.outline,
  Pro: DS.primary,
  Business: DS.tertiary,
};

interface BillingTabProps {
  onBillingSuccess?: () => void;
}

const BillingTab: React.FC<BillingTabProps> = ({ onBillingSuccess }) => {
  const { data: plans, isLoading: plansLoading } = useGetPlansQuery();
  const { data: usage, isLoading: usageLoading } = useGetUsageQuery();
  const [createCheckout, { isLoading: checkoutLoading }] = useCreateCheckoutSessionMutation();
  const [createPortal, { isLoading: portalLoading }] = useCreatePortalSessionMutation();
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [actionPlanId, setActionPlanId] = useState<number | null>(null);
  const { showNotification } = useNotification();

  // Handle Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      showNotification('Subscription activated successfully!', 'success');
      window.history.replaceState({}, '', '/settings?section=billing');
      onBillingSuccess?.();
    }
  }, []);

  const currentPlanName = usage?.plan?.name ?? 'Free';
  const subscription = usage?.subscription;

  const handleUpgrade = async (plan: Plan) => {
    if (plan.free) return;
    setActionPlanId(plan.id);
    try {
      const result = await createCheckout({ planId: plan.id, interval }).unwrap();
      window.location.href = result.checkoutUrl;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { error?: string } }).data?.error
        : 'Failed to start checkout';
      showNotification(msg || 'Failed to start checkout', 'danger');
    } finally {
      setActionPlanId(null);
    }
  };

  const handlePortal = async () => {
    try {
      const result = await createPortal().unwrap();
      window.location.href = result.portalUrl;
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { error?: string } }).data?.error
        : 'Failed to open billing portal';
      showNotification(msg || 'Failed to open billing portal', 'danger');
    }
  };

  const getCtaLabel = (plan: Plan) => {
    if (plan.name === currentPlanName) return 'Current Plan';
    if (plan.free) return 'Downgrade to Free';
    const planOrder = ['Free', 'Pro', 'Business'];
    const currentIdx = planOrder.indexOf(currentPlanName);
    const planIdx = planOrder.indexOf(plan.name);
    return planIdx > currentIdx ? 'Upgrade' : 'Switch Plan';
  };

  if (plansLoading || usageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} sx={{ color: DS.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Current plan info */}
      {subscription && (
        <Box sx={sectionCard}>
          <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '14px', color: DS.onSurface, mb: 1 }}>
            Current Subscription
          </Typography>
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: DS.onSurfaceVariant }}>
            <strong style={{ color: DS.primary }}>{currentPlanName}</strong>
            {subscription.billingInterval === 'month' ? ' · billed monthly' : ' · billed yearly'}
            {subscription.currentPeriodEnd && (
              <> · renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
            )}
          </Typography>
          {subscription.cancelAtPeriodEnd && (
            <Alert severity="warning" sx={{ mt: 2, bgcolor: `${DS.tertiary}1a`, color: DS.tertiary, '& .MuiAlert-icon': { color: DS.tertiary }, borderRadius: '8px', fontSize: '13px' }}>
              Cancels at end of billing period
            </Alert>
          )}
          <Button
            onClick={handlePortal}
            disabled={portalLoading}
            size="small"
            sx={{
              mt: 2,
              bgcolor: DS.surfaceHigh,
              color: DS.primary,
              border: `1px solid ${DS.outlineVariant}40`,
              borderRadius: '8px',
              fontFamily: '"Inter", sans-serif',
              fontSize: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: DS.surfaceBright },
            }}
          >
            {portalLoading ? 'Opening...' : 'Manage Subscription'}
          </Button>
        </Box>
      )}

      {/* Billing interval toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '14px', color: DS.onSurface }}>
          Choose a Plan
        </Typography>
        <ToggleButtonGroup
          value={interval}
          exclusive
          onChange={(_, val) => val && setInterval(val)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: DS.outline,
              borderColor: `${DS.outlineVariant}40`,
              fontFamily: '"Inter", sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'none',
              px: 1.5,
              py: 0.5,
              '&.Mui-selected': { bgcolor: `${DS.primary}1a`, color: DS.primary, borderColor: `${DS.primary}40` },
            },
          }}
        >
          <ToggleButton value="month">Monthly</ToggleButton>
          <ToggleButton value="year">Yearly <span style={{ color: DS.tertiary, marginLeft: 4 }}>−20%</span></ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Plan cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        {(plans ?? []).map((plan) => {
          const Icon = PLAN_ICONS[plan.name] ?? StarBorderOutlined;
          const color = PLAN_COLORS[plan.name] ?? DS.primary;
          const isCurrent = plan.name === currentPlanName;
          const price = interval === 'month' ? plan.priceMonthyCents : plan.priceYearlyCents;
          const priceLabel = plan.free ? 'Free' : `$${(price / 100).toFixed(0)}/${interval === 'month' ? 'mo' : 'yr'}`;
          const isActioning = actionPlanId === plan.id && checkoutLoading;

          return (
            <Box
              key={plan.id}
              sx={{
                bgcolor: isCurrent ? `${DS.primary}0d` : DS.surfaceLow,
                border: `1px solid ${isCurrent ? `${DS.primary}40` : `${DS.outlineVariant}20`}`,
                borderRadius: '12px',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {isCurrent && (
                <Box sx={{ position: 'absolute', top: 12, right: 12, bgcolor: `${DS.primary}1a`, color: DS.primary, borderRadius: '9999px', px: 1.5, py: 0.25, fontSize: '10px', fontWeight: 700, fontFamily: '"Inter", sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Active
                </Box>
              )}

              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Icon sx={{ fontSize: 20, color }} />
              </Box>

              <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 800, fontSize: '18px', color: DS.onSurface, mb: 0.5 }}>
                {plan.name}
              </Typography>
              <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '22px', fontWeight: 700, color, mb: 2 }}>
                {priceLabel}
              </Typography>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                {[
                  plan.unlimitedMinutes ? 'Unlimited minutes' : `${plan.transcriptionMinutesLimit} min/month`,
                  `${plan.maxFileSizeMb}MB max file size`,
                  plan.videoAllowed ? 'Video files supported' : 'Audio files only',
                  `${plan.maxConcurrentJobs} concurrent job${plan.maxConcurrentJobs !== 1 ? 's' : ''}`,
                ].map((feature) => (
                  <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutline sx={{ fontSize: 14, color }} />
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: DS.onSurfaceVariant }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Button
                fullWidth
                disabled={isCurrent || isActioning || (plan.free && currentPlanName !== 'Free')}
                onClick={() => !isCurrent && !plan.free && handleUpgrade(plan)}
                sx={{
                  background: isCurrent ? 'none' : plan.free ? 'none' : DS.primaryGradient,
                  bgcolor: isCurrent || plan.free ? DS.surfaceHigh : undefined,
                  color: isCurrent ? DS.outline : plan.free ? DS.onSurfaceVariant : DS.onPrimary,
                  borderRadius: '8px',
                  py: 1.25,
                  fontSize: '13px',
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: 'none',
                  border: isCurrent ? `1px solid ${DS.outlineVariant}30` : 'none',
                  '&:hover': { opacity: 0.9 },
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                {isActioning ? 'Redirecting...' : getCtaLabel(plan)}
              </Button>
            </Box>
          );
        })}
      </Box>

      {/* Manage link for non-free paid users */}
      {subscription && !subscription.stripeStatus.includes('free') && (
        <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '12px', color: DS.outline, textAlign: 'center' }}>
          Need to cancel or update payment?{' '}
          <span onClick={handlePortal} style={{ color: DS.primary, cursor: 'pointer', fontWeight: 600 }}>
            Open billing portal
          </span>
        </Typography>
      )}
    </Box>
  );
};

export default BillingTab;
