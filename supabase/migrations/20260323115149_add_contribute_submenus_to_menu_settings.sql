/*
  # Add Contribute Sub-menu Entries to Menu Settings

  ## Summary
  Inserts four sub-menu entries under the "contribute" parent menu:
    - contribute_ebooks  (Making E-Books)
    - contribute_covers  (Making Book Covers)
    - contribute_audiobooks (Making Audio Books)
    - donate (Donate)

  These entries use parent_key = 'contribute' to link them to the Contribute top-level menu.
  All are enabled by default.
*/

INSERT INTO menu_settings (menu_key, menu_label, menu_label_tamil, is_enabled, order_index, parent_key)
VALUES
  ('contribute_ebooks',      'Making E-Books',       'மின்-புத்தகங்கள் உருவாக்குதல்',          true, 1, 'contribute'),
  ('contribute_covers',      'Making Book Covers',   'புத்தக அட்டைகள் உருவாக்குதல்',            true, 2, 'contribute'),
  ('contribute_audiobooks',  'Making Audio Books',   'ஆடியோ புத்தகங்கள் உருவாக்குதல்',         true, 3, 'contribute'),
  ('donate',                 'Donate',               'நன்கொடை',                                 true, 4, 'contribute')
ON CONFLICT (menu_key) DO NOTHING;
