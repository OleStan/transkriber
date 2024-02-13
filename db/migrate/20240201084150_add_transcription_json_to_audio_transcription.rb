class AddTranscriptionJsonToAudioTranscription < ActiveRecord::Migration[7.0]
  def change
    add_column :audio_transcriptions, :transcription_json, :jsonb
  end
end
