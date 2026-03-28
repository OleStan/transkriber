# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Ajax::UsersController', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }

  before { sign_in user }

  describe 'PATCH /ajax/user/update_profile' do
    context 'with valid params' do
      let(:params) { { first_name: 'Jane', last_name: 'Smith' } }

      it 'returns 200' do
        patch update_profile_ajax_user_path, params: params, as: :json
        expect(response).to have_http_status(:ok)
      end

      it 'updates the user name' do
        patch update_profile_ajax_user_path, params: params, as: :json
        expect(user.reload.first_name).to eq('Jane')
        expect(user.reload.last_name).to eq('Smith')
      end

      it 'returns the updated name' do
        patch update_profile_ajax_user_path, params: params, as: :json
        body = response.parsed_body
        expect(body['first_name']).to eq('Jane')
        expect(body['last_name']).to eq('Smith')
      end
    end

    context 'when not authenticated' do
      before { sign_out :user }

      it 'returns 401' do
        patch update_profile_ajax_user_path, params: { first_name: 'Jane', last_name: 'Smith' }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /ajax/user/update_password' do
    context 'with valid current password' do
      let(:params) do
        {
          current_password: 'Password123!',
          password: 'NewPassword456!',
          password_confirmation: 'NewPassword456!'
        }
      end

      it 'returns 200' do
        patch update_password_ajax_user_path, params: params, as: :json
        expect(response).to have_http_status(:ok)
      end

      it 'returns success message' do
        patch update_password_ajax_user_path, params: params, as: :json
        expect(response.parsed_body['message']).to eq('Password updated')
      end
    end

    context 'with wrong current password' do
      let(:params) do
        {
          current_password: 'WrongPassword!',
          password: 'NewPassword456!',
          password_confirmation: 'NewPassword456!'
        }
      end

      it 'returns 422' do
        patch update_password_ajax_user_path, params: params, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns error messages' do
        patch update_password_ajax_user_path, params: params, as: :json
        expect(response.parsed_body['errors']).to be_present
      end
    end

    context 'when user signed in via OAuth (has provider)' do
      let(:oauth_user) { create(:user, :oauth, account: account) }
      before { sign_in oauth_user }

      let(:params) do
        {
          current_password: 'anything',
          password: 'NewPassword456!',
          password_confirmation: 'NewPassword456!'
        }
      end

      it 'returns 422' do
        patch update_password_ajax_user_path, params: params, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns a clear error about OAuth accounts' do
        patch update_password_ajax_user_path, params: params, as: :json
        expect(response.parsed_body['errors'].first).to include('Google')
      end
    end

    context 'when not authenticated' do
      before { sign_out :user }

      it 'returns 401' do
        patch update_password_ajax_user_path, params: {}, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
