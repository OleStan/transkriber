class ApplicationController < ActionController::Base
  # before_action :cors_set_access_control_headers
  #
  # def cors_set_access_control_headers
  #   headers['Access-Control-Allow-Origin'] = 'localhost:5173' # Again, be cautious with allowing all origins.
  #   headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, PATCH, DELETE, OPTIONS'
  #   headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
  #   headers['Access-Control-Max-Age'] = "1728000"
  # end
  #
  # def cors_preflight_check
  #   cors_set_access_control_headers
  #   render text: '', content_type: 'text/plain'
  # end
end
