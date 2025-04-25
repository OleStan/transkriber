# frozen_string_literal: true

module Ajax
  class AccountsController < ApplicationController
    before_action :authenticate_user!
    before_action :set_account, only: %i[show update destroy]

    def index
      accounts = current_user.admin? ? Account.all : [current_user.account].compact
      render json: accounts
    end

    def show
      render json: @account
    end

    def create
      @account = Account.new(account_params)
      if @account.save
        current_user.update(account: @account) if current_user.account.nil?
        render json: @account, status: :created
      else
        render json: { errors: @account.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @account.update(account_params)
        render json: @account
      else
        render json: { errors: @account.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @account.destroy
      head :no_content
    end

    private

    def set_account
      @account = Account.find(params[:id])
    end

    def account_params
      params.require(:account).permit(:name)
    end
  end
end
