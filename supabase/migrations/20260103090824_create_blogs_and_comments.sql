/*
  # Create Blogs and Comments Tables

  ## New Tables
  
  ### `blogs`
  - `id` (uuid, primary key) - Unique blog identifier
  - `title` (text) - Blog post title
  - `slug` (text, unique) - URL-friendly version of title
  - `content` (text) - Full blog post content
  - `excerpt` (text, nullable) - Short summary for listings
  - `cover_image_url` (text, nullable) - Featured image URL
  - `author_name` (text) - Name of the blog author
  - `is_published` (boolean, default false) - Publication status
  - `published_at` (timestamptz, nullable) - When the blog was published
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `created_by` (uuid) - Admin user who created the blog
  
  ### `blog_comments`
  - `id` (uuid, primary key) - Unique comment identifier
  - `blog_id` (uuid) - Foreign key to blogs table
  - `user_name` (text) - Name of commenter
  - `user_email` (text) - Email of commenter
  - `comment` (text) - Comment content
  - `is_approved` (boolean, default false) - Admin approval status
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  
  ### Blogs Table
  - Enable RLS
  - Public can read published blogs
  - Authenticated admins can create, update, delete blogs
  
  ### Blog Comments Table
  - Enable RLS
  - Public can read approved comments
  - Public can insert comments (requires approval)
  - Authenticated admins can update/delete comments
*/

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  cover_image_url text,
  author_name text NOT NULL DEFAULT 'Admin',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_email text NOT NULL,
  comment text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON blog_comments(is_approved);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Blogs policies
CREATE POLICY "Public can view published blogs"
  ON blogs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can view all blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

-- Blog comments policies
CREATE POLICY "Public can view approved comments"
  ON blog_comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Public can insert comments"
  ON blog_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );