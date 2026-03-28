/*
  # Fix Foreign Key Indexes and Unused Indexes

  1. New Foreign Key Indexes
    - `blogs.created_by` → `auth.users.id`
    - `book_of_the_day.book_id` → `books.id`
    - `site_settings.updated_by` → `auth.users.id`

  2. Drop Unused Indexes
    - idx_blog_comments_blog_id
    - idx_audiobook_chapters_book_format_id
    - idx_orders_book_id
    - idx_orders_user_id

  3. Security Notes
    - Multiple permissive policies are intentional for public vs admin access patterns
    - Always-true RLS policies are intentional for publicly writable tables
    - Auth connection strategy and password protection are dashboard settings, not database
*/

CREATE INDEX IF NOT EXISTS idx_blogs_created_by ON blogs(created_by);
CREATE INDEX IF NOT EXISTS idx_book_of_the_day_book_id ON book_of_the_day(book_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON site_settings(updated_by);

DROP INDEX IF EXISTS idx_blog_comments_blog_id;
DROP INDEX IF EXISTS idx_audiobook_chapters_book_format_id;
DROP INDEX IF EXISTS idx_orders_book_id;
DROP INDEX IF EXISTS idx_orders_user_id;
