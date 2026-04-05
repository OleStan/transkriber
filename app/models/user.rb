class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, 
         :omniauthable, omniauth_providers: [:google_oauth2]
         
  belongs_to :account, optional: true

  validates :first_name, :last_name, presence: true

  accepts_nested_attributes_for :account

  after_create :create_free_subscription
  
  def full_name
    "#{first_name} #{last_name}"
  end
  
  def display_name
    full_name.presence || email
  end
  
  # Omniauth methods
  def self.from_omniauth(auth)
    user = find_or_initialize_by(provider: auth.provider, uid: auth.uid)
    
    # Update user information if already exists
    user.email = auth.info.email if user.email.blank?
    user.password = Devise.friendly_token[0, 20] if user.encrypted_password.blank?
    user.first_name = auth.info.first_name if user.first_name.blank?
    user.last_name = auth.info.last_name if user.last_name.blank?
    user.avatar = auth.info.image if auth.info.image.present?
    
    # Create account if it doesn't exist
    if user.account.blank?
      user.build_account(name: "#{auth.info.first_name}'s Account")
    end
    
    user.save
    user.account&.create_free_subscription_if_missing
    user
  end

  private

  def create_free_subscription
    account&.create_free_subscription_if_missing
  end
end
