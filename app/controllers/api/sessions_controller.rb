class Api::SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token
  respond_to :json

  def create
    user = User.find_by(email: params[:user][:email])

    if user && user.valid_password?(params[:user][:password])
      sign_in(user)
      render json: {
        status: 200,
        message: "Logged in successfully",
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          account_id: user.account_id,
          avatar: user.avatar,
          provider: user.provider
        }
      }
    else
      render json: {
        status: 401,
        message: "Invalid email or password"
      }, status: :unauthorized
    end
  end

  def destroy
    sign_out(current_user)
    render json: {
      status: 200,
      message: "Logged out successfully"
    }
  end

  def show
    if user_signed_in?
      render json: {
        status: 200,
        user: {
          id: current_user.id,
          email: current_user.email,
          first_name: current_user.first_name,
          last_name: current_user.last_name,
          account_id: current_user.account_id
        }
      }
    else
      render json: {
        status: 401,
        message: "User not logged in"
      }, status: :unauthorized
    end
  end
end
