export default function Ticker({ items }) {
  const doubled = [...items, ...items];
  return (
    <div className="bg-duskdeep border-y border-white/10 overflow-hidden py-2.5" aria-hidden="true">
      <div className="flex gap-10 ticker-track w-max">
        {doubled.map((item, i) => (
          <div key={`${item.crop}-${i}`} className="flex items-center gap-2 font-mono text-xs whitespace-nowrap text-sand/90">
            <span className="text-gold">{item.crop}</span>
            <span>{item.region}</span>
            <span className={item.trend >= 0 ? "text-sage" : "text-clay"}>
              N${item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              {item.trend >= 0 ? " ▲" : " ▼"}
              {Math.abs(item.trend).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
