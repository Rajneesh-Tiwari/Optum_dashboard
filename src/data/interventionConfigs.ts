import { type CostBreakdown } from "../lib/dataUtils"

export interface SliderState {
  populationReachPct: number
  ipReductionPct: number
  opReductionPct: number
  physIncreasePct: number
  programCostPMPM: number
}

export interface ROIResult {
  impactedMembers: number
  ipSavings: number
  opSavings: number
  physIncrease: number
  grossSavings: number
  netSavingsPMPY: number
  programCostAnnual: number
  netAfterProgram: number
  roiRatio: number
  breakEvenMonths: number
  projectedPMPY: number
}

export interface EvidenceSource {
  label: string
  url: string
}

export interface InterventionConfig {
  clusterId: number
  name: string
  narrative: string
  defaults: SliderState
  evidence: EvidenceSource[]
}

export const INTERVENTION_CONFIGS: Record<number, InterventionConfig> = {
  1: {
    clusterId: 1,
    name: "Lifestyle Modification + Medication Adherence",
    narrative:
      "This segment represents the earliest intervention window in the population. Lifestyle coaching, digital BP monitoring, and medication adherence programs target the 60% with emerging hypertension before progression to metabolic syndrome. Evidence shows that low-intensity, scalable programs in this demographic yield the best population-level ROI by preventing 3-8x cost escalation downstream.",
    defaults: {
      populationReachPct: 60,
      ipReductionPct: 8,
      opReductionPct: 5,
      physIncreasePct: 10,
      programCostPMPM: 75,
    },
    evidence: [
      { label: "DPP trial: lifestyle intervention reduced diabetes incidence by 58% in pre-diabetic adults (Knowler et al., NEJM 2002)", url: "https://pubmed.ncbi.nlm.nih.gov/11832527/" },
      { label: "Digital BP monitoring programs show 40% reduction in hypertension medication gaps (JAMA Network Open 2021)", url: "https://pubmed.ncbi.nlm.nih.gov/33635324/" },
      { label: "Annual wellness visit incentives increase preventive screening completion by 2.3x", url: "https://www.ahrq.gov/research/findings/evidence-based-reports/caregapupd-evidence-report.html" },
    ],
  },
  2: {
    clusterId: 2,
    name: "Intensive Diabetes Management + Pharmacy Optimization",
    narrative:
      "Dual diabetes-hypertension comorbidity in 100% of this segment creates compounding metabolic risk. Dedicated diabetes care coordinators, continuous glucose monitoring for highest-risk members, and medication therapy management target A1C reduction and pharmacy cost optimization. Without intervention, 15-20% face major cardiac events within 24 months.",
    defaults: {
      populationReachPct: 70,
      ipReductionPct: 15,
      opReductionPct: 10,
      physIncreasePct: 15,
      programCostPMPM: 350,
    },
    evidence: [
      { label: "UKPDS: intensive glucose control reduces microvascular complications by 25% (Lancet 1998, UKPDS Group)", url: "https://pubmed.ncbi.nlm.nih.gov/9742976/" },
      { label: "Medication therapy management reduces pharmacy costs by 20% and adverse events by 35% (Zhuo et al., Diabetes Care 2013)", url: "https://pubmed.ncbi.nlm.nih.gov/23468088/" },
      { label: "Integrated behavioral health improves diabetes medication adherence by 35% in comorbid depression (ADA Standards 2024)", url: "https://diabetesjournals.org/care/issue/47/Supplement_1" },
    ],
  },
  3: {
    clusterId: 3,
    name: "Remote Monitoring + Care Transitions",
    narrative:
      "A 35% 30-day readmission rate - 3x the national average - makes this segment the highest-impact target for acute care intervention. Remote patient monitoring detects decompensation 48-72 hours before hospitalization, while nurse navigator contact within 48 hours of discharge addresses the critical transition window. Break-even is achievable within 4-6 months.",
    defaults: {
      populationReachPct: 80,
      ipReductionPct: 30,
      opReductionPct: 10,
      physIncreasePct: 20,
      programCostPMPM: 800,
    },
    evidence: [
      { label: "TIM-HF2 trial: remote monitoring reduced unplanned CV hospitalizations by 30% (Koehler et al., Lancet 2018)", url: "https://pubmed.ncbi.nlm.nih.gov/30153985/" },
      { label: "Care transition programs reduce 30-day readmissions by 20-25%", url: "https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps/hospital-readmissions-reduction-program-hrrp" },
      { label: "Palliative care integration reduces unwanted aggressive interventions by 40% (JAMA Intern Med 2014)", url: "https://pubmed.ncbi.nlm.nih.gov/25179514/" },
    ],
  },
  4: {
    clusterId: 4,
    name: "Pre-ESRD Diversion + Home Dialysis Conversion",
    narrative:
      "The most expensive per-member segment. Pre-ESRD care management for the 20% not yet on dialysis can divert $45K+ per member annually. For existing dialysis patients, home modality conversion saves 30-40% versus in-center hemodialysis. Transplant evaluation acceleration for eligible members yields the highest long-term savings of any intervention in the population.",
    defaults: {
      populationReachPct: 65,
      ipReductionPct: 20,
      opReductionPct: 15,
      physIncreasePct: 25,
      programCostPMPM: 1200,
    },
    evidence: [
      { label: "DAPA-CKD trial: SGLT2 inhibitors reduce CKD progression by 39% and ESRD incidence by 44% (Heerspink et al., NEJM 2020)", url: "https://pubmed.ncbi.nlm.nih.gov/32970396/" },
      { label: "Home dialysis costs 30-40% less than in-center HD with comparable outcomes (USRDS 2023 ADR)", url: "https://usrds-adr.niddk.nih.gov/2023/end-stage-renal-disease/11-medicare-expenditures-for-persons-with-esrd" },
      { label: "Successful kidney transplant saves $200K+ over 5 years versus continued dialysis (KDIGO 2024)", url: "https://pubmed.ncbi.nlm.nih.gov/36904135/" },
    ],
  },
  5: {
    clusterId: 5,
    name: "Community Health Workers + Mobile Health Units",
    narrative:
      "Clinical programs will fail in this segment without first solving access. Zero PCP engagement, 45+ mile distances to care, and 35% without internet demand a fundamentally different delivery model. Community health workers provide trusted door-to-door engagement, while mobile health units bring basic labs, medication management, and diabetes education directly to Delta region communities.",
    defaults: {
      populationReachPct: 50,
      ipReductionPct: 12,
      opReductionPct: 5,
      physIncreasePct: 8,
      programCostPMPM: 250,
    },
    evidence: [
      { label: "CHW interventions improve chronic disease management engagement by 40% in underserved populations (Kangovi et al., JAMA Intern Med 2020)", url: "https://pubmed.ncbi.nlm.nih.gov/31710345/" },
      { label: "Mobile health units reduce ER utilization by 25-30% in rural communities", url: "https://www.ruralhealthinfo.org/toolkits/services-integration/2/mobile-health-clinics" },
      { label: "Transportation assistance programs increase appointment adherence by 60% in Medicaid populations (Health Affairs 2020)", url: "https://pubmed.ncbi.nlm.nih.gov/32634352/" },
    ],
  },
  6: {
    clusterId: 6,
    name: "Geriatric Care + Polypharmacy Review",
    narrative:
      "Quality-of-life interventions outperform aggressive disease management for this frail elderly cohort. Comprehensive geriatric assessment establishes realistic care goals. Formal deprescribing protocols can safely discontinue 30% of medications, reducing adverse events. Home-based primary care for those too frail for office visits reduces ER visits by 30% and hospitalizations by 20%.",
    defaults: {
      populationReachPct: 75,
      ipReductionPct: 20,
      opReductionPct: 10,
      physIncreasePct: 15,
      programCostPMPM: 500,
    },
    evidence: [
      { label: "Deprescribing reduces adverse drug events by 40% in elderly patients on 5+ medications (Scott et al., JAMA Intern Med 2015)", url: "https://pubmed.ncbi.nlm.nih.gov/26052551/" },
      { label: "Home-based primary care reduces ER visits by 30% and hospitalizations by 20% (Edes et al., JAGS 2014)", url: "https://pubmed.ncbi.nlm.nih.gov/25040793/" },
      { label: "Advance care planning reduces unwanted ICU admissions by 50% (AGS Beers Criteria 2023)", url: "https://pubmed.ncbi.nlm.nih.gov/36602233/" },
    ],
  },
}

export function calculateROI(
  costs: CostBreakdown,
  sliders: SliderState,
): ROIResult {
  const impactedMembers = Math.round(costs.count * (sliders.populationReachPct / 100))
  const ipSavings = costs.ip * (sliders.ipReductionPct / 100)
  const opSavings = costs.op * (sliders.opReductionPct / 100)
  const physIncrease = costs.phys * (sliders.physIncreasePct / 100)
  const programCostAnnual = sliders.programCostPMPM * 12

  const grossSavings = ipSavings + opSavings
  const netSavingsPMPY = grossSavings - physIncrease
  const netAfterProgram = netSavingsPMPY - programCostAnnual

  const totalInvestment = programCostAnnual * impactedMembers
  const roiRatio = totalInvestment > 0
    ? (netSavingsPMPY * impactedMembers) / totalInvestment
    : 0

  const monthlyNet = netSavingsPMPY / 12
  const breakEvenMonths = monthlyNet > 0
    ? sliders.programCostPMPM / monthlyNet
    : monthlyNet <= 0 ? 999 : 0

  const projectedPMPY = costs.total - netAfterProgram

  return {
    impactedMembers,
    ipSavings,
    opSavings,
    physIncrease,
    grossSavings,
    netSavingsPMPY,
    programCostAnnual,
    netAfterProgram,
    roiRatio,
    breakEvenMonths: Math.min(breakEvenMonths, 999),
    projectedPMPY,
  }
}
