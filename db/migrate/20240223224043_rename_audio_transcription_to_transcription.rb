class RenameAudioTranscriptionToTranscription < ActiveRecord::Migration[7.0]
  def change
    rename_table :audio_transcriptions, :transcriptions
  end
end
