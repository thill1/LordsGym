import React from "react";
import logo from "@/assets/logo/lords-gym-wht-logo.jpg";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const Logo: React.FC<LogoProps> = ({ className = "", variant = "full" }) => {
  const isIcon = variant === "icon";
  const sizeClass = isIcon ? "h-10 w-10" : "h-10 w-auto";

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="Lord's Gym"
        className={`${sizeClass} object-contain`}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </div>
  );
};

export default Logo;
