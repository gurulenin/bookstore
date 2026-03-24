/*
  # Add why_choose_us_stats JSONB column

  ## Summary
  Replaces the three hardcoded stat columns (stat1_*, stat2_*, stat3_*) with a single
  JSONB array column `why_choose_us_stats` to allow admins to add, remove, and reorder
  any number of bullet points without future schema changes.

  ## Changes
  - Add `why_choose_us_stats` column (jsonb) to `homepage_settings`
  - Migrate existing stat1/stat2/stat3 data into the new column
  - Preserves all bilingual (EN/TA) values

  ## Notes
  - Old stat1/stat2/stat3 columns are kept for backward compatibility but are no longer
    the source of truth; the app will use `why_choose_us_stats` going forward.
  - Default colors: blue, green, orange (cycle if more are added)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'homepage_settings' AND column_name = 'why_choose_us_stats'
  ) THEN
    ALTER TABLE homepage_settings ADD COLUMN why_choose_us_stats jsonb;
  END IF;
END $$;

UPDATE homepage_settings
SET why_choose_us_stats = jsonb_build_array(
  jsonb_build_object(
    'value_en', COALESCE(stat1_value_en, '10,000+'),
    'value_ta', COALESCE(stat1_value_ta, '10,000+'),
    'label_en', COALESCE(stat1_label_en, 'Books Available'),
    'label_ta', COALESCE(stat1_label_ta, 'புத்தகங்கள் கிடைக்கின்றன'),
    'color', 'blue'
  ),
  jsonb_build_object(
    'value_en', COALESCE(stat2_value_en, 'Free'),
    'value_ta', COALESCE(stat2_value_ta, 'இலவசம்'),
    'label_en', COALESCE(stat2_label_en, 'Tamil E-Books & Audiobooks'),
    'label_ta', COALESCE(stat2_label_ta, 'தமிழ் மின்னூல்கள் மற்றும் ஆடியோ புத்தகங்கள்'),
    'color', 'green'
  ),
  jsonb_build_object(
    'value_en', COALESCE(stat3_value_en, '24/7'),
    'value_ta', COALESCE(stat3_value_ta, '24/7'),
    'label_en', COALESCE(stat3_label_en, 'Always Available'),
    'label_ta', COALESCE(stat3_label_ta, 'எப்போதும் கிடைக்கும்'),
    'color', 'orange'
  )
)
WHERE why_choose_us_stats IS NULL;
