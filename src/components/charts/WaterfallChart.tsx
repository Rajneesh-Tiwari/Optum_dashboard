import ReactECharts from "echarts-for-react"
import { CHART_COLORS } from "../../lib/echartsTheme"

interface WaterfallItem {
  label: string
  value: number
  isTotal?: boolean
}

interface WaterfallChartProps {
  items: WaterfallItem[]
  height?: number
}

export function WaterfallChart({ items, height = 320 }: WaterfallChartProps) {
  // Build stacked bar waterfall: transparent base + colored bar
  const categories: string[] = []
  const baseData: (number | string)[] = []
  const greenData: (number | string)[] = []
  const redData: (number | string)[] = []
  const grayData: (number | string)[] = []

  let running = 0

  for (const item of items) {
    categories.push(item.label)

    if (item.isTotal) {
      // Total bar - gray, starts from 0
      baseData.push(0)
      greenData.push("-")
      redData.push("-")
      grayData.push(Math.max(0, item.value))
    } else if (item.value >= 0) {
      // Positive (savings) - green, stacks down from running total
      baseData.push(Math.max(0, running - item.value))
      greenData.push(item.value)
      redData.push("-")
      grayData.push("-")
      running -= item.value
    } else {
      // Negative (cost increase) - red, stacks up from running total
      baseData.push(running)
      greenData.push("-")
      redData.push(Math.abs(item.value))
      grayData.push("-")
      running += Math.abs(item.value)
    }
  }

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: CHART_COLORS.tooltipBg,
      borderColor: CHART_COLORS.tooltipBorder,
      textStyle: { color: CHART_COLORS.tooltipText, fontSize: 12 },
      formatter: (params: { name: string; seriesName: string; value: number | string }[]) => {
        const name = params[0]?.name || ""
        const visibleParam = params.find(
          (p) => p.seriesName !== "base" && typeof p.value === "number" && p.value > 0
        )
        if (!visibleParam) return name
        const val = visibleParam.value as number
        const label = visibleParam.seriesName === "savings" ? "Savings" :
                     visibleParam.seriesName === "increase" ? "Increase" : "Total"
        return `<b>${name}</b><br/>${label}: $${val.toLocaleString()}`
      },
    },
    grid: { left: 80, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        color: CHART_COLORS.axisLabel,
        fontSize: 10,
        interval: 0,
        rotate: categories.length > 5 ? 20 : 0,
      },
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
        name: "base",
        type: "bar",
        stack: "waterfall",
        data: baseData,
        itemStyle: { color: "transparent" },
        emphasis: { itemStyle: { color: "transparent" } },
      },
      {
        name: "savings",
        type: "bar",
        stack: "waterfall",
        data: greenData,
        itemStyle: { color: "#4ade80", borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "#16a34a",
          formatter: (p: { value: number | string }) =>
            typeof p.value === "number" ? `-$${(p.value / 1000).toFixed(1)}K` : "",
        },
      },
      {
        name: "increase",
        type: "bar",
        stack: "waterfall",
        data: redData,
        itemStyle: { color: "#fb7185", borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: "#e11d48",
          formatter: (p: { value: number | string }) =>
            typeof p.value === "number" ? `+$${(p.value / 1000).toFixed(1)}K` : "",
        },
      },
      {
        name: "total",
        type: "bar",
        stack: "waterfall",
        data: grayData,
        itemStyle: { color: "#94a3b8", borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: "top",
          fontSize: 10,
          color: CHART_COLORS.axisLabel,
          formatter: (p: { value: number | string }) =>
            typeof p.value === "number" ? `$${(p.value / 1000).toFixed(1)}K` : "",
        },
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
