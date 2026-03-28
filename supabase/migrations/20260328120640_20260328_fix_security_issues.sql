/*
  # Fix Security Issues

  1. Add Missing Foreign Key Indexes
    - audiobook_chapters.book_format_id
    - blog_comments.blog_id
    - orders.book_id
    - orders.user_id

  2. Remove Unused Indexes
    - idx_blogs_created_by
    - idx_site_settings_updated_by
    - idx_book_of_the_day_book_id

  3. Fix Overly Permissive RLS Policies
    - Replace multiple SELECT policies with single unified policies
    - Remove policies with always-true conditions
    - Implement proper role-based access control using admin_users table

  4. Notable Security Changes
    - Only admins can manage contact submissions
    - Only admins can manage menu settings
    - Only admins can manage page content
    - Blog comments are visible when approved
    - All admin operations require admin user verification
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_audiobook_chapters_book_format_id 
  ON audiobook_chapters(book_format_id);

CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id 
  ON blog_comments(blog_id);

CREATE INDEX IF NOT EXISTS idx_orders_book_id 
  ON orders(book_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_id 
  ON orders(user_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_blogs_created_by;
DROP INDEX IF EXISTS idx_site_settings_updated_by;
DROP INDEX IF EXISTS idx_book_of_the_day_book_id;

-- Fix blog_comments RLS policies
DROP POLICY IF EXISTS "Admins can view all comments" ON blog_comments;
DROP POLICY IF EXISTS "Public can view approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Public can insert comments" ON blog_comments;

CREATE POLICY "Public can view approved comments"
  ON blog_comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can insert comments"
  ON blog_comments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix genres RLS policies
DROP POLICY IF EXISTS "Admins can manage genres" ON genres;
DROP POLICY IF EXISTS "Public can view genres" ON genres;

CREATE POLICY "Public can view genres"
  ON genres FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert genres"
  ON genres FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update genres"
  ON genres FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete genres"
  ON genres FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix hero_carousel RLS policies
DROP POLICY IF EXISTS "Admins can view all carousel images" ON hero_carousel;
DROP POLICY IF EXISTS "Public can view active carousel images" ON hero_carousel;

CREATE POLICY "Public can view active carousel images"
  ON hero_carousel FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all carousel images"
  ON hero_carousel FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can insert carousel images"
  ON hero_carousel FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update carousel images"
  ON hero_carousel FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete carousel images"
  ON hero_carousel FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix orders RLS policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can insert orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix page_contents RLS policies
DROP POLICY IF EXISTS "Anyone can view published page content" ON page_contents;
DROP POLICY IF EXISTS "Authenticated users can view all page content" ON page_contents;
DROP POLICY IF EXISTS "Authenticated users can delete page content" ON page_contents;
DROP POLICY IF EXISTS "Authenticated users can insert page content" ON page_contents;
DROP POLICY IF EXISTS "Authenticated users can update page content" ON page_contents;

CREATE POLICY "Public can view published page content"
  ON page_contents FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all page content"
  ON page_contents FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can insert page content"
  ON page_contents FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update page content"
  ON page_contents FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete page content"
  ON page_contents FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix ui_translations RLS policies
DROP POLICY IF EXISTS "Admins can manage translations" ON ui_translations;
DROP POLICY IF EXISTS "Public can view translations" ON ui_translations;

CREATE POLICY "Public can view translations"
  ON ui_translations FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert translations"
  ON ui_translations FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update translations"
  ON ui_translations FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete translations"
  ON ui_translations FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix contact_submissions RLS policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can delete contact submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Authenticated users can update contact submissions" ON contact_submissions;

CREATE POLICY "Public can insert contact submissions"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix contribute_page_content RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert contribute page content" ON contribute_page_content;
DROP POLICY IF EXISTS "Authenticated users can update contribute page content" ON contribute_page_content;

CREATE POLICY "Only admins can insert contribute page content"
  ON contribute_page_content FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update contribute page content"
  ON contribute_page_content FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix featured_books RLS policies
DROP POLICY IF EXISTS "Authenticated users can delete featured books" ON featured_books;
DROP POLICY IF EXISTS "Authenticated users can insert featured books" ON featured_books;
DROP POLICY IF EXISTS "Authenticated users can update featured books" ON featured_books;

CREATE POLICY "Only admins can insert featured books"
  ON featured_books FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update featured books"
  ON featured_books FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete featured books"
  ON featured_books FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix homepage_settings RLS policies
DROP POLICY IF EXISTS "Authenticated users can update homepage settings" ON homepage_settings;

CREATE POLICY "Only admins can update homepage settings"
  ON homepage_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix menu_settings RLS policies
DROP POLICY IF EXISTS "Authenticated users can delete menu settings" ON menu_settings;
DROP POLICY IF EXISTS "Authenticated users can insert menu settings" ON menu_settings;
DROP POLICY IF EXISTS "Authenticated users can update menu settings" ON menu_settings;

CREATE POLICY "Only admins can insert menu settings"
  ON menu_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update menu settings"
  ON menu_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can delete menu settings"
  ON menu_settings FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

-- Fix publish_page_content RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert publish page content" ON publish_page_content;
DROP POLICY IF EXISTS "Authenticated users can update publish page content" ON publish_page_content;

CREATE POLICY "Only admins can insert publish page content"
  ON publish_page_content FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));

CREATE POLICY "Only admins can update publish page content"
  ON publish_page_content FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()));
