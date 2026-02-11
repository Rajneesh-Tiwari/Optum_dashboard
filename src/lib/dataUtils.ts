import rawData from "../data/ar_cardiometabolic_demo_data.json"
import featureMetadata from "../data/ui_feature_metadata.json"

export type Member = (typeof rawData)[number]
export const members: Member[] = rawData
export const metadata = featureMetadata as Record<
  string,
  { features: string[]; descriptions: Record<string, string> }
>

export const CLUSTER_COLORS: Record<number, string> = {
  1: "#EF4444",
  2: "#F97316",
  3: "#EAB308",
  4: "#22C55E",
  5: "#3B82F6",
  6: "#8B5CF6",
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

export function getFeaturesInGroup(group: string): string[] {
  return metadata[group]?.features ?? []
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
