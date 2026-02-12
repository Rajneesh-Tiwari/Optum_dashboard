import ReactECharts from "echarts-for-react"
import { CHART_COLORS } from "../../lib/echartsTheme"

interface BarChartProps {
  title?: string
  categories: string[]
  values: number[]
  colors?: string[]
  height?: number
  horizontal?: boolean
  formatter?: (v: number) => string
}

export function BarChart({
  title,
  categories,
  values,
  colors,
  height = 250,
  horizontal = false,
  formatter,
}: BarChartProps) {
  const data = values.map((v, i) => ({
    value: v,
    itemStyle: colors ? { color: colors[i % colors.length] } : undefined,
  }))

  const catAxis = {
    type: "category" as const,
    data: categories,
    axisLabel: { color: CHART_COLORS.axisLabel, fontSize: 10 },
    axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
  }

  const valAxis = {
    type: "value" as const,
    axisLabel: {
      color: CHART_COLORS.axisLabel,
      formatter: formatter ? (v: number) => formatter(v) : undefined,
    },
    splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
  }

  return (
    <ReactECharts
      option={{
        title: title
          ? { text: title, left: "center", textStyle: { color: CHART_COLORS.titleText, fontSize: 13 } }
          : undefined,
        tooltip: {
          trigger: "axis",
          formatter: formatter
            ? (params: unknown) => {
                const p = params as Array<{ name: string; value: number }>
                return `${p[0].name}: ${formatter(p[0].value)}`
              }
            : undefined,
        },
        grid: { left: 60, right: 20, bottom: 30, top: title ? 45 : 20 },
        xAxis: horizontal ? valAxis : catAxis,
        yAxis: horizontal ? catAxis : valAxis,
        series: [
          {
            type: "bar",
            data,
            barWidth: "60%",
            itemStyle: colors ? undefined : { color: "#FF612B" },
          },
        ],
        animationDuration: 600,
      }}
      style={{ height }}
      theme="optumLight"
    />
  )
}
