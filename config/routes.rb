Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"


  root "pages#index"
  resources :audio_transcriptions do
    post :transcribe, on: :member
  end

  namespace :ajax do
    resources :transcriptions, only: %i[index show]
  end

end
