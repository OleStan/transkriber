# frozen_string_literal: true

module Ajax
  class UsersController < ApplicationController
    before_action :authenticate_user!
    before_action :set_account, except: %i[update_profile update_password]
    before_action :set_user, only: %i[show update destroy]
    before_action :authorize_account_management, except: %i[update_profile update_password]

    def update_profile
      if current_user.update(profile_params)
        render json: { first_name: current_user.first_name, last_name: current_user.last_name }
      else
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update_password
      if current_user.provider.present?
        return render json: { errors: ['Password cannot be changed for accounts signed in with Google'] }, status: :unprocessable_entity
      end

      if current_user.update_with_password(password_params)
        bypass_sign_in(current_user)
        render json: { message: 'Password updated' }
      else
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

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

    def profile_params
      params.permit(:first_name, :last_name)
    end

    def password_params
      params.permit(:current_password, :password, :password_confirmation)
    end

    def authorize_account_management
      head :forbidden unless current_user.admin? || current_user.account_id == @account.id
    end
  end
end
