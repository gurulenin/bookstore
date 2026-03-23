import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChapterMarker {
  id: string;
  chapter_number: number;
  chapter_title: string;
  start_time_seconds: number;
}

interface AudiobookPlayerProps {
  url: string;
  title: string;
  formatId?: string;
}

export default function AudiobookPlayer({ url, title, formatId }: AudiobookPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markers, setMarkers] = useState<ChapterMarker[]>([]);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState(-1);

  useEffect(() => {
    if (formatId) loadMarkers();
  }, [formatId]);

  const loadMarkers = async () => {
    const { data } = await supabase
      .from('audiobook_chapters')
      .select('id, chapter_number, chapter_title, start_time_seconds')
      .eq('book_format_id', formatId)
      .eq('is_marker', true)
      .order('start_time_seconds', { ascending: true });
    if (data) setMarkers(data);
  };

  useEffect(() => {
    if (markers.length === 0) return;
    let idx = -1;
    for (let i = 0; i < markers.length; i++) {
      if (currentTime >= markers[i].start_time_seconds) idx = i;
    }
    setActiveMarkerIndex(idx);
  }, [currentTime, markers]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const seekToMarker = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const skipToPrev = () => {
    if (markers.length === 0 || activeMarkerIndex <= 0) return;
    seekToMarker(markers[activeMarkerIndex - 1].start_time_seconds);
  };

  const skipToNext = () => {
    if (markers.length === 0 || activeMarkerIndex >= markers.length - 1) return;
    seekToMarker(markers[activeMarkerIndex + 1].start_time_seconds);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getMarkerPercent = (seconds: number) =>
    duration > 0 ? (seconds / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6">
      <p className="text-base text-slate-700 mb-4 font-medium">{title}</p>

      {markers.length > 0 && activeMarkerIndex >= 0 && (
        <div className="mb-3 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-700 font-medium">
          Now: Ch.{markers[activeMarkerIndex].chapter_number} — {markers[activeMarkerIndex].chapter_title}
        </div>
      )}

      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="space-y-3">
        <div className="relative pt-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          {markers.map((m) => (
            <button
              key={m.id}
              onClick={() => seekToMarker(m.start_time_seconds)}
              title={`Ch.${m.chapter_number}: ${m.chapter_title}`}
              style={{ left: `calc(${getMarkerPercent(m.start_time_seconds)}% - 5px)` }}
              className="absolute top-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow cursor-pointer hover:scale-125 transition-transform z-10"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center space-x-4 pt-1">
          {markers.length > 0 && (
            <button
              onClick={skipToPrev}
              disabled={activeMarkerIndex <= 0}
              className="text-slate-600 hover:text-slate-800 transition p-2 rounded-full hover:bg-slate-200 disabled:opacity-30"
            >
              <SkipBack className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={togglePlay}
            className="bg-orange-500 text-white p-5 rounded-full hover:bg-orange-600 transition shadow-lg transform hover:scale-105"
          >
            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
          </button>

          {markers.length > 0 && (
            <button
              onClick={skipToNext}
              disabled={activeMarkerIndex >= markers.length - 1}
              className="text-slate-600 hover:text-slate-800 transition p-2 rounded-full hover:bg-slate-200 disabled:opacity-30"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={toggleMute}
            className="text-slate-600 hover:text-slate-800 transition p-3 rounded-full hover:bg-slate-200"
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {markers.length > 0 && (
        <div className="mt-5 border-t pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Chapters</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {markers.map((m, i) => (
              <button
                key={m.id}
                onClick={() => seekToMarker(m.start_time_seconds)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                  activeMarkerIndex === i
                    ? 'bg-orange-100 text-orange-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="flex items-center gap-2 text-left">
                  <span className="text-xs text-slate-400 font-mono">{m.chapter_number}.</span>
                  {m.chapter_title}
                </span>
                <span className="text-xs text-slate-400 font-mono tabular-nums shrink-0">
                  {formatTime(m.start_time_seconds)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
