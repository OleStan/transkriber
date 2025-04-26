# frozen_string_literal: true

class TranscriptionChannel < ApplicationCable::Channel
  def subscribed
    # Prevent streaming for finalized transcriptions
    transcription = Transcription.find(params[:room])
    if transcription.completed? || transcription.failed?
      reject
    else
      stream_from "transcription_channel_#{params[:room]}"
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
