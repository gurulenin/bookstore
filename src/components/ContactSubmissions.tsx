import { useState, useEffect } from 'react';
import { Mail, Phone, Trash2, Eye, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSubmissions(data);
  };

  const markRead = async (id: string) => {
    await supabase.from('contact_submissions').update({ is_read: true }).eq('id', id);
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, is_read: true } : s));
    if (selected?.id === id) setSelected({ ...selected, is_read: true });
  };

  const handleView = async (sub: Submission) => {
    setSelected(sub);
    if (!sub.is_read) markRead(sub.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return;
    await supabase.from('contact_submissions').delete().eq('id', id);
    setSubmissions(prev => prev.filter(s => s.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const filtered = filter === 'all'
    ? submissions
    : filter === 'unread'
      ? submissions.filter(s => !s.is_read)
      : submissions.filter(s => s.is_read);

  const unreadCount = submissions.filter(s => !s.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-slate-800">Contact / Feedback</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
          className="px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No submissions found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((sub) => (
              <div
                key={sub.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition ${!sub.is_read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!sub.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                    <span className="font-semibold text-slate-800 truncate">{sub.name}</span>
                    <span className="text-slate-400 text-xs truncate">{sub.email}</span>
                  </div>
                  <p className="text-sm text-slate-600 truncate mt-0.5">{sub.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(sub.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleView(sub)}
                    className="text-blue-500 hover:text-blue-700 p-2"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">{selected.subject}</h3>
                {selected.is_read && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-medium">Name:</span> {selected.name}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="h-4 w-4 text-green-400" />
                    <a href={`tel:${selected.phone}`} className="text-green-600 hover:underline">{selected.phone}</a>
                  </div>
                )}
                <div className="text-slate-400 text-xs col-span-2">
                  Received: {new Date(selected.created_at).toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>

              <div className="flex justify-between pt-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  <Mail className="h-4 w-4" />
                  Reply via Email
                </a>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
