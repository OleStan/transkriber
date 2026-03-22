# frozen_string_literal: true

class Ajax::TranscriptionsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_transcription, only: %i[show destroy export update]
  before_action :verify_transcription_ownership, only: %i[show destroy export update]

  def index
    result = Transcriptions::Index.perform(
      page: params[:page],
      user: current_user,
      account: current_user&.account,
      status: params[:status],
      search: params[:q],
      start_date: params[:start_date],
      end_date: params[:end_date],
      file_type: params[:type]
    )

    if result.success?
      render json: result.data
    else
      render json: { errors: result.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    render json: @transcription, serializer: Ajax::Transcriptions::ShowSerializer
  end

  def create
    # For URL uploads, defer media download to background job
    result = Transcriptions::Create.perform(
      audio: transcriptions_params[:audio],
      url: transcriptions_params[:url],
      language: transcriptions_params[:language],
      user: current_user,
      account: current_user&.account
    )

    if result.success?
      render json: { transcription_id: result.audio_transcription.id }, status: :created
    else
      render json: { errors: result.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def export
    format = params[:format].to_s.downcase
    unless %w[txt srt vtt].include?(format)
      return render json: { error: 'Invalid format. Use txt, srt, or vtt.' }, status: :bad_request
    end

    content = Transcriptions::Exporter.call(@transcription, format)
    filename = "#{(@transcription.title || 'transcription').parameterize}.#{format}"
    mime_type = format == 'vtt' ? 'text/vtt; charset=utf-8' : 'text/plain; charset=utf-8'
    send_data content, filename: filename, type: mime_type, disposition: 'attachment'
  end

  def update
    result = Transcriptions::Update.perform(
      id: @transcription.id,
      user: current_user,
      transcription_text: transcription_update_params[:transcription],
      transcription_json: transcription_update_params[:transcription_json]
    )

    if result.success?
      render json: { id: result.transcription.id }, status: :ok
    else
      render json: { errors: result.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    result = Transcriptions::Delete.perform(
      id: @transcription.id, 
      page: params[:page],
      user: current_user,
      account: current_user&.account
    )

    if result.success?
      render json: result.data
    else
      render json: { errors: result.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_transcription
    # Find the transcription, allowing lookup even if account_id is nil (for legacy records)
    @transcription = Transcription.find(params[:id])
  end

  def verify_transcription_ownership
    # Use the owned_by? helper method from the Transcription model
    unless @transcription.owned_by?(current_user)
      render json: { errors: ['Not authorized to access this transcription'] }, status: :forbidden
    end
  end

  def transcriptions_params
    params
      .require(:audio_transcription)
      .permit(:audio, :url, :language)
  end

  def transcription_update_params
    text = params.require(:transcription).permit(:transcription)[:transcription]
    json = params.dig(:transcription, :transcription_json)
    { transcription: text, transcription_json: json.present? ? json.as_json : nil }
  end
end
