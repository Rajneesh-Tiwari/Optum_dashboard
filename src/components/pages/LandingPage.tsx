interface LandingPageProps {
  onNavigate: (page: number) => void
}

const CARDS = [
  {
    page: 1,
    title: "Population Analysis",
    desc: "Explore the full Arkansas member cohort with interactive health metrics, cost insights, and county-level geographic views.",
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
    title: "Segmentation Analysis",
    desc: "Discover AI-identified member segments with risk profiles, intervention opportunities, and deep-dives for each group.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a10 10 0 0 1 0 20" />
        <path d="M2 12h20" />
        <path d="M12 2c2.5 3.5 4 7.5 4 10s-1.5 6.5-4 10" />
      </svg>
    ),
  },
]

const QUICK_ACCESS = [
  {
    page: 1,
    label: "Population Flow",
    desc: "Age, insurance, risk and cost pathways",
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
    desc: "Explore 6 member archetypes",
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
    desc: "Risk factors to cost impact",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
]

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-5">
          <svg width="48" height="48" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#FF612B" />
            <circle cx="16" cy="16" r="6" fill="white" opacity="0.9" />
            <circle cx="16" cy="16" r="2.5" fill="#FF612B" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          <span className="text-optum">Optum</span> Value Connect
        </h1>
        <p className="text-lg text-gray-500 max-w-lg mx-auto">
          AI Powered Public Health Intervention Planning
        </p>
      </div>

      {/* Main navigation cards */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        {CARDS.map((card) => (
          <button
            key={card.page}
            onClick={() => onNavigate(card.page)}
            className="glass-card p-6 text-left transition-all cursor-pointer group hover:shadow-[0_0_24px_rgba(96,165,250,0.3)]"
            style={{ border: '2px solid rgba(96, 165, 250, 0.45)', boxShadow: '0 0 12px rgba(96, 165, 250, 0.12)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-optum/5 group-hover:border-optum/15 group-hover:text-optum transition-colors">
              {card.icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">{card.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
            <div className="mt-3 text-xs font-medium text-blue-500 group-hover:text-optum transition-colors flex items-center gap-1">
              Explore
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
              className="glass-card p-4 text-left cursor-pointer transition-all hover:border-blue-200 hover:shadow-sm group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 mb-3 group-hover:text-blue-500 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                {item.icon}
              </div>
              <div className="text-sm font-medium text-gray-800 mb-0.5">{item.label}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
