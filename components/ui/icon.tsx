import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Icon({
  name,
  className,
  size = 20,
  filled = false,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  name: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <span
      className={cx("material-symbols-rounded", className)}
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}

