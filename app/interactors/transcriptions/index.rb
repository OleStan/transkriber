# frozen_string_literal: true

class Transcriptions::IndexContext < ActiveInteractor::Context::Base 
  attributes :page

  attributes :data
end

class Transcriptions::Index < ActiveInteractor::Base

  def perform
    context.transcriptions = fetch_transcriptions
    context.data = build_data
  end

  private

  delegate :page, :transcriptions, to: :context

  def fetch_transcriptions
    Transcription.select(:id, :created_at, :status, :duration, :title).page(context.page)
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
end
