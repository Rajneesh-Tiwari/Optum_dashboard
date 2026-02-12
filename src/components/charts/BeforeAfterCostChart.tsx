import ReactECharts from "echarts-for-react"
import { CHART_COLORS } from "../../lib/echartsTheme"

interface BeforeAfterCostChartProps {
  before: { ip: number; op: number; phys: number; rx: number }
  after: { ip: number; op: number; phys: number; rx: number }
  clusterColor?: string
  height?: number
}

export function BeforeAfterCostChart({
  before,
  after,
  clusterColor = "#89BEC0",
  height = 280,
}: BeforeAfterCostChartProps) {
  const categories = ["Inpatient", "Outpatient", "Physician", "Pharmacy"]
  const beforeValues = [before.ip, before.op, before.phys, before.rx]
  const afterValues = [after.ip, after.op, after.phys, after.rx]

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: CHART_COLORS.tooltipBg,
      borderColor: CHART_COLORS.tooltipBorder,
      textStyle: { color: CHART_COLORS.tooltipText, fontSize: 12 },
      formatter: (params: { seriesName: string; value: number; name: string }[]) => {
        let html = `<b>${params[0].name}</b>`
        for (const p of params) {
          html += `<br/>${p.seriesName}: $${p.value.toLocaleString()}`
        }
        return html
      },
    },
    legend: {
      data: ["Current", "Projected"],
      top: 0,
      textStyle: { color: CHART_COLORS.legendText, fontSize: 11 },
    },
    grid: { left: 70, right: 20, top: 35, bottom: 30 },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { color: CHART_COLORS.axisLabel, fontSize: 11 },
      axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: CHART_COLORS.axisLabel,
        fontSize: 10,
        formatter: (v: number) => `$${(v / 1000).toFixed(0)}K`,
      },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
    },
    series: [
      {
        name: "Current",
        type: "bar",
        data: beforeValues,
        itemStyle: { color: clusterColor, borderRadius: [3, 3, 0, 0] },
        barGap: "20%",
      },
      {
        name: "Projected",
        type: "bar",
        data: afterValues,
        itemStyle: { color: "#4ade80", borderRadius: [3, 3, 0, 0] },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      theme="optumLight"
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  )
}
