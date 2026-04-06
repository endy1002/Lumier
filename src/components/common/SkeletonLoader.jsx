export default function SkeletonLoader({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="bg-brand-cream-dark rounded-lg"
          style={{
            height: i === 0 ? '24px' : '16px',
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl overflow-hidden">
      <div className="bg-brand-cream-dark h-56 w-full" />
      <div className="p-4 space-y-3">
        <div className="bg-brand-cream-dark h-5 rounded w-3/4" />
        <div className="bg-brand-cream-dark h-4 rounded w-1/2" />
        <div className="bg-brand-cream-dark h-8 rounded w-full mt-4" />
      </div>
    </div>
  );
}
