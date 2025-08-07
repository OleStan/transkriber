class AddProgressAndErrorMessageToTranscriptions < ActiveRecord::Migration[7.2]
  def change
    add_column :transcriptions, :progress, :integer, default: 0
    add_column :transcriptions, :error_message, :text
  end
end
