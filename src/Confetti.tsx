import "./Confetti.css";

export default function Confetti() {
  const pieces = Array.from({ length: 30 });
  const colors = ["#6c9bff", "#ff6c9b", "#ffd76c", "#6cffb0"];

  return (
    <div className="confetti-container">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.3}s`,
            animationDuration: `${1 + Math.random() * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}