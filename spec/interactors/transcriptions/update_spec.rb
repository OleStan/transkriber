# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Transcriptions::Update do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:transcription) { create(:transcription, user: user, account: account) }

  let(:new_text) { 'Updated transcription text' }
  let(:new_json) { { 'segments' => [{ 'id' => 0, 'text' => 'Updated', 'start' => 0.0, 'end' => 1.0 }] } }

  subject(:result) do
    described_class.perform(
      id: transcription.id,
      user: user,
      transcription_text: new_text,
      transcription_json: new_json
    )
  end

  context 'when the transcription exists and user owns it' do
    it 'succeeds' do
      expect(result).to be_success
    end

    it 'updates the transcription text' do
      result
      expect(transcription.reload.transcription).to eq(new_text)
    end

    it 'updates the transcription_json' do
      result
      expect(transcription.reload.transcription_json).to eq(new_json)
    end

    it 'sets context.transcription to the updated record' do
      expect(result.transcription).to eq(transcription)
    end
  end

  context 'when the transcription does not exist' do
    subject(:result) do
      described_class.perform(
        id: 0,
        user: user,
        transcription_text: new_text,
        transcription_json: new_json
      )
    end

    it 'fails' do
      expect(result).not_to be_success
    end
  end

  context 'when the user does not own the transcription' do
    let(:other_user) { create(:user) }

    subject(:result) do
      described_class.perform(
        id: transcription.id,
        user: other_user,
        transcription_text: new_text,
        transcription_json: new_json
      )
    end

    it 'fails' do
      expect(result).not_to be_success
    end

    it 'does not modify the transcription' do
      original_text = transcription.transcription
      result
      expect(transcription.reload.transcription).to eq(original_text)
    end
  end

  context 'when the transcription belongs to the same account' do
    let(:other_account_user) { create(:user, account: account) }

    subject(:result) do
      described_class.perform(
        id: transcription.id,
        user: other_account_user,
        transcription_text: new_text,
        transcription_json: new_json
      )
    end

    it 'succeeds (account-level access)' do
      expect(result).to be_success
    end
  end
end
