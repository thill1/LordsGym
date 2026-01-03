import React from "react";
import logo from "../assets/logo/lords-gym-logo.jpg";

type LogoProps = {
  className?: string;
  variant?: "full" | "icon";
  alt?: string;
};

export default function Logo({
  className = "",
  variant = "full",
  alt = "Lord's Gym Auburn",
}: LogoProps) {
  const isIcon = variant === "icon";

  // Slightly bigger than before but not huge
  const sizeClass = isIcon ? "h-10 w-10" : "h-18 w-auto";

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
