const READY_AT = 70;

export default function ReadinessBar({ score, role }: { score: number; role: string }) {
  const gap = Math.max(0, READY_AT - score);
  const pct = Math.min(score, 100);
  const color =
    score >= READY_AT ? "from-[#34C48A] to-[#5DDBA8]" : "from-[#3B6EF8] to-[#6A9BFF]";

  return (
    <figure aria-label={`Skill match ${score} percent for ${role}`} className="rounded-2xl border border-[#1E3D55] bg-[#112638] p-6">
      {/* Score headline */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7FA3B8]">Skill match</p>
          <p className="font-display text-5xl font-bold text-[#E8F1F6]">
            {score}
            <span className="text-2xl text-[#7FA3B8]">%</span>
          </p>
          <p className="mt-1 text-sm text-[#7FA3B8]">of the <span className="text-[#A8C4D4]">{role}</span> skill set</p>
        </div>

        {/* Status badge */}
        <div className={`rounded-xl px-4 py-2 text-center ${score >= READY_AT ? "bg-[#34C48A]/10 border border-[#34C48A]/30" : "bg-[#3B6EF8]/10 border border-[#3B6EF8]/30"}`}>
          <p className={`text-sm font-semibold ${score >= READY_AT ? "text-[#34C48A]" : "text-[#3B6EF8]"}`}>
            {score >= READY_AT ? "Interview ready" : `${gap}pts to go`}
          </p>
          <p className="text-[10px] text-[#7FA3B8]">{READY_AT}% threshold</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 overflow-hidden rounded-full bg-[#0B1D2E]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-[width] duration-700 motion-reduce:transition-none`}
          style={{ width: `${pct}%` }}
        />
        {/* Threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/40"
          style={{ left: `${READY_AT}%` }}
        />
      </div>

      <figcaption className="mt-2 flex justify-between text-[11px] text-[#7FA3B8]">
        <span>0%</span>
        <span className="absolute left-[70%] translate-x-1 text-[10px] text-white/40">{READY_AT}%</span>
        <span>100%</span>
      </figcaption>
    </figure>
  );
}
