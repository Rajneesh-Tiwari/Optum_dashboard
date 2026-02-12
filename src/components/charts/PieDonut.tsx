import ReactECharts from "echarts-for-react"
import { CHART_COLORS } from "../../lib/echartsTheme"

interface PieDonutProps {
  title?: string
  data: Array<{ name: string; value: number; color?: string }>
  height?: number
}

export function PieDonut({ title, data, height = 250 }: PieDonutProps) {
  return (
    <ReactECharts
      option={{
        title: title
          ? { text: title, left: "center", textStyle: { color: CHART_COLORS.titleText, fontSize: 13 } }
          : undefined,
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} ({d}%)",
        },
        legend: {
          bottom: 0,
          type: "scroll",
          textStyle: { color: CHART_COLORS.legendText, fontSize: 10 },
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          pageIconColor: CHART_COLORS.legendPageIcon,
          pageTextStyle: { color: CHART_COLORS.legendText },
        },
        series: [
          {
            type: "pie",
            radius: ["40%", "65%"],
            center: ["50%", "45%"],
            data: data.map((d) => ({
              name: d.name,
              value: d.value,
              itemStyle: d.color ? { color: d.color } : undefined,
            })),
            label: { color: CHART_COLORS.axisLabel, fontSize: 10, formatter: "{b}: {d}%" },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.15)" },
            },
          },
        ],
        animationDuration: 600,
      }}
      style={{ height }}
      theme="optumLight"
    />
  )
}
