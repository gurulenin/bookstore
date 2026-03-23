import { useState, useRef } from 'react';
import { Upload, Download, X, AlertCircle, CheckCircle, Loader, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CsvImportProps {
  onClose: () => void;
  onImportComplete: () => void;
}

interface ParsedBook {
  title: string;
  author: string;
  description: string;
  isbn: string;
  sku: string;
  genre: string;
  cover_image_url: string;
  publisher: string;
  published_date: string;
  format_type: string;
  price: string;
  file_url: string;
  file_format: string;
  stock_quantity: string;
  is_available: string;
  license_info: string;
}

interface ImportResult {
  row: number;
  title: string;
  status: 'success' | 'error';
  message: string;
}

const SAMPLE_CSV = `title,author,description,isbn,sku,genre,cover_image_url,publisher,published_date,format_type,price,file_url,file_format,stock_quantity,is_available,license_info
The Great Novel,Jane Doe,"A compelling story about life and adventure.",978-1234567890,SKU-001,Fiction,https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg,Sample Press,2024-01-15,physical,299,,,50,true,
The Great Novel,Jane Doe,"A compelling story about life and adventure.",978-1234567890,SKU-001,Fiction,https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg,Sample Press,2024-01-15,ebook,99,https://example.com/book.pdf,pdf,,true,CC-BY-SA
Science Explained,John Smith,"An introduction to modern science concepts.",978-0987654321,SKU-002,Science,https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg,Knowledge Publishers,2023-06-20,physical,349,,,30,true,
Science Explained,John Smith,"An introduction to modern science concepts.",978-0987654321,SKU-002,Science,https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg,Knowledge Publishers,2023-06-20,audiobook,149,https://example.com/audio.mp3,mp3,,true,Public Domain`;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string): ParsedBook[] {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
  const books: ParsedBook[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    books.push(row as unknown as ParsedBook);
  }

  return books;
}

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_books.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function BookCsvImport({ onClose, onImportComplete }: CsvImportProps) {
  const [parsedBooks, setParsedBooks] = useState<ParsedBook[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'results'>('upload');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      return;
    }

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const books = parseCsv(text);
        if (books.length === 0) {
          setError('No valid rows found in CSV. Make sure the file has headers and data rows.');
          return;
        }
        setParsedBooks(books);
        setStep('preview');
      } catch {
        setError('Failed to parse CSV. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    setResults([]);
    const importResults: ImportResult[] = [];

    const bookGroups: Record<string, ParsedBook[]> = {};
    parsedBooks.forEach(row => {
      const key = row.isbn || row.sku || row.title;
      if (!bookGroups[key]) bookGroups[key] = [];
      bookGroups[key].push(row);
    });

    let rowIndex = 1;
    for (const [, rows] of Object.entries(bookGroups)) {
      const first = rows[0];
      try {
        if (!first.title || !first.author) {
          importResults.push({ row: rowIndex, title: first.title || '(no title)', status: 'error', message: 'title and author are required' });
          rowIndex += rows.length;
          continue;
        }

        const { data: existingBooks } = await supabase
          .from('books')
          .select('id')
          .eq('title', first.title)
          .eq('author', first.author)
          .maybeSingle();

        let bookId: string;

        if (existingBooks?.id) {
          bookId = existingBooks.id;
          await supabase.from('books').update({
            description: first.description || '',
            isbn: first.isbn || null,
            sku: first.sku || `SKU-${Date.now()}`,
            genre: first.genre || null,
            cover_image_url: first.cover_image_url || '',
            publisher: first.publisher || '',
            published_date: first.published_date || null,
            updated_at: new Date().toISOString()
          }).eq('id', bookId);
        } else {
          const { data: newBook, error: bookError } = await supabase
            .from('books')
            .insert({
              title: first.title,
              author: first.author,
              description: first.description || '',
              isbn: first.isbn || null,
              sku: first.sku || `SKU-${Date.now()}`,
              genre: first.genre || null,
              cover_image_url: first.cover_image_url || '',
              publisher: first.publisher || '',
              published_date: first.published_date || null,
            })
            .select('id')
            .single();

          if (bookError || !newBook) {
            importResults.push({ row: rowIndex, title: first.title, status: 'error', message: bookError?.message || 'Failed to insert book' });
            rowIndex += rows.length;
            continue;
          }
          bookId = newBook.id;
        }

        for (const row of rows) {
          if (!row.format_type || !['physical', 'ebook', 'audiobook'].includes(row.format_type)) {
            importResults.push({ row: rowIndex, title: row.title, status: 'error', message: `Invalid format_type "${row.format_type}". Must be physical, ebook, or audiobook` });
            rowIndex++;
            continue;
          }

          const { data: existingFormat } = await supabase
            .from('book_formats')
            .select('id')
            .eq('book_id', bookId)
            .eq('format_type', row.format_type)
            .maybeSingle();

          const formatData = {
            book_id: bookId,
            format_type: row.format_type as 'physical' | 'ebook' | 'audiobook',
            price: parseFloat(row.price) || 0,
            file_url: row.file_url || null,
            file_format: row.file_format || null,
            stock_quantity: parseInt(row.stock_quantity) || 0,
            is_available: row.is_available?.toLowerCase() !== 'false',
            license_info: row.license_info || null,
          };

          if (existingFormat?.id) {
            await supabase.from('book_formats').update(formatData).eq('id', existingFormat.id);
          } else {
            await supabase.from('book_formats').insert(formatData);
          }

          importResults.push({ row: rowIndex, title: row.title, status: 'success', message: `${row.format_type} format imported` });
          rowIndex++;
        }
      } catch (err: any) {
        importResults.push({ row: rowIndex, title: first.title, status: 'error', message: err.message || 'Unknown error' });
        rowIndex += rows.length;
      }
    }

    setResults(importResults);
    setImporting(false);
    setStep('results');

    const hasSuccess = importResults.some(r => r.status === 'success');
    if (hasSuccess) onImportComplete();
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Bulk Import Books via CSV</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 'upload' && (
            <div className="space-y-5">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <p className="font-semibold text-slate-700 dark:text-slate-300">CSV Format Requirements</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>title</strong>, <strong>author</strong> — required for every row</li>
                  <li><strong>format_type</strong> — must be <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">physical</code>, <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">ebook</code>, or <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">audiobook</code></li>
                  <li>One row per format — books with multiple formats need multiple rows with the same title/author/ISBN</li>
                  <li>Existing books (matched by title+author) will be updated, not duplicated</li>
                </ul>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">sample_books.csv</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">— preview &amp; download</span>
                  </div>
                  <button
                    onClick={downloadSampleCsv}
                    className="flex items-center space-x-1.5 bg-slate-800 dark:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-500 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>
                <div className="overflow-x-auto max-h-40 bg-slate-950 dark:bg-slate-950">
                  <pre className="text-xs text-green-400 p-4 whitespace-pre leading-relaxed font-mono">{SAMPLE_CSV}</pre>
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-10 space-y-3 hover:border-slate-500 dark:hover:border-slate-400 transition"
              >
                <Upload className="h-10 w-10 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Click to upload your CSV file</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm">.csv files only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  Found <span className="text-slate-900 dark:text-slate-100 font-bold">{parsedBooks.length}</span> rows in <span className="font-mono text-sm">{fileName}</span>
                </p>
                <button
                  onClick={() => { setStep('upload'); setParsedBooks([]); setFileName(''); }}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                >
                  Change file
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-900">
                    <tr>
                      {['title', 'author', 'format_type', 'price', 'isbn', 'genre', 'publisher'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {parsedBooks.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="px-4 py-2 text-slate-800 dark:text-slate-200 max-w-[160px] truncate">{row.title}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.author}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.format_type === 'physical' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            row.format_type === 'ebook' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>{row.format_type || '?'}</span>
                        </td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.price}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.isbn || '-'}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.genre || '-'}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{row.publisher || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedBooks.length > 10 && (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">... and {parsedBooks.length - 10} more rows</p>
              )}
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{successCount}</p>
                  <p className="text-sm text-green-700 dark:text-green-500">Imported</p>
                </div>
                <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</p>
                  <p className="text-sm text-red-700 dark:text-red-500">Errors</p>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((r, i) => (
                  <div key={i} className={`flex items-start space-x-3 px-4 py-3 rounded-lg ${
                    r.status === 'success'
                      ? 'bg-green-50 dark:bg-green-900/10'
                      : 'bg-red-50 dark:bg-red-900/10'
                  }`}>
                    {r.status === 'success'
                      ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    }
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${r.status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        Row {r.row}: {r.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{r.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex space-x-3">
          {step === 'preview' && (
            <>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex-1 bg-slate-800 dark:bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {importing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Import {parsedBooks.length} Rows</span>
                  </>
                )}
              </button>
              <button onClick={onClose} className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                Cancel
              </button>
            </>
          )}

          {step === 'results' && (
            <button
              onClick={onClose}
              className="flex-1 bg-slate-800 dark:bg-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 transition"
            >
              Done
            </button>
          )}

          {step === 'upload' && (
            <button onClick={onClose} className="flex-1 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
