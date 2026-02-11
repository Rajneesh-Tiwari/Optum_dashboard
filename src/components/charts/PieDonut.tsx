import ReactECharts from "echarts-for-react"

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
          ? { text: title, left: "center", textStyle: { color: "#f1f5f9", fontSize: 13 } }
          : undefined,
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} ({d}%)",
        },
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
            label: { color: "#94a3b8", fontSize: 10, formatter: "{b}: {d}%" },
            emphasis: {
              itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" },
            },
          },
        ],
        animationDuration: 600,
      }}
      style={{ height }}
      theme="optumDark"
    />
  )
}
