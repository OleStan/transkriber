# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Ajax::TranscriptionsController', type: :request do
  let(:account) { create(:account) }
  let(:user) { create(:user, account: account) }
  let(:transcription) { create(:transcription, user: user, account: account) }

  before { sign_in user }

  describe 'GET /ajax/transcriptions/:id/export' do
    context 'with format=txt' do
      it 'returns 200 with text/plain content type' do
        get export_ajax_transcription_path(transcription, format: 'txt')
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include('text/plain')
      end

      it 'sends an attachment with .txt filename' do
        get export_ajax_transcription_path(transcription, format: 'txt')
        expect(response.headers['Content-Disposition']).to include('attachment')
        expect(response.headers['Content-Disposition']).to include('.txt')
      end

      it 'returns transcription text content' do
        get export_ajax_transcription_path(transcription, format: 'txt')
        expect(response.body).to include('Hello world')
      end
    end

    context 'with format=srt' do
      it 'returns 200' do
        get export_ajax_transcription_path(transcription, format: 'srt')
        expect(response).to have_http_status(:ok)
      end

      it 'returns content with SRT timestamp format' do
        get export_ajax_transcription_path(transcription, format: 'srt')
        expect(response.body).to match(/\d{2}:\d{2}:\d{2},\d{3}/)
      end
    end

    context 'with format=vtt' do
      it 'returns text/vtt content type' do
        get export_ajax_transcription_path(transcription, format: 'vtt')
        expect(response.content_type).to include('text/vtt')
      end

      it 'returns body starting with WEBVTT' do
        get export_ajax_transcription_path(transcription, format: 'vtt')
        expect(response.body).to start_with('WEBVTT')
      end
    end

    context 'with an invalid format' do
      it 'returns 400 bad request' do
        get export_ajax_transcription_path(transcription, format: 'pdf')
        expect(response).to have_http_status(:bad_request)
      end
    end

    context 'when user does not own the transcription' do
      let(:other_user) { create(:user) }
      before { sign_in other_user }

      it 'returns 403 forbidden' do
        get export_ajax_transcription_path(transcription, format: 'txt')
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when not authenticated' do
      before { sign_out :user }

      it 'returns 401 unauthorized' do
        get export_ajax_transcription_path(transcription, format: 'txt')
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'PATCH /ajax/transcriptions/:id' do
    let(:update_params) do
      {
        transcription: {
          transcription: 'New text',
          transcription_json: {
            segments: [{ id: 0, text: 'New text', start: 0.0, end: 1.0 }]
          }
        }
      }
    end

    it 'returns 200 on success' do
      patch ajax_transcription_path(transcription), params: update_params, as: :json
      expect(response).to have_http_status(:ok)
    end

    it 'updates the transcription text' do
      patch ajax_transcription_path(transcription), params: update_params, as: :json
      expect(transcription.reload.transcription).to eq('New text')
    end

    it 'returns the transcription id' do
      patch ajax_transcription_path(transcription), params: update_params, as: :json
      expect(response.parsed_body['id']).to eq(transcription.id)
    end

    context 'when user does not own the transcription' do
      let(:other_user) { create(:user) }
      before { sign_in other_user }

      it 'returns 403 forbidden' do
        patch ajax_transcription_path(transcription), params: update_params, as: :json
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'when not authenticated' do
      before { sign_out :user }

      it 'returns 401 unauthorized' do
        patch ajax_transcription_path(transcription), params: update_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
