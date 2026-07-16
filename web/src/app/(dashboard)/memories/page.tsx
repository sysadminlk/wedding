'use client';

import { useEffect, useState } from 'react';
import { Video, Mic, Camera, Play, X, Filter } from 'lucide-react';
import { GuestMemory } from '@/types';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card } from '@/components/ui/Card';

type FilterType = 'all' | 'video' | 'audio' | 'photo';

const typeConfig: Record<
  string,
  { icon: typeof Video; color: string; label: string }
> = {
  video: { icon: Video, color: '#8c4b55', label: 'Video' },
  audio: { icon: Mic, color: '#166d13', label: 'Audio' },
  photo: { icon: Camera, color: '#2563eb', label: 'Photo' },
};

function TypeBadge({ type }: { type: string }) {
  const config = typeConfig[type] ?? typeConfig.photo;
  const Icon = config.icon;
  return (
    <span
      className="font-label inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: config.color + '20', color: config.color }}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function MemoryModal({
  memory,
  onClose,
}: {
  memory: GuestMemory;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-dashboard-surface)',
          border: '1px solid var(--color-dashboard-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full p-1"
          style={{ backgroundColor: 'var(--color-dashboard-border)' }}
        >
          <X size={18} style={{ color: 'var(--color-dashboard-text)' }} />
        </button>

        {memory.type === 'video' && (
          <video
            src={memory.fileUrl}
            controls
            autoPlay
            className="w-full aspect-video object-cover"
          />
        )}
        {memory.type === 'audio' && (
          <div
            className="flex items-center justify-center aspect-video"
            style={{ backgroundColor: 'var(--color-dashboard-border)' }}
          >
            <audio src={memory.fileUrl} controls autoPlay />
          </div>
        )}
        {memory.type === 'photo' && (
          <img
            src={memory.fileUrl}
            alt={memory.message || 'Guest memory'}
            className="w-full aspect-video object-cover"
          />
        )}

        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <TypeBadge type={memory.type} />
            <span
              className="font-body text-sm"
              style={{ color: 'var(--color-dashboard-text-secondary)' }}
            >
              {new Date(memory.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <p
            className="font-heading text-lg font-semibold mb-1"
            style={{ color: 'var(--color-dashboard-text)' }}
          >
            {memory.guestName}
          </p>
          {memory.message && (
            <p
              className="font-body text-sm mt-2"
              style={{ color: 'var(--color-dashboard-text-secondary)' }}
            >
              {memory.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<GuestMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedMemory, setSelectedMemory] = useState<GuestMemory | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/memories?page=${page}&size=20`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMemories((prev) =>
            page === 0 ? data : [...prev, ...data]
          );
          setHasMore(data.length === 20);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const filtered =
    activeFilter === 'all'
      ? memories
      : memories.filter((m) => m.type === activeFilter);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'video', label: 'Video' },
    { key: 'audio', label: 'Audio' },
    { key: 'photo', label: 'Photo' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Memories"
        description="Video, audio, and photo messages from your guests"
      />

      <div className="flex items-center gap-2 flex-wrap">
        <Filter
          size={16}
          style={{ color: 'var(--color-dashboard-text-secondary)' }}
        />
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => {
                setActiveFilter(f.key);
                setPage(0);
              }}
              className="font-label rounded-full px-3 py-1 text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive
                  ? '#d4af37'
                  : 'var(--color-dashboard-border)',
                color: isActive
                  ? '#fff'
                  : 'var(--color-dashboard-text-secondary)',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading && memories.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl animate-pulse"
              style={{
                backgroundColor: 'var(--color-dashboard-border)',
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl"
          style={{
            backgroundColor: 'var(--color-dashboard-surface)',
            border: '1px solid var(--color-dashboard-border)',
          }}
        >
          <Camera
            size={40}
            style={{ color: 'var(--color-dashboard-text-secondary)' }}
          />
          <p
            className="font-heading text-lg mt-3"
            style={{ color: 'var(--color-dashboard-text-secondary)' }}
          >
            No memories yet
          </p>
          <p
            className="font-body text-sm mt-1"
            style={{ color: 'var(--color-dashboard-text-secondary)' }}
          >
            Guests can share video, audio, and photo messages
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((memory) => (
              <Card
                key={memory.id}
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow"
                style={{
                  backgroundColor: 'var(--color-dashboard-surface)',
                  border: '1px solid var(--color-dashboard-border)',
                }}
                onClick={() => setSelectedMemory(memory)}
              >
                <div className="relative aspect-video overflow-hidden">
                  {memory.type === 'video' && (
                    <>
                      <video
            src={memory.fileUrl}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div
                          className="rounded-full p-3"
                          style={{ backgroundColor: 'var(--color-dashboard-surface)' }}
                        >
                          <Play
                            size={20}
                            style={{ color: '#d4af37' }}
                            fill="#d4af37"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {memory.type === 'audio' && (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        backgroundColor:
                          typeConfig.audio.color + '15',
                      }}
                    >
                      <div
                        className="rounded-full p-4"
                        style={{
                          backgroundColor: typeConfig.audio.color + '30',
                        }}
                      >
                        <Mic
                          size={28}
                          style={{ color: typeConfig.audio.color }}
                        />
                      </div>
                    </div>
                  )}
                  {memory.type === 'photo' && (
                    <img
                      src={memory.fileUrl}
                      alt={memory.message || 'Guest photo'}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 left-2">
                    <TypeBadge type={memory.type} />
                  </div>
                </div>

                <div className="p-4">
                  <p
                    className="font-heading text-sm font-semibold truncate"
                    style={{ color: 'var(--color-dashboard-text)' }}
                  >
                    {memory.guestName}
                  </p>
                  {memory.message && (
                    <p
                      className="font-body text-xs mt-1 line-clamp-2"
                      style={{
                        color: 'var(--color-dashboard-text-secondary)',
                      }}
                    >
                      {memory.message}
                    </p>
                  )}
                  <p
                    className="font-label text-xs mt-2"
                    style={{ color: 'var(--color-dashboard-text-secondary)' }}
                  >
                    {new Date(memory.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="font-label rounded-lg px-5 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-dashboard-border)',
                  color: 'var(--color-dashboard-text)',
                }}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
        />
      )}
    </div>
  );
}
