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

  // Files in repo:
  // public/media/lords-gym/lords-gym-logo-dark.png
  // public/media/lords-gym/lords-gym-logo-light.png
  const logoDark = `${base}media/lords-gym/lords-gym-logo-dark.png`;
  const logoLight = `${base}media/lords-gym/lords-gym-logo-light.png`;

  const effectiveVariant = variant === "full" ? "nav" : variant;
  const isIcon = effectiveVariant === "icon";

  // Sizes (header/logo is intentionally bigger)
  const sizeClass = isIcon
    ? "h-10 w-10"
    : effectiveVariant === "footer"
      ? "h-20 w-auto"
      : "h-14 w-auto";

  const src = tone === "light" ? logoLight : logoDark;

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} object-contain ${className}`}
      loading="eager"
      decoding="async"
    />
  );
};

export default Logo;
