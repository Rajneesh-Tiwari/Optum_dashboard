import { type ReactNode, useEffect, useState, useRef } from "react"

interface PageShellProps {
  page: number
  children: ReactNode
}

export function PageShell({ page, children }: PageShellProps) {
  const [visible, setVisible] = useState(true)
  const [rendered, setRendered] = useState(children)
  const prevPage = useRef(page)

  useEffect(() => {
    if (page !== prevPage.current) {
      setVisible(false)
      const timer = setTimeout(() => {
        setRendered(children)
        setVisible(true)
        prevPage.current = page
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setRendered(children)
    }
  }, [page, children])

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {rendered}
    </div>
  )
}
