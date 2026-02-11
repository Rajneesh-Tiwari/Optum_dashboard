import ReactECharts from "echarts-for-react"
import {
  members,
  getFeatureValues,
  getFeatureDescription,
  isBinaryFeature,
  CLUSTER_COLORS,
} from "../../lib/dataUtils"

interface FeatureDistributionProps {
  feature: string
}

// ── Bucketing definitions ────────────────────────────────────────
// Each entry maps a feature key to an array of { label, min, max } buckets.
// Values satisfy: min <= value < max (last bucket uses <=).

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
    { label: "Low (0-0.2)", min: 0, max: 0.2 },
    { label: "Mild (0.2-0.35)", min: 0.2, max: 0.35 },
    { label: "Moderate (0.35-0.5)", min: 0.35, max: 0.5 },
    { label: "High (0.5-0.7)", min: 0.5, max: 0.7 },
    { label: "Critical (0.7+)", min: 0.7, max: Infinity },
  ],
  frailty_index: [
    { label: "Robust (0-0.05)", min: 0, max: 0.05 },
    { label: "Pre-frail (0.05-0.15)", min: 0.05, max: 0.15 },
    { label: "Mild (0.15-0.25)", min: 0.15, max: 0.25 },
    { label: "Moderate (0.25-0.35)", min: 0.25, max: 0.35 },
    { label: "Severe (0.35+)", min: 0.35, max: Infinity },
  ],
}

function assignBucket(value: number, buckets: Bucket[]): number {
  for (let i = 0; i < buckets.length; i++) {
    if (value >= buckets[i].min && value < buckets[i].max) return i
  }
  return buckets.length - 1
}

export function FeatureDistribution({ feature }: FeatureDistributionProps) {
  const desc = getFeatureDescription(feature)

  // Check if feature values are numeric
  const rawVals = members.map((m) => (m as Record<string, unknown>)[feature])
  const isNumeric = rawVals.every((v) => typeof v === "number")

  if (!isNumeric) {
    // Categorical: count occurrences
    const counts: Record<string, number> = {}
    rawVals.forEach((v) => {
      const key = String(v)
      counts[key] = (counts[key] || 0) + 1
    })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20)

    return (
      <ReactECharts
        option={{
          title: { text: desc, left: "center", textStyle: { color: "#f1f5f9", fontSize: 13 } },
          tooltip: { trigger: "axis" },
          grid: { left: 50, right: 20, bottom: 40, top: 50 },
          xAxis: {
            type: "category",
            data: entries.map(([k]) => k),
            axisLabel: { color: "#94a3b8", rotate: 30, fontSize: 10 },
            axisLine: { lineStyle: { color: "#334155" } },
          },
          yAxis: {
            type: "value",
            axisLabel: { color: "#94a3b8" },
            splitLine: { lineStyle: { color: "#1e293b" } },
          },
          series: [{ type: "bar", data: entries.map(([, v]) => v), itemStyle: { color: "#FF612B" } }],
        }}
        style={{ height: 300 }}
        theme="optumDark"
      />
    )
  }

  const binary = isBinaryFeature(feature)

  if (binary) {
    const clusters = [1, 2, 3, 4, 5, 6]
    const clusterTotals = clusters.map(
      (c) => members.filter((m) => m.cluster_label === c).length
    )
    const flaggedPct = clusters.map(
      (c, i) => {
        const flagged = members.filter(
          (m) => m.cluster_label === c && (m as Record<string, unknown>)[feature] === 1
        ).length
        return clusterTotals[i] > 0 ? Math.round((flagged / clusterTotals[i]) * 100) : 0
      }
    )

    return (
      <ReactECharts
        option={{
          title: { text: desc, left: "center", textStyle: { color: "#f1f5f9", fontSize: 13 } },
          tooltip: {
            trigger: "axis",
            formatter: (params: Array<{ name: string; value: number; dataIndex: number }>) => {
              const p = params[0]
              const total = clusterTotals[p.dataIndex]
              const count = Math.round((p.value / 100) * total)
              return `${p.name}: <b>${p.value}%</b> (${count}/${total} members)`
            },
          },
          grid: { left: 50, right: 20, bottom: 40, top: 50 },
          xAxis: {
            type: "category",
            data: clusters.map((c) => `C${c}`),
            axisLabel: { color: "#94a3b8" },
            axisLine: { lineStyle: { color: "#334155" } },
          },
          yAxis: {
            type: "value",
            name: "% Flagged",
            max: 100,
            axisLabel: { color: "#94a3b8", formatter: "{value}%" },
            splitLine: { lineStyle: { color: "#1e293b" } },
          },
          series: [
            {
              type: "bar",
              data: flaggedPct.map((v, i) => ({
                value: v,
                itemStyle: { color: CLUSTER_COLORS[clusters[i]] },
              })),
              barWidth: "50%",
            },
          ],
        }}
        style={{ height: 300 }}
        theme="optumDark"
      />
    )
  }

  // ── Bucketed features ──────────────────────────────────────────
  const bucketDef = BUCKET_DEFS[feature]
  if (bucketDef) {
    const values = getFeatureValues(feature)
    const bucketCounts = Array(bucketDef.length).fill(0) as number[]
    const bucketClusterColors: string[][] = Array.from({ length: bucketDef.length }, () => [])

    values.forEach((v, i) => {
      const idx = assignBucket(v, bucketDef)
      bucketCounts[idx]++
      bucketClusterColors[idx].push(CLUSTER_COLORS[members[i].cluster_label])
    })

    // Dominant cluster color per bucket
    const barColors = bucketClusterColors.map((colors) => {
      if (colors.length === 0) return "#334155"
      const counts: Record<string, number> = {}
      colors.forEach((c) => (counts[c] = (counts[c] || 0) + 1))
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    })

    return (
      <ReactECharts
        option={{
          title: { text: desc, left: "center", textStyle: { color: "#f1f5f9", fontSize: 13 } },
          tooltip: {
            trigger: "axis",
            formatter: (params: Array<{ name: string; value: number }>) => {
              const p = params[0]
              return `${p.name}: <b>${p.value}</b> members`
            },
          },
          grid: { left: 50, right: 20, bottom: 40, top: 50 },
          xAxis: {
            type: "category",
            data: bucketDef.map((b) => b.label),
            axisLabel: { color: "#94a3b8", fontSize: 11 },
            axisLine: { lineStyle: { color: "#334155" } },
          },
          yAxis: {
            type: "value",
            name: "Members",
            axisLabel: { color: "#94a3b8" },
            splitLine: { lineStyle: { color: "#1e293b" } },
          },
          series: [
            {
              type: "bar",
              data: bucketCounts.map((v, i) => ({ value: v, itemStyle: { color: barColors[i] } })),
              barWidth: "60%",
            },
          ],
        }}
        style={{ height: 300 }}
        theme="optumDark"
      />
    )
  }

  // ── Generic histogram for remaining continuous features ────────
  const values = getFeatureValues(feature)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const bins = 20
  const step = (max - min) / bins || 1
  const buckets = Array(bins).fill(0) as number[]
  const colorBuckets: string[][] = Array.from({ length: bins }, () => [])

  values.forEach((v, i) => {
    let idx = Math.floor((v - min) / step)
    if (idx >= bins) idx = bins - 1
    buckets[idx]++
    colorBuckets[idx].push(CLUSTER_COLORS[members[i].cluster_label])
  })

  const labels = Array.from({ length: bins }, (_, i) => {
    const val = min + i * step
    return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(1)
  })

  const barColors = colorBuckets.map((colors) => {
    if (colors.length === 0) return "#334155"
    const counts: Record<string, number> = {}
    colors.forEach((c) => (counts[c] = (counts[c] || 0) + 1))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  })

  return (
    <ReactECharts
      option={{
        title: { text: desc, left: "center", textStyle: { color: "#f1f5f9", fontSize: 13 } },
        tooltip: { trigger: "axis" },
        grid: { left: 50, right: 20, bottom: 40, top: 50 },
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: { color: "#94a3b8", rotate: 30, fontSize: 10 },
          axisLine: { lineStyle: { color: "#334155" } },
        },
        yAxis: {
          type: "value",
          name: "Count",
          axisLabel: { color: "#94a3b8" },
          splitLine: { lineStyle: { color: "#1e293b" } },
        },
        series: [
          {
            type: "bar",
            data: buckets.map((v, i) => ({ value: v, itemStyle: { color: barColors[i] } })),
            barWidth: "80%",
          },
        ],
      }}
      style={{ height: 300 }}
      theme="optumDark"
    />
  )
}
