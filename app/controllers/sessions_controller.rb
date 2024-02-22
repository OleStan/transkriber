# frozen_string_literal: true

class SessionsController < ApplicationController

  def create
    user = User.find(params[:user])
    session[:user_id] = user.id
    render json: user
  end

  def show
    user = User.find(session[:user_id])
    render json: user
  end
end