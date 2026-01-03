import React from "react";
import logo from "../assets/logo/lords-gym-logo.jpg";

type LogoProps = {
  className?: string;
  variant?: "full" | "icon";
  alt?: string;
  size?: "sm" | "md" | "lg";
};

export default function Logo({
  className = "",
  variant = "full",
  alt = "Lord's Gym",
  size = "md",
}: LogoProps) {
  const isIcon = variant === "icon";

  const sizeMap = {
    sm: isIcon ? "h-8 w-8" : "h-10 w-auto",
    md: isIcon ? "h-10 w-10" : "h-14 w-auto",
    lg: isIcon ? "h-12 w-12" : "h-20 w-auto",
  } as const;

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt={alt}
        className={`${sizeMap[size]} object-contain`}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
