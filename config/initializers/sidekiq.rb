# frozen_string_literal: true

Sidekiq.configure_server do |config|
  # Create and configure the logger
  # config.logger = Logger.new(File.join(Rails.root, 'log', 'sidekiq.log'))
  # config.logger.level = Logger::DEBUG
end
