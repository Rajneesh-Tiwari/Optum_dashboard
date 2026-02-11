import { useTypewriter } from "../../hooks/useTypewriter"
import type { ClusterPersona } from "../../data/clusterPersonas"

interface PersonaCardProps {
  persona: ClusterPersona
  animate?: boolean
}

export function PersonaCard({ persona, animate = true }: PersonaCardProps) {
  const { displayed, done } = useTypewriter(persona.narrative, 12, animate)

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: persona.color }}>
          AI
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100">Clinical Persona</div>
          <div className="text-xs text-slate-400">{persona.name}</div>
        </div>
      </div>
      <p className={`text-sm text-slate-300 leading-relaxed mb-3 ${!done ? "typewriter-cursor" : ""}`}>
        {displayed}
      </p>
      <div className="space-y-1">
        {persona.keyFeatures.map((f, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <span className="text-optum mt-0.5">-</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
