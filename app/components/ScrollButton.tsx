"use client";

export default function ScrollButton({
  targetId,
  children,
  className,
}: {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
