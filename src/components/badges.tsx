import { CATEGORY_META, SEVERITY_META, STATUS_META } from "@/lib/brand";
import type { ActionStatus, Category, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", meta.className)}>{meta.label}</span>;
}

export function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
      <span className="size-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ActionStatus | "open" | "closed" }) {
  const meta = status === "closed" || status === "open" || status === "in_progress" ? STATUS_META[status] : STATUS_META.open;
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", meta.className)}>{meta.label}</span>;
}
