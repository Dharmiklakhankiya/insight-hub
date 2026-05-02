import Link from "next/link";

export default function ProtectedFooter() {
  return (
    <footer className="ml-64 w-[calc(100%-16rem)] py-12 px-8 bg-surface-container-lowest border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex flex-col items-start gap-1">
        <span className="font-heading font-bold text-lg text-primary-container">
          InsightHub
        </span>
        <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant opacity-50">
          © {new Date().getFullYear()} InsightHub Intelligence. All rights reserved.
        </span>
      </div>
      <div className="flex gap-8">
        {["Legal Documentation", "Privacy Policy", "Terms of Service", "Security Whitepaper"].map(
          (label) => (
            <Link
              key={label}
              href="#"
              className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50 hover:text-primary-container hover:opacity-100 transition-all"
            >
              {label}
            </Link>
          ),
        )}
      </div>
    </footer>
  );
}
