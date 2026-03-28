# frozen_string_literal: true

class Billing::CreatePortalSessionContext < ActiveInteractor::Context::Base
  attributes :account, :return_url
  attributes :portal_url

  validates :account, presence: true
end

class Billing::CreatePortalSession < ActiveInteractor::Base
  def perform
    unless context.account.stripe_customer_id.present?
      context.fail!(error: 'No billing account found. Please subscribe to a plan first.')
      return
    end

    session = Stripe::BillingPortal::Session.create(
      customer: context.account.stripe_customer_id,
      return_url: context.return_url || ENV.fetch('STRIPE_CANCEL_URL', 'http://localhost:3000/settings')
    )

    context.portal_url = session.url
  rescue Stripe::StripeError => e
    context.fail!(error: e.message)
  end
end
