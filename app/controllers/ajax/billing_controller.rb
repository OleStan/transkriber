# frozen_string_literal: true

class Ajax::BillingController < ApplicationController
  before_action :authenticate_user!

  def plans
    plans = Plan.active
    render json: plans, each_serializer: Ajax::Billing::PlanSerializer
  end

  def create_checkout_session
    plan = Plan.find_by(id: params[:plan_id])
    return render json: { error: 'Plan not found' }, status: :not_found unless plan
    return render json: { error: 'Free plan does not require checkout' }, status: :unprocessable_entity if plan.free?

    result = Billing::CreateCheckoutSession.perform(
      account: current_user.account,
      user: current_user,
      plan: plan,
      interval: params[:interval] || 'month'
    )

    if result.success?
      render json: { checkout_url: result.checkout_url }
    else
      render json: { error: result.error }, status: :unprocessable_entity
    end
  end

  def create_portal_session
    result = Billing::CreatePortalSession.perform(
      account: current_user.account,
      return_url: "#{ENV.fetch('HOST', 'http://localhost:3000')}/settings"
    )

    if result.success?
      render json: { portal_url: result.portal_url }
    else
      render json: { error: result.error }, status: :unprocessable_entity
    end
  end

  def usage
    result = Billing::FetchUsage.perform(account: current_user.account)

    if result.success?
      render json: result.data
    else
      render json: { error: result.error }, status: :unprocessable_entity
    end
  end
end
