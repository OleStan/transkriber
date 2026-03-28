FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    password { 'Password123!' }
    password_confirmation { 'Password123!' }
    provider { nil }
    uid { nil }
    admin { false }
    association :account
  end

  trait :oauth do
    provider { 'google_oauth2' }
    uid { Faker::Number.number(digits: 10).to_s }
    password { Devise.friendly_token[0, 20] }
    password_confirmation { password }
  end

  trait :admin do
    admin { true }
  end
end
