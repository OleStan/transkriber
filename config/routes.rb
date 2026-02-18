require 'sidekiq/web'

Rails.application.routes.draw do
  resources :accounts
  devise_for :users, controllers: {
    registrations: 'api/registrations',
    omniauth_callbacks: 'users/omniauth_callbacks'
  }
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  mount ActionCable.server => '/cable'

  mount Sidekiq::Web => '/sidekiq'

  # Defines the root path route ("/")
  # root "articles#index"
  # post '/login', to: "sessions#create"
  # get '/login', to: "sessions#show"
  # react routes

  controller :pages do
    get '/', to: 'pages#root'
    get '/home', to: 'pages#root'
    get '/settings', to: 'pages#root'
    get  'transcriptions', to: 'pages#root'
    get  'transcriptions/:id', to: 'pages#root'
    get  'transcriptions/', to: 'pages#root'
  end

  resources :transcriptions do
    post :transcribe, on: :member
  end

  namespace :ajax do
    resources :accounts do
      resources :users
    end
    resources :transcriptions, only: %i[index show create destroy]
  end

  namespace :api do
    resource :session, only: [:create, :destroy, :show]
  end

end
