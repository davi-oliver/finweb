import type { HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";

export type StatusPillTone = "neutral" | "positive" | "negative" | "warning" | "info";

export function StatusPill({
  className,
  label,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { label: string; tone?: StatusPillTone }) {
  return (
    <Badge className={className} tone={tone} {...props}>
      {label}
    </Badge>
  );
}

