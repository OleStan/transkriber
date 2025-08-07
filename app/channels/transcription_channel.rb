# frozen_string_literal: true

class TranscriptionChannel < ApplicationCable::Channel
  def subscribed
    # Prevent streaming for finalized or non-existent transcriptions
    transcription = Transcription.find_by(id: params[:room])
    
    if transcription.nil?
      reject and return
    end
    
    # Allow completed and failed transcriptions to be viewed but prevent duplicates
    if transcription.completed? || transcription.failed?
      # Just send current status once and reject subscription
      transmit({ 
        status: transcription.status, 
        progress: transcription.progress || 100,
        error: transcription.error_message,
        id: transcription.id
      })
      reject
    else
      # For active transcriptions, allow streaming
      stream_from "transcription_channel_#{params[:room]}"
      
      # Immediately send current status
      transmit({ 
        status: transcription.status, 
        progress: transcription.progress || 0,
        id: transcription.id
      })
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    stop_all_streams
  end
  
  # Handle cancellation requests from the client
  def cancel
    transcription = Transcription.find_by(id: params[:room])
    return unless transcription && transcription.in_progress?
    
    # Set status to cancelled
    transcription.update(status: :cancelled)
    
    # Broadcast cancellation to all listeners
    ActionCable.server.broadcast(
      "transcription_channel_#{transcription.id}",
      { 
        status: :cancelled,
        progress: transcription.progress,
        id: transcription.id,
        message: "Transcription cancelled by user"
      }
    )
    
    # Find and terminate related background job if possible
    scheduled_jobs = Sidekiq::ScheduledSet.new
    jobs = scheduled_jobs.select do |job|
      args = job.args[0]["arguments"]
      args.first.to_s == transcription.id.to_s
    end
    
    jobs.each(&:delete) if jobs.any?
    
    # Same for retry set
    retry_jobs = Sidekiq::RetrySet.new
    jobs = retry_jobs.select do |job|
      args = job.args[0]["arguments"]
      args.first.to_s == transcription.id.to_s
    end
    
    jobs.each(&:delete) if jobs.any?
  end
end
