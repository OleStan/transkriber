class AccountsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_account, only: [:show, :edit, :update, :destroy]
  before_action :authorize_account_management, only: [:edit, :update, :destroy]

  def index
    @accounts = current_user.admin? ? Account.all : [current_user.account]
  end

  def show
  end

  def new
    @account = Account.new
  end

  def create
    @account = Account.new(account_params)

    if @account.save
      # Associate the current user with the account if they don't have one
      if current_user.account.nil?
        current_user.update(account: @account)
      end
      
      redirect_to @account, notice: 'Account was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @account.update(account_params)
      redirect_to @account, notice: 'Account was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @account.destroy
    redirect_to accounts_url, notice: 'Account was successfully destroyed.'
  end

  private

  def set_account
    @account = Account.find(params[:id])
  end

  def account_params
    params.require(:account).permit(:name)
  end

  def authorize_account_management
    unless current_user.account == @account || current_user.admin?
      redirect_to root_path, alert: 'You are not authorized to manage this account.'
    end
  end
end
