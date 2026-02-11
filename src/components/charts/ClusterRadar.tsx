import ReactECharts from "echarts-for-react"
import { clusterStats, CLUSTER_COLORS } from "../../lib/dataUtils"

interface ClusterRadarProps {
  highlightCluster?: number | null
}

export function ClusterRadar({ highlightCluster }: ClusterRadarProps) {
  const clusters = [1, 2, 3, 4, 5, 6]
  const stats = clusters.map((c) => clusterStats(c))

  const dims = [
    { key: "avgCost", label: "Avg Cost" },
    { key: "avgSeverity", label: "Severity" },
    { key: "avgER", label: "ER Visits" },
    { key: "avgFrailty", label: "Frailty" },
    { key: "avgRiskScore", label: "Risk Score" },
    { key: "pctDiabetes", label: "Diabetes %" },
    { key: "pctHeart", label: "Heart Disease %" },
    { key: "avgAge", label: "Avg Age" },
  ] as const

  const maxes = dims.map((d) =>
    Math.max(...stats.map((s) => s[d.key as keyof typeof s] as number))
  )

  const indicator = dims.map((d, i) => ({
    name: d.label,
    max: Math.ceil(maxes[i] * 1.1) || 100,
  }))

  const hasHighlight = highlightCluster != null

  const SHORT_NAMES: Record<number, string> = {
    1: "C1: At-Risk",
    2: "C2: Metabolic",
    3: "C3: Heart Fail.",
    4: "C4: ESRD",
    5: "C5: Rural SDOH",
    6: "C6: Frail Elderly",
  }

  const data = clusters.map((c, ci) => {
    const isActive = !hasHighlight || highlightCluster === c

    return {
      name: SHORT_NAMES[c],
      value: dims.map(
        (d) => Math.round((stats[ci][d.key as keyof (typeof stats)[0]] as number) * 10) / 10
      ),
      lineStyle: {
        color: CLUSTER_COLORS[c],
        width: isActive ? 2.5 : 1,
        opacity: isActive ? 1 : 0.15,
      },
      itemStyle: {
        color: CLUSTER_COLORS[c],
        opacity: isActive ? 1 : 0.15,
      },
      areaStyle: {
        color: CLUSTER_COLORS[c],
        opacity: isActive ? 0.18 : 0.02,
      },
      symbol: isActive ? "circle" : "none",
      symbolSize: isActive ? 5 : 0,
    }
  })

  return (
    <ReactECharts
      option={{
        tooltip: { trigger: "item" },
        legend: {
          bottom: 0,
          type: "scroll",
          textStyle: { color: "#94a3b8", fontSize: 10 },
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          pageIconColor: "#94a3b8",
          pageTextStyle: { color: "#94a3b8" },
        },
        radar: {
          indicator,
          shape: "polygon",
          splitNumber: 4,
          center: ["50%", "48%"],
          radius: "60%",
          axisName: { color: "#94a3b8", fontSize: 10 },
          splitLine: { lineStyle: { color: "#1e293b" } },
          splitArea: { areaStyle: { color: ["transparent"] } },
          axisLine: { lineStyle: { color: "#334155" } },
        },
        series: [{ type: "radar", data }],
        animationDuration: 400,
      }}
      style={{ height: 400 }}
      theme="optumDark"
    />
  )
}
