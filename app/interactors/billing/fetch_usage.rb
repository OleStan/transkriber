# frozen_string_literal: true

class Billing::FetchUsageContext < ActiveInteractor::Context::Base
  attributes :account
  attributes :data

  validates :account, presence: true
end

class Billing::FetchUsage < ActiveInteractor::Base
  HISTORY_MONTHS = 6

  def perform
    subscription = context.account.active_subscription
    plan = context.account.current_plan

    period_start = subscription&.period_start_date || Date.current.beginning_of_month
    minutes_used = UsageRecord.total_minutes_for(context.account, period_start)
    limit = plan.transcription_minutes_limit

    context.data = {
      plan: {
        name: plan.name,
        transcription_minutes_limit: limit,
        unlimited_minutes: plan.unlimited?,
        max_file_size_mb: plan.max_file_size_mb,
        video_allowed: plan.video_allowed,
        max_concurrent_jobs: plan.max_concurrent_jobs,
        price_monthly_cents: plan.price_monthly_cents,
        price_yearly_cents: plan.price_yearly_cents,
        features: plan.features
      },
      subscription: subscription_data(subscription),
      current_period: {
        period_start: period_start,
        minutes_used: minutes_used.round(2),
        minutes_limit: limit,
        unlimited: plan.unlimited?,
        percentage_used: limit.zero? ? 0 : [(minutes_used / limit * 100).round(1), 100].min
      },
      history: usage_history
    }
  end

  private

  def subscription_data(subscription)
    return nil unless subscription

    {
      stripe_status: subscription.stripe_status,
      billing_interval: subscription.billing_interval,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end
    }
  end

  def usage_history
    HISTORY_MONTHS.times.map do |i|
      start_date = i.months.ago.to_date.beginning_of_month
      end_date = start_date.end_of_month
      minutes = UsageRecord
        .where(account: context.account)
        .where(period_start: start_date..end_date)
        .sum(:minutes_used).to_f
      { month: start_date.strftime('%b %Y'), minutes_used: minutes.round(2), period_start: start_date }
    end.reverse
  end
end
