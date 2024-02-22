Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
  # post '/login', to: "sessions#create"
  # get '/login', to: "sessions#show"
  # react routes
  controller :pages do
    get '/', to: 'pages#root'
    get '/home', to: 'pages#root'
    get  'transcriptions', to: 'pages#root'
    get  'transcriptions/:id', to: 'pages#root'
    get  'transcriptions/', to: 'pages#root'
  end




  resources :audio_transcriptions do
    post :transcribe, on: :member
  end

  namespace :ajax do
    resources :transcriptions, only: %i[index show create]
  end

end
