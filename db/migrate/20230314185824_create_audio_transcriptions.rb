class CreateAudioTranscriptions < ActiveRecord::Migration[7.0]
  def change
    create_table :audio_transcriptions do |t|
      t.text :result

      t.timestamps
    end
  end
end
