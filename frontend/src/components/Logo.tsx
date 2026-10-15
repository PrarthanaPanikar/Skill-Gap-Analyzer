/**
 * Logo — shared brand mark used across Nav, Login, and Onboarding.
 *
 * Variants:
 *   "mark"    – image only (used inside Nav where space is tight)
 *   "lockup"  – image + "SkillGap" wordmark side-by-side (Login hero)
 *   "stacked" – image above wordmark (Onboarding header)
 *
 * Size prop controls the image width/height in pixels (default 36).
 */

type LogoVariant = "mark" | "lockup" | "stacked";

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}

export default function Logo({ variant = "lockup", size = 36, className = "" }: LogoProps) {
  const img = (
    <img
      src="/images/skillgap-logo.png"
      alt="SkillGap logo"
      width={size}
      height={size}
      className="rounded-xl object-contain"
      style={{ width: size, height: size }}
      draggable={false}
    />
  );

  if (variant === "mark") return <span className={className}>{img}</span>;

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <img
          src="/images/skillgap-logo.png"
          alt="SkillGap logo"
          width={size}
          height={size}
          className="rounded-2xl object-contain"
          style={{ width: size, height: size }}
          draggable={false}
        />
        <span
          className="font-display font-bold tracking-tight text-[#E8F1F6]"
          style={{ fontSize: Math.round(size * 0.38) }}
        >
          SkillGap
        </span>
      </div>
    );
  }

  // default: lockup (horizontal)
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/images/skillgap-logo.png"
        alt="SkillGap logo"
        width={size}
        height={size}
        className="rounded-xl object-contain"
        style={{ width: size, height: size }}
        draggable={false}
      />
      <span
        className="font-display font-bold tracking-tight text-[#E8F1F6]"
        style={{ fontSize: Math.round(size * 0.5) }}
      >
        SkillGap
      </span>
    </span>
  );
}
