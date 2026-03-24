/*
  # Add "Why Choose Us" Section Fields to homepage_settings

  Adds customizable fields for the "Why Choose Us" stats block on the landing page.

  ## New Columns

  ### Section-level
  - `show_why_choose_us` (boolean, default true) — toggle to show/hide the entire section
  - `why_choose_us_title_en` / `why_choose_us_title_ta` — section heading

  ### Stat 1 (left, blue)
  - `stat1_value_en` / `stat1_value_ta` — the large displayed value (e.g. "10,000+")
  - `stat1_label_en` / `stat1_label_ta` — the smaller label below the value

  ### Stat 2 (center, green)
  - `stat2_value_en` / `stat2_value_ta`
  - `stat2_label_en` / `stat2_label_ta`

  ### Stat 3 (right, orange)
  - `stat3_value_en` / `stat3_value_ta`
  - `stat3_label_en` / `stat3_label_ta`
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='show_why_choose_us') THEN
    ALTER TABLE homepage_settings ADD COLUMN show_why_choose_us boolean DEFAULT true;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='why_choose_us_title_en') THEN
    ALTER TABLE homepage_settings ADD COLUMN why_choose_us_title_en text DEFAULT 'Why Choose Us';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='why_choose_us_title_ta') THEN
    ALTER TABLE homepage_settings ADD COLUMN why_choose_us_title_ta text DEFAULT 'ஏன் எங்களை தேர்வு செய்ய வேண்டும்';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat1_value_en') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat1_value_en text DEFAULT '10,000+';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat1_value_ta') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat1_value_ta text DEFAULT '10,000+';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat1_label_en') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat1_label_en text DEFAULT 'Books Available';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat1_label_ta') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat1_label_ta text DEFAULT 'புத்தகங்கள் கிடைக்கின்றன';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat2_value_en') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat2_value_en text DEFAULT 'Free';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat2_value_ta') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat2_value_ta text DEFAULT 'இலவசம்';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat2_label_en') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat2_label_en text DEFAULT 'Tamil E-Books & Audiobooks';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat2_label_ta') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat2_label_ta text DEFAULT 'தமிழ் மின்னூல்கள் மற்றும் ஆடியோ புத்தகங்கள்';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat3_value_en') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat3_value_en text DEFAULT '24/7';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat3_value_ta') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat3_value_ta text DEFAULT '24/7';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat3_label_en') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat3_label_en text DEFAULT 'Always Available';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='homepage_settings' AND column_name='stat3_label_ta') THEN
    ALTER TABLE homepage_settings ADD COLUMN stat3_label_ta text DEFAULT 'எப்போதும் கிடைக்கும்';
  END IF;
END $$;
