class RenameResultToAudioTranscription < ActiveRecord::Migration[7.0]
  def change
    rename_column :audio_transcriptions, :result, :transcription
  end
end
