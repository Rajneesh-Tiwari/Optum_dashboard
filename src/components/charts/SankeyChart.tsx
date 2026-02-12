import { useRef, useCallback } from "react"
import ReactECharts from "echarts-for-react"
import { CHART_COLORS } from "../../lib/echartsTheme"

interface SankeyNode {
  name: string
  itemStyle?: { color: string }
}

interface SankeyLink {
  source: string
  target: string
  value: number
}

interface SankeyChartProps {
  title?: string
  nodes: SankeyNode[]
  links: SankeyLink[]
  height?: number
  orient?: "horizontal" | "vertical"
  onNodeClick?: (nodeName: string) => void
}

export function SankeyChart({ title, nodes, links, height = 400, orient = "horizontal", onNodeClick }: SankeyChartProps) {
  const chartRef = useRef<ReactECharts>(null)

  const highlightPath = useCallback(
    (seedNodes: string[], direction: "both" | "forward" | "backward") => {
      const chart = chartRef.current?.getEchartsInstance()
      if (!chart) return

      const connectedNodes = new Set<string>(seedNodes)
      const connectedLinks = new Set<number>()

      // Forward pass: find all downstream
      if (direction === "both" || direction === "forward") {
        const queue = [...seedNodes]
        while (queue.length > 0) {
          const current = queue.shift()!
          links.forEach((link, i) => {
            if (link.source === current && !connectedLinks.has(i)) {
              connectedLinks.add(i)
              connectedNodes.add(link.target)
              queue.push(link.target)
            }
          })
        }
      }

      // Backward pass: find all upstream
      if (direction === "both" || direction === "backward") {
        const queue = [...seedNodes]
        while (queue.length > 0) {
          const current = queue.shift()!
          links.forEach((link, i) => {
            if (link.target === current && !connectedLinks.has(i)) {
              connectedLinks.add(i)
              connectedNodes.add(link.source)
              queue.push(link.source)
            }
          })
        }
      }

      const styledNodes = nodes.map((n) => ({
        ...n,
        itemStyle: {
          ...(n.itemStyle || {}),
          opacity: connectedNodes.has(n.name) ? 1 : 0.12,
        },
        label: {
          opacity: connectedNodes.has(n.name) ? 1 : 0.15,
        },
      }))

      const styledLinks = links.map((l, i) => ({
        ...l,
        lineStyle: {
          opacity: connectedLinks.has(i) ? 0.55 : 0.03,
        },
      }))

      chart.setOption({
        series: [{ data: styledNodes, links: styledLinks }],
      })
    },
    [nodes, links]
  )

  const resetChart = useCallback(() => {
    const chart = chartRef.current?.getEchartsInstance()
    if (!chart) return
    const resetNodes = nodes.map((n) => ({
      ...n,
      itemStyle: { ...(n.itemStyle || {}), opacity: 1 },
      label: { opacity: 1 },
    }))
    const resetLinks = links.map((l) => ({
      ...l,
      lineStyle: { opacity: 0.35 },
    }))
    chart.setOption({
      series: [{ data: resetNodes, links: resetLinks }],
    })
  }, [nodes, links])

  const handleClick = useCallback(
    (params: { dataType: string; name?: string; data?: { source?: string; target?: string } }) => {
      if (params.dataType === "node" && params.name) {
        highlightPath([params.name], "both")
        onNodeClick?.(params.name)
      } else if (params.dataType === "edge" && params.data?.source && params.data?.target) {
        highlightPath([params.data.source, params.data.target], "both")
        onNodeClick?.(params.data.source)
      } else {
        resetChart()
        onNodeClick?.("")
      }
    },
    [highlightPath, resetChart, onNodeClick]
  )

  const onEvents = {
    click: handleClick,
    dblclick: resetChart,
  }

  return (
    <ReactECharts
      ref={chartRef}
      option={{
        title: title
          ? { text: title, left: "center", textStyle: { color: CHART_COLORS.titleText, fontSize: 13 } }
          : undefined,
        legend: { show: false },
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
          extraCssText: "max-width: 300px; white-space: normal;",
        },
        series: [
          {
            type: "sankey",
            orient,
            layoutIterations: 32,
            data: nodes,
            links,
            emphasis: {
              focus: "adjacency",
            },
            lineStyle: {
              color: "gradient",
              curveness: 0.5,
              opacity: 0.35,
            },
            label: {
              color: CHART_COLORS.titleText,
              fontSize: 11,
            },
            nodeWidth: 20,
            nodeGap: 12,
            left: 20,
            right: 120,
            top: title ? 45 : 20,
            bottom: 20,
          },
        ],
        animationDuration: 800,
      }}
      onEvents={onEvents}
      style={{ height }}
      theme="optumLight"
    />
  )
}
