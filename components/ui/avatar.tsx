/**
 * Initials-based avatar, matching the Sovereign Archive aesthetic.
 */

const SIZE = {
  sm: "w-8 h-8 text-[10px]",
  md: "w-10 h-10 text-xs",
  lg: "w-12 h-12 text-sm",
} as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <div
      className={`rounded-full bg-primary-fixed text-on-primary-fixed-variant font-heading font-bold flex items-center justify-center shrink-0 ${SIZE[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
