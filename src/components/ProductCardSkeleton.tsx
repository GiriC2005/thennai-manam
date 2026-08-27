export default function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 skeleton" />
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="flex gap-1">
          <div className="h-3 w-3 skeleton rounded-full" />
          <div className="h-3 w-3 skeleton rounded-full" />
          <div className="h-3 w-3 skeleton rounded-full" />
          <div className="h-3 w-3 skeleton rounded-full" />
          <div className="h-3 w-3 skeleton rounded-full" />
        </div>
        <div className="h-5 w-1/2 skeleton" />
      </div>
    </div>
  );
}
