import { useState, useCallback, useEffect } from "react"

const TOTAL_PAGES = 4

export const PAGE_IDS = ["home", "population", "segmentation", "intervention"] as const
export const PAGE_LABELS = ["Home", "Risk Intelligence", "Segment Studio", "Intervention Planner"] as const

export function usePageNavigation() {
  const [page, setPage] = useState(0)

  const next = useCallback(() => setPage((p) => Math.min(p + 1, TOTAL_PAGES - 1)), [])
  const prev = useCallback(() => setPage((p) => Math.max(p - 1, 0)), [])
  const goTo = useCallback((p: number) => setPage(Math.max(0, Math.min(p, TOTAL_PAGES - 1))), [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [next, prev])

  return { page, next, prev, goTo, totalPages: TOTAL_PAGES }
}
