# frozen_string_literal: true

class Billing::RecordUsageContext < ActiveInteractor::Context::Base
  attributes :account, :transcription

  validates :account, :transcription, presence: true
end

class Billing::RecordUsage < ActiveInteractor::Base
  def perform
    duration_seconds = context.transcription.duration.to_f
    minutes_used = (duration_seconds / 60.0).ceil(2)
    return if minutes_used <= 0

    subscription = context.account.active_subscription
    period_start = subscription&.period_start_date || Date.current.beginning_of_month

    UsageRecord.create!(
      account: context.account,
      transcription: context.transcription,
      minutes_used: minutes_used,
      recorded_at: Time.current,
      period_start: period_start
    )
  rescue ActiveRecord::RecordInvalid => e
    # Non-blocking: a usage recording failure must never break transcription delivery
    Rails.logger.error("Failed to record usage for transcription #{context.transcription.id}: #{e.message}")
  end
end
