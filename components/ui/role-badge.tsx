/**
 * User role badge with color-coded styling per Sovereign Archive design.
 */

const VARIANTS: Record<string, string> = {
  super_admin: "bg-primary text-white",
  admin: "bg-secondary-fixed-dim text-on-secondary-fixed",
  lawyer: "bg-surface-container-highest text-on-surface-variant",
  clerk: "border border-outline-variant text-on-surface-variant",
};

const LABELS: Record<string, string> = {
  super_admin: "SUPER_ADMIN",
  admin: "ADMIN",
  lawyer: "LAWYER",
  clerk: "CLERK",
};

export default function RoleBadge({ role }: { role: string }) {
  const style = VARIANTS[role] ?? VARIANTS.clerk;
  const label = LABELS[role] ?? role.toUpperCase();

  return (
    <span
      className={`inline-block px-3 py-1 text-[10px] font-bold tracking-wider rounded-full ${style}`}
    >
      {label}
    </span>
  );
}
