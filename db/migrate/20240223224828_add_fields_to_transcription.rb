class AddFieldsToTranscription < ActiveRecord::Migration[7.0]
  def change
    add_column :transcriptions, :title, :string
    add_column :transcriptions, :status, :string, default: 'pending'
    add_column :transcriptions, :duration, :integer
  end
end
