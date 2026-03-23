/*
  # Add PrinThink.in Under About Sub-menu

  Inserts a new sub-menu entry for PrinThink.in (print partner) under the "about" parent menu.
  Uses parent_key = 'about' and is enabled by default.
*/

INSERT INTO menu_settings (menu_key, menu_label, menu_label_tamil, is_enabled, order_index, parent_key)
VALUES
  ('printhink', 'PrinThink.in', 'பிரின்தின்க்.இன்', true, 5, 'about')
ON CONFLICT (menu_key) DO NOTHING;
