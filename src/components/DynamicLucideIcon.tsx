import React from "react";
import * as LucideIcons from "lucide-react";

interface DynamicLucideIconProps {
  name?: string;
  size?: number;
  className?: string;
}

// Convert kebab-case, snake_case, camelCase or lowercase to PascalCase (e.g., "book-open" -> "BookOpen")
export const normalizeIconName = (name?: string): string => {
  if (!name || typeof name !== "string") return "Bot";
  const trimmed = name.trim();
  if (!trimmed) return "Bot";

  // If already PascalCase with existing export
  const directMatch = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  if ((LucideIcons as any)[directMatch]) {
    return directMatch;
  }

  // Convert kebab-case / snake_case / spaces to PascalCase
  const pascal = trimmed
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toUpperCase());

  return pascal;
};

export const isValidLucideIcon = (name?: string): boolean => {
  if (!name) return false;
  const pascal = normalizeIconName(name);
  return Boolean(
    (LucideIcons as any)[pascal] || (LucideIcons as any)[pascal + "Icon"]
  );
};

export const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({
  name,
  size = 20,
  className = "",
}) => {
  const pascalName = normalizeIconName(name);
  const IconComponent =
    (LucideIcons as any)[pascalName] ||
    (LucideIcons as any)[pascalName + "Icon"] ||
    LucideIcons.Bot;

  return (
    <IconComponent
      size={size}
      className={`shrink-0 aspect-square ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        aspectRatio: "1 / 1",
      }}
    />
  );
};
