const sizes = { sm: 130, md: 170, lg: 230 };

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Sorocaba Executivos"
      width={sizes[size]}
      height={sizes[size]}
      style={{ objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto" }}
    />
  );
}
