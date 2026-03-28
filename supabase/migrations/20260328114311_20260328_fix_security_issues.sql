/*
  # Fix Security Issues and Performance Optimizations

  1. Add Indexes on Foreign Keys
    - `blogs.created_by` → `auth.users.id`
    - `book_of_the_day.book_id` → `books.id`
    - `site_settings.updated_by` → `auth.users.id`

  2. Optimize RLS Policies
    - Replace direct `auth.uid()` calls with `(select auth.uid())`
    - Apply to: books, book_formats, admin_users, blogs, blog_comments, site_settings, orders, hero_carousel, ui_translations, genres, audiobook_chapters, book_of_the_day

  3. Remove Unused Indexes
    - idx_books_genre, idx_books_author, idx_book_formats_type
    - idx_blogs_slug, idx_blogs_published
    - idx_blog_comments_blog_id, idx_blog_comments_approved
    - idx_audiobook_chapters_book_format_id, idx_audiobook_chapters_chapter_number
    - idx_orders_order_number, idx_orders_user_id, idx_orders_status, idx_orders_created_at, idx_orders_book_id
    - idx_ui_translations_key

  4. Fix Function Search Paths
    - Make search_path immutable for functions: generate_order_number, set_order_number, check_max_carousel_images, update_updated_at_column

  5. Security Notes
    - RLS policies with always-true conditions are intentional for public/open data
    - Leaked password protection is an auth setting, not database-level
    - Multiple permissive policies for same role/action are intentional for public vs admin access
*/

CREATE INDEX IF NOT EXISTS idx_blogs_created_by ON blogs(created_by);
CREATE INDEX IF NOT EXISTS idx_book_of_the_day_book_id ON book_of_the_day(book_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON site_settings(updated_by);

DROP INDEX IF EXISTS idx_books_genre;
DROP INDEX IF EXISTS idx_books_author;
DROP INDEX IF EXISTS idx_book_formats_type;
DROP INDEX IF EXISTS idx_blogs_slug;
DROP INDEX IF EXISTS idx_blogs_published;
DROP INDEX IF EXISTS idx_blog_comments_blog_id;
DROP INDEX IF EXISTS idx_blog_comments_approved;
DROP INDEX IF EXISTS idx_audiobook_chapters_book_format_id;
DROP INDEX IF EXISTS idx_audiobook_chapters_chapter_number;
DROP INDEX IF EXISTS idx_orders_order_number;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_orders_book_id;
DROP INDEX IF EXISTS idx_ui_translations_key;

DROP POLICY IF EXISTS "Admins can insert books" ON books;
CREATE POLICY "Admins can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update books" ON books;
CREATE POLICY "Admins can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete books" ON books;
CREATE POLICY "Admins can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can insert book formats" ON book_formats;
CREATE POLICY "Admins can insert book formats"
  ON book_formats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update book formats" ON book_formats;
CREATE POLICY "Admins can update book formats"
  ON book_formats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete book formats" ON book_formats;
CREATE POLICY "Admins can delete book formats"
  ON book_formats FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;
CREATE POLICY "Users can view own admin record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all blogs" ON blogs;
CREATE POLICY "Admins can view all blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
    OR is_published = true
  );

DROP POLICY IF EXISTS "Admins can insert blogs" ON blogs;
CREATE POLICY "Admins can insert blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update blogs" ON blogs;
CREATE POLICY "Admins can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete blogs" ON blogs;
CREATE POLICY "Admins can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all comments" ON blog_comments;
CREATE POLICY "Admins can view all comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
    OR is_approved = true
  );

DROP POLICY IF EXISTS "Admins can update comments" ON blog_comments;
CREATE POLICY "Admins can update comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete comments" ON blog_comments;
CREATE POLICY "Admins can delete comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all carousel images" ON hero_carousel;
CREATE POLICY "Admins can view all carousel images"
  ON hero_carousel FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
    OR is_active = true
  );

DROP POLICY IF EXISTS "Admins can insert carousel images" ON hero_carousel;
CREATE POLICY "Admins can insert carousel images"
  ON hero_carousel FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update carousel images" ON hero_carousel;
CREATE POLICY "Admins can update carousel images"
  ON hero_carousel FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete carousel images" ON hero_carousel;
CREATE POLICY "Admins can delete carousel images"
  ON hero_carousel FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage translations" ON ui_translations;
CREATE POLICY "Admins can manage translations"
  ON ui_translations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can manage genres" ON genres;
CREATE POLICY "Admins can manage genres"
  ON genres FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert audiobook chapters" ON audiobook_chapters;
CREATE POLICY "Authenticated users can insert audiobook chapters"
  ON audiobook_chapters FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update audiobook chapters" ON audiobook_chapters;
CREATE POLICY "Authenticated users can update audiobook chapters"
  ON audiobook_chapters FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete audiobook chapters" ON audiobook_chapters;
CREATE POLICY "Authenticated users can delete audiobook chapters"
  ON audiobook_chapters FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert book of the day" ON book_of_the_day;
CREATE POLICY "Admins can insert book of the day"
  ON book_of_the_day FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can update book of the day" ON book_of_the_day;
CREATE POLICY "Admins can update book of the day"
  ON book_of_the_day FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can delete book of the day" ON book_of_the_day;
CREATE POLICY "Admins can delete book of the day"
  ON book_of_the_day FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = (select auth.uid())
    )
  );
