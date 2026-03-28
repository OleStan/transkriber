# frozen_string_literal: true

plans = [
  {
    name: 'Free',
    stripe_product_id: nil,
    stripe_price_id_monthly: nil,
    stripe_price_id_yearly: nil,
    price_monthly_cents: 0,
    price_yearly_cents: 0,
    transcription_minutes_limit: 60,
    max_file_size_mb: 25,
    video_allowed: false,
    max_concurrent_jobs: 1,
    features: { 'export' => ['txt'], 'editor' => true },
    position: 1,
    active: true
  },
  {
    name: 'Pro',
    stripe_product_id: ENV.fetch('STRIPE_PRO_PRODUCT_ID', nil),
    stripe_price_id_monthly: ENV.fetch('STRIPE_PRO_PRICE_MONTHLY', nil),
    stripe_price_id_yearly: ENV.fetch('STRIPE_PRO_PRICE_YEARLY', nil),
    price_monthly_cents: 1200,
    price_yearly_cents: 9600,
    transcription_minutes_limit: 600,
    max_file_size_mb: 200,
    video_allowed: true,
    max_concurrent_jobs: 3,
    features: { 'export' => ['txt', 'srt', 'vtt'], 'editor' => true, 'summary' => true },
    position: 2,
    active: true
  },
  {
    name: 'Business',
    stripe_product_id: ENV.fetch('STRIPE_BUSINESS_PRODUCT_ID', nil),
    stripe_price_id_monthly: ENV.fetch('STRIPE_BUSINESS_PRICE_MONTHLY', nil),
    stripe_price_id_yearly: ENV.fetch('STRIPE_BUSINESS_PRICE_YEARLY', nil),
    price_monthly_cents: 3900,
    price_yearly_cents: 31200,
    transcription_minutes_limit: 0,
    max_file_size_mb: 500,
    video_allowed: true,
    max_concurrent_jobs: 10,
    features: { 'export' => ['txt', 'srt', 'vtt'], 'editor' => true, 'summary' => true, 'priority_queue' => true },
    position: 3,
    active: true
  }
]

plans.each do |attrs|
  plan = Plan.find_or_initialize_by(name: attrs[:name])
  plan.update!(attrs)
  puts "  #{plan.persisted? ? 'Updated' : 'Created'} plan: #{plan.name}"
end
