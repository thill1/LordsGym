import React from "react";
import logoJpg from "@/assets/logo/lords-gym-logo.jpg";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

const Logo: React.FC<LogoProps> = ({ className = "", variant = "full" }) => {
  const isIcon = variant === "icon";

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoJpg}
        alt="Lord's Gym"
        className={isIcon ? "h-10 w-10 object-contain" : "h-10 w-auto object-contain"}
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </div>
  );
};

export default Logo;
