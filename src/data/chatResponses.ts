export interface Source {
  label: string
  url: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  sources?: Source[]
}

export interface SimulationStep {
  text: string
  durationMs: number
}

export const SIMULATION_STEPS: SimulationStep[] = [
  { text: "Parsing Arkansas state SDOH parameters...", durationMs: 800 },
  { text: "Querying cardiometabolic feature store...", durationMs: 1200 },
  { text: "Running population segmentation analysis...", durationMs: 1000 },
  { text: "Synthesizing insights...", durationMs: 600 },
]

// ── Page 1: Population Overview ──────────────────────────────────

const PAGE1_QUERIES = [
  "What are the biggest cost drivers in this population?",
  "Show me the ESRD prevalence across this population",
  "How do social determinants impact this population?",
] as const

const PAGE1_RESPONSES: Record<string, ChatMessage> = {
  cost_drivers: {
    role: "assistant",
    content: `Analyzing cost drivers across the 500-member Arkansas cardiometabolic population:

**Top Cost Drivers (by total allowed amount):**
- **Inpatient admissions** account for the largest share of spend, concentrated in Clusters 3 (Heart Failure) and 4 (ESRD) which carry an 8x cost multiplier
- **Pharmacy costs** are the second largest driver, especially in Cluster 2 (Unmanaged Metabolic Syndrome) where dual diabetes + hypertension require complex medication regimens
- **ER utilization as primary care** in Cluster 5 (Rural SDOH Crisis) creates avoidable acute spend - these members average 4+ ER visits/year with zero PCP engagement

**Key Insight:** The top 15% of members (Clusters 3 and 4) drive over 60% of total population cost. Targeted care management for these two segments would yield the highest ROI.`,
    sources: [
      { label: "CMS Chronic Conditions Dashboard, 2024", url: "https://www.cms.gov/data-research/statistics-trends-and-reports/chronic-conditions" },
      { label: "Optum Internal: AR Cardiometabolic Cost Analysis, Q3 2024", url: "#optum-internal" },
      { label: "Anderson GF et al. Health Affairs, 2019 - Concentration of Health Expenditures", url: "https://pubmed.ncbi.nlm.nih.gov/31542749/" },
    ],
  },
  esrd: {
    role: "assistant",
    content: `**ESRD Prevalence Analysis:**

Across the 500-member population, approximately 15-16% carry an active ESRD flag. The distribution is highly concentrated:

- **Cluster 4 (Diabetic Nephropathy/ESRD):** ~80% ESRD prevalence - this is the primary ESRD cohort
- **Cluster 6 (Frail Elderly):** ~15% ESRD prevalence - secondary to multi-organ decline
- **Cluster 3 (Heart Failure):** ~10% ESRD prevalence - cardiorenal syndrome overlap
- **Clusters 1, 2, 5:** Minimal ESRD flags (<5%)

**Geographic Pattern:** ESRD prevalence correlates strongly with Delta region counties, where poverty rates exceed 25% and distances to nephrology care average 35+ miles.

**Clinical Implication:** Pre-ESRD identification (eGFR monitoring in Cluster 2 members with rising creatinine) could divert 20-30% of future dialysis initiations.`,
    sources: [
      { label: "USRDS Annual Data Report 2023 - ESRD Incidence & Prevalence", url: "https://usrds-adr.niddk.nih.gov/2023" },
      { label: "Optum Internal: AR Nephrology Utilization Report, 2024", url: "#optum-internal" },
      { label: "Saran R et al. Am J Kidney Dis, 2020 - US Renal Data System", url: "https://pubmed.ncbi.nlm.nih.gov/32005440/" },
      { label: "Arkansas DHS: County-Level ESRD Prevalence Map, 2023", url: "https://www.healthy.arkansas.gov/programs-services/topics/chronic-disease" },
    ],
  },
  sdoh: {
    role: "assistant",
    content: `**Social Determinants Impact on Population Health:**

This population exhibits stark SDOH disparities that directly drive clinical outcomes:

**Access Barriers:**
- 17% of the population lives >30 miles from urgent care
- 15% of workers lack personal vehicle access
- Cluster 5 members average 45+ miles to nearest UC (vs. 12 miles population average)

**Socioeconomic Factors:**
- Average ZIP-level unemployment: ~10%, spiking to 18%+ in Delta region
- 24% average poverty rate in member ZIP codes
- 14% average with less than high school education

**Digital Divide:**
- 12% population average without internet, but 35%+ in rural Cluster 5
- This directly blocks telehealth adoption for the members who need it most

**Correlation:** Members in high-SDOH-burden ZIPs show 1.8x higher ER utilization and near-zero preventive care engagement. Addressing transportation and broadband access could unlock primary care for ~85 currently unreachable members.`,
    sources: [
      { label: "Healthy People 2030 - Social Determinants of Health", url: "https://health.gov/healthypeople/priority-areas/social-determinants-health" },
      { label: "AHRQ: SDOH & Healthcare Utilization, 2023", url: "https://www.ahrq.gov/sdoh/data-analytics/index.html" },
      { label: "Optum Internal: AR ZIP-Level SDOH Stratification, 2024", url: "#optum-internal" },
      { label: "ACS 5-Year Estimates: Arkansas, 2022", url: "https://data.census.gov/table/ACSST5Y2022.S1701" },
    ],
  },
}

// ── Page 2: AI Segmentation ──────────────────────────────────────

const PAGE2_QUERIES = [
  "Which cluster is the most expensive and why?",
  "How distinct are these 6 clusters from each other?",
  "What intervention opportunities exist across segments?",
] as const

const PAGE2_RESPONSES: Record<string, ChatMessage> = {
  most_expensive: {
    role: "assistant",
    content: `**Most Expensive Cluster Analysis:**

**Cluster 3 (Advanced Heart Failure)** and **Cluster 4 (Diabetic Nephropathy/ESRD)** are the costliest, both carrying an **8x cost multiplier** versus baseline:

**Cluster 3 - Advanced Heart Failure:**
- Driven by frequent inpatient admissions and 35% 30-day readmission rates
- Highest cardiology visit frequency (6+ per year)
- 100% heart disease + cardiovascular flags
- Average PMPY exceeds $80K for the highest-acuity members

**Cluster 4 - Diabetic Nephropathy/ESRD:**
- ESRD management alone averages $90K+ annually per member
- Highest nephrology utilization (5+ visits/year)
- 100% diabetes + kidney disease comorbidity
- Highest demographic medical risk scores (demo_medrx_100k_risk: 40-80)

**Key Difference:** Cluster 3 cost is driven by acute events (readmissions, ER). Cluster 4 cost is driven by chronic management (dialysis, specialty visits). Different cost drivers require different intervention strategies.`,
    sources: [
      { label: "Heidenreich PA et al. Circulation, 2022 - Heart Failure Cost Projections", url: "https://pubmed.ncbi.nlm.nih.gov/35078371/" },
      { label: "USRDS 2023: Cost of ESRD by Treatment Modality", url: "https://usrds-adr.niddk.nih.gov/2023/end-stage-renal-disease/11-medicare-expenditures-for-persons-with-esrd" },
      { label: "Optum Internal: AR High-Cost Claimant Segmentation, 2024", url: "#optum-internal" },
    ],
  },
  distinctness: {
    role: "assistant",
    content: `**Cluster Separation Analysis:**

The 6 clusters show strong separation across multiple dimensions:

**Age Stratification:**
- Clusters 1 & 5: Younger (30-55, 35-70) - preventive opportunity
- Clusters 2 & 4: Middle-aged (40-65, 50-75) - active disease management
- Clusters 3 & 6: Older (60-85, 75-95) - complex care coordination

**Utilization Signatures:**
- Each cluster has a distinct "specialty fingerprint" - Cluster 2 peaks in Endocrinology, Cluster 3 in Cardiology, Cluster 4 in Nephrology, Cluster 6 across multiple specialties
- Cluster 5 is uniquely defined by ZERO PCP engagement + high ER use

**Cost Architecture:**
- Clusters 1 & 5: Low per-member cost but high avoidable utilization
- Cluster 2: Moderate cost, pharmacy-driven
- Clusters 3 & 4: High cost, 8x multiplier
- Cluster 6: Moderate-high cost (3x), complexity-driven

**The radar chart confirms:** No single cluster dominates across all dimensions. Each has a distinctive profile that demands a tailored strategy.`,
    sources: [
      { label: "Optum Internal: Population Segmentation Methodology, 2024", url: "#optum-internal" },
      { label: "Yan S et al. BMC Health Serv Res, 2020 - Clustering High-Cost Patients", url: "https://pubmed.ncbi.nlm.nih.gov/32423456/" },
      { label: "CMS Innovation Center: Risk Stratification Models", url: "https://www.cms.gov/priorities/innovation/key-concepts/risk-stratification" },
    ],
  },
  interventions: {
    role: "assistant",
    content: `**Intervention Opportunity Matrix:**

Each cluster maps to specific, evidence-based interventions:

**Cluster 1 (At-Risk Baseline):** Lifestyle modification programs, medication adherence support, annual wellness visits. Estimated cost avoidance: $2-4K PMPY.

**Cluster 2 (Unmanaged Metabolic Syndrome):** Intensive diabetes management, endocrinology care coordination, pharmacy optimization. Could prevent 30% of cardiac events within 24 months.

**Cluster 3 (Heart Failure):** Remote patient monitoring, care transition programs, readmission prevention protocols. Target: reduce 35% readmission rate to <20%.

**Cluster 4 (ESRD):** CKD care management for pre-ESRD members, dialysis cost negotiation, transplant evaluation acceleration. Highest per-member savings potential: $45K+ per diverted dialysis initiation.

**Cluster 5 (Rural SDOH):** Community health workers, mobile health units, asynchronous telehealth, transportation assistance. Foundational - must establish care access before clinical programs.

**Cluster 6 (Frail Elderly):** Integrated geriatric care models, polypharmacy review, fall prevention, palliative care conversations. Focus on quality-of-life metrics alongside cost.`,
    sources: [
      { label: "AHRQ Evidence Report: Care Coordination Strategies, 2022", url: "https://www.ahrq.gov/research/findings/evidence-based-reports/caregapupd-evidence-report.html" },
      { label: "Optum Internal: Intervention ROI Calculator, 2024", url: "#optum-internal" },
      { label: "ADA Standards of Care 2024 - Diabetes Self-Management", url: "https://diabetesjournals.org/care/issue/47/Supplement_1" },
      { label: "AHA Scientific Statement: Readmission Reduction in HF", url: "https://pubmed.ncbi.nlm.nih.gov/31567048/" },
    ],
  },
}

// ── Page 3: Cluster Deep Dive (cluster-aware) ────────────────────

const CLUSTER_RESPONSES: Record<number, Record<string, ChatMessage>> = {
  1: {
    risks: {
      role: "assistant",
      content: `**Cluster 1 (At-Risk Baseline) - Key Clinical Risks:**

This is your early-stage cohort - the window of opportunity is now:

- **Hypertension progression:** 60% already flagged. Without management, expect 30-40% to develop stage 2 hypertension within 18 months
- **Metabolic trajectory:** Low current severity (1.2 avg) but BMI and sedentary indicators suggest pre-diabetic trajectory for ~25% of members
- **Care gap risk:** Standard PCP adherence today, but these members are the least "activated" - a single life event (job loss, move) could push them to disengagement
- **Cost escalation:** Currently lowest-cost cluster, but each member who progresses to Cluster 2 or 3 represents a 3-8x cost increase

**Action Window:** 12-18 months before progression accelerates.`,
      sources: [
        { label: "Whelton PK et al. JACC, 2018 - ACC/AHA Hypertension Guidelines", url: "https://pubmed.ncbi.nlm.nih.gov/29133356/" },
        { label: "Optum Internal: Cluster Migration Analysis, 2024", url: "#optum-internal" },
        { label: "CDC: Hypertension Prevalence Among Adults, 2023", url: "https://www.cdc.gov/bloodpressure/facts.htm" },
      ],
    },
    interventions: {
      role: "assistant",
      content: `**Best Interventions for At-Risk Baseline:**

This cluster responds best to low-intensity, scalable programs:

1. **Digital wellness coaching** - App-based BP monitoring + lifestyle nudges. Cost: ~$50/member/month. Expected reach: 60%+ of this younger demographic
2. **Medication adherence programs** - Automated refill reminders, generic substitution optimization. Reduces hypertension medication gaps by 40%
3. **Annual wellness visit incentives** - Many have standard PCP adherence but skip preventive screenings. $50 gift card incentive has shown 2.3x screening completion rates
4. **Employer wellness partnerships** - This cohort skews younger and commercially insured. Workplace programs amplify engagement

**ROI Profile:** Low per-member investment ($600-1,200/year), moderate savings ($2-4K PMPY avoided cost), but excellent population-level ROI due to large cohort size.`,
      sources: [
        { label: "Diabetes Prevention Program Research Group, NEJM, 2002", url: "https://pubmed.ncbi.nlm.nih.gov/11832527/" },
        { label: "Optum Wellness Program Outcomes Report, 2023", url: "#optum-internal" },
        { label: "USPSTF: Behavioral Counseling for CVD Prevention", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/healthy-diet-and-physical-activity-counseling-adults-with-cardiovascular-risk-factors-behavioral-counseling" },
      ],
    },
    comparison: {
      role: "assistant",
      content: `**Cluster 1 vs. Population Baseline:**

| Metric | Cluster 1 | Population Avg |
|--------|-----------|----------------|
| Avg Age | 42 | 59 |
| Avg PMPY | Lowest | $51K |
| ER Visits | 0.8/yr | 1.4/yr |
| PCP Visits | 3.0/yr | 3.2/yr |
| Severity | 1.2 | 2.6 |
| Diabetes % | 15% | ~50% |
| ESRD % | 0% | 16% |

**Key Differences:** Cluster 1 is the youngest, healthiest, and cheapest segment. Their clinical profile is 70% below population average on severity and cost. The gap between their current state and the population average represents the progression risk we're trying to prevent.`,
      sources: [
        { label: "Optum Internal: AR Population Baseline Report, 2024", url: "#optum-internal" },
        { label: "CMS Chronic Conditions Chartbook, 2023", url: "https://www.cms.gov/data-research/statistics-trends-and-reports/chronic-conditions/chartbook" },
      ],
    },
  },
  2: {
    risks: {
      role: "assistant",
      content: `**Cluster 2 (Unmanaged Metabolic Syndrome) - Key Clinical Risks:**

This cohort is at an inflection point - the next 18 months are critical:

- **Cardiac event risk:** 100% carry both diabetes + hypertension. Without intervention, 15-20% will experience a major cardiac event within 2 years
- **Renal progression:** 15% already show kidney flag. Uncontrolled diabetes is the #1 pathway to ESRD (Cluster 4)
- **Pharmacy complexity:** Highest rx_cost_risk scores (15-35). Polypharmacy increases adverse drug interaction risk
- **Endocrinology dependency:** 4+ endocrinology visits/year signals active disease that PCP alone cannot manage

**Critical Metric:** A1C trajectories. Members with rising A1C despite endocrinology engagement may need insulin intensification or GLP-1 therapy.`,
      sources: [
        { label: "ADA Standards of Care 2024 - Pharmacologic Approaches", url: "https://diabetesjournals.org/care/issue/47/Supplement_1" },
        { label: "Optum Internal: Metabolic Syndrome Cohort Tracking, 2024", url: "#optum-internal" },
        { label: "Arnett DK et al. Circulation, 2019 - ACC/AHA CVD Primary Prevention", url: "https://pubmed.ncbi.nlm.nih.gov/30879355/" },
      ],
    },
    interventions: {
      role: "assistant",
      content: `**Best Interventions for Unmanaged Metabolic Syndrome:**

1. **Intensive diabetes management** - Dedicated diabetes care coordinators, continuous glucose monitoring (CGM) for highest-risk members. Target: A1C reduction of 1.5 points in 6 months
2. **Pharmacy optimization** - Medication therapy management (MTM) reviews, therapeutic substitution for high-cost brands. Potential 20% rx cost reduction
3. **Cardiology risk screening** - Proactive cardiac stress testing for members with >2 risk factors. Early detection prevents $50K+ acute cardiac events
4. **Behavioral health integration** - 30% of poorly controlled diabetes correlates with depression/anxiety. Integrated behavioral health improves medication adherence by 35%

**ROI:** Moderate per-member investment ($3-5K/year), high savings potential ($15-25K PMPY avoided cost from prevented hospitalizations and delayed ESRD progression).`,
      sources: [
        { label: "Intensive Blood-Glucose Control with Sulphonylureas - UKPDS 33, Lancet, 1998", url: "https://pubmed.ncbi.nlm.nih.gov/9742976/" },
        { label: "Optum Internal: Diabetes Care Coordination ROI, 2023", url: "#optum-internal" },
        { label: "Zhuo X et al. Diabetes Care, 2013 - Cost-Effectiveness of Interventions", url: "https://pubmed.ncbi.nlm.nih.gov/23468088/" },
      ],
    },
    comparison: {
      role: "assistant",
      content: `**Cluster 2 vs. Population Baseline:**

| Metric | Cluster 2 | Population Avg |
|--------|-----------|----------------|
| Avg Age | 52 | 59 |
| Diabetes | 100% | ~50% |
| Hypertension | 100% | ~55% |
| Endocrinology Visits | 4+/yr | 1.2/yr |
| rx_cost_risk | 25 | 15 |
| ER Visits | 1.5/yr | 1.4/yr |
| Severity | 2.5 | 2.6 |

**Key Insight:** Cluster 2 is close to population average on age and severity, but dramatically over-indexed on metabolic disease. This is the "silent escalation" cluster - they don't look expensive yet, but their disease trajectory is pointed directly at Clusters 3 and 4.`,
      sources: [
        { label: "Optum Internal: AR Population Baseline Report, 2024", url: "#optum-internal" },
        { label: "Grundy SM et al. Circulation, 2005 - Metabolic Syndrome Scientific Statement", url: "https://pubmed.ncbi.nlm.nih.gov/16157765/" },
      ],
    },
  },
  3: {
    risks: {
      role: "assistant",
      content: `**Cluster 3 (Advanced Heart Failure) - Key Clinical Risks:**

This is the highest-acuity acute-care cluster:

- **Readmission crisis:** 35% 30-day readmission rate is 3x the national average. Each readmission costs $15-25K
- **Mortality risk:** Advanced heart failure with 100% HEART_FLAG and CARDIO_CIRCUL_FLAG. 1-year mortality risk for this profile is 15-20%
- **Polypharmacy burden:** Average 8+ medications. Drug interaction risk is severe, especially ACE inhibitors + potassium-sparing diuretics
- **Cardiorenal syndrome:** 25% also carry KIDNEY_FLAG. Heart failure + kidney disease creates a bidirectional deterioration cycle
- **Cognitive impact:** High neurology utilization suggests cognitive decline complicating self-management

**Cost Reality:** This cluster drives disproportionate inpatient spend. The top decile accounts for >40% of total IP costs.`,
      sources: [
        { label: "Heidenreich PA et al. Circulation, 2022 - AHA Heart Failure Statistics", url: "https://pubmed.ncbi.nlm.nih.gov/35078371/" },
        { label: "Optum Internal: AR Readmission Analysis, Q2 2024", url: "#optum-internal" },
        { label: "Dharmarajan K et al. JAMA, 2013 - 30-Day Readmission Rates", url: "https://pubmed.ncbi.nlm.nih.gov/23443106/" },
      ],
    },
    interventions: {
      role: "assistant",
      content: `**Best Interventions for Advanced Heart Failure:**

1. **Remote patient monitoring (RPM)** - Daily weight, BP, and symptom tracking. Detects decompensation 48-72 hours before hospitalization. Evidence shows 30% readmission reduction
2. **Transition of care programs** - Nurse navigator contact within 48 hours of discharge, medication reconciliation, follow-up appointment scheduling. Targets the critical 30-day readmission window
3. **Palliative care integration** - Not end-of-life. Symptom management, advance care planning, quality-of-life focus. Reduces unwanted aggressive interventions by 40%
4. **Heart failure clinic enrollment** - Dedicated multidisciplinary HF clinics show 25% mortality reduction in NYHA Class III-IV patients

**ROI:** High per-member investment ($8-12K/year), but very high savings potential ($30-50K PMPY from readmission prevention). Break-even within 4-6 months for most members.`,
      sources: [
        { label: "Koehler F et al. Lancet, 2018 - TIM-HF2 Remote Monitoring Trial", url: "https://pubmed.ncbi.nlm.nih.gov/30153985/" },
        { label: "CMS Hospital Readmissions Reduction Program, 2024", url: "https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps/hospital-readmissions-reduction-program-hrrp" },
        { label: "Optum Internal: Care Transition Program ROI, 2023", url: "#optum-internal" },
      ],
    },
    comparison: {
      role: "assistant",
      content: `**Cluster 3 vs. Population Baseline:**

| Metric | Cluster 3 | Population Avg |
|--------|-----------|----------------|
| Avg Age | 72 | 59 |
| Heart Disease | 100% | ~35% |
| Readmission Rate | 35% | 12% |
| Cardiology Visits | 6+/yr | 1.5/yr |
| ER Visits | 3+/yr | 1.4/yr |
| Severity | 3.5 | 2.6 |
| PMPY | 8x baseline | $51K |

**Key Insight:** Cluster 3 is the most resource-intensive segment by utilization pattern. They consume 3x the ER visits, 4x the cardiology visits, and 3x the readmissions. Cost management here is primarily about preventing acute episodes, not reducing chronic management spend.`,
      sources: [
        { label: "Optum Internal: AR Population Baseline Report, 2024", url: "#optum-internal" },
        { label: "AHA Heart Disease & Stroke Statistics, 2024", url: "https://pubmed.ncbi.nlm.nih.gov/38264914/" },
      ],
    },
  },
  4: {
    risks: {
      role: "assistant",
      content: `**Cluster 4 (Diabetic Nephropathy / ESRD) - Key Clinical Risks:**

The most expensive per-member cohort in the population:

- **Dialysis dependency:** 80% carry active ESRD flag. Each dialysis-dependent member costs $90K+/year in treatment alone
- **Metabolic complexity:** 100% diabetes + kidney disease creates medication management nightmare - most diabetes drugs are renally cleared
- **Vascular access complications:** Dialysis patients face 20-30% annual rate of access-related hospitalizations
- **Cardiovascular crossover:** 30% also carry HEART_FLAG - cardiac death is the #1 cause of mortality in ESRD patients
- **Transplant underutilization:** Only ~15% of eligible ESRD patients are on transplant waitlists

**Financial Reality:** This cluster has the highest demo_medrx_100k_risk scores (40-80), reflecting the convergence of multiple high-cost disease states.`,
      sources: [
        { label: "USRDS 2023 Annual Data Report - ESRD Treatment Costs", url: "https://usrds-adr.niddk.nih.gov/2023" },
        { label: "Optum Internal: AR Nephrology Cohort Analysis, 2024", url: "#optum-internal" },
        { label: "Afkarian M et al. JASN, 2013 - Kidney Disease and CVD in Diabetes", url: "https://pubmed.ncbi.nlm.nih.gov/23539758/" },
      ],
    },
    interventions: {
      role: "assistant",
      content: `**Best Interventions for Diabetic Nephropathy / ESRD:**

1. **Pre-ESRD care management** - For the 20% not yet on dialysis: aggressive eGFR monitoring, ACE/ARB optimization, SGLT2 inhibitor initiation. Each diverted dialysis start saves $45K+/year
2. **Home dialysis conversion** - Peritoneal dialysis and home hemodialysis cost 30-40% less than in-center hemodialysis with comparable outcomes. Current home dialysis rates are only ~12%
3. **Transplant evaluation acceleration** - Proactive transplant workup for eligible members. A successful transplant saves $200K+ over 5 years vs. continued dialysis
4. **Vascular access optimization** - Fistula-first programs reduce access complications by 50%. Pre-emptive fistula placement before dialysis initiation is critical
5. **Integrated nephrology-endocrinology care** - Co-management of diabetes + CKD with shared protocols reduces conflicting medication decisions

**ROI:** Very high per-member investment ($12-20K/year), but highest absolute savings potential in the population.`,
      sources: [
        { label: "KDIGO 2024 Clinical Practice Guideline for CKD", url: "https://pubmed.ncbi.nlm.nih.gov/36904135/" },
        { label: "Heerspink HJL et al. NEJM, 2020 - Dapagliflozin in CKD (DAPA-CKD)", url: "https://pubmed.ncbi.nlm.nih.gov/32970396/" },
        { label: "Optum Internal: Home Dialysis Cost Comparison, 2023", url: "#optum-internal" },
        { label: "USRDS: Transplant vs Dialysis Cost Analysis, 2023", url: "https://usrds-adr.niddk.nih.gov/2023/end-stage-renal-disease/11-medicare-expenditures-for-persons-with-esrd" },
      ],
    },
    comparison: {
      role: "assistant",
      content: `**Cluster 4 vs. Population Baseline:**

| Metric | Cluster 4 | Population Avg |
|--------|-----------|----------------|
| Avg Age | 62 | 59 |
| ESRD | 80% | 16% |
| Kidney Disease | 100% | ~20% |
| Nephrology Visits | 5+/yr | 0.8/yr |
| demo_medrx_risk | 60 | 22 |
| Severity | 3.8 | 2.6 |
| PMPY | 8x baseline | $51K |

**Key Insight:** Cluster 4 has the highest medical risk scores in the population (demo_medrx_100k_risk 40-80 vs. 22 average). Nephrology utilization is 6x the population average. This is the only cluster where the primary cost driver is a single disease pathway (CKD/ESRD) rather than multi-system complexity.`,
      sources: [
        { label: "Optum Internal: AR Population Baseline Report, 2024", url: "#optum-internal" },
        { label: "USRDS 2023: Costs of CKD by Stage", url: "https://usrds-adr.niddk.nih.gov/2023" },
      ],
    },
  },
  5: {
    risks: {
      role: "assistant",
      content: `**Cluster 5 (Rural SDOH Crisis) - Key Clinical Risks:**

This cohort falls through every crack in the traditional healthcare system:

- **Zero primary care engagement:** Average PCP visits = 0. These members have no ongoing clinical relationship
- **ER as primary care:** 4+ ER visits/year for acute episodes (diabetic crises, hypertensive emergencies) that should be managed outpatient
- **Geographic isolation:** 45+ miles to nearest urgent care, 35+ miles to nearest ED. A medical emergency is a 90-minute round trip
- **Digital exclusion:** 35% without internet access eliminates standard telehealth as a solution
- **Unmanaged diabetes:** 70% diabetes prevalence with zero endocrinology engagement. These members are progressing silently toward Cluster 4 (ESRD)
- **100% HRSN flagged:** Every member in this cluster has documented health-related social needs

**Root Cause:** This is fundamentally an access problem, not a clinical complexity problem. The clinical profile is moderate - but the absence of any care relationship makes it the highest-risk trajectory in the population.`,
      sources: [
        { label: "HRSA: Health Professional Shortage Areas - Arkansas, 2024", url: "https://data.hrsa.gov/tools/shortage-area/hpsa-find" },
        { label: "Optum Internal: AR Rural Access Gap Analysis, 2024", url: "#optum-internal" },
        { label: "Arkansas DHS: Health Equity Report, 2023", url: "https://www.healthy.arkansas.gov/programs-services/topics/health-equity" },
        { label: "Douthit N et al. J Gen Intern Med, 2015 - Rural Health Disparities", url: "https://pubmed.ncbi.nlm.nih.gov/25678375/" },
      ],
    },
    interventions: {
      role: "assistant",
      content: `**Best Interventions for Rural SDOH Crisis:**

This cluster requires a completely different intervention model - clinical programs will fail without first solving access:

1. **Community health workers (CHWs)** - Trusted local workforce that can bridge the cultural and geographic gap. Door-to-door engagement, appointment facilitation, medication delivery. Evidence: 40% improvement in care engagement
2. **Mobile health units** - Monthly clinic visits to Delta region communities. Basic labs, medication management, diabetes education. Brings care to where members live
3. **Asynchronous telehealth** - Store-and-forward technology that works on low-bandwidth connections. Members photograph wounds, log glucose readings offline, sync when connectivity is available
4. **Transportation assistance** - Medicaid transportation benefit activation, volunteer driver networks, ride-share partnerships. Removes the #1 stated barrier to care
5. **Food security programs** - Partner with local food banks for diabetic-appropriate nutrition. 40%+ live in food deserts

**ROI:** Low per-member cost ($2-4K/year), moderate savings from ER diversion ($5-10K PMPY), but the real value is preventing 10-year progression to Clusters 3/4 ($60K+ PMPY).`,
      sources: [
        { label: "Kangovi S et al. JAMA Intern Med, 2020 - CHW Impact on Health Outcomes", url: "https://pubmed.ncbi.nlm.nih.gov/31710345/" },
        { label: "Optum Internal: Mobile Health Unit Pilot Results, 2023", url: "#optum-internal" },
        { label: "FCC: Broadband Deployment Report - Arkansas, 2023", url: "https://www.fcc.gov/reports-research/reports/broadband-progress-reports" },
      ],
    },
    comparison: {
      role: "assistant",
      content: `**Cluster 5 vs. Population Baseline:**

| Metric | Cluster 5 | Population Avg |
|--------|-----------|----------------|
| Avg Age | 52 | 59 |
| PCP Visits | 0/yr | 3.2/yr |
| ER Visits | 4+/yr | 1.4/yr |
| Dist to UC | 45 mi | 15 mi |
| No Internet | 35% | 12% |
| HRSN Flag | 100% | 15% |
| Diabetes | 70% | ~50% |

**Key Insight:** Cluster 5 is the starkest outlier in the population. It is the only cluster with ZERO PCP engagement, yet has the HIGHEST ER utilization. The 45-mile distance to urgent care is 3.7x the population average. This is what healthcare disparity looks like in data form.`,
      sources: [
        { label: "Optum Internal: AR Population Baseline Report, 2024", url: "#optum-internal" },
        { label: "HRSA: Rural Health Information Hub - Arkansas", url: "https://www.ruralhealthinfo.org/states/arkansas" },
      ],
    },
  },
  6: {
    risks: {
      role: "assistant",
      content: `**Cluster 6 (Frail Elderly Complex) - Key Clinical Risks:**

The most medically complex cohort, requiring integrated geriatric care:

- **Multi-system disease burden:** Charlson CCI 4-9 (population avg ~2). Multiple organ systems failing simultaneously
- **Frailty:** Highest frailty index (0.15-0.40). Each hospitalization risks a permanent functional decline
- **Fall risk:** High frailty + polypharmacy + neurology involvement = elevated fall and fracture risk
- **Cognitive decline:** High neurology utilization (2+ visits/yr) suggests cognitive comorbidities complicating self-management
- **Stroke history:** 30% carry STROKE_FLAG, adding neurological rehabilitation needs
- **Polypharmacy cascade:** Overlapping cardiology, endocrinology, and neurology prescriptions create dangerous interaction potential

**Care Complexity:** These members see 4+ specialists, take 10+ medications, and have caregivers making most healthcare decisions. The coordination burden alone drives significant cost.`,
      sources: [
        { label: "Clegg A et al. Lancet, 2013 - Frailty in Elderly People", url: "https://pubmed.ncbi.nlm.nih.gov/23395245/" },
        { label: "Optum Internal: AR Frail Elderly Cohort Profile, 2024", url: "#optum-internal" },
        { label: "Boyd CM et al. JAMA, 2005 - Clinical Practice Guidelines & Multimorbidity", url: "https://pubmed.ncbi.nlm.nih.gov/16145017/" },
      ],
    },
    interventions: {
      role: "assistant",
      content: `**Best Interventions for Frail Elderly Complex:**

This cluster needs quality-of-life-focused care, not aggressive disease management:

1. **Comprehensive geriatric assessment** - Structured evaluation of functional status, cognition, nutrition, social support. Establishes realistic care goals and avoids overtreatment
2. **Polypharmacy review** - Formal deprescribing protocol. Studies show 30% of medications in this demographic can be safely discontinued, reducing adverse events by 40%
3. **Care transitions nursing** - Dedicated nurse navigators for hospital-to-home transitions. Frail elderly lose 10% functional capacity per hospitalization without active rehabilitation
4. **Advance care planning** - Goals-of-care conversations with members and families. Reduces unwanted ICU admissions by 50% and improves end-of-life quality
5. **Home-based primary care** - House calls for members too frail for office visits. Reduces ER visits by 30% and hospitalizations by 20%

**ROI:** Moderate investment ($5-8K/year), savings come primarily from avoided hospitalizations and reduced ICU days. Quality metrics (functional status, patient satisfaction) should be primary outcomes.`,
      sources: [
        { label: "Scott IA et al. JAMA Intern Med, 2015 - Deprescribing Framework", url: "https://pubmed.ncbi.nlm.nih.gov/26052551/" },
        { label: "Edes T et al. JAGS, 2014 - Home-Based Primary Care", url: "https://pubmed.ncbi.nlm.nih.gov/25040793/" },
        { label: "Optum Internal: Geriatric Care Model Outcomes, 2023", url: "#optum-internal" },
        { label: "AGS Beers Criteria 2023 - Potentially Inappropriate Medications", url: "https://pubmed.ncbi.nlm.nih.gov/36602233/" },
      ],
    },
    comparison: {
      role: "assistant",
      content: `**Cluster 6 vs. Population Baseline:**

| Metric | Cluster 6 | Population Avg |
|--------|-----------|----------------|
| Avg Age | 84 | 59 |
| Frailty Index | 0.28 | 0.08 |
| Charlson CCI | 6.5 | 2.1 |
| Heart Disease | 100% | ~35% |
| Stroke | 30% | ~8% |
| Neurology Visits | 2+/yr | 0.5/yr |
| PMPY | 3x baseline | $51K |

**Key Insight:** Cluster 6 is the oldest cohort by 12+ years and has the highest comorbidity burden. The frailty index is 3.5x the population average. Unlike Clusters 3/4 which are defined by a single dominant disease pathway, Cluster 6 is defined by the compounding effect of multiple moderate-severity conditions on a frail substrate.`,
      sources: [
        { label: "Optum Internal: AR Population Baseline Report, 2024", url: "#optum-internal" },
        { label: "Fried LP et al. J Gerontol, 2001 - Frailty in Older Adults", url: "https://pubmed.ncbi.nlm.nih.gov/11253156/" },
      ],
    },
  },
}

// ── Page 3: Intervention Planner ─────────────────────────────────

const PAGE3_QUERIES = [
  "Which segment has the highest ROI for intervention?",
  "How sensitive are savings to population reach?",
  "What's the total projected savings across all segments?",
] as const

const PAGE3_RESPONSES: Record<string, ChatMessage> = {
  highest_roi: {
    role: "assistant",
    content: `**Highest ROI Intervention Analysis:**

Ranking segments by intervention ROI (at default parameters):

1. **S1: At-Risk Baseline** - Highest ROI ratio due to low program cost ($75/mo) relative to prevented escalation. Every $1 invested prevents $3-8 in future spend.
2. **S3: Heart Failure** - High absolute savings from readmission reduction, but higher program cost ($800/mo). Break-even in 4-6 months.
3. **S5: Rural SDOH** - Moderate ROI with outsized long-term value. Preventing progression from this segment to Clusters 3/4 avoids $60K+ PMPY over 10 years.

**Key Insight:** S1 offers the best ratio, but S3 offers the highest absolute dollar savings. Budget-constrained plans should prioritize S1; plans optimizing total cost reduction should start with S3.`,
    sources: [
      { label: "HWHI Internal: Intervention ROI Models, 2024", url: "#optum-internal" },
      { label: "CMS Chronic Conditions Dashboard", url: "https://www.cms.gov/data-research/statistics-trends-and-reports/chronic-conditions" },
      { label: "Knowler WC et al. NEJM 2002 - Diabetes Prevention Program", url: "https://pubmed.ncbi.nlm.nih.gov/11832527/" },
    ],
  },
  sensitivity: {
    role: "assistant",
    content: `**Population Reach Sensitivity Analysis:**

Population reach is the single most impactful slider for total portfolio savings:

- **At 50% reach:** Portfolio savings are roughly half of maximum. Good for pilot programs.
- **At 75% reach:** Diminishing returns begin for most segments. Sweet spot for cost-effective deployment.
- **At 100% reach:** Maximum savings but includes low-acuity members where ROI per dollar is lower.

**Segment-Specific Sensitivity:**
- **S3 (Heart Failure):** Most sensitive - each 10% reach increase adds significant savings due to high per-member cost
- **S1 (At-Risk):** Least sensitive per-member, but large cohort size means total impact scales linearly
- **S4 (ESRD):** Moderate sensitivity - small segment size limits absolute scaling

**Recommendation:** Start with 50-60% reach targeting highest-acuity members within each segment, then expand based on observed outcomes.`,
    sources: [
      { label: "HWHI Internal: Sensitivity Analysis Framework, 2024", url: "#optum-internal" },
      { label: "AHRQ: Care Coordination Cost-Effectiveness", url: "https://www.ahrq.gov/research/findings/evidence-based-reports/caregapupd-evidence-report.html" },
      { label: "Koehler F et al. Lancet 2018 - TIM-HF2 Remote Monitoring Trial", url: "https://pubmed.ncbi.nlm.nih.gov/30153985/" },
    ],
  },
  total_savings: {
    role: "assistant",
    content: `**Portfolio-Level Projected Savings:**

With default intervention parameters across all 6 segments:

**By Segment (Annual Net Savings):**
- S1 At-Risk: Moderate savings, high ROI ratio
- S2 Metabolic: Moderate-high savings from pharmacy optimization + IP reduction
- S3 Heart Failure: Highest absolute savings from readmission prevention
- S4 ESRD: High per-member savings offset by high program cost
- S5 Rural SDOH: Lower savings but critical for access equity
- S6 Frail Elderly: Moderate savings, primarily from hospitalization avoidance

**Key Levers:** IP cost reduction and population reach are the two most impactful parameters. A 5% improvement in IP reduction across all segments yields approximately 15-20% more portfolio savings.

**Caveat:** These are modeled projections. Actual savings depend on implementation quality, member engagement, and provider network readiness.`,
    sources: [
      { label: "HWHI Internal: Portfolio Savings Model, 2024", url: "#optum-internal" },
      { label: "Optum Internal: Value-Based Care Outcomes Report, 2023", url: "#optum-internal" },
      { label: "CMS Innovation Center: Risk Stratification Models", url: "https://www.cms.gov/priorities/innovation/key-concepts/risk-stratification" },
    ],
  },
}

// ── Fallback ─────────────────────────────────────────────────────

export const FALLBACK_RESPONSE: ChatMessage = {
  role: "assistant",
  content:
    "I'm currently scoped to pre-analyzed population insights and can't process freeform queries yet. Try one of the suggested questions above to explore the data.",
  sources: [],
}

// ── Query matching ───────────────────────────────────────────────
// Page indices: 0=Home, 1=Population Overview, 2=Segmentation Analysis

const HOME_QUERIES = [
  "Which segments have the highest intervention ROI?",
  "Where should we focus resources this quarter?",
  "What are the top cost drivers in this population?",
] as const

const HOME_RESPONSES: Record<string, ChatMessage> = {
  roi: {
    role: "assistant",
    content: `**Highest intervention ROI by segment:**

1. **S3: Heart Failure** - Remote monitoring + care transitions. 35% readmission rate is 3x national avg. Break-even in 4-6 months. Estimated savings: $18K/member/yr.
2. **S1: At-Risk Baseline** - Lifestyle modification programs at $600-1,200/yr prevent 3-8x cost escalation. 100 members, largest early-intervention pool.
3. **S4: ESRD** - Pre-ESRD diversion for the 20% not yet on dialysis saves $45K+/member. Home dialysis conversion saves 30-40% vs. in-center.

**Recommendation:** Prioritize S3 for immediate ROI, S1 for long-term cost avoidance, S4 for highest per-member savings.`,
    sources: [
      { label: "Optum Internal: Intervention ROI Models, 2024", url: "#optum-internal" },
      { label: "CMS Chronic Conditions Dashboard", url: "https://www.cms.gov/data-research/statistics-trends-and-reports/chronic-conditions" },
    ],
  },
  focus: {
    role: "assistant",
    content: `**Recommended focus areas for this quarter:**

1. **Care transitions for S3 (Heart Failure)** - 75 members driving $9M+ in annual acute spend. A 10% readmission reduction saves ~$900K/yr.
2. **Access gap closure for S5 (Rural SDOH)** - 85 members with zero PCP engagement. Deploy mobile health units or telehealth to 3 highest-concentration counties.
3. **Diabetes management for S2 (Metabolic)** - 90 members at inflection point. Endocrinology coordination prevents cardiac events within 2 years.

**Geographic priority:** Pulaski, Jefferson, and Craighead counties have the highest risk concentration. Start there.`,
    sources: [
      { label: "Optum Internal: Q1 2025 Intervention Planning", url: "#optum-internal" },
    ],
  },
  cost: {
    role: "assistant",
    content: `**Top cost drivers across the 500-member cohort:**

- **Inpatient admissions** - Single largest category. S3 (Heart Failure) and S4 (ESRD) account for 65% of all inpatient spend.
- **ESRD management** - S4 members average $90K+/yr. 80% ESRD prevalence in this segment.
- **ER-as-primary-care** - S5 (Rural SDOH) members average 3.2 ER visits/yr with zero PCP visits. Each avoidable ER visit costs ~$2,500.
- **Pharmacy costs** - S2 (Metabolic) has elevated rx_cost_risk (15-35) from uncoordinated diabetes + hypertension medications.

**Total population PMPY:** $51,135. Top 15% of members drive 60%+ of total spend.`,
    sources: [
      { label: "Optum Internal: Cost Architecture Analysis, 2024", url: "#optum-internal" },
      { label: "USRDS Annual Data Report: ESRD Cost Trends", url: "https://usrds-adr.niddk.nih.gov" },
    ],
  },
}

export function getSuggestedQueries(page: number): string[] {
  if (page === 0) return [...HOME_QUERIES]
  if (page === 1) return [...PAGE1_QUERIES]
  if (page === 2) return [...PAGE2_QUERIES]
  if (page === 3) return [...PAGE3_QUERIES]
  return [...HOME_QUERIES]
}

export function matchQuery(
  input: string,
  page: number,
): ChatMessage | null {
  const lower = input.toLowerCase()

  // Page 0: Home
  if (page === 0) {
    if (lower.includes("roi") || lower.includes("intervention") || lower.includes("highest"))
      return HOME_RESPONSES.roi
    if (lower.includes("focus") || lower.includes("prioriti") || lower.includes("quarter") || lower.includes("resource"))
      return HOME_RESPONSES.focus
    if (lower.includes("cost") || lower.includes("driver") || lower.includes("spend") || lower.includes("expensive"))
      return HOME_RESPONSES.cost
    return HOME_RESPONSES.focus
  }

  // Page 1: Population Overview
  if (page === 1) {
    if (lower.includes("cost driver") || lower.includes("biggest cost") || lower.includes("expensive"))
      return PAGE1_RESPONSES.cost_drivers
    if (lower.includes("esrd") || lower.includes("renal") || lower.includes("kidney"))
      return PAGE1_RESPONSES.esrd
    if (lower.includes("sdoh") || lower.includes("social determinant") || lower.includes("determinants"))
      return PAGE1_RESPONSES.sdoh
  }

  // Page 3: Intervention Planner
  if (page === 3) {
    if (lower.includes("highest roi") || lower.includes("best roi") || lower.includes("which segment"))
      return PAGE3_RESPONSES.highest_roi
    if (lower.includes("sensitive") || lower.includes("sensitivity") || lower.includes("population reach"))
      return PAGE3_RESPONSES.sensitivity
    if (lower.includes("total") || lower.includes("projected") || lower.includes("portfolio") || lower.includes("all segment"))
      return PAGE3_RESPONSES.total_savings
    return PAGE3_RESPONSES.highest_roi
  }

  // Page 2: Segmentation Analysis (merged)
  if (page === 2) {
    if (lower.includes("most expensive") || lower.includes("costliest") || lower.includes("cost"))
      return PAGE2_RESPONSES.most_expensive
    if (lower.includes("distinct") || lower.includes("separated") || lower.includes("different"))
      return PAGE2_RESPONSES.distinctness
    if (lower.includes("intervention") || lower.includes("opportunity") || lower.includes("program"))
      return PAGE2_RESPONSES.interventions

    // Also match cluster-specific queries by keyword
    for (const [clusterId, responses] of Object.entries(CLUSTER_RESPONSES)) {
      const id = Number(clusterId)
      const clusterName = CLUSTER_NAMES_REF[id]?.toLowerCase() || ""
      if (lower.includes(`cluster ${id}`) || lower.includes(clusterName)) {
        if (lower.includes("risk") || lower.includes("clinical"))
          return responses.risks
        if (lower.includes("intervention") || lower.includes("work best") || lower.includes("program"))
          return responses.interventions
        if (lower.includes("compare") || lower.includes("population") || lower.includes("baseline"))
          return responses.comparison
        return responses.risks // default to risks for cluster mention
      }
    }
  }

  return null
}

const CLUSTER_NAMES_REF: Record<number, string> = {
  1: "at-risk",
  2: "metabolic",
  3: "heart failure",
  4: "esrd",
  5: "rural",
  6: "frail elderly",
}
