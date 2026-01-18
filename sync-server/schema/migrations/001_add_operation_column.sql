-- Migration: Add operation column to sync_items table
-- This column is required for signature verification on pull
-- Run: wrangler d1 execute memry-sync --file=./schema/migrations/001_add_operation_column.sql --local

-- Add the operation column with default value 'create'
-- Existing items will get 'create' as the operation
ALTER TABLE sync_items ADD COLUMN operation TEXT NOT NULL DEFAULT 'create';
