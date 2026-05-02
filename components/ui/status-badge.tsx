/**
 * Case status badge with color-coded styling per Sovereign Archive design.
 */

const VARIANTS: Record<string, string> = {
  ongoing:
    "bg-green-50 text-green-700 border-green-200/30",
  pending:
    "bg-yellow-50 text-yellow-700 border-yellow-200/30",
  closed:
    "bg-slate-100 text-slate-600 border-slate-200/30",
};

export default function StatusBadge({
  status,
}: {
  status: string;
}) {
  const style = VARIANTS[status] ?? VARIANTS.closed;

  return (
    <span
      className={`inline-block px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${style}`}
    >
      {status}
    </span>
  );
}
