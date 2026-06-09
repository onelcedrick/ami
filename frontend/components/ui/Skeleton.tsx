export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden p-4 animate-pulse">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols * 3 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-600 mb-1">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
