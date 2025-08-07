# frozen_string_literal: true

class Transcriptions::DeleteContext < ActiveInteractor::Context::Base
  attributes :id, :page, :user, :account
  validates :id, presence: true
end

class Transcriptions::Delete < ActiveInteractor::Organizer::Base
  organize do
    add Transcriptions::DeleteTranscription
    add Transcriptions::Index
  end
end
