export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span
      className={`font-heading font-bold uppercase tracking-widest ${sizes[size]}`}
      style={{ fontFamily: "var(--font-oswald)" }}
    >
      <span className="text-brand-red">S</span>
      <span className="text-brand-text">OROCABA </span>
      <span className="text-brand-red">E</span>
      <span className="text-brand-text">XECUTIVOS</span>
    </span>
  );
}
