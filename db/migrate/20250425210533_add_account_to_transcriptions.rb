class AddAccountToTranscriptions < ActiveRecord::Migration[7.2]
  def change
    add_reference :transcriptions, :account, null: true, foreign_key: true
  end
end
