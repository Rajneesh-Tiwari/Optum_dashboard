import { useState } from "react"
import { getSuggestedQueries } from "../../data/chatResponses"
import { HWHIIcon } from "../HWHIIcon"

interface LandingPageProps {
  onNavigate: (page: number) => void
  onChatSubmit?: (query: string) => void
}

const CARDS = [
  {
    page: 1,
    title: "Risk Intelligence",
    desc: "Explore member demographics, cost drivers, and county-level risk patterns to identify where to focus resources.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    page: 2,
    title: "Segment Studio",
    desc: "Review AI-identified member segments to compare risk profiles and prioritize intervention strategies.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20" />
        <path d="M2 12h20" />
        <path d="M12 2c2.5 3.5 4 7.5 4 10s-1.5 6.5-4 10" />
      </svg>
    ),
  },
  {
    page: 3,
    title: "Intervention Planner",
    desc: "Model intervention scenarios, adjust parameters with interactive sliders, and project ROI by segment.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M8 6h8M8 10h8M8 14h4" />
        <circle cx="16" cy="18" r="2" />
        <path d="M14 18h-6" />
      </svg>
    ),
  },
]

const QUICK_ACCESS = [
  {
    page: 1,
    label: "Population Flow",
    desc: "Trace member pathways from demographics to cost",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    page: 1,
    label: "Geographic Insights",
    desc: "County-level risk heatmap",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    page: 2,
    label: "Segment Deep Dive",
    desc: "Compare 6 member archetypes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    page: 2,
    label: "Risk Pathways",
    desc: "Conditions to cost impact",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
]

export function LandingPage({ onNavigate, onChatSubmit }: LandingPageProps) {
  const [chatInput, setChatInput] = useState("")
  const suggestedQueries = getSuggestedQueries(0)

  const handleChatSubmit = (query: string) => {
    if (!query.trim()) return
    setChatInput("")
    onChatSubmit?.(query)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero section */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-5">
          <HWHIIcon size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Know your Population. Move the needle.
        </h1>
        <p className="text-base text-gray-400 max-w-md mx-auto">
          Heartland Whole Health - Cardiometabolic Intelligence
        </p>
      </div>

      {/* Prominent Chat Box */}
      <div className="mb-14">
        <div className="glass-card p-1 relative">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleChatSubmit(chatInput)
            }}
            className="flex items-center gap-2"
          >
            <div className="pl-4 text-gray-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Which segments need intervention this quarter?"
              className="flex-1 bg-transparent px-3 py-4 text-base text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="mr-2 w-10 h-10 rounded-xl text-white flex items-center justify-center hover:shadow-lg hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none cursor-pointer transition-all shrink-0"
              style={{ background: 'linear-gradient(135deg, #799842, #5F7A33)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Suggested query chips */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {suggestedQueries.map((q, i) => (
            <button
              key={i}
              onClick={() => handleChatSubmit(q)}
              className="text-xs bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Main navigation cards */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {CARDS.map((card) => (
          <button
            key={card.page}
            onClick={() => onNavigate(card.page)}
            className="glass-card p-6 text-left transition-all cursor-pointer group hover:shadow-md"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-4 group-hover:text-primary group-hover:bg-primary-light group-hover:border-primary/15 transition-colors">
              {card.icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">{card.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
            <div className="mt-3 text-xs font-medium text-gray-400 group-hover:text-primary transition-colors flex items-center gap-1">
              Open
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Quick access section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Access</h3>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACCESS.map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate(item.page)}
              className="glass-card p-4 text-left cursor-pointer transition-all hover:shadow-sm group flex flex-col"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3 group-hover:text-primary group-hover:bg-primary-light group-hover:border-primary/15 transition-colors shrink-0">
                {item.icon}
              </div>
              <div className="text-sm font-medium text-gray-800 mb-0.5">{item.label}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
