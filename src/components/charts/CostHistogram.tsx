import ReactECharts from "echarts-for-react"
import { membersInCluster, CLUSTER_COLORS, CLUSTER_NAMES } from "../../lib/dataUtils"
import { formatCurrency } from "../../lib/format"

interface CostHistogramProps {
  clusterId?: number
  height?: number
}

export function CostHistogram({ clusterId, height = 280 }: CostHistogramProps) {
  const clusters = clusterId ? [clusterId] : [1, 2, 3, 4, 5, 6]

  const bucketEdges = [0, 5000, 15000, 30000, 60000, 100000, 200000, 500000]
  const labels = bucketEdges.slice(0, -1).map((e, i) =>
    `${formatCurrency(e)}-${formatCurrency(bucketEdges[i + 1])}`
  )

  const SHORT_NAMES: Record<number, string> = {
    1: "C1: At-Risk",
    2: "C2: Metabolic",
    3: "C3: Heart Fail.",
    4: "C4: ESRD",
    5: "C5: Rural SDOH",
    6: "C6: Frail Elderly",
  }

  const series = clusters.map((c) => {
    const costs = membersInCluster(c).map((m) => m.pmpy)
    const counts = bucketEdges.slice(0, -1).map((lo, i) => {
      const hi = bucketEdges[i + 1]
      return costs.filter((v) => v >= lo && v < hi).length
    })
    return {
      name: clusterId ? CLUSTER_NAMES[c] : SHORT_NAMES[c],
      type: "bar" as const,
      stack: "total",
      data: counts,
      itemStyle: { color: CLUSTER_COLORS[c] },
    }
  })

  return (
    <ReactECharts
      option={{
        title: {
          text: clusterId ? `Cost Distribution - Cluster ${clusterId}` : "Cost Distribution by Cluster",
          left: "center",
          textStyle: { color: "#f1f5f9", fontSize: 13 },
        },
        tooltip: { trigger: "axis" },
        legend: clusterId
          ? undefined
          : {
              bottom: 0,
              type: "scroll",
              textStyle: { color: "#94a3b8", fontSize: 9 },
              itemWidth: 8,
              itemHeight: 8,
              itemGap: 10,
              pageIconColor: "#94a3b8",
              pageTextStyle: { color: "#94a3b8" },
            },
        grid: { left: 50, right: 20, bottom: clusterId ? 30 : 55, top: 45 },
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: { color: "#94a3b8", fontSize: 9, rotate: 25 },
          axisLine: { lineStyle: { color: "#334155" } },
        },
        yAxis: {
          type: "value",
          name: "Members",
          axisLabel: { color: "#94a3b8" },
          splitLine: { lineStyle: { color: "#1e293b" } },
        },
        series,
        animationDuration: 600,
      }}
      style={{ height }}
      theme="optumDark"
    />
  )
}
