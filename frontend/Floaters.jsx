const ITEMS = ["✏️", "📚", "🎓", "📝", "📐", "🔔", "🖍️", "📖"];

export default function Floaters() {
  return (
    <div className="floaters" aria-hidden="true">
      {ITEMS.map((icon, i) => (
        <span
          key={i}
          style={{
            left: `${6 + i * 12}%`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${9 + (i % 4) * 2}s`,
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  );
}