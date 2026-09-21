export default function ScoreBar({ label, value }) {
  const color = value >= 70 ? "bg-sage" : value >= 40 ? "bg-gold" : "bg-clay";
  return (
    <div>
      <div className="flex justify-between text-xs font-mono text-ink/70 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
