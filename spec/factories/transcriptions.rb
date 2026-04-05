FactoryBot.define do
  factory :transcription do
    title { Faker::Lorem.words(number: 3).join(' ') }
    status { 'completed' }
    progress { 100 }
    transcription { Faker::Lorem.paragraph }
    transcription_json do
      {
        'segments' => [
          { 'id' => 0, 'text' => ' Hello world', 'start' => 0.0, 'end' => 2.5 },
          { 'id' => 1, 'text' => ' How are you', 'start' => 2.5, 'end' => 5.0 }
        ]
      }
    end
    association :user
    association :account
  end

  trait :without_json do
    transcription_json { nil }
  end

  trait :chunked_json do
    transcription_json do
      [
        {
          'segments' => [
            { 'id' => 0, 'text' => ' First chunk', 'start' => 0.0, 'end' => 2.0 }
          ]
        }
      ]
    end
  end

  trait :pending do
    status { 'pending' }
    progress { 0 }
    transcription { nil }
    transcription_json { nil }
  end
end
