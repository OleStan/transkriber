# frozen_string_literal: true

class Transcriptions::IndexContext < ActiveInteractor::Context::Base
  attributes :page, :user, :account, :status, :search, :start_date, :end_date

  attributes :data, :transcriptions
end

class Transcriptions::Index < ActiveInteractor::Base
  def perform
    context.transcriptions = fetch_transcriptions
    context.data = build_data
  end

  private

  delegate :page, :transcriptions, :user, :account, to: :context

  def fetch_transcriptions
    # Use the filter_by class method to apply all filters at once
    # This delegates the filtering logic to the model, following SRP
    Transcription
      .select(:id, :created_at, :status, :duration, :title)
      .filter_by(
        user: user,
        account: account,
        status: context.status,
        search: context.search,
        start_date: parse_date(context.start_date),
        end_date: parse_date(context.end_date)
      )
      .page(page)
  end

  def serilize_transcriptions
    ActiveModel::SerializableResource.new(
      transcriptions,
      each_serializer: Ajax::Transcriptions::IndexSerializer
    )
  end

  def build_data
    {
      transcriptions: serilize_transcriptions,
      page: context.page,
      total_pages: transcriptions.total_pages,
      total_count: transcriptions.total_count
    }
  end
  
  # Helper method to safely parse date strings
  def parse_date(date_string)
    return nil unless date_string.present?
    
    # Try to parse the date string using different formats
    begin
      # First try ISO format (YYYY-MM-DD)
      Date.parse(date_string)
    rescue ArgumentError
      begin
        # Then try more flexible parsing
        Time.zone.parse(date_string)&.to_date
      rescue
        # Return nil if parsing fails
        nil
      end
    end
  end
end
