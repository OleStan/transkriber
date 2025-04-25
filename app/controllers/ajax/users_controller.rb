# frozen_string_literal: true

module Ajax
  class UsersController < ApplicationController
    before_action :authenticate_user!
    before_action :set_account
    before_action :set_user, only: %i[show update destroy]
    before_action :authorize_account_management

    def index
      users = current_user.admin? ? @account.users : [current_user]
      render json: users
    end

    def show
      render json: @user
    end

    def create
      @user = @account.users.new(user_params)
      if @user.save
        render json: @user, status: :created
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @user.update(user_params)
        render json: @user
      else
        render json: { errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @user.destroy
      head :no_content
    end

    private

    def set_account
      @account = Account.find(params[:account_id])
    end

    def set_user
      @user = @account.users.find(params[:id])
    end

    def user_params
      permitted = %i[email first_name last_name password password_confirmation]
      permitted << :admin if current_user.admin?
      params.require(:user).permit(permitted)
    end

    def authorize_account_management
      head :forbidden unless current_user.admin? || current_user.account_id == @account.id
    end
  end
end
