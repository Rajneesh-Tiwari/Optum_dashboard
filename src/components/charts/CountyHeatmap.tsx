import { useEffect, useState, useRef } from "react"
import ReactECharts from "echarts-for-react"
import { CHART_COLORS, echarts } from "../../lib/echartsTheme"
import { type CountyStat } from "../../lib/dataUtils"

interface CountyHeatmapProps {
  countyStats: CountyStat[]
  metric: "avgRiskScore" | "avgCost" | "memberCount"
  height?: number
  onCountyClick?: (county: CountyStat | null) => void
  selectedCounty?: string | null
}

const METRIC_CONFIG = {
  avgRiskScore: { label: "Avg Risk Score", format: (v: number) => v.toFixed(3), colors: ["#EFF5E6", "#799842", "#D8A8B8"] },
  avgCost: { label: "Avg PMPY Cost", format: (v: number) => `$${(v / 1000).toFixed(0)}K`, colors: ["#EFF5E6", "#A8C8A0", "#E8BA98"] },
  memberCount: { label: "Member Count", format: (v: number) => String(Math.round(v)), colors: ["#f3f4f6", "#8CB8D8", "#B0A5D4"] },
}

export function CountyHeatmap({ countyStats, metric, height = 500, onCountyClick, selectedCounty }: CountyHeatmapProps) {
  const [mapReady, setMapReady] = useState(false)
  const chartRef = useRef<ReactECharts>(null)

  useEffect(() => {
    import("../../data/arkansas_counties.json").then((geo) => {
      echarts.registerMap("arkansas", geo as unknown as Parameters<typeof echarts.registerMap>[1])
      setMapReady(true)
    })
  }, [])

  if (!mapReady) {
    return <div style={{ height }} className="flex items-center justify-center text-gray-400 text-sm">Loading map...</div>
  }

  const config = METRIC_CONFIG[metric]
  const statsMap = new Map(countyStats.map((s) => [s.name, s]))

  const values = countyStats.map((s) => s[metric])
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  const mapData = countyStats.map((s) => ({
    name: s.name,
    value: s[metric],
    selected: s.name === selectedCounty,
  }))

  const onEvents = {
    click: (params: { componentType: string; name: string }) => {
      if (params.componentType === "series" && onCountyClick) {
        const stat = statsMap.get(params.name)
        if (stat) {
          onCountyClick(stat.name === selectedCounty ? null : stat)
        }
      }
    },
  }

  return (
    <ReactECharts
      ref={chartRef}
      option={{
        tooltip: {
          trigger: "item",
          formatter: (params: { name: string; value?: number }) => {
            const stat = statsMap.get(params.name)
            if (!stat) return `<b>${params.name} County</b><br/>No member data`
            return `<b>${params.name} County</b><br/>
Members: ${stat.memberCount}<br/>
Risk Score: ${stat.avgRiskScore.toFixed(3)}<br/>
Avg Cost: $${(stat.avgCost / 1000).toFixed(0)}K<br/>
Avg Age: ${stat.avgAge.toFixed(1)}<br/>
Diabetes: ${stat.pctDiabetes.toFixed(0)}%`
          },
        },
        visualMap: {
          min: minVal,
          max: maxVal,
          text: [config.format(maxVal), config.format(minVal)],
          inRange: {
            color: config.colors,
          },
          textStyle: { color: CHART_COLORS.axisLabel },
          calculable: true,
          left: 20,
          bottom: 20,
        },
        series: [
          {
            type: "map",
            map: "arkansas",
            roam: true,
            selectedMode: "single",
            data: mapData,
            emphasis: {
              label: { show: true, color: CHART_COLORS.titleText },
              itemStyle: { areaColor: "#799842", borderColor: "#5F7A33", borderWidth: 2 },
            },
            select: {
              label: { show: true, color: "#fff", fontWeight: "bold" },
              itemStyle: { areaColor: "#5F7A33", borderColor: "#4A6228", borderWidth: 2 },
            },
            label: {
              show: false,
            },
            itemStyle: {
              areaColor: "#f3f4f6",
              borderColor: CHART_COLORS.axisLine,
              borderWidth: 0.5,
            },
          },
        ],
        animationDuration: 600,
      }}
      onEvents={onEvents}
      style={{ height }}
      theme="optumLight"
    />
  )
}
