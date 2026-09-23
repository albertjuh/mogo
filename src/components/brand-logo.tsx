import Image from "next/image";
import { cn } from "@/lib/utils";

export const BRAND_NAME = "King Bariki";
export const BRAND_TAGLINE = "Bajaji & TukTuk Fleet";

/** The King Bariki shield emblem (transparent PNG, ~0.9:1 portrait). */
export function BrandShield({ size = 40, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt={`${BRAND_NAME} logo`}
      width={Math.round(size * 0.91)}
      height={size}
      priority={priority}
      className={cn("object-contain drop-shadow-sm", className)}
    />
  );
}

/**
 * Shield + wordmark lockup. `tone="light"` is for navy/dark backgrounds
 * (white name, gold tagline); `tone="dark"` for light backgrounds.
 */
export function BrandLogo({
  size = 40,
  tone = "dark",
  showTagline = true,
  className,
  priority,
}: {
  size?: number;
  tone?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandShield size={size} priority={priority} />
      <div className="leading-none">
        <p
          className={cn(
            "font-headline font-black uppercase tracking-tight",
            tone === "light" ? "text-white" : "text-accent"
          )}
          style={{ fontSize: Math.max(14, size * 0.42) }}
        >
          King <span className={tone === "light" ? "text-gold" : "text-primary"}>Bariki</span>
        </p>
        {showTagline && (
          <p
            className={cn(
              "mt-1 font-bold uppercase tracking-[0.18em]",
              tone === "light" ? "text-gold" : "text-gold-foreground/60"
            )}
            style={{ fontSize: Math.max(8, size * 0.19) }}
          >
            {BRAND_TAGLINE}
          </p>
        )}
      </div>
    </div>
  );
}
