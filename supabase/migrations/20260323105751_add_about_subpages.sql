/*
  # Add About Sub-pages

  ## Summary
  Adds four sub-pages under the "About" section to the page_contents table:
  - `about_us` - About Us (We) - who we are
  - `kaniyam` - Kaniyam Foundation (kaniyam.com)
  - `freetamilebooks` - FreeTamilEbooks.com
  - `nutpagam` - Nutpagam

  These pages are editable via the existing PageContentManagement admin panel.
*/

INSERT INTO page_contents (page_key, title, content, is_published)
VALUES
  ('about_us', 'About Us', 'We are a platform dedicated to promoting Tamil literature and culture through digital publishing.', true),
  ('kaniyam', 'Kaniyam Foundation', 'Kaniyam Foundation (kaniyam.com) is our partner organization focused on free and open knowledge in Tamil.', true),
  ('freetamilebooks', 'FreeTamilEbooks.com', 'FreeTamilEbooks.com is a partner initiative providing free Tamil e-books to readers worldwide.', true),
  ('nutpagam', 'Nutpagam', 'Nutpagam is a partner organization working with us to expand Tamil digital content.', true)
ON CONFLICT (page_key) DO NOTHING;
