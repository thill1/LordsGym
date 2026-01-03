import React from "react";
import logo from "../assets/logo/lords-gym-logo.jpg";

type LogoProps = {
  className?: string;
  variant?: "nav" | "footer" | "icon";
  alt?: string;
};

export default function Logo({
  className = "",
  variant = "nav",
  alt = "Lord's Gym Auburn",
}: LogoProps) {
  // NAV: small + clean
  // FOOTER: slightly larger
  const sizeClass =
    variant === "icon"
      ? "h-9 w-9"
      : variant === "footer"
      ? "h-14 w-auto"
      : "h-10 w-auto"; // nav default

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt={alt}
        className={`${sizeClass} object-contain`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
