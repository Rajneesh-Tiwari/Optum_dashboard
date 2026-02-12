import rawData from "../data/ar_cardiometabolic_demo_data.json"
import featureMetadata from "../data/ui_feature_metadata.json"

export type Member = (typeof rawData)[number]
export const members: Member[] = rawData
export const metadata = featureMetadata as Record<
  string,
  { features: string[]; descriptions: Record<string, string> }
>

export const CLUSTER_COLORS: Record<number, string> = {
  1: "#89BEC0",
  2: "#B0A5D4",
  3: "#E8BA98",
  4: "#8CB8D8",
  5: "#D8A8B8",
  6: "#A8C8A0",
}

export const CLUSTER_NAMES: Record<number, string> = {
  1: "At-Risk Baseline",
  2: "Unmanaged Metabolic Syndrome",
  3: "Advanced Heart Failure",
  4: "Diabetic Nephropathy / ESRD",
  5: "Rural SDOH Crisis",
  6: "Frail Elderly Complex",
}

export function membersInCluster(clusterId: number): Member[] {
  return members.filter((m) => m.cluster_label === clusterId)
}

export function avg(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

export function countWhere(arr: Member[], key: keyof Member, value: unknown): number {
  return arr.filter((m) => m[key] === value).length
}

export function getFeatureValues(feature: string): number[] {
  return members.map((m) => (m as Record<string, unknown>)[feature] as number)
}

export function getClusterFeatureValues(clusterId: number, feature: string): number[] {
  return membersInCluster(clusterId).map(
    (m) => (m as Record<string, unknown>)[feature] as number
  )
}

export function getFeatureGroups(): string[] {
  return Object.keys(metadata)
}

const EXCLUDED_FEATURES = new Set(["member_id", "state", "cluster_label"])

export function getFeaturesInGroup(group: string): string[] {
  return (metadata[group]?.features ?? []).filter((f) => !EXCLUDED_FEATURES.has(f))
}

export function getFeatureDescription(feature: string): string {
  for (const group of Object.values(metadata)) {
    if (feature in group.descriptions) {
      return group.descriptions[feature]
    }
  }
  return feature
}

export function isBinaryFeature(feature: string): boolean {
  const vals = getFeatureValues(feature)
  return vals.every((v) => v === 0 || v === 1)
}

export function clusterStats(clusterId: number) {
  const m = membersInCluster(clusterId)
  return {
    count: m.length,
    avgAge: avg(m.map((x) => x.age_at_pred)),
    avgCost: avg(m.map((x) => x.pmpy)),
    avgSeverity: avg(m.map((x) => x.avg_severity_level)),
    avgFrailty: avg(m.map((x) => x.frailty_index)),
    avgCCI: avg(m.map((x) => x.charleston_comorbidity_score_cci)),
    avgER: avg(m.map((x) => x.cnt_er_visits)),
    avgPCP: avg(m.map((x) => x.cnt_pcp_visits)),
    pctDiabetes: (countWhere(m, "DIABETES_FLAG", 1) / m.length) * 100,
    pctHyper: (countWhere(m, "HYPER_FLAG", 1) / m.length) * 100,
    pctHeart: (countWhere(m, "HEART_FLAG", 1) / m.length) * 100,
    pctESRD: (countWhere(m, "esrd_flag", 1) / m.length) * 100,
    pctKidney: (countWhere(m, "KIDNEY_FLAG", 1) / m.length) * 100,
    avgRiskScore: avg(m.map((x) => x.cardio_metabolic_risk_score)),
  }
}

// ── Sankey data builders ─────────────────────────────────────────

const SHORT_CLUSTER_NAMES: Record<number, string> = {
  1: "C1: At-Risk",
  2: "C2: Metabolic",
  3: "C3: Heart Fail.",
  4: "C4: ESRD",
  5: "C5: Rural SDOH",
  6: "C6: Frail Elderly",
}

export function getClusterCompositionSankey(clusterId?: number) {
  const pool = clusterId ? membersInCluster(clusterId) : members

  // Age groups -> LOB -> Clusters
  const ageGroups = [
    { label: "18-44", min: 18, max: 45 },
    { label: "45-64", min: 45, max: 65 },
    { label: "65-79", min: 65, max: 80 },
    { label: "80+", min: 80, max: 200 },
  ]
  const lobs = ["Medicare", "Medicaid", "DSNP", "Commercial"]
  const clusters = [1, 2, 3, 4, 5, 6]

  const allNodes = [
    ...ageGroups.map((a) => ({ name: a.label })),
    ...lobs.map((l) => ({ name: l })),
    ...clusters.map((c) => ({ name: SHORT_CLUSTER_NAMES[c], itemStyle: { color: CLUSTER_COLORS[c] } })),
  ]

  const links: { source: string; target: string; value: number }[] = []

  // Age -> LOB links
  for (const age of ageGroups) {
    for (const lob of lobs) {
      const count = pool.filter(
        (m) => m.age_at_pred >= age.min && m.age_at_pred < age.max && m.lob === lob
      ).length
      if (count > 0) links.push({ source: age.label, target: lob, value: count })
    }
  }

  // LOB -> Cluster links
  for (const lob of lobs) {
    for (const c of clusters) {
      const count = pool.filter(
        (m) => m.lob === lob && m.cluster_label === c
      ).length
      if (count > 0) links.push({ source: lob, target: SHORT_CLUSTER_NAMES[c], value: count })
    }
  }

  // Only keep nodes that appear in links
  const usedNames = new Set(links.flatMap((l) => [l.source, l.target]))
  const nodes = allNodes.filter((n) => usedNames.has(n.name))

  return { nodes, links }
}

export function getRiskFactorFlowSankey(clusterId?: number) {
  const pool = clusterId ? membersInCluster(clusterId) : members

  // Conditions -> Severity tiers -> Cost tiers
  const conditions = [
    { label: "Diabetes", key: "DIABETES_FLAG" },
    { label: "Hypertension", key: "HYPER_FLAG" },
    { label: "Heart Disease", key: "HEART_FLAG" },
    { label: "Kidney Disease", key: "KIDNEY_FLAG" },
    { label: "ESRD", key: "esrd_flag" },
  ]

  const severityTiers = [
    { label: "Low Severity", min: 0, max: 2 },
    { label: "Mod Severity", min: 2, max: 3.5 },
    { label: "High Severity", min: 3.5, max: 100 },
  ]

  const costTiers = [
    { label: "Low Cost (<$20K)", min: 0, max: 20000 },
    { label: "Med Cost ($20-60K)", min: 20000, max: 60000 },
    { label: "High Cost ($60K+)", min: 60000, max: 10000000 },
  ]

  const costCategories = [
    { label: "Inpatient", key: "ip_allowed_amt" as keyof Member, color: "#D8A8B8" },
    { label: "Outpatient", key: "op_allowed_amt" as keyof Member, color: "#E8BA98" },
    { label: "Physician", key: "phys_allowed_amt" as keyof Member, color: "#8CB8D8" },
    { label: "Pharmacy", key: "rx_allowed_amt" as keyof Member, color: "#B0A5D4" },
  ]

  const allNodes = [
    ...conditions.map((c) => ({ name: c.label })),
    ...severityTiers.map((s) => ({ name: s.label })),
    ...costTiers.map((c) => ({ name: c.label })),
    ...costCategories.map((c) => ({ name: c.label, itemStyle: { color: c.color } })),
  ]

  const links: { source: string; target: string; value: number }[] = []

  // Condition -> Severity
  for (const cond of conditions) {
    const flagged = pool.filter((m) => (m as Record<string, unknown>)[cond.key] === 1)
    for (const sev of severityTiers) {
      const count = flagged.filter(
        (m) => m.avg_severity_level >= sev.min && m.avg_severity_level < sev.max
      ).length
      if (count > 0) links.push({ source: cond.label, target: sev.label, value: count })
    }
  }

  // Severity -> Cost Tier
  for (const sev of severityTiers) {
    const sevPool = pool.filter(
      (m) => m.avg_severity_level >= sev.min && m.avg_severity_level < sev.max
    )
    for (const cost of costTiers) {
      const count = sevPool.filter(
        (m) => m.pmpy >= cost.min && m.pmpy < cost.max
      ).length
      if (count > 0) links.push({ source: sev.label, target: cost.label, value: count })
    }
  }

  // Cost Tier -> Cost Category (proportional member distribution by spend share)
  for (const cost of costTiers) {
    const tierPool = pool.filter(
      (m) => m.pmpy >= cost.min && m.pmpy < cost.max
    )
    if (tierPool.length === 0) continue
    const catSpends = costCategories.map((cat) =>
      tierPool.reduce((s, m) => s + (m[cat.key] as number), 0)
    )
    const totalAllCats = catSpends.reduce((a, b) => a + b, 0)
    if (totalAllCats === 0) continue
    for (let i = 0; i < costCategories.length; i++) {
      const share = catSpends[i] / totalAllCats
      const memberShare = Math.round(tierPool.length * share)
      if (memberShare > 0) {
        links.push({ source: cost.label, target: costCategories[i].label, value: memberShare })
      }
    }
  }

  // Only keep nodes that appear in links
  const usedNames = new Set(links.flatMap((l) => [l.source, l.target]))
  const nodes = allNodes.filter((n) => usedNames.has(n.name))

  return { nodes, links }
}

// ── Population flow sankey (Age -> LOB -> Risk -> Cost) ──────────

export function getPopulationFlowSankey() {
  const ageGroups = [
    { label: "18-34", min: 18, max: 35 },
    { label: "35-49", min: 35, max: 50 },
    { label: "50-64", min: 50, max: 65 },
    { label: "65-79", min: 65, max: 80 },
    { label: "80+", min: 80, max: 200 },
  ]

  const lobs = ["Medicare", "Medicaid", "DSNP", "Commercial"]

  const riskTiers = [
    { label: "Low Risk", min: 0, max: 0.25 },
    { label: "Moderate Risk", min: 0.25, max: 0.45 },
    { label: "High Risk", min: 0.45, max: 0.65 },
    { label: "Critical Risk", min: 0.65, max: 1.01 },
  ]

  const costTiers = [
    { label: "Under $25K", min: 0, max: 25000 },
    { label: "$25-50K", min: 25000, max: 50000 },
    { label: "$50-100K", min: 50000, max: 100000 },
    { label: "$100K+", min: 100000, max: 10000000 },
  ]

  const ageColors = ["#89BEC0", "#8CB8D8", "#A8C8A0", "#B0A5D4", "#D8A8B8"]
  const lobColors: Record<string, string> = {
    Medicare: "#B0A5D4", Medicaid: "#89BEC0", DSNP: "#E8BA98", Commercial: "#D8A8B8",
  }
  const riskColors = ["#A8C8A0", "#E8BA98", "#D8A8B8", "#B0A5D4"]
  const costColors = ["#A8C8A0", "#89BEC0", "#8CB8D8", "#D8A8B8"]

  const nodes = [
    ...ageGroups.map((a, i) => ({ name: a.label, itemStyle: { color: ageColors[i] } })),
    ...lobs.map((l) => ({ name: l, itemStyle: { color: lobColors[l] } })),
    ...riskTiers.map((r, i) => ({ name: r.label, itemStyle: { color: riskColors[i] } })),
    ...costTiers.map((c, i) => ({ name: c.label, itemStyle: { color: costColors[i] } })),
  ]

  const links: { source: string; target: string; value: number }[] = []

  // Age -> LOB
  for (const age of ageGroups) {
    for (const lob of lobs) {
      const count = members.filter(
        (m) => m.age_at_pred >= age.min && m.age_at_pred < age.max && m.lob === lob
      ).length
      if (count > 0) links.push({ source: age.label, target: lob, value: count })
    }
  }

  // LOB -> Risk
  for (const lob of lobs) {
    for (const risk of riskTiers) {
      const count = members.filter(
        (m) =>
          m.lob === lob &&
          m.cardio_metabolic_risk_score >= risk.min &&
          m.cardio_metabolic_risk_score < risk.max
      ).length
      if (count > 0) links.push({ source: lob, target: risk.label, value: count })
    }
  }

  // Risk -> Cost
  for (const risk of riskTiers) {
    for (const cost of costTiers) {
      const count = members.filter(
        (m) =>
          m.cardio_metabolic_risk_score >= risk.min &&
          m.cardio_metabolic_risk_score < risk.max &&
          m.pmpy >= cost.min &&
          m.pmpy < cost.max
      ).length
      if (count > 0) links.push({ source: risk.label, target: cost.label, value: count })
    }
  }

  return { nodes, links }
}

// ── Sankey node member stats (for detail panes) ─────────────────

export interface NodeStats {
  nodeName: string
  nodeCategory: string
  count: number
  avgAge: number
  avgCost: number
  avgRiskScore: number
  avgSeverity: number
  avgER: number
  pctDiabetes: number
  pctHypertension: number
  pctHeartDisease: number
  pctESRD: number
  topCluster: { name: string; count: number; color: string }
  avgFrailty: number
}

function computeNodeStats(pool: Member[], nodeName: string, nodeCategory: string): NodeStats {
  const n = pool.length
  if (n === 0) {
    return {
      nodeName, nodeCategory, count: 0, avgAge: 0, avgCost: 0, avgRiskScore: 0,
      avgSeverity: 0, avgER: 0, pctDiabetes: 0, pctHypertension: 0,
      pctHeartDisease: 0, pctESRD: 0, topCluster: { name: "-", count: 0, color: "#999" },
      avgFrailty: 0,
    }
  }
  const clusterCounts: Record<number, number> = {}
  pool.forEach((m) => {
    clusterCounts[m.cluster_label] = (clusterCounts[m.cluster_label] || 0) + 1
  })
  const topC = Object.entries(clusterCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
  const topClusterId = Number(topC[0])

  return {
    nodeName,
    nodeCategory,
    count: n,
    avgAge: avg(pool.map((m) => m.age_at_pred)),
    avgCost: avg(pool.map((m) => m.pmpy)),
    avgRiskScore: avg(pool.map((m) => m.cardio_metabolic_risk_score)),
    avgSeverity: avg(pool.map((m) => m.avg_severity_level)),
    avgER: avg(pool.map((m) => m.cnt_er_visits)),
    pctDiabetes: (countWhere(pool, "DIABETES_FLAG", 1) / n) * 100,
    pctHypertension: (countWhere(pool, "HYPER_FLAG", 1) / n) * 100,
    pctHeartDisease: (countWhere(pool, "HEART_FLAG", 1) / n) * 100,
    pctESRD: (countWhere(pool, "esrd_flag", 1) / n) * 100,
    topCluster: {
      name: CLUSTER_NAMES[topClusterId] || `Cluster ${topClusterId}`,
      count: Number(topC[1]),
      color: CLUSTER_COLORS[topClusterId] || "#999",
    },
    avgFrailty: avg(pool.map((m) => m.frailty_index)),
  }
}

const NODE_FILTERS: Record<string, { category: string; filter: (m: Member) => boolean }> = {
  // Age groups (population flow)
  "18-34": { category: "Age Group", filter: (m) => m.age_at_pred >= 18 && m.age_at_pred < 35 },
  "35-49": { category: "Age Group", filter: (m) => m.age_at_pred >= 35 && m.age_at_pred < 50 },
  "50-64": { category: "Age Group", filter: (m) => m.age_at_pred >= 50 && m.age_at_pred < 65 },
  "65-79": { category: "Age Group", filter: (m) => m.age_at_pred >= 65 && m.age_at_pred < 80 },
  "80+": { category: "Age Group", filter: (m) => m.age_at_pred >= 80 },
  // Age groups (composition sankey)
  "18-44": { category: "Age Group", filter: (m) => m.age_at_pred >= 18 && m.age_at_pred < 45 },
  "45-64": { category: "Age Group", filter: (m) => m.age_at_pred >= 45 && m.age_at_pred < 65 },
  // LOB
  Medicare: { category: "Line of Business", filter: (m) => m.lob === "Medicare" },
  Medicaid: { category: "Line of Business", filter: (m) => m.lob === "Medicaid" },
  DSNP: { category: "Line of Business", filter: (m) => m.lob === "DSNP" },
  Commercial: { category: "Line of Business", filter: (m) => m.lob === "Commercial" },
  // Risk tiers
  "Low Risk": { category: "Risk Tier", filter: (m) => m.cardio_metabolic_risk_score < 0.25 },
  "Moderate Risk": { category: "Risk Tier", filter: (m) => m.cardio_metabolic_risk_score >= 0.25 && m.cardio_metabolic_risk_score < 0.45 },
  "High Risk": { category: "Risk Tier", filter: (m) => m.cardio_metabolic_risk_score >= 0.45 && m.cardio_metabolic_risk_score < 0.65 },
  "Critical Risk": { category: "Risk Tier", filter: (m) => m.cardio_metabolic_risk_score >= 0.65 },
  // Cost tiers
  "Under $25K": { category: "Cost Tier", filter: (m) => m.pmpy < 25000 },
  "$25-50K": { category: "Cost Tier", filter: (m) => m.pmpy >= 25000 && m.pmpy < 50000 },
  "$50-100K": { category: "Cost Tier", filter: (m) => m.pmpy >= 50000 && m.pmpy < 100000 },
  "$100K+": { category: "Cost Tier", filter: (m) => m.pmpy >= 100000 },
  // Conditions
  Diabetes: { category: "Condition", filter: (m) => (m as Record<string, unknown>).DIABETES_FLAG === 1 },
  Hypertension: { category: "Condition", filter: (m) => (m as Record<string, unknown>).HYPER_FLAG === 1 },
  "Heart Disease": { category: "Condition", filter: (m) => (m as Record<string, unknown>).HEART_FLAG === 1 },
  "Kidney Disease": { category: "Condition", filter: (m) => (m as Record<string, unknown>).KIDNEY_FLAG === 1 },
  ESRD: { category: "Condition", filter: (m) => (m as Record<string, unknown>).esrd_flag === 1 },
  // Severity tiers
  "Low Severity": { category: "Severity", filter: (m) => m.avg_severity_level < 2 },
  "Mod Severity": { category: "Severity", filter: (m) => m.avg_severity_level >= 2 && m.avg_severity_level < 3.5 },
  "High Severity": { category: "Severity", filter: (m) => m.avg_severity_level >= 3.5 },
  // Cost categories
  "Low Cost (<$20K)": { category: "Cost Tier", filter: (m) => m.pmpy < 20000 },
  "Med Cost ($20-60K)": { category: "Cost Tier", filter: (m) => m.pmpy >= 20000 && m.pmpy < 60000 },
  "High Cost ($60K+)": { category: "Cost Tier", filter: (m) => m.pmpy >= 60000 },
  // Cost type (approximate: members where that category is dominant)
  Inpatient: { category: "Cost Category", filter: (m) => m.ip_allowed_amt > m.op_allowed_amt && m.ip_allowed_amt > m.rx_allowed_amt },
  Outpatient: { category: "Cost Category", filter: (m) => m.op_allowed_amt > m.ip_allowed_amt && m.op_allowed_amt > m.rx_allowed_amt },
  Physician: { category: "Cost Category", filter: (m) => m.phys_allowed_amt > m.ip_allowed_amt && m.phys_allowed_amt > m.op_allowed_amt },
  Pharmacy: { category: "Cost Category", filter: (m) => m.rx_allowed_amt > m.ip_allowed_amt && m.rx_allowed_amt > m.op_allowed_amt },
  // Clusters
  "C1: At-Risk": { category: "Segment", filter: (m) => m.cluster_label === 1 },
  "C2: Metabolic": { category: "Segment", filter: (m) => m.cluster_label === 2 },
  "C3: Heart Fail.": { category: "Segment", filter: (m) => m.cluster_label === 3 },
  "C4: ESRD": { category: "Segment", filter: (m) => m.cluster_label === 4 },
  "C5: Rural SDOH": { category: "Segment", filter: (m) => m.cluster_label === 5 },
  "C6: Frail Elderly": { category: "Segment", filter: (m) => m.cluster_label === 6 },
}

export function getNodeMemberStats(nodeName: string, clusterScope?: number): NodeStats | null {
  const entry = NODE_FILTERS[nodeName]
  if (!entry) return null
  const pool = clusterScope ? membersInCluster(clusterScope) : members
  const filtered = pool.filter(entry.filter)
  return computeNodeStats(filtered, nodeName, entry.category)
}

// ── Intervention planner cost breakdowns ─────────────────────────

export interface CostBreakdown {
  ip: number
  op: number
  phys: number
  rx: number
  total: number
  count: number
  totalIP: number
  totalOP: number
  totalPhys: number
  totalRx: number
  totalCost: number
}

export function clusterCostBreakdown(clusterId: number): CostBreakdown {
  const m = membersInCluster(clusterId)
  const count = m.length
  const ip = avg(m.map((x) => x.ip_allowed_amt))
  const op = avg(m.map((x) => x.op_allowed_amt))
  const phys = avg(m.map((x) => x.phys_allowed_amt))
  const rx = avg(m.map((x) => x.rx_allowed_amt))
  return {
    ip,
    op,
    phys,
    rx,
    total: ip + op + phys + rx,
    count,
    totalIP: sum(m.map((x) => x.ip_allowed_amt)),
    totalOP: sum(m.map((x) => x.op_allowed_amt)),
    totalPhys: sum(m.map((x) => x.phys_allowed_amt)),
    totalRx: sum(m.map((x) => x.rx_allowed_amt)),
    totalCost: sum(m.map((x) => x.pmpy)),
  }
}

export interface PercentileCost {
  percentile: number
  avgCost: number
  avgRisk: number
  count: number
}

export function clusterRiskPercentileCostMap(clusterId: number): PercentileCost[] {
  const m = membersInCluster(clusterId)
  const sorted = [...m].sort((a, b) => a.cardio_metabolic_risk_score - b.cardio_metabolic_risk_score)
  const deciles: PercentileCost[] = []
  for (let p = 10; p <= 100; p += 10) {
    const start = Math.floor(((p - 10) / 100) * sorted.length)
    const end = Math.floor((p / 100) * sorted.length)
    const bucket = sorted.slice(start, end)
    if (bucket.length > 0) {
      deciles.push({
        percentile: p,
        avgCost: avg(bucket.map((x) => x.pmpy)),
        avgRisk: avg(bucket.map((x) => x.cardio_metabolic_risk_score)),
        count: bucket.length,
      })
    }
  }
  return deciles
}

// ── County aggregation for heatmap ───────────────────────────────

export interface CountyStat {
  name: string
  memberCount: number
  avgRiskScore: number
  avgCost: number
  avgAge: number
  pctDiabetes: number
  pctHypertension: number
  pctHeartDisease: number
  avgERVisits: number
  avgFrailty: number
  avgComorbidity: number
}

// All 75 Arkansas counties
const ALL_COUNTIES = [
  "Arkansas","Ashley","Baxter","Benton","Boone","Bradley","Calhoun","Carroll",
  "Chicot","Clark","Clay","Cleburne","Cleveland","Columbia","Conway","Craighead",
  "Crawford","Crittenden","Cross","Dallas","Desha","Drew","Faulkner","Franklin",
  "Fulton","Garland","Grant","Greene","Hempstead","Hot Spring","Howard",
  "Independence","Izard","Jackson","Jefferson","Johnson","Lafayette","Lawrence",
  "Lee","Lincoln","Little River","Logan","Lonoke","Madison","Marion","Miller",
  "Mississippi","Monroe","Montgomery","Nevada","Newton","Ouachita","Perry",
  "Phillips","Pike","Poinsett","Polk","Pope","Prairie","Pulaski","Randolph",
  "Saline","Scott","Searcy","Sebastian","Sevier","Sharp","St. Francis","Stone",
  "Union","Van Buren","Washington","White","Woodruff","Yell",
]

// Seeded pseudo-random for consistent synthetic data
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

export function getCountyStats(): CountyStat[] {
  // Real data from members
  const countyMap: Record<string, Member[]> = {}
  for (const m of members) {
    const county = m.county
    if (!county) continue
    if (!countyMap[county]) countyMap[county] = []
    countyMap[county].push(m)
  }

  const realStats = new Map<string, CountyStat>()
  for (const [name, cm] of Object.entries(countyMap)) {
    realStats.set(name, {
      name,
      memberCount: cm.length,
      avgRiskScore: avg(cm.map((x) => x.cardio_metabolic_risk_score)),
      avgCost: avg(cm.map((x) => x.pmpy)),
      avgAge: avg(cm.map((x) => x.age_at_pred)),
      pctDiabetes: cm.length > 0 ? (countWhere(cm, "DIABETES_FLAG", 1) / cm.length) * 100 : 0,
      pctHypertension: cm.length > 0 ? (countWhere(cm, "HYPER_FLAG", 1) / cm.length) * 100 : 0,
      pctHeartDisease: cm.length > 0 ? (countWhere(cm, "HEART_FLAG", 1) / cm.length) * 100 : 0,
      avgERVisits: avg(cm.map((x) => x.cnt_er_visits)),
      avgFrailty: avg(cm.map((x) => x.frailty_index)),
      avgComorbidity: avg(cm.map((x) => x.charleston_comorbidity_score_cci)),
    })
  }

  // Generate plausible synthetic data for counties without real members
  return ALL_COUNTIES.map((name) => {
    if (realStats.has(name)) return realStats.get(name)!
    const rand = seededRandom(name.length * 31 + name.charCodeAt(0) * 17)
    const memberCount = Math.floor(rand() * 35) + 5
    return {
      name,
      memberCount,
      avgRiskScore: 0.15 + rand() * 0.45,
      avgCost: 15000 + rand() * 70000,
      avgAge: 42 + rand() * 30,
      pctDiabetes: 20 + rand() * 55,
      pctHypertension: 25 + rand() * 50,
      pctHeartDisease: 10 + rand() * 40,
      avgERVisits: 0.5 + rand() * 3,
      avgFrailty: 0.02 + rand() * 0.3,
      avgComorbidity: 0.5 + rand() * 5,
    }
  })
}
