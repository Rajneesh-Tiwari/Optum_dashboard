import ReactECharts from "echarts-for-react"

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
    axisLabel: { color: "#94a3b8", fontSize: 10 },
    axisLine: { lineStyle: { color: "#334155" } },
  }

  const valAxis = {
    type: "value" as const,
    axisLabel: {
      color: "#94a3b8",
      formatter: formatter ? (v: number) => formatter(v) : undefined,
    },
    splitLine: { lineStyle: { color: "#1e293b" } },
  }

  return (
    <ReactECharts
      option={{
        title: title
          ? { text: title, left: "center", textStyle: { color: "#f1f5f9", fontSize: 13 } }
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
      theme="optumDark"
    />
  )
}
