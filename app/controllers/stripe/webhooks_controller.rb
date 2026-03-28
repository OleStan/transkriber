# frozen_string_literal: true

module Stripe
  class WebhooksController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def create
      payload = request.body.read
      sig_header = request.env['HTTP_STRIPE_SIGNATURE']
      webhook_secret = ENV.fetch('STRIPE_WEBHOOK_SECRET', nil)

      begin
        event = ::Stripe::Webhook.construct_event(payload, sig_header, webhook_secret)
      rescue ::Stripe::SignatureVerificationError => e
        Rails.logger.error("Stripe webhook signature verification failed: #{e.message}")
        return head :bad_request
      rescue JSON::ParserError => e
        Rails.logger.error("Stripe webhook JSON parse error: #{e.message}")
        return head :bad_request
      end

      handle_event(event)
      head :ok
    end

    private

    def handle_event(event)
      case event.type
      when 'checkout.session.completed'
        handle_checkout_completed(event.data.object)
      when 'customer.subscription.updated'
        handle_subscription_updated(event.data.object)
      when 'customer.subscription.deleted'
        handle_subscription_deleted(event.data.object)
      when 'invoice.payment_failed'
        handle_payment_failed(event.data.object)
      else
        Rails.logger.info("Unhandled Stripe event: #{event.type}")
      end
    end

    def handle_checkout_completed(session)
      return unless session.mode == 'subscription'

      account_id = session.metadata['account_id']
      plan_id = session.metadata['plan_id']
      account = Account.find_by(id: account_id)
      plan = Plan.find_by(id: plan_id)
      return unless account && plan

      stripe_sub = ::Stripe::Subscription.retrieve(session.subscription)
      interval = stripe_sub.items.data.first&.price&.recurring&.interval || 'month'

      # Cancel any existing paid subscriptions
      account.subscriptions.where.not(stripe_subscription_id: nil).each do |old_sub|
        old_sub.update!(stripe_status: 'canceled', cancel_at_period_end: false)
      end

      account.subscriptions.create!(
        plan: plan,
        stripe_subscription_id: stripe_sub.id,
        stripe_status: stripe_sub.status,
        billing_interval: interval,
        current_period_start: Time.at(stripe_sub.current_period_start),
        current_period_end: Time.at(stripe_sub.current_period_end),
        cancel_at_period_end: stripe_sub.cancel_at_period_end
      )
    rescue => e
      Rails.logger.error("checkout.session.completed handler error: #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}")
    end

    def handle_subscription_updated(stripe_sub)
      sub = ::Subscription.find_by(stripe_subscription_id: stripe_sub.id)
      return unless sub

      sub.update!(
        stripe_status: stripe_sub.status,
        current_period_start: Time.at(stripe_sub.current_period_start),
        current_period_end: Time.at(stripe_sub.current_period_end),
        cancel_at_period_end: stripe_sub.cancel_at_period_end,
        canceled_at: stripe_sub.canceled_at ? Time.at(stripe_sub.canceled_at) : nil
      )
    rescue => e
      Rails.logger.error("customer.subscription.updated handler error: #{e.message}")
    end

    def handle_subscription_deleted(stripe_sub)
      sub = ::Subscription.find_by(stripe_subscription_id: stripe_sub.id)
      return unless sub

      sub.update!(stripe_status: 'canceled', canceled_at: Time.current, cancel_at_period_end: false)

      # Downgrade account back to Free plan
      account = sub.account
      account.create_free_subscription_if_missing
    rescue => e
      Rails.logger.error("customer.subscription.deleted handler error: #{e.message}")
    end

    def handle_payment_failed(invoice)
      customer_id = invoice.customer
      account = Account.find_by(stripe_customer_id: customer_id)
      return unless account

      sub = account.subscriptions.find_by(stripe_subscription_id: invoice.subscription)
      sub&.update!(stripe_status: 'past_due')
      Rails.logger.warn("Payment failed for account #{account.id}")
    rescue => e
      Rails.logger.error("invoice.payment_failed handler error: #{e.message}")
    end
  end
end
