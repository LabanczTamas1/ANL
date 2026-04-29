import React, { useCallback, useEffect, useRef, useState } from 'react';

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// ── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl overflow-hidden bg-surface-elevated/50 border border-line-glass animate-pulse">
    <div className="aspect-video bg-surface-elevated" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-surface-elevated rounded w-3/4" />
      <div className="h-3 bg-surface-elevated rounded w-1/2" />
    </div>
  </div>
);

// ── Single video card (lite-embed) ───────────────────────────────────────────
const VideoCard: React.FC<{ video: VideoItem }> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formattedDate = video.publishedAt
    ? new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(video.publishedAt))
    : '';

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-surface-elevated/50 border border-line-glass transition-transform duration-300 hover:scale-[1.02]">
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand/20 to-accent-teal/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Video area */}
      <div className="relative aspect-video bg-surface-overlay">
        {isPlaying ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className="absolute inset-0 w-full h-full group/play focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${video.title}`}
          >
            {/* Thumbnail — lazy loaded, no YouTube scripts */}
            <img
              src={video.thumbnail}
              alt={video.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = '1';
                  img.src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
                }
              }}
            />
            {/* Dark overlay */}
            <span className="absolute inset-0 bg-black/30 group-hover/play:bg-black/20 transition-colors duration-200" />
            {/* Play button */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-brand/90 group-hover/play:bg-brand shadow-lg transition-all duration-200 group-hover/play:scale-110 flex items-center justify-center">
                <span
                  style={{
                    display: 'inline-block',
                    width: 0,
                    height: 0,
                    marginLeft: '4px',
                    borderStyle: 'solid',
                    borderWidth: '8px 0 8px 16px',
                    borderColor: 'transparent transparent transparent white',
                  }}
                />
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="relative p-4">
        <p className="text-white text-sm font-medium line-clamp-2 leading-snug mb-1">
          {video.title}
        </p>
        {formattedDate && (
          <p className="text-content-muted text-xs">{formattedDate}</p>
        )}
      </div>
    </div>
  );
};

// ── Section ──────────────────────────────────────────────────────────────────
interface YouTubeSectionProps {
  className?: string;
}

const YouTubeSection: React.FC<YouTubeSectionProps> = ({ className = '' }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  const fetchVideos = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    try {
      const res = await fetch(`${BASE_URL}/api/v1/youtube/videos`);
      if (!res.ok) throw new Error('Request failed');
      const data: VideoItem[] = await res.json();
      setVideos(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only trigger the API call once the section is near the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchVideos();
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [fetchVideos]);

  return (
    <div ref={sectionRef} className={`relative py-20 overflow-hidden ${className}`}>
      {/* Background gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-teal/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
          Latest from Our Channel
        </h2>
        <p className="text-content-muted text-center mb-16 max-w-2xl mx-auto">
          Stay up to date with our newest content — tips, strategies, and success stories
        </p>

        {error ? (
          <p className="text-content-muted text-center">
            Could not load videos right now. Visit us on{' '}
            <a
              href="https://www.youtube.com/@Ads_AndLeads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-hover underline underline-offset-2"
            >
              YouTube
            </a>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="mt-10 text-center">
            <a
              href="https://www.youtube.com/@Ads_AndLeads"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand hover:bg-brand-hover text-white text-sm font-medium transition-colors duration-200"
            >
              View All Videos
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeSection;
