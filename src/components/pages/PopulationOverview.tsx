import { useState, useEffect } from "react"
import { KPICard } from "../ui/KPICard"
import { CategoryDropdown } from "../ui/CategoryDropdown"
import { FeatureDistribution } from "../charts/FeatureDistribution"
import { BarChart } from "../charts/BarChart"
import { PieDonut } from "../charts/PieDonut"
import { CostHistogram } from "../charts/CostHistogram"
import {
  members,
  avg,
  getFeatureGroups,
  getFeaturesInGroup,
} from "../../lib/dataUtils"
import { formatCurrencyFull, formatNumber, formatDecimal } from "../../lib/format"

const GROUP_TAKEAWAYS: Record<string, string> = {
  Demographics:
    "The population spans ages 18-95 with a median around 59. The wide age range means no single age-targeted intervention will cover this cohort. Over 40% of members are 65+, driving Medicare and DSNP as dominant lines of business.",
  "Social Determinants of Health (SDOH)":
    "SDOH features reveal stark disparities across Arkansas. Members in Delta region ZIPs face 3-4x the distance to urgent care and 3x the rate of internet exclusion compared to urban areas. 15% of the population is HRSN-flagged, and food desert exposure correlates strongly with higher ER utilization.",
  "Clinical Utilization":
    "Utilization patterns are highly heterogeneous. The population averages 1.4 ER visits/year, but the top quintile exceeds 4 visits. Meanwhile, a significant subset has zero PCP engagement, using the ER as their sole point of care. Specialty visit patterns vary widely by disease burden.",
  "Cardiometabolic Diagnostics":
    "Approximately 50% of this population carries a diabetes diagnosis, and 55% have hypertension. These two conditions co-occur frequently, creating a compounding metabolic risk. About 16% have ESRD, and 35% carry heart disease flags. The diagnostic complexity of this cohort demands multi-specialty coordination.",
  "Risk & Vulnerability":
    "Risk scores span a 10x range across this population. Frailty indices range from near-zero to 0.40, while Charlson Comorbidity scores range from 0 to 9. The cardiometabolic risk score averages 0.35 but the top quartile exceeds 0.55, identifying members who need immediate intervention.",
  Financial:
    "Cost architecture varies dramatically across the population. Average PMPY is ~$51K, but the distribution is heavily right-skewed: the top 15% of members drive over 60% of total spend. Inpatient admissions are the single largest cost category, followed by pharmacy and specialty visits.",
  Outcomes:
    "Over 30% of the population is flagged by the high-risk utilization measure (ER-only care or 3+ ER visits). This metric identifies members falling through gaps in the care system - either lacking primary care access or experiencing acute disease exacerbations that could be managed outpatient.",
}

interface PopulationOverviewProps {
  onFeatureGroupChange?: (group: string) => void
}

export function PopulationOverview({ onFeatureGroupChange }: PopulationOverviewProps) {
  const [group, setGroup] = useState(getFeatureGroups()[0])
  const [selectedFeature, setSelectedFeature] = useState(getFeaturesInGroup(getFeatureGroups()[0])[0])

  const handleGroupChange = (g: string) => {
    setGroup(g)
    setSelectedFeature(getFeaturesInGroup(g)[0])
    onFeatureGroupChange?.(g)
  }

  useEffect(() => {
    onFeatureGroupChange?.(group)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const features = getFeaturesInGroup(group)

  const totalMembers = members.length
  const avgAge = avg(members.map((m) => m.age_at_pred))
  const avgCost = avg(members.map((m) => m.pmpy))
  const avgRiskScore = avg(members.map((m) => m.cardio_metabolic_risk_score))

  const ageBuckets = ["18-34", "35-49", "50-64", "65-79", "80+"]
  const ageRanges = [[18, 34], [35, 49], [50, 64], [65, 79], [80, 100]]
  const ageCounts = ageRanges.map(
    ([lo, hi]) => members.filter((m) => m.age_at_pred >= lo && m.age_at_pred <= hi).length
  )

  const maleCount = members.filter((m) => m.gender === "M").length
  const femaleCount = members.filter((m) => m.gender === "F").length

  const takeaway = GROUP_TAKEAWAYS[group] || GROUP_TAKEAWAYS["Demographics"]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Population Overview</h2>
        <p className="text-sm text-slate-400 mt-1">
          Full 500-member Arkansas cardiometabolic dataset at a glance
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Members" value={formatNumber(totalMembers)} subtitle="Arkansas cardiometabolic cohort" />
        <KPICard label="Average Age" value={formatDecimal(avgAge, 1)} subtitle="years" />
        <KPICard label="Average PMPY Cost" value={formatCurrencyFull(avgCost)} subtitle="per member per year" />
        <KPICard label="Avg Risk Score" value={formatDecimal(avgRiskScore, 3)} subtitle="cardiometabolic (0-1)" />
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Feature Explorer</h3>
          <div className="flex items-center gap-3">
            <CategoryDropdown value={group} onChange={handleGroupChange} />
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-optum cursor-pointer max-w-xs"
            >
              {features.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
        <FeatureDistribution feature={selectedFeature} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <BarChart
            title="Age Distribution"
            categories={ageBuckets}
            values={ageCounts}
            colors={["#3B82F6", "#3B82F6", "#F97316", "#EF4444", "#8B5CF6"]}
          />
        </div>
        <div className="glass-card p-4">
          <PieDonut
            title="Gender Split"
            data={[
              { name: "Male", value: maleCount, color: "#3B82F6" },
              { name: "Female", value: femaleCount, color: "#EC4899" },
            ]}
          />
        </div>
        <div className="glass-card p-4">
          <CostHistogram height={250} />
        </div>
      </div>

      <div className="glass-card p-4 border-l-4 border-optum">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-optum">Takeaway:</span> {takeaway}
        </p>
      </div>
    </div>
  )
}
