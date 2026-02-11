import { PersonaCard } from "../ui/PersonaCard"
import { BarChart } from "../charts/BarChart"
import { PieDonut } from "../charts/PieDonut"
import { CostHistogram } from "../charts/CostHistogram"
import { clusterPersonas } from "../../data/clusterPersonas"
import {
  clusterStats,
  membersInCluster,
  avg,
  CLUSTER_COLORS,
  CLUSTER_NAMES,
} from "../../lib/dataUtils"
import {
  formatDecimal,
  formatPercent,
  formatCurrency,
} from "../../lib/format"

interface ClusterDeepDiveProps {
  activeCluster: number
  onClusterChange: (c: number) => void
}

const CLUSTER_TAKEAWAYS: Record<number, string> = {
  1: "At-Risk Baseline members are in the earliest intervention window. Lifestyle modification programs and medication adherence support at $600-1,200/year per member could prevent 3-8x cost escalation as these members age into higher-risk clusters.",
  2: "Unmanaged Metabolic Syndrome is the highest-leverage intervention target. Intensive diabetes management and pharmacy optimization could prevent 15-20% of this cohort from experiencing cardiac events within 24 months, and delay ESRD progression by years.",
  3: "Advanced Heart Failure drives the highest acute-care spend. A 35% readmission rate at $15-25K per readmission makes this the fastest-ROI target for care transition and remote monitoring programs. Break-even within 4-6 months.",
  4: "Diabetic Nephropathy/ESRD contains the costliest individual members. Pre-ESRD diversion (targeting the 20% not yet on dialysis) saves $45K+ per diverted member. Home dialysis conversion for existing ESRD patients saves 30-40% vs. in-center treatment.",
  5: "Rural SDOH Crisis members have zero healthcare relationships. Community health workers, mobile health units, and transportation assistance must come first - clinical programs will fail without solving the access barrier. The ROI horizon is 5-10 years (preventing progression to Clusters 3/4).",
  6: "Frail Elderly Complex members need quality-of-life-focused care, not aggressive disease management. Polypharmacy review can safely eliminate 30% of medications, and advance care planning reduces unwanted ICU admissions by 50%.",
}

export function ClusterDeepDive({ activeCluster, onClusterChange }: ClusterDeepDiveProps) {
  const clusters = [1, 2, 3, 4, 5, 6]

  const stats = clusterStats(activeCluster)
  const m = membersInCluster(activeCluster)
  const persona = clusterPersonas.find((p) => p.id === activeCluster)!

  const lobs = ["Medicare", "Medicaid", "DSNP", "Commercial"]
  const lobCounts = lobs.map((l) => m.filter((x) => x.lob === l).length)

  const utilizationLabels = ["ER Visits", "PCP Visits", "Cardiology", "Endocrinology", "Nephrology", "Neurology"]
  const utilizationValues = [
    avg(m.map((x) => x.cnt_er_visits)),
    avg(m.map((x) => x.cnt_pcp_visits)),
    avg(m.map((x) => x.cardiology_visit_cnt)),
    avg(m.map((x) => x.endocrinology_visit_cnt)),
    avg(m.map((x) => x.nephrology_visit_cnt)),
    avg(m.map((x) => x.neurology_visit_cnt)),
  ]

  const sdohLabels = ["Dist to UC (mi)", "No Internet %", "Unemploy %", "No Vehicle %", "Below Poverty %"]
  const sdohValues = [
    avg(m.map((x) => x.hifld_dist_uc_zp)),
    avg(m.map((x) => x.acs_pct_hh_no_internet_zc)),
    avg(m.map((x) => x.acs_pct_unemploy_zc)),
    avg(m.map((x) => x.acs_pct_work_no_car_zc)),
    avg(m.map((x) => x.acs_pct_hh_no_fd_stmp_blw_pov_zc)),
  ]

  const costData = [
    { name: "Inpatient", value: Math.round(avg(m.map((x) => x.ip_allowed_amt))), color: "#EF4444" },
    { name: "Outpatient", value: Math.round(avg(m.map((x) => x.op_allowed_amt))), color: "#F97316" },
    { name: "Physician", value: Math.round(avg(m.map((x) => x.phys_allowed_amt))), color: "#3B82F6" },
    { name: "Pharmacy", value: Math.round(avg(m.map((x) => x.rx_allowed_amt))), color: "#8B5CF6" },
  ]

  const takeaway = CLUSTER_TAKEAWAYS[activeCluster]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100">Cluster Deep Dive</h2>
        <p className="text-sm text-slate-400 mt-1">
          Each segment has a distinct clinical story
        </p>
      </div>

      <div className="flex gap-2">
        {clusters.map((c) => (
          <button
            key={c}
            onClick={() => onClusterChange(c)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeCluster === c
                ? "text-white"
                : "bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
            style={
              activeCluster === c
                ? { backgroundColor: CLUSTER_COLORS[c], borderColor: CLUSTER_COLORS[c] }
                : {}
            }
          >
            <span className="mr-1">{c}.</span> {CLUSTER_NAMES[c]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-9 gap-3">
        <StatBox label="Members" value={String(stats.count)} />
        <StatBox label="Avg Age" value={formatDecimal(stats.avgAge, 1)} />
        <StatBox label="Avg PMPY" value={formatCurrency(stats.avgCost)} />
        <StatBox label="Severity" value={formatDecimal(stats.avgSeverity, 2)} />
        <StatBox label="Diabetes" value={formatPercent(stats.pctDiabetes, 0)} />
        <StatBox label="Heart Dz" value={formatPercent(stats.pctHeart, 0)} />
        <StatBox label="ESRD" value={formatPercent(stats.pctESRD, 0)} />
        <StatBox label="Avg ER" value={formatDecimal(stats.avgER, 1)} />
        <StatBox label="Risk Score" value={formatDecimal(stats.avgRiskScore, 3)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PersonaCard key={activeCluster} persona={persona} animate={true} />
        <div className="glass-card p-4">
          <CostHistogram clusterId={activeCluster} height={260} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <BarChart
            title="Avg Utilization"
            categories={utilizationLabels}
            values={utilizationValues.map((v) => Math.round(v * 10) / 10)}
            colors={Array(6).fill(CLUSTER_COLORS[activeCluster])}
            height={250}
          />
        </div>
        <div className="glass-card p-4">
          <BarChart
            title="SDOH Factors"
            categories={sdohLabels}
            values={sdohValues.map((v) => Math.round(v * 10) / 10)}
            colors={Array(5).fill("#3B82F6")}
            height={250}
          />
        </div>
        <div className="glass-card p-4">
          <PieDonut
            title="Avg Cost Breakdown"
            data={costData}
            height={250}
          />
        </div>
      </div>

      <div className="glass-card p-4">
        <BarChart
          title="Line of Business Distribution"
          categories={lobs}
          values={lobCounts}
          colors={["#3B82F6", "#22C55E", "#F97316", "#8B5CF6"]}
          height={200}
        />
      </div>

      <div className="glass-card p-4 border-l-4" style={{ borderColor: CLUSTER_COLORS[activeCluster] }}>
        <p className="text-sm text-slate-300">
          <span className="font-semibold" style={{ color: CLUSTER_COLORS[activeCluster] }}>
            Takeaway:
          </span>{" "}
          {takeaway}
        </p>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-bold text-slate-100 mt-1">{value}</div>
    </div>
  )
}
