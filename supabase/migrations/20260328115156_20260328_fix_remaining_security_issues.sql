/*
  # Fix Remaining Security Issues

  1. Add Missing Foreign Key Indexes
    - `audiobook_chapters.book_format_id` → `book_formats.id`
    - `blog_comments.blog_id` → `blogs.id`
    - `orders.book_id` → `books.id`
    - `orders.user_id` → `auth.users.id`

  2. Remove Unused Indexes
    - idx_blogs_created_by
    - idx_site_settings_updated_by
    - idx_book_of_the_day_book_id

  3. Immutable Function Search Paths
    - Make search_path immutable for: generate_order_number, set_order_number, check_max_carousel_images, update_updated_at_column

  4. Security Notes
    - Multiple permissive policies are intentional for public vs admin data access
    - Always-true RLS policies are intentional for publicly accessible data
    - Auth connection strategy and password protection are non-database settings
*/

CREATE INDEX IF NOT EXISTS idx_audiobook_chapters_book_format_id ON audiobook_chapters(book_format_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_orders_book_id ON orders(book_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

DROP INDEX IF EXISTS idx_blogs_created_by;
DROP INDEX IF EXISTS idx_site_settings_updated_by;
DROP INDEX IF EXISTS idx_book_of_the_day_book_id;

DO $$
DECLARE
  v_search_path TEXT;
BEGIN
  SELECT current_setting('search_path') INTO v_search_path;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name = 'generate_order_number'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.generate_order_number() SET search_path = pg_catalog';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name = 'set_order_number'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.set_order_number() SET search_path = pg_catalog';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name = 'check_max_carousel_images'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.check_max_carousel_images() SET search_path = pg_catalog';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_schema = 'public' AND routine_name = 'update_updated_at_column'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.update_updated_at_column() SET search_path = pg_catalog';
  END IF;
END $$;
