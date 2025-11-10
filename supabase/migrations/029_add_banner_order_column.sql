-- Migration: Add 'ordem' column to 'banners' table
-- Purpose: Support explicit ordering of banners in UI
-- Safe defaults: default 0 for existing rows
-- Index: add simple btree index for ordering queries

BEGIN;

-- 1) Add column if not exists
ALTER TABLE IF EXISTS public.banners
  ADD COLUMN IF NOT EXISTS ordem integer NOT NULL DEFAULT 0;

-- 2) Ensure default applies to existing rows
UPDATE public.banners SET ordem = COALESCE(ordem, 0);

--