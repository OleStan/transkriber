class UpdateActiveStorageAttachmentRecordTypes < ActiveRecord::Migration[7.0]
  def up
    ActiveStorage::Attachment.where(record_type: "AudioTranscription").update_all(record_type: "Transcription")
  end

  def down
    ActiveStorage::Attachment.where(record_type: "Transcription").update_all(record_type: "AudioTranscription")
  end
end
