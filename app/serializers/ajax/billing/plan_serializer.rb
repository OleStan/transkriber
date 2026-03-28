# frozen_string_literal: true

class Ajax::Billing::PlanSerializer < ActiveModel::Serializer
  attributes :id, :name, :price_monthly_cents, :price_yearly_cents,
             :transcription_minutes_limit, :max_file_size_mb,
             :video_allowed, :max_concurrent_jobs, :features,
             :position, :free, :unlimited_minutes

  def free
    object.free?
  end

  def unlimited_minutes
    object.unlimited?
  end
end
