import Image from "next/image";
import Link from "next/link";

const SRC = {
  horizontal: {
    light: "/branding/logo-light-horizontal.png",
    dark: "/branding/logo-dark-horizontal.png",
  },
  stacked: {
    light: "/branding/logo-light-stacked.png",
    dark: "/branding/logo-dark-stacked.png",
  },
} as const;

const SIZE = {
  horizontal: {
    light: { width: 439, height: 150 },
    dark: { width: 422, height: 123 },
  },
  stacked: {
    light: { width: 311, height: 194 },
    dark: { width: 293, height: 197 },
  },
} as const;

type BrandLogoProps = {
  variant?: "horizontal" | "stacked";
  /** Altura visual em Tailwind (ex.: h-8, h-10). Largura segue a proporção do PNG. */
  className?: string;
  priority?: boolean;
  href?: string | null;
};

export function BrandLogo({
  variant = "horizontal",
  className,
  priority = false,
  href = "/",
}: BrandLogoProps) {
  const sizes = SIZE[variant];
  const { light, dark } = SRC[variant];

  const img = (
    <span className={["relative inline-block shrink-0", className].filter(Boolean).join(" ")}>
      <Image
        src={light}
        alt="Fin Web"
        width={sizes.light.width}
        height={sizes.light.height}
        className="h-full w-auto dark:hidden"
        priority={priority}
      />
      <Image
        src={dark}
        alt="Fin Web"
        width={sizes.dark.width}
        height={sizes.dark.height}
        className="hidden h-full w-auto dark:block"
        priority={priority}
      />
    </span>
  );

  if (href === null) {
    return img;
  }

  return (
    <Link href={href} className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-950">
      {img}
    </Link>
  );
}
