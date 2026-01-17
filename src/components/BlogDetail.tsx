import { useState, useEffect } from 'react';
import { Calendar, User, X, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Blog {
  id: string;
  title: string;
  content: string;
  cover_image_url: string;
  author_name: string;
  published_at: string;
}

interface Comment {
  id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

interface BlogDetailProps {
  blogId: string;
  onBack: () => void;
}

export default function BlogDetail({ blogId, onBack }: BlogDetailProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    user_name: '',
    user_email: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBlog();
    loadComments();
  }, [blogId]);

  const loadBlog = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .eq('is_published', true)
      .single();

    if (data) setBlog(data);
    setLoading(false);
  };

  const loadComments = async () => {
    const { data } = await supabase
      .from('blog_comments')
      .select('id, user_name, comment, created_at')
      .eq('blog_id', blogId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (data) setComments(data);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await supabase.from('blog_comments').insert([{
      blog_id: blogId,
      user_name: commentForm.user_name,
      user_email: commentForm.user_email,
      comment: commentForm.comment,
      is_approved: false
    }]);

    setCommentForm({ user_name: '', user_email: '', comment: '' });
    setSubmitting(false);
    alert('Comment submitted! It will appear after admin approval.');
  };

  if (loading || !blog) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Blogs</span>
        </button>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {blog.cover_image_url && (
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-96 object-cover"
            />
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">{blog.title}</h1>

            <div className="flex items-center space-x-6 text-slate-600 mb-8 pb-6 border-b">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{blog.author_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(blog.published_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Comments ({comments.length})</h2>

          <div className="space-y-6 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-6 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">{comment.user_name}</span>
                  <span className="text-sm text-slate-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-700">{comment.comment}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Leave a Comment</h3>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={commentForm.user_name}
                    onChange={(e) => setCommentForm({ ...commentForm, user_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={commentForm.user_email}
                    onChange={(e) => setCommentForm({ ...commentForm, user_email: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Comment *</label>
                <textarea
                  value={commentForm.comment}
                  onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-700 transition disabled:bg-slate-400"
              >
                {submitting ? 'Submitting...' : 'Submit Comment'}
              </button>
              <p className="text-sm text-slate-500">
                Your comment will be visible after admin approval.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
