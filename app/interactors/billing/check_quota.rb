# frozen_string_literal: true

class Billing::CheckQuotaContext < ActiveInteractor::Context::Base
  attributes :account
end

class Billing::CheckQuota < ActiveInteractor::Base
  def perform
    return unless context.account

    plan = context.account.current_plan
    return if plan.nil? || plan.unlimited?

    subscription = context.account.active_subscription
    period_start = subscription&.period_start_date || Date.current.beginning_of_month

    minutes_used = UsageRecord.total_minutes_for(context.account, period_start)

    if minutes_used >= plan.transcription_minutes_limit
      context.fail!(
        error: "Monthly transcription limit reached (#{plan.transcription_minutes_limit} min). " \
               'Upgrade your plan to continue transcribing.'
      )
    end
  end
end
