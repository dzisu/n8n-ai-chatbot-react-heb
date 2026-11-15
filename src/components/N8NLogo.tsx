import React from "react";

interface N8NLogoProps {
  className?: string;
  size?: number; // Height in px
  showText?: boolean;
  theme?: "light" | "dark" | "auto";
}

export const N8NLogo: React.FC<N8NLogoProps> = ({
  className = "",
  size = 40,
  showText = true,
  theme = "auto",
}) => {
  if (!showText) {
    // Official n8n symbol (Nodes only) - Aspect ratio 240:96 (2.5:1)
    return (
      <img
        src="/logos/symbol/n8n-symbol-accent.svg"
        alt="n8n symbol"
        width={Math.round(size * 2.5)}
        height={size}
        style={{ height: `${size}px`, width: "auto" }}
        className={`inline-block select-none pointer-events-none object-contain ${className}`}
        loading="eager"
      />
    );
  }

  // Full Lockup: Icon + n8n Wordmark - Aspect ratio 480:96 (5:1)
  // If theme is explicit, render single img; if auto, render both with CSS dark/light display
  if (theme === "dark") {
    return (
      <img
        src="/logos/lockup/n8n-logo-white-accent.svg"
        alt="n8n logo"
        width={Math.round(size * 5)}
        height={size}
        style={{ height: `${size}px`, width: "auto" }}
        className={`inline-block select-none pointer-events-none object-contain ${className}`}
        loading="eager"
      />
    );
  }

  if (theme === "light") {
    return (
      <img
        src="/logos/lockup/n8n-logo-black-accent.svg"
        alt="n8n logo"
        width={Math.round(size * 5)}
        height={size}
        style={{ height: `${size}px`, width: "auto" }}
        className={`inline-block select-none pointer-events-none object-contain ${className}`}
        loading="eager"
      />
    );
  }

  // Auto mode: responsive to html.dark class
  return (
    <span className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/logos/lockup/n8n-logo-black-accent.svg"
        alt="n8n logo"
        width={Math.round(size * 5)}
        height={size}
        style={{ height: `${size}px`, width: "auto" }}
        className="block dark:hidden object-contain"
        loading="eager"
      />
      <img
        src="/logos/lockup/n8n-logo-white-accent.svg"
        alt="n8n logo"
        width={Math.round(size * 5)}
        height={size}
        style={{ height: `${size}px`, width: "auto" }}
        className="hidden dark:block object-contain"
        loading="eager"
      />
    </span>
  );
};
