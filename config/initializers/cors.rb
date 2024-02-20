Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'
    # resource '*',
    #          headers: :any,
    #          methods: [:get, :post, :put, :patch, :delete, :options, :head],
    #          expose: ['Content-Disposition']
    resource "*",
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options, :head]

    # resource '/rails/active_storage/*', headers: :any, methods: [:get], credentials: false
  end
end
