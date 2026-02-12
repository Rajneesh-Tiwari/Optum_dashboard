export interface ClusterPersona {
  id: number
  name: string
  short: string
  color: string
  narrative: string
  keyFeatures: string[]
}

export const clusterPersonas: ClusterPersona[] = [
  {
    id: 1,
    name: "At-Risk Baseline",
    short: "Mild Hypertension",
    color: "#60A5FA",
    narrative:
      "Primarily younger adults with emerging hypertension (HYPER_FLAG). Low interaction with specialty care; standard PCP adherence. This cohort represents the earliest intervention window - lifestyle modifications and medication adherence programs could prevent progression to more severe cardiometabolic disease states.",
    keyFeatures: [
      "Ages 30-55, mixed gender",
      "60% hypertension prevalence",
      "Low specialty utilization",
      "Lowest cost cluster",
      "Best trajectory for early intervention",
    ],
  },
  {
    id: 2,
    name: "Unmanaged Metabolic Syndrome",
    short: "Diabetes + Hypertension",
    color: "#34D399",
    narrative:
      "High prevalence of dual-diagnosis Diabetes and Hypertension. Significant utilization of Endocrinology, driving higher pharmacy cost risks (rx_cost_risk). This population is at an inflection point - without intensive management, they will progress toward cardiac events and renal complications within 18-24 months.",
    keyFeatures: [
      "100% diabetes + hypertension comorbidity",
      "High endocrinology visit counts",
      "Elevated rx_cost_risk (15-35)",
      "Rising cardiovascular risk",
      "Key target for diabetes management programs",
    ],
  },
  {
    id: 3,
    name: "Advanced Heart Failure",
    short: "Cardiac High-Acuity",
    color: "#A78BFA",
    narrative:
      "High-acuity cardiac cohort defined by frequent Cardiology touchpoints, severe inpatient costs, and elevated 30-day readmission rates. These members drive disproportionate cost - the top decile accounts for over 40% of total inpatient spend. Remote monitoring and care coordination are critical.",
    keyFeatures: [
      "Ages 60-85, 35% readmission rate",
      "100% heart + cardiovascular flags",
      "Highest cardiology visit frequency",
      "8x cost multiplier vs baseline",
      "Highest inpatient utilization",
    ],
  },
  {
    id: 4,
    name: "Diabetic Nephropathy / ESRD",
    short: "Kidney Disease",
    color: "#F472B6",
    narrative:
      "Severe metabolic progression resulting in Kidney Disease and ESRD flags. Distinctive spikes in Nephrology visits and the highest demographic medical risk scores. This cluster includes the most expensive individual members in the population - ESRD management alone averages $90K+ annually per member.",
    keyFeatures: [
      "80% ESRD flag prevalence",
      "Highest nephrology visit counts (5+ avg)",
      "100% diabetes + kidney disease",
      "Highest demo_medrx_100k_risk (40-80)",
      "Critical for CKD care management",
    ],
  },
  {
    id: 5,
    name: "Rural SDOH Crisis",
    short: "Arkansas Delta Profile",
    color: "#38BDF8",
    narrative:
      "Geographically isolated population reflecting severe Arkansas rurality. Characterized by extreme distances to Urgent Care (hifld_dist_uc_zp) and lack of broadband access. Clinical profile shows zero PCP engagement but high ER utilization for acute diabetic episodes. This is the population that falls through every crack in the traditional healthcare system.",
    keyFeatures: [
      "Zero PCP visits - ER as primary care",
      "45+ mile avg distance to urgent care",
      "35% without internet access",
      "100% HRSN flagged",
      "70% Delta region concentration",
    ],
  },
  {
    id: 6,
    name: "Frail Elderly Complex",
    short: "Geriatric Cardio-Metabolic",
    color: "#FBBF24",
    narrative:
      "Geriatric cohort (75+) with compounding cardiometabolic issues. High Frailty Indices and Charlson Comorbidity scores driven by overlapping Heart, Stroke, and cognitive flags. These members require integrated geriatric care models that address polypharmacy, fall risk, and care transitions simultaneously.",
    keyFeatures: [
      "Ages 75-95, highest frailty index",
      "Charlson CCI 4-9",
      "100% heart flag, 30% stroke",
      "High neurology utilization",
      "3x cost multiplier, complex care needs",
    ],
  },
]
