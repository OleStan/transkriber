class AddSummaryToTranscriptions < ActiveRecord::Migration[7.2]
  def change
    add_column :transcriptions, :summary, :jsonb
  end
end
