# frozen_string_literal: true

module Transcriptions
  module Filterable
    extend ActiveSupport::Concern

    class_methods do
      # Apply a set of supported filters to Transcription records.
      def filter_by(options = {})
        scope = all

        user       = options[:user]
        account    = options[:account]
        status     = options[:status]
        search     = options[:search]
        start_date = options[:start_date]
        end_date   = options[:end_date]
        file_type  = options[:file_type]
        order_by   = options[:order_by]

        # Ownership / access
        scope = scope.accessible_by(user) if user.present?
        scope = scope.for_account(account) if account.present? && user.blank?

        # Attribute filters
        scope = scope.with_status(status) if status.present?
        scope = scope.search_by_title(search) if search.present?

        # Date range
        scope = scope.created_after(start_date) if start_date.present?
        scope = scope.created_before(end_date) if end_date.present?

        # File type
        scope = scope.with_file_type(file_type) if file_type.present?

        # Ordering (default newest first)
        scope.order(normalize_order(order_by))
      end

      private

      # Normalize and whitelist ordering. Accepts Hash/Array, or a String like "created_at desc".
      def normalize_order(order_by)
        return { created_at: :desc } if order_by.blank?

        return order_by if order_by.is_a?(Hash) || order_by.is_a?(Array)

        column, direction = order_by.to_s.split
        column = column&.to_sym
        direction = direction&.downcase == 'asc' ? :asc : :desc

        allowed_columns = %i[created_at updated_at title status]
        return { created_at: :desc } unless allowed_columns.include?(column)

        { column => direction }
      end
    end
  end
end
