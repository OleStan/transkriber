# frozen_string_literal: true

class Plan < ApplicationRecord
  has_many :subscriptions

  scope :active, -> { where(active: true).order(:position) }

  def free?
    price_monthly_cents == 0
  end

  def unlimited?
    transcription_minutes_limit == 0
  end
end
