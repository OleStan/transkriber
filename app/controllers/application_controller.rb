class ApplicationController < ActionController::Base
  # before_action :cors_set_access_control_headers
  #
  # def cors_set_access_control_headers
  #   headers['Access-Control-Allow-Origin'] = 'localhost:5173' # Again, be cautious with allowing all origins.
  #   headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, PATCH, DELETE, OPTIONS'
  #   headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
  #   headers['Access-Control-Max-Age'] = "1728000"
  # end

  def cors_preflight_check
    if request.method == 'OPTIONS'
      cors_set_access_control_headers
      render text: '', content_type: 'text/plain'
    end
  end

  def cors_set_access_control_headers
    response.headers['Access-Control-Allow-Origin'] = check_origin
    response.headers['Access-Control-Allow-Credentials'] = "true"
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, PATCH, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token, Auth-Token, Email, X-User-Token, X-User-Email'
    response.headers['Access-Control-Max-Age'] = '86400'
  end

  def check_origin
    permitted_origins = Set[
      "http://localhost:3000",
      "http://localhost:5173",
    ]

    origin = request.origin

    if permitted_origins.include?(origin)
      origin
    else
      render json: { error: "Origin not permitted" }
    end
  end

  # def cors_preflight_check
  #   cors_set_access_control_headers
  #   render text: '', content_type: 'text/plain'
  # end
end
