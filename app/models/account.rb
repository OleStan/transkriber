class Account < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :transcriptions, dependent: :nullify
  has_many :subscriptions, dependent: :destroy
  has_many :usage_records, dependent: :destroy
  has_one :active_subscription,
          -> { where(stripe_status: Subscription::ACTIVE_STATUSES).order(created_at: :desc) },
          class_name: 'Subscription'

  validates :name, presence: true

  def current_plan
    active_subscription&.plan || Plan.find_by(name: 'Free', active: true)
  end

  def find_or_create_stripe_customer(user)
    return stripe_customer_id if stripe_customer_id.present?

    customer = Stripe::Customer.create(
      email: user.email,
      name: user.full_name,
      metadata: { account_id: id }
    )
    update!(stripe_customer_id: customer.id)
    customer.id
  end

  def create_free_subscription_if_missing
    return if subscriptions.exists?

    free_plan = Plan.find_by(name: 'Free', active: true)
    return unless free_plan

    subscriptions.create!(
      plan: free_plan,
      stripe_status: 'active',
      billing_interval: 'month',
      current_period_start: Time.current,
      current_period_end: 1.month.from_now
    )
  end
end
