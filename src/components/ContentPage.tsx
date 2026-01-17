import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';

interface ContentPageProps {
  pageKey: string;
}

interface PageContent {
  title: string;
  content: string;
  is_published: boolean;
}

export default function ContentPage({ pageKey }: ContentPageProps) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
  }, [pageKey]);

  const loadPageContent = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('page_contents')
      .select('title, content, is_published')
      .eq('page_key', pageKey)
      .maybeSingle();

    if (data) {
      setPageContent(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pageContent || !pageContent.is_published) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Page Not Found</h1>
            <p className="text-slate-600">This page is currently unavailable.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl md:rounded-2xl shadow-lg p-6 md:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-6 md:mb-8">
            {pageContent.title}
          </h1>
          <div className="prose prose-sm sm:prose md:prose-lg max-w-none prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600 prose-strong:text-slate-800 prose-ul:text-slate-600 prose-ol:text-slate-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {pageContent.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
