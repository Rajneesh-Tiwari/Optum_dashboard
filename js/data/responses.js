const LLM_RESPONSES = {
    // Population Overview Insights
    population_overview: "This 4,000-member cardio-metabolic cohort represents approximately $142M in annual spend. The top 10% of members (Cluster 1) drive 38% of total costs. Early intervention in Clusters 2 and 3 offers the highest ROI opportunity - these 1,925 members are on trajectories toward costly complications but remain highly modifiable with targeted engagement.",

    population_cost_drivers: "Analysis reveals three primary cost drivers: unplanned hospitalizations account for 42% of Cluster 1 spend, pharmacy costs represent 28% of Cluster 2 spend, and specialist utilization drives 31% of overall costs. Addressing care fragmentation could reduce total spend by 12-15%.",

    // Geographic Insights
    geographic_delta: "The Delta region shows a striking 2.3x higher ESRD rate compared to Northwest Arkansas, correlating strongly with SDOH factors: 34% food desert coverage, 42% higher poverty rates, and 67% longer travel times to nephrologists. This geographic disparity represents both a challenge and an opportunity - concentrated intervention resources here could yield 40% higher impact per dollar invested.",

    geographic_access: "Provider access analysis reveals critical gaps: Delta counties average just 3.2 PCPs per 10,000 population versus 9.8 in Northwest Arkansas. Telehealth adoption could bridge 60% of this gap, particularly for diabetes management and medication reconciliation visits.",

    geographic_northwest: "Northwest Arkansas demonstrates what's achievable - despite similar chronic disease prevalence, PMPY costs are 28% lower than Delta region. Key differentiators include integrated health systems, higher engagement rates, and robust community health worker programs. These practices could be adapted for statewide deployment.",

    // Segmentation Insights
    segmentation_overview: "The five-cluster segmentation reveals distinct intervention windows. Cluster 1 requires intensive care management. Cluster 2 presents the pivotal intervention point - without engagement, 35% will progress to Cluster 1 within 24 months. Cluster 3 offers the highest prevention ROI with lifestyle and medication adherence programs.",

    segmentation_cost: "Cost concentration follows the 80/20 rule amplified: 31% of members (Clusters 1-2) generate 72% of costs. However, the rising-risk Cluster 3 population presents the most cost-effective intervention target with projected savings of $8,400 PMPY through early engagement.",

    // Cluster Detail Insights
    cluster_1_detail: "Cluster 1 analysis reveals two critical sub-populations requiring differentiated strategies: 85 Complex Frail members (age 75+, 4+ comorbidities) need palliative-informed care coordination, while 30 Non-Outreach members show 18+ month care gaps - this group has 3.2x higher hospitalization risk and requires aggressive re-engagement through community health workers and SDOH support.",

    cluster_1_esrd: "Among Cluster 1 ESRD members, 67% initiated dialysis emergently rather than through planned transition. Pre-dialysis education and vascular access planning could reduce emergency starts by 45%, saving an estimated $32,000 per member in first-year dialysis costs.",

    cluster_2_detail: "Cluster 2 members average 10.2% A1C with declining eGFR trajectories. Without intervention, predictive modeling shows 35% will progress to Cluster 1 within 24 months. Key modifiable factors include medication adherence (currently 62%), dietary management, and blood pressure control. Intensive management programs show 18% cost reduction in similar populations.",

    cluster_2_trajectory: "Analysis of Cluster 2 trajectories shows a critical window: members crossing from Stage 3a to Stage 3b CKD experience a 2.4x cost increase. Currently, 340 members are within 12 months of this transition - targeted nephrology referral and ACE/ARB optimization could prevent 40% of these progressions.",

    cluster_3_detail: "Cluster 3 represents the optimal prevention investment point. These 1,070 members have early metabolic dysfunction but remain highly modifiable. Every dollar invested in lifestyle intervention and medication optimization yields $3.40 in avoided future costs. Digital health tools show 72% engagement rates in this population.",

    cluster_3_prevention: "Metabolic syndrome members in Cluster 3 show strong response to structured interventions: medical nutrition therapy reduces A1C by 0.8 points on average, while GLP-1 initiation in appropriate candidates shows 1.2 point reduction. Early statin therapy in this population prevents 12 cardiovascular events per 1,000 member-years.",

    // DaVita Insights
    davita_analysis: "The 54.5% cost gap between DaVita and non-DaVita ESRD members warrants investigation. Severity adjustment accounts for only 18% of this variance. Key drivers include 2.1x higher vascular access complications, limited care coordination with PCPs, and higher infection rates. A value-based dialysis partnership could address these gaps and save an estimated $631,600 annually for these 8 members alone.",

    davita_deep_dive: "Root cause analysis suggests care fragmentation is the primary driver. DaVita members average 4.2 different care settings monthly versus 2.1 for non-DaVita members. Implementing a unified care plan with real-time data sharing between dialysis centers and primary care could reduce complications by 35%.",

    // Scenario Insights
    scenario_cluster1_ckd: "CKD Care Management for Cluster 1 shows strong projected outcomes: 70% enrollment with 60% engagement yields $15,240 net savings PMPY after program costs. Key success factors include nephrology-PCP co-management, pre-dialysis education, and vascular access planning. Break-even occurs at month 4.2.",

    scenario_cluster1_coord: "Care Coordination for Cluster 1 targets the fragmentation driving excess costs. With 391 members averaging 4.8 care transitions annually, reducing unplanned transitions by 30% would prevent an estimated 47 hospitalizations and save $2.1M. CHW integration is critical for this high-complexity population.",

    scenario_cluster2_diabetes: "Diabetes Intensive Management for Cluster 2 projects 15% cost reduction through A1C improvement. At 70% enrollment, 855 members would see average A1C reduction of 1.8 points, preventing 28 ESRD progressions and 42 cardiovascular events over 24 months. Program investment: $2.4M. Projected savings: $6.8M.",

    scenario_cluster2_remote: "Remote Patient Monitoring shows exceptional engagement in Cluster 2 - CGM users demonstrate 2.1x higher medication adherence and 1.4 point better A1C control. At $180/month program cost, the 14% cost reduction yields 312% ROI. Recommend prioritizing members with A1C > 9% and declining eGFR.",

    scenario_cluster3_prevention: "Prevention & Wellness for Cluster 3 offers the highest long-term ROI. At just $80/month program cost, lifestyle intervention prevents 12% of metabolic progressions. Over 5 years, every 100 members engaged avoids 8 diabetes progressions and 3 cardiovascular events - $1.2M in avoided costs from $480K investment.",

    scenario_cluster3_nutrition: "Medical Nutrition Therapy in Cluster 3 shows 8% cost reduction with exceptional member satisfaction (NPS 72). The intervention addresses root causes - weight reduction of 7% on average, 0.6 point A1C improvement, and 15 mmHg systolic BP reduction. Cost per quality-adjusted life year gained: $12,400.",

    // Timeline Insights
    timeline_projection: "The 24-month projection shows accelerating returns after month 6 as interventions mature. Year 1 savings of $4.2M grow to cumulative $12.9M by month 24. Key inflection points: enrollment completion (month 3), clinical impact visible (month 6), behavioral change embedded (month 12). Sustaining engagement past month 12 is critical - programs losing >20% engagement see 60% lower savings.",

    timeline_milestones: "Critical success metrics by milestone: Month 3 - 70% enrollment achieved; Month 6 - A1C reduction visible in Cluster 2; Month 12 - hospitalization reduction of 15% in Cluster 1; Month 18 - ESRD progression rate reduced by 25%; Month 24 - full program ROI realized at 285%.",

    // Persona Insights
    persona_james: "James represents the pivotal intervention opportunity. His trajectory without intervention: 35% probability of ESRD within 3 years, $156K projected PMPY by Year 2. With coordinated intervention (diabetes management + SDOH support + remote monitoring), modeling shows A1C reduction to 7.8%, eGFR stabilization, and 42% cost reduction. Investment of $8,400/year prevents $52,000 in future costs.",

    persona_james_sdoh: "James's SDOH barriers are addressable: food insecurity can be mitigated through medically-tailored meal delivery ($180/month), transportation barriers addressed through ride coordination for specialist visits. These $4,200 annual SDOH investments prevent an estimated $18,000 in ER visits and hospitalizations.",

    persona_maria: "Maria requires a different strategy - as an established dialysis patient, the goal shifts from prevention to complication reduction and quality optimization. Her vascular access complications cost $34,000 this year alone. Intensive care coordination between DaVita, her PCP, and vascular surgery could reduce complications by 40%, improving both outcomes and costs.",

    persona_maria_trajectory: "Maria's cost trajectory shows opportunities even in advanced disease. Current PMPY of $142,800 could reduce to $118,000 through: care coordination reducing hospitalizations (save $12,400), vascular access optimization (save $8,200), and dialysis adherence improvement (save $4,200). Quality of life metrics would also improve substantially.",

    // Executive Summary
    executive_summary: "This analysis demonstrates a clear path to transforming cardio-metabolic population health in Arkansas. Three key opportunities: (1) Delta region intervention yielding 40% higher impact per dollar, (2) Cluster 2 intensive management preventing costly ESRD progressions, and (3) DaVita partnership addressing the 54% cost gap. Total 24-month investment of $8.2M projects $12.9M in savings - 285% ROI. Recommend phased implementation starting with Cluster 1 care coordination to demonstrate rapid wins, followed by Cluster 2 expansion in Q2.",

    summary_recommendations: "Priority recommendations: 1) Launch Cluster 1 CKD Care Management immediately - highest cost members, fastest ROI. 2) Deploy care coordination in Delta region with dedicated CHW resources. 3) Negotiate value-based arrangement with DaVita addressing identified quality gaps. 4) Scale remote monitoring for Cluster 2 using proven CGM protocols. 5) Implement prevention program for Cluster 3 to stem future high-cost progression.",

    // Additional contextual insights
    roi_methodology: "ROI calculations incorporate: intervention program costs, administrative overhead (12%), member attribution adjustments, and medical cost trend (6.5% baseline). Savings projections use conservative estimates based on peer-reviewed intervention studies with 20% efficacy discount for real-world implementation variability.",

    data_quality: "Analysis based on 24 months of claims data, clinical lab results, and SDOH assessments. Data completeness: 94% for claims, 78% for labs, 62% for SDOH. Recommendations account for data gaps through conservative modeling assumptions.",

    implementation_risks: "Key implementation risks and mitigations: (1) Provider engagement - address through shared savings incentives; (2) Member enrollment - leverage trusted community partners; (3) Sustainability - build internal capability alongside vendor programs; (4) Measurement - establish clear baselines and attribution methodology upfront."
};
