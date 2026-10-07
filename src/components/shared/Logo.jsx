import Link from "next/link";
import { NotebookPen } from "lucide-react";

export function Logo({ className = "" }) {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-transform group-hover:rotate-6">
        <NotebookPen className="h-4 w-4" />
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-gradient">
        Marginalia
      </span>
    </Link>
  );
}
