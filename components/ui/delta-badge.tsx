import type { HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";

export function DeltaBadge({
  className,
  delta,
  suffix = "este mês",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { delta: number; suffix?: string }) {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  const tone = delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral";
  const formatted = `${sign}${Math.abs(delta).toFixed(1)}%`;

  return (
    <Badge className={className} tone={tone} {...props}>
      <span className="tabular-nums">{formatted}</span>
      <span className="opacity-80">{suffix ? ` ${suffix}` : ""}</span>
    </Badge>
  );
}

