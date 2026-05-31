export default function NoteCardSkeleton() {
  return (
    <div className="rounded-xl border border-black/5 bg-white/50 p-4 flex flex-col gap-3">
      <div className="h-3 w-16 animate-pulse rounded-full bg-black/10" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-black/10" />
      <div className="h-3 w-full animate-pulse rounded bg-black/[0.07]" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-black/[0.07]" />
      <div className="h-3 w-3/5 animate-pulse rounded bg-black/[0.07]" />
    </div>
  );
}
