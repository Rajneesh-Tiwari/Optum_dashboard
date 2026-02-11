import { useState, useRef, useEffect, useCallback } from "react"
import { useTypewriter } from "../../hooks/useTypewriter"
import {
  SIMULATION_STEPS,
  FALLBACK_RESPONSE,
  getSuggestedQueries,
  matchQuery,
  type ChatMessage,
  type Source,
} from "../../data/chatResponses"

interface ChatDockProps {
  open: boolean
  onToggle: () => void
  currentPage: number
  activeCluster: number
}

interface DisplayMessage extends ChatMessage {
  id: number
  animate?: boolean
  sources?: Source[]
}

const PAGE_LABELS = ["Population Overview", "AI Segmentation", "Cluster Deep Dive"]

export function ChatDock({ open, onToggle, currentPage, activeCluster }: ChatDockProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState("")
  const [simulating, setSimulating] = useState(false)
  const [simText, setSimText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const msgIdRef = useRef(0)

  const suggestedQueries = getSuggestedQueries(currentPage, activeCluster)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, simText, scrollToBottom])

  const addMessage = (msg: ChatMessage, animate = false) => {
    msgIdRef.current += 1
    setMessages((prev) => [...prev, { ...msg, id: msgIdRef.current, animate }])
  }

  const runSimulation = async (response: ChatMessage) => {
    setSimulating(true)
    for (const step of SIMULATION_STEPS) {
      setSimText(step.text)
      await new Promise((r) => setTimeout(r, step.durationMs))
    }
    setSimText("")
    setSimulating(false)
    addMessage(response, true)
  }

  const handleSubmit = (query: string) => {
    if (!query.trim() || simulating) return
    addMessage({ role: "user", content: query })
    setInput("")

    const matched = matchQuery(query, currentPage, activeCluster)
    runSimulation(matched ?? FALLBACK_RESPONSE)
  }

  return (
    <>
      {/* Toggle Button - prominent with pulse */}
      {!open && (
        <button
          onClick={onToggle}
          className="fixed bottom-20 right-6 z-40 flex items-center gap-2.5 bg-optum text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:bg-optum-dark transition-all cursor-pointer group"
          title="Open Insights Copilot"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-optum/40 animate-ping pointer-events-none" />
          <span className="relative flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
            <span className="text-sm font-semibold whitespace-nowrap">Copilot</span>
          </span>
        </button>
      )}

      {/* Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[420px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-optum to-optum-dark flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-optum/20">
              AI
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Insights Copilot</div>
              <div className="text-xs text-slate-400">
                Context: {PAGE_LABELS[currentPage]}
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-200 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Context indicator */}
        <div className="px-5 py-2 bg-slate-800/50 border-b border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-400">
            Scoped to <span className="text-slate-200 font-medium">{PAGE_LABELS[currentPage]}</span>
            {currentPage === 2 && (
              <span className="text-slate-400"> - Cluster {activeCluster}</span>
            )}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !simulating && (
            <div className="py-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-optum/20 to-optum/5 border border-optum/20 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF612B" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-center text-sm text-slate-300 mb-1 font-medium">
                What would you like to explore?
              </p>
              <p className="text-center text-xs text-slate-500 mb-5">
                Explore {PAGE_LABELS[currentPage].toLowerCase()} insights or try a suggestion below
              </p>
              <div className="space-y-2">
                {suggestedQueries.map((q, i) => (
                  <button
                    key={`${currentPage}-${activeCluster}-${i}`}
                    onClick={() => handleSubmit(q)}
                    className="block w-full text-left text-sm bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-3 text-slate-300 hover:border-optum/40 hover:bg-slate-800 hover:text-slate-100 transition-all cursor-pointer"
                  >
                    <span className="text-optum mr-2 font-mono text-xs">{i + 1}</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {simulating && (
            <div className="flex items-start gap-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-optum/15 flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-optum animate-pulse" />
              </div>
              <div className="text-sm text-optum/80 italic">{simText}</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested pills (when messages exist) */}
        {messages.length > 0 && !simulating && (
          <div className="px-5 pb-3 flex gap-2 flex-wrap">
            {suggestedQueries.map((q, i) => (
              <button
                key={`pill-${currentPage}-${activeCluster}-${i}`}
                onClick={() => handleSubmit(q)}
                className="text-xs bg-slate-800 border border-slate-700/60 rounded-full px-3 py-1.5 text-slate-400 hover:border-optum/40 hover:text-slate-200 transition-all cursor-pointer"
              >
                {q.length > 45 ? q.slice(0, 45) + "..." : q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-800 p-4 bg-slate-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(input)
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this population..."
              disabled={simulating}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-optum/60 focus:ring-1 focus:ring-optum/20 disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={simulating || !input.trim()}
              className="px-4 py-2.5 bg-optum text-white rounded-xl text-sm font-medium hover:bg-optum-dark disabled:opacity-40 cursor-pointer transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-optum/10 border border-optum/20 rounded-xl rounded-br-sm px-4 py-2.5 text-sm text-slate-200">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-optum/20 to-optum/5 border border-optum/15 flex items-center justify-center text-optum text-xs font-bold shrink-0 mt-0.5">
        AI
      </div>
      <div className="max-w-[90%] bg-slate-800/60 border border-slate-700/40 rounded-xl rounded-tl-sm px-4 py-3">
        <AssistantMessage content={message.content} animate={message.animate ?? false} sources={message.sources} />
      </div>
    </div>
  )
}

function AssistantMessage({ content, animate, sources }: { content: string; animate: boolean; sources?: Source[] }) {
  const { displayed, done } = useTypewriter(content, 6, animate)
  const [sourcesExpanded, setSourcesExpanded] = useState(false)

  const hasSources = sources && sources.length > 0

  return (
    <div>
      <div className={`text-sm text-slate-300 whitespace-pre-wrap leading-relaxed ${!done ? "typewriter-cursor" : ""}`}>
        {formatMarkdown(displayed)}
      </div>
      {done && hasSources && (
        <div className="mt-3 pt-2.5 border-t border-slate-700/40">
          <button
            onClick={() => setSourcesExpanded(!sourcesExpanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${sourcesExpanded ? "rotate-90" : ""}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>{sources!.length} source{sources!.length > 1 ? "s" : ""}</span>
          </button>
          {sourcesExpanded && (
            <div className="mt-2 space-y-1.5">
              {sources!.map((src, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-slate-500 font-mono shrink-0">[{i + 1}]</span>
                  {src.url === "#optum-internal" ? (
                    <span className="text-amber-400/80 italic">{src.label}</span>
                  ) : (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                    >
                      {src.label}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-slate-100 font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}
