/**
 * Wrapper around Google Material Symbols Rounded icon font.
 * Usage: <Icon name="dashboard" /> or <Icon name="gavel" filled />
 *
 * The font MUST be loaded globally (see app/layout.tsx).
 * The icon name is rendered as text content inside a <span> — the font
 * ligature engine converts it to the correct glyph.
 */
export default function Icon({
  name,
  filled = false,
  className = "",
}: {
  name: string;
  filled?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-rounded shrink-0 select-none leading-none ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        fontSize: "inherit",
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
