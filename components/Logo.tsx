import React from "react";

type LogoVariant = "nav" | "footer" | "icon" | "full";
type LogoTone = "light" | "dark";

interface LogoProps {
  className?: string;
  variant?: LogoVariant;
  tone?: LogoTone;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  variant = "nav",
  tone = "dark",
  alt = "Lord's Gym",
}) => {
  // IMPORTANT:
  // Avoid: new URL("...", import.meta.env.BASE_URL)
  // On GitHub Pages, BASE_URL is a *path* (e.g. "/LordsGym/"), not an absolute URL,
  // and can crash with "Invalid base URL".
  const rawBase = (import.meta.env.BASE_URL ?? "/").toString();
  const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

  // New logo file: lords-gym-logo.jpg (black and white design)
  const logoPath = `${base}media/lords-gym/lords-gym-logo.jpg`;

  const effectiveVariant = variant === "full" ? "nav" : variant;
  const isIcon = effectiveVariant === "icon";

  // Sizes (increased by 15% from current)
  const sizeClass = isIcon
    ? "h-7 w-7" // 15% increase from h-6
    : effectiveVariant === "footer"
      ? "h-14 w-auto" // 15% increase from h-12
      : variant === "full"
      ? "h-14 w-auto" // 15% increase from h-12 (12 * 1.15 = 13.8, round to 14)
      : "h-12 w-auto"; // 15% increase from h-10

  // Use the new black and white logo for all contexts
  const src = logoPath;

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} object-contain border-0 ${className}`}
      loading="eager"
      decoding="async"
      style={{ border: 'none', outline: 'none' }}
    />
  );
};

export default Logo;
