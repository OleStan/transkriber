class Account < ApplicationRecord
  has_many :users, dependent: :destroy
  has_many :transcriptions, dependent: :nullify
  
  validates :name, presence: true
end
