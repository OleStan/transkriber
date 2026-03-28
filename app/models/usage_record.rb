# frozen_string_literal: true

class UsageRecord < ApplicationRecord
  belongs_to :account
  belongs_to :transcription, optional: true

  scope :for_period, ->(account, period_start) { where(account: account, period_start: period_start) }

  def self.total_minutes_for(account, period_start)
    for_period(account, period_start).sum(:minutes_used).to_f
  end
end
