export default function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-3 border-gold/20 border-t-gold rounded-full animate-spin" style={{ borderWidth: '3px' }} />
      <p className="mt-4 text-sm text-ink-soft">{label}</p>
    </div>
  );
}
