class Api::RegistrationsController < Devise::RegistrationsController
  skip_before_action :verify_authenticity_token
  respond_to :json

  def create
    build_resource(sign_up_params)

    if resource.save
      sign_in(resource_name, resource)
      render json: {
        status: 201,
        message: "Signed up successfully",
        user: {
          id: resource.id,
          email: resource.email,
          first_name: resource.first_name,
          last_name: resource.last_name,
          account_id: resource.account_id
        }
      }, status: :created
    else
      clean_up_passwords resource
      render json: {
        status: 422,
        message: resource.errors.full_messages.join(", ")
      }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(
      :email, 
      :password, 
      :password_confirmation, 
      :first_name, 
      :last_name, 
      :account_id,
      account_attributes: [:name]
    )
  end
end
