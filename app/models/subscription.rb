# frozen_string_literal: true

class Subscription < ApplicationRecord
  belongs_to :account
  belongs_to :plan

  ACTIVE_STATUSES = %w[active trialing].freeze

  def active?
    stripe_status.in?(ACTIVE_STATUSES)
  end

  def period_start_date
    current_period_start&.to_date
  end
end
