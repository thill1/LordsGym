import React from "react";
import logo from "../assets/logo/lords-gym-logo.jpg";

type LogoProps = {
  className?: string;
  /**
   * full = legacy alias (treat as nav)
   * nav = top navigation
   * footer = footer area
   * icon = square icon
   */
  variant?: "full" | "nav" | "footer" | "icon";
  alt?: string;
};

export default function Logo({
  className = "",
  variant = "nav",
  alt = "Lord's Gym Auburn",
}: LogoProps) {
  const v = variant === "full" ? "nav" : variant;

  // Twice as big vs prior sizing:
  // Previous: nav h-9, footer h-12
  // New:      nav h-16, footer h-20
  const sizeClass =
    v === "icon"
      ? "h-12 w-12"
      : v === "footer"
      ? "h-20 w-auto"
      : "h-16 w-auto"; // nav/full default

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
