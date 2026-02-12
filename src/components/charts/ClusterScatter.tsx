import ReactECharts from "echarts-for-react"
import { members, CLUSTER_COLORS, CLUSTER_NAMES } from "../../lib/dataUtils"
import { CHART_COLORS } from "../../lib/echartsTheme"

interface ClusterScatterProps {
  highlightCluster?: number | null
}

export function ClusterScatter({ highlightCluster }: ClusterScatterProps) {
  const clusters = [1, 2, 3, 4, 5, 6]

  const series = clusters.map((c) => {
    const data = members
      .filter((m) => m.cluster_label === c)
      .map((m) => [m.tsne_x, m.tsne_y, m.member_id, m.age_at_pred, m.pmpy])

    const isHighlighted = highlightCluster == null || highlightCluster === c

    return {
      name: CLUSTER_NAMES[c],
      type: "scatter" as const,
      data,
      symbolSize: isHighlighted ? 8 : 4,
      itemStyle: {
        color: CLUSTER_COLORS[c],
        opacity: isHighlighted ? 0.85 : 0.15,
      },
      emphasis: {
        itemStyle: { borderColor: CHART_COLORS.axisLine, borderWidth: 1 },
      },
    }
  })

  return (
    <ReactECharts
      option={{
        tooltip: {
          trigger: "item",
          formatter: (params: unknown) => {
            const p = params as { data: [number, number, string, number, number]; seriesName: string }
            return `<b>${p.seriesName}</b><br/>ID: ${p.data[2]}<br/>Age: ${p.data[3]}<br/>PMPY: $${p.data[4].toLocaleString()}`
          },
        },
        legend: {
          data: clusters.map((c) => CLUSTER_NAMES[c]),
          bottom: 0,
          textStyle: { color: CHART_COLORS.legendText, fontSize: 10 },
          itemWidth: 10,
          itemHeight: 10,
        },
        grid: { left: 50, right: 20, bottom: 60, top: 20 },
        xAxis: {
          type: "value",
          axisLabel: { show: false },
          axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
          splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
        },
        yAxis: {
          type: "value",
          axisLabel: { show: false },
          axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
          splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
        },
        series,
        animationDuration: 800,
      }}
      style={{ height: 400 }}
      theme="optumLight"
    />
  )
}
