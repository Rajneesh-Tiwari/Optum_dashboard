const STEPS = [
  { label: "Population Overview", desc: "500-member dataset" },
  { label: "AI Segmentation", desc: "6 clusters revealed" },
  { label: "Cluster Deep Dive", desc: "Clinical profiles" },
]

interface StepperProps {
  currentPage: number
  onGoTo: (page: number) => void
}

export function Stepper({ currentPage, onGoTo }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 px-6">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center">
          <button
            onClick={() => onGoTo(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
              i === currentPage
                ? "bg-optum/15 border border-optum/40 text-optum"
                : i < currentPage
                  ? "bg-slate-800 border border-slate-600 text-slate-300"
                  : "bg-slate-800/50 border border-slate-700 text-slate-400"
            }`}
          >
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                i === currentPage
                  ? "bg-optum text-white"
                  : i < currentPage
                    ? "bg-slate-600 text-white"
                    : "bg-slate-700 text-slate-400"
              }`}
            >
              {i < currentPage ? "\u2713" : i + 1}
            </span>
            <div className="text-left">
              <div className="text-sm font-medium leading-tight">{step.label}</div>
              <div className="text-xs opacity-60">{step.desc}</div>
            </div>
          </button>
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 h-px mx-2 ${
                i < currentPage ? "bg-optum/50" : "bg-slate-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
