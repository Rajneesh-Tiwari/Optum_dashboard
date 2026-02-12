import ReactECharts from "echarts-for-react"
import { CHART_COLORS } from "../../lib/echartsTheme"
import {
  members,
  getFeatureValues,
  getFeatureDescription,
  isBinaryFeature,
} from "../../lib/dataUtils"

interface FeatureDistributionProps {
  feature: string
  compact?: boolean
}

// ── Bucketing definitions ────────────────────────────────────────

interface Bucket {
  label: string
  min: number
  max: number
}

const BUCKET_DEFS: Record<string, Bucket[]> = {
  age_at_pred: [
    { label: "18-34", min: 18, max: 35 },
    { label: "35-49", min: 35, max: 50 },
    { label: "50-64", min: 50, max: 65 },
    { label: "65-79", min: 65, max: 80 },
    { label: "80+", min: 80, max: Infinity },
  ],
  total_months: [
    { label: "0-6 mo", min: 0, max: 7 },
    { label: "7-12 mo", min: 7, max: 13 },
    { label: "13-24 mo", min: 13, max: 25 },
    { label: "25-36 mo", min: 25, max: 37 },
    { label: "37+ mo", min: 37, max: Infinity },
  ],
  hifld_dist_uc_zp: [
    { label: "<5 mi", min: 0, max: 5 },
    { label: "5-15 mi", min: 5, max: 15 },
    { label: "15-30 mi", min: 15, max: 30 },
    { label: "30-50 mi", min: 30, max: 50 },
    { label: "50+ mi", min: 50, max: Infinity },
  ],
  pos_dist_ed_zp: [
    { label: "<5 mi", min: 0, max: 5 },
    { label: "5-15 mi", min: 5, max: 15 },
    { label: "15-30 mi", min: 15, max: 30 },
    { label: "30+ mi", min: 30, max: Infinity },
  ],
  pmpy: [
    { label: "$0-10K", min: 0, max: 10000 },
    { label: "$10-25K", min: 10000, max: 25000 },
    { label: "$25-50K", min: 25000, max: 50000 },
    { label: "$50-100K", min: 50000, max: 100000 },
    { label: "$100K+", min: 100000, max: Infinity },
  ],
  total_allowed_amt: [
    { label: "$0-10K", min: 0, max: 10000 },
    { label: "$10-25K", min: 10000, max: 25000 },
    { label: "$25-50K", min: 25000, max: 50000 },
    { label: "$50-100K", min: 50000, max: 100000 },
    { label: "$100K+", min: 100000, max: Infinity },
  ],
  ip_allowed_amt: [
    { label: "$0", min: 0, max: 1 },
    { label: "$1-10K", min: 1, max: 10000 },
    { label: "$10-30K", min: 10000, max: 30000 },
    { label: "$30-60K", min: 30000, max: 60000 },
    { label: "$60K+", min: 60000, max: Infinity },
  ],
  charleston_comorbidity_score_cci: [
    { label: "0", min: 0, max: 1 },
    { label: "1-2", min: 1, max: 3 },
    { label: "3-4", min: 3, max: 5 },
    { label: "5-6", min: 5, max: 7 },
    { label: "7+", min: 7, max: Infinity },
  ],
  cnt_er_visits: [
    { label: "0", min: 0, max: 1 },
    { label: "1", min: 1, max: 2 },
    { label: "2-3", min: 2, max: 4 },
    { label: "4-5", min: 4, max: 6 },
    { label: "6+", min: 6, max: Infinity },
  ],
  cnt_pcp_visits: [
    { label: "0", min: 0, max: 1 },
    { label: "1-2", min: 1, max: 3 },
    { label: "3-4", min: 3, max: 5 },
    { label: "5-6", min: 5, max: 7 },
    { label: "7+", min: 7, max: Infinity },
  ],
  cardio_metabolic_risk_score: [
    { label: "Low", min: 0, max: 0.2 },
    { label: "Mild", min: 0.2, max: 0.35 },
    { label: "Moderate", min: 0.35, max: 0.5 },
    { label: "High", min: 0.5, max: 0.7 },
    { label: "Critical", min: 0.7, max: Infinity },
  ],
  frailty_index: [
    { label: "Robust", min: 0, max: 0.05 },
    { label: "Pre-frail", min: 0.05, max: 0.15 },
    { label: "Mild", min: 0.15, max: 0.25 },
    { label: "Moderate", min: 0.25, max: 0.35 },
    { label: "Severe", min: 0.35, max: Infinity },
  ],
}

function assignBucket(value: number, buckets: Bucket[]): number {
  for (let i = 0; i < buckets.length; i++) {
    if (value >= buckets[i].min && value < buckets[i].max) return i
  }
  return buckets.length - 1
}

export function FeatureDistribution({ feature, compact = false }: FeatureDistributionProps) {
  const desc = getFeatureDescription(feature)
  const h = compact ? 200 : 300
  const titleSize = compact ? 11 : 13
  const labelSize = compact ? 9 : 11
  const grid = compact
    ? { left: 40, right: 12, bottom: 30, top: 40 }
    : { left: 50, right: 20, bottom: 40, top: 50 }

  // Check if feature values are numeric
  const rawVals = members.map((m) => (m as Record<string, unknown>)[feature])
  const isNumeric = rawVals.every((v) => typeof v === "number")

  if (!isNumeric) {
    // Categorical: pie chart
    const counts: Record<string, number> = {}
    rawVals.forEach((v) => {
      const key = String(v)
      counts[key] = (counts[key] || 0) + 1
    })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
    const pieColors = ["#89BEC0", "#B0A5D4", "#E8BA98", "#8CB8D8", "#D8A8B8", "#A8C8A0", "#C4B08C", "#C09CC0", "#8CB8A8", "#D4B8A8"]

    return (
      <ReactECharts
        option={{
          title: { text: desc, left: "center", textStyle: { color: CHART_COLORS.titleText, fontSize: titleSize } },
          tooltip: { trigger: "item", formatter: "{b}: {c} members ({d}%)" },
          series: [
            {
              type: "pie",
              radius: compact ? ["30%", "60%"] : ["35%", "65%"],
              center: ["50%", "55%"],
              data: entries.map(([k, v], i) => ({
                name: k,
                value: v,
                itemStyle: { color: pieColors[i % pieColors.length] },
              })),
              label: {
                color: CHART_COLORS.axisLabel,
                fontSize: compact ? 9 : 11,
                formatter: compact ? "{d}%" : "{b}: {d}%",
              },
              emphasis: {
                itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.15)" },
              },
            },
          ],
        }}
        style={{ height: h }}
        theme="optumLight"
      />
    )
  }

  const binary = isBinaryFeature(feature)

  if (binary) {
    const total = members.length
    const flagged = members.filter((m) => (m as Record<string, unknown>)[feature] === 1).length
    const pct = Math.round((flagged / total) * 100)
    const notFlagged = total - flagged
    const notPct = 100 - pct

    return (
      <ReactECharts
        option={{
          title: { text: desc, left: "center", textStyle: { color: CHART_COLORS.titleText, fontSize: titleSize } },
          tooltip: {
            trigger: "axis",
            formatter: (params: Array<{ seriesName: string; value: number }>) => {
              return params.map((p) => `${p.seriesName}: <b>${p.value}</b> members`).join("<br/>")
            },
          },
          grid: compact
            ? { left: 12, right: 12, bottom: 20, top: 50 }
            : { left: 20, right: 20, bottom: 30, top: 55 },
          xAxis: {
            type: "value",
            max: total,
            show: false,
          },
          yAxis: {
            type: "category",
            data: [""],
            show: false,
          },
          series: [
            {
              name: "Flagged",
              type: "bar",
              stack: "total",
              data: [flagged],
              barWidth: compact ? 28 : 36,
              itemStyle: {
                color: "#799842",
                borderRadius: [6, 0, 0, 6],
              },
              label: {
                show: true,
                position: "inside",
                formatter: `${pct}%  (${flagged})`,
                color: "#fff",
                fontSize: compact ? 10 : 12,
                fontWeight: "bold",
              },
            },
            {
              name: "Not Flagged",
              type: "bar",
              stack: "total",
              data: [notFlagged],
              barWidth: compact ? 28 : 36,
              itemStyle: {
                color: "#E5E7EB",
                borderRadius: [0, 6, 6, 0],
              },
              label: {
                show: true,
                position: "inside",
                formatter: `${notPct}%`,
                color: "#9CA3AF",
                fontSize: compact ? 10 : 12,
              },
            },
          ],
        }}
        style={{ height: h }}
        theme="optumLight"
      />
    )
  }

  // ── Bucketed features ──────────────────────────────────────────
  const bucketDef = BUCKET_DEFS[feature]
  if (bucketDef) {
    const values = getFeatureValues(feature)
    const bucketCounts = Array(bucketDef.length).fill(0) as number[]

    values.forEach((v) => {
      const idx = assignBucket(v, bucketDef)
      bucketCounts[idx]++
    })

    return (
      <ReactECharts
        option={{
          title: { text: desc, left: "center", textStyle: { color: CHART_COLORS.titleText, fontSize: titleSize } },
          tooltip: {
            trigger: "axis",
            formatter: (params: Array<{ name: string; value: number }>) => {
              const p = params[0]
              return `${p.name}: <b>${p.value}</b> members`
            },
          },
          grid,
          xAxis: {
            type: "category",
            data: bucketDef.map((b) => b.label),
            axisLabel: { color: CHART_COLORS.axisLabel, fontSize: labelSize },
            axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
            boundaryGap: false,
          },
          yAxis: {
            type: "value",
            name: compact ? "" : "Members",
            axisLabel: { color: CHART_COLORS.axisLabel, fontSize: labelSize },
            splitLine: { show: false },
          },
          series: [
            {
              type: "line",
              smooth: true,
              symbol: "circle",
              symbolSize: compact ? 5 : 8,
              data: bucketCounts,
              itemStyle: { color: "#799842" },
              lineStyle: { color: "#799842", width: 2 },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(121, 152, 66, 0.25)" },
                    { offset: 1, color: "rgba(121, 152, 66, 0.02)" },
                  ],
                },
              },
            },
          ],
        }}
        style={{ height: h }}
        theme="optumLight"
      />
    )
  }

  // ── Generic histogram for remaining continuous features ────────
  const values = getFeatureValues(feature)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const bins = compact ? 12 : 20
  const step = (max - min) / bins || 1
  const buckets = Array(bins).fill(0) as number[]

  values.forEach((v) => {
    let idx = Math.floor((v - min) / step)
    if (idx >= bins) idx = bins - 1
    buckets[idx]++
  })

  const labels = Array.from({ length: bins }, (_, i) => {
    const val = min + i * step
    return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(1)
  })

  return (
    <ReactECharts
      option={{
        title: { text: desc, left: "center", textStyle: { color: CHART_COLORS.titleText, fontSize: titleSize } },
        tooltip: {
          trigger: "axis",
          formatter: (params: Array<{ name: string; value: number }>) => {
            const p = params[0]
            return `${p.name}: <b>${p.value}</b> members`
          },
        },
        grid,
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: { color: CHART_COLORS.axisLabel, rotate: compact ? 0 : 30, fontSize: labelSize, interval: compact ? "auto" : 0 },
          axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
          boundaryGap: false,
        },
        yAxis: {
          type: "value",
          name: compact ? "" : "Members",
          axisLabel: { color: CHART_COLORS.axisLabel, fontSize: labelSize },
          splitLine: { show: false },
        },
        series: [
          {
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: compact ? 4 : 6,
            data: buckets,
            itemStyle: { color: "#B0A5D4" },
            lineStyle: { color: "#B0A5D4", width: 2 },
            areaStyle: {
              color: {
                type: "linear",
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(176, 165, 212, 0.25)" },
                  { offset: 1, color: "rgba(176, 165, 212, 0.02)" },
                ],
              },
            },
          },
        ],
      }}
      style={{ height: h }}
      theme="optumLight"
    />
  )
}
