import { Card, CardContent } from "@/components/ui/card";
import { DeltaBadge } from "@/components/ui/delta-badge";
import { Icon } from "@/components/ui/icon";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function MetricCard({
  label,
  value,
  sublabel,
  deltaPercent,
  tone = "neutral",
  icon,
  className,
}: {
  label: string;
  value: string;
  sublabel?: string;
  deltaPercent?: number;
  tone?: "neutral" | "positive" | "negative";
  icon?: string;
  className?: string;
}) {
  const valueColor =
    tone === "positive"
      ? "text-[var(--color-positive)]"
      : tone === "negative"
        ? "text-[var(--color-negative)]"
        : "text-[var(--color-text-1)]";

  return (
    <Card className={cx("shadow-none", className)}>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-3)]">{label}</p>
          {icon ? <Icon name={icon} className="text-[var(--color-text-3)]" /> : null}
        </div>
        <p className={cx("text-2xl font-semibold tabular-nums tracking-[-0.02em]", valueColor)}>{value}</p>
        <div className="flex flex-wrap items-center gap-2">
          {typeof deltaPercent === "number" ? <DeltaBadge delta={deltaPercent} /> : null}
          {sublabel ? <p className="text-sm text-[var(--color-text-2)]">{sublabel}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

