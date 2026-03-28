# frozen_string_literal: true

class Billing::CreateCheckoutSessionContext < ActiveInteractor::Context::Base
  attributes :account, :user, :plan, :interval
  attributes :checkout_url

  validates :account, :user, :plan, presence: true
  validates :interval, inclusion: { in: %w[month year] }
end

class Billing::CreateCheckoutSession < ActiveInteractor::Base
  def perform
    customer_id = context.account.find_or_create_stripe_customer(context.user)
    price_id = monthly? ? context.plan.stripe_price_id_monthly : context.plan.stripe_price_id_yearly

    session = Stripe::Checkout::Session.create(
      customer: customer_id,
      mode: 'subscription',
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: "#{ENV.fetch('STRIPE_SUCCESS_URL', 'http://localhost:3000/settings')}?billing=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: ENV.fetch('STRIPE_CANCEL_URL', 'http://localhost:3000/settings'),
      metadata: {
        account_id: context.account.id,
        plan_id: context.plan.id
      }
    )

    context.checkout_url = session.url
  rescue Stripe::StripeError => e
    context.fail!(error: e.message)
  end

  private

  def monthly?
    context.interval == 'month'
  end
end
