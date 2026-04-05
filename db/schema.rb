# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_03_22_125404) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "accounts", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "stripe_customer_id"
    t.index ["stripe_customer_id"], name: "index_accounts_on_stripe_customer_id", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "plans", force: :cascade do |t|
    t.string "name", null: false
    t.string "stripe_product_id"
    t.string "stripe_price_id_monthly"
    t.string "stripe_price_id_yearly"
    t.integer "price_monthly_cents", default: 0, null: false
    t.integer "price_yearly_cents", default: 0, null: false
    t.integer "transcription_minutes_limit", default: 0, null: false
    t.integer "max_file_size_mb", default: 25, null: false
    t.boolean "video_allowed", default: false, null: false
    t.integer "max_concurrent_jobs", default: 1, null: false
    t.jsonb "features", default: {}
    t.integer "position", default: 0, null: false
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active"], name: "index_plans_on_active"
    t.index ["position"], name: "index_plans_on_position"
  end

  create_table "subscriptions", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "plan_id", null: false
    t.string "stripe_subscription_id"
    t.string "stripe_status", default: "active", null: false
    t.datetime "current_period_start"
    t.datetime "current_period_end"
    t.boolean "cancel_at_period_end", default: false, null: false
    t.datetime "canceled_at"
    t.string "billing_interval", default: "month", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_subscriptions_on_account_id"
    t.index ["plan_id"], name: "index_subscriptions_on_plan_id"
    t.index ["stripe_status"], name: "index_subscriptions_on_stripe_status"
    t.index ["stripe_subscription_id"], name: "index_subscriptions_on_stripe_subscription_id", unique: true
  end

  create_table "transcriptions", force: :cascade do |t|
    t.text "transcription"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "transcription_json"
    t.string "title"
    t.string "status", default: "pending"
    t.integer "duration"
    t.bigint "account_id"
    t.bigint "user_id"
    t.integer "progress", default: 0
    t.text "error_message"
    t.jsonb "summary"
    t.index ["account_id"], name: "index_transcriptions_on_account_id"
    t.index ["user_id"], name: "index_transcriptions_on_user_id"
  end

  create_table "usage_records", force: :cascade do |t|
    t.bigint "account_id", null: false
    t.bigint "transcription_id"
    t.decimal "minutes_used", precision: 10, scale: 2, null: false
    t.datetime "recorded_at", null: false
    t.date "period_start", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id", "period_start"], name: "index_usage_records_on_account_id_and_period_start"
    t.index ["account_id"], name: "index_usage_records_on_account_id"
    t.index ["transcription_id"], name: "index_usage_records_on_transcription_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.bigint "account_id"
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "admin", default: false, null: false
    t.string "provider"
    t.string "uid"
    t.string "avatar"
    t.index ["account_id"], name: "index_users_on_account_id"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "subscriptions", "accounts"
  add_foreign_key "subscriptions", "plans"
  add_foreign_key "transcriptions", "accounts"
  add_foreign_key "transcriptions", "users"
  add_foreign_key "usage_records", "accounts"
  add_foreign_key "usage_records", "transcriptions"
end
