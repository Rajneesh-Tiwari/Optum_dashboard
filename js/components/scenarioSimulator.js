// Scenario Simulator Module
const ScenarioSimulator = {
    currentCluster: 1,
    currentIntervention: 'ckd_care',
    currentEnrollment: 0.7,
    currentEngagement: 0.6,
    debounceTimer: null,

    init() {
        this.setupClusterRadios();
        this.setupInterventionSelect();
        this.setupSliders();
        this.updateResults();
    },

    setupClusterRadios() {
        const radios = document.querySelectorAll('input[name="scenario-cluster"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.currentCluster = parseInt(radio.value);
                this.updateInterventionOptions();
                this.updateResults();
            });
        });
    },

    setupInterventionSelect() {
        const select = document.getElementById('intervention-select');
        select.addEventListener('change', () => {
            this.currentIntervention = select.value;
            this.updateResults();
        });
    },

    setupSliders() {
        const enrollmentSlider = document.getElementById('enrollment-slider');
        const engagementSlider = document.getElementById('engagement-slider');
        const enrollmentValue = document.getElementById('enrollment-value');
        const engagementValue = document.getElementById('engagement-value');

        enrollmentSlider.addEventListener('input', () => {
            this.currentEnrollment = enrollmentSlider.value / 100;
            enrollmentValue.textContent = `${enrollmentSlider.value}%`;
            this.debounceUpdate();
        });

        engagementSlider.addEventListener('input', () => {
            this.currentEngagement = engagementSlider.value / 100;
            engagementValue.textContent = `${engagementSlider.value}%`;
            this.debounceUpdate();
        });
    },

    debounceUpdate() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.updateResults();
        }, 100);
    },

    updateInterventionOptions() {
        const select = document.getElementById('intervention-select');
        const cluster = this.currentCluster;

        // Update which interventions are available
        const options = select.querySelectorAll('option');
        options.forEach(option => {
            const intervention = INTERVENTIONS.find(i => i.id === option.value);
            if (intervention) {
                const isAvailable = intervention.target_clusters.includes(cluster);
                option.disabled = !isAvailable;
                if (!isAvailable && option.selected) {
                    // Select first available
                    const firstAvailable = INTERVENTIONS.find(i => i.target_clusters.includes(cluster));
                    if (firstAvailable) {
                        select.value = firstAvailable.id;
                        this.currentIntervention = firstAvailable.id;
                    }
                }
            }
        });
    },

    updateResults() {
        // Find closest matching scenario
        const scenario = this.findClosestScenario();

        if (scenario) {
            // Update result cards
            document.getElementById('result-reduction').textContent = `${scenario.cost_reduction_pct.toFixed(1)}%`;
            document.getElementById('result-savings').textContent = `$${scenario.net_savings_pmpy.toLocaleString()}`;
            document.getElementById('result-roi').textContent = `${scenario.roi_pct.toFixed(0)}%`;
            document.getElementById('result-breakeven').textContent = `${scenario.break_even_months.toFixed(1)} mo`;

            // Color code results
            this.colorCodeResults(scenario);
        } else {
            // Calculate approximate results
            const cluster = CLUSTERS[this.currentCluster];
            const intervention = INTERVENTIONS.find(i => i.id === this.currentIntervention);

            if (cluster && intervention) {
                const effectiveRate = this.currentEnrollment * this.currentEngagement;
                const costReduction = intervention.cost_reduction * effectiveRate * (1 - Math.max(0, effectiveRate - 0.6) * 0.3);
                const savingsPmpy = cluster.avg_pmpy * costReduction;
                const interventionCost = intervention.monthly_cost * 12 * this.currentEnrollment;
                const netSavings = savingsPmpy - interventionCost;
                const roi = (netSavings / interventionCost) * 100;

                document.getElementById('result-reduction').textContent = `${(costReduction * 100).toFixed(1)}%`;
                document.getElementById('result-savings').textContent = `$${netSavings.toFixed(0).toLocaleString()}`;
                document.getElementById('result-roi').textContent = `${roi.toFixed(0)}%`;
                document.getElementById('result-breakeven').textContent = netSavings > 0 ? `${(interventionCost / (netSavings / 12)).toFixed(1)} mo` : 'N/A';
            }
        }

        // Update chart
        ScenarioCharts.updateChart(
            this.currentCluster,
            this.currentIntervention,
            this.currentEnrollment,
            this.currentEngagement
        );

        // Update LLM insight
        this.updateInsight();
    },

    findClosestScenario() {
        // Find scenario closest to current parameters
        const matching = SCENARIOS.filter(s =>
            s.cluster === this.currentCluster &&
            s.intervention_id === this.currentIntervention
        );

        if (matching.length === 0) return null;

        // Find closest by enrollment and engagement
        let closest = matching[0];
        let minDistance = Infinity;

        matching.forEach(s => {
            const distance = Math.abs(s.enrollment - this.currentEnrollment) +
                           Math.abs(s.engagement - this.currentEngagement);
            if (distance < minDistance) {
                minDistance = distance;
                closest = s;
            }
        });

        return closest;
    },

    colorCodeResults(scenario) {
        const reductionEl = document.getElementById('result-reduction');
        const savingsEl = document.getElementById('result-savings');
        const roiEl = document.getElementById('result-roi');
        const breakevenEl = document.getElementById('result-breakeven');

        // Positive outcomes in green, negative in red
        const positiveClass = 'text-cluster-4';
        const negativeClass = 'text-risk-high';
        const neutralClass = 'text-optum-navy';

        reductionEl.className = `text-3xl font-bold ${scenario.cost_reduction_pct > 0 ? positiveClass : negativeClass}`;
        savingsEl.className = `text-3xl font-bold ${scenario.net_savings_pmpy > 0 ? positiveClass : negativeClass}`;
        roiEl.className = `text-3xl font-bold ${scenario.roi_pct > 100 ? positiveClass : scenario.roi_pct > 0 ? neutralClass : negativeClass}`;
        breakevenEl.className = `text-3xl font-bold ${scenario.break_even_months < 12 ? positiveClass : neutralClass}`;
    },

    updateInsight() {
        const insightKey = `scenario_cluster${this.currentCluster}_${this.currentIntervention.replace('_', '')}`;
        const insightEl = document.querySelector('#scenario .llm-text');

        // Check for specific insight, fallback to cluster-specific
        let insight = LLM_RESPONSES[insightKey];
        if (!insight) {
            // Try intervention-specific
            const interventionKey = `scenario_cluster${this.currentCluster}_${this.getInterventionKeyword()}`;
            insight = LLM_RESPONSES[interventionKey];
        }
        if (!insight) {
            // Fallback to generic cluster insight
            insight = LLM_RESPONSES[`cluster_${this.currentCluster}_detail`];
        }

        if (insight && insightEl) {
            insightEl.dataset.insight = insightKey;
            LLMInsight.typeText(insightEl, insight);
        }
    },

    getInterventionKeyword() {
        const keywords = {
            'ckd_care': 'ckd',
            'diabetes_mgmt': 'diabetes',
            'care_coord': 'coord',
            'remote_monitor': 'remote',
            'nutrition': 'nutrition',
            'pharma_opt': 'pharma',
            'sdoh_support': 'sdoh',
            'behavioral': 'behavioral',
            'prevention': 'prevention'
        };
        return keywords[this.currentIntervention] || this.currentIntervention;
    },

    // Calculate total program impact
    calculateProgramImpact() {
        const cluster = CLUSTERS[this.currentCluster];
        const enrolledMembers = Math.round(cluster.member_count * this.currentEnrollment);
        const scenario = this.findClosestScenario();

        if (!scenario) return null;

        return {
            enrolledMembers,
            totalSavings: scenario.net_savings_pmpy * enrolledMembers,
            totalCost: scenario.intervention_cost_annual * enrolledMembers,
            netImpact: scenario.net_savings_pmpy * enrolledMembers - scenario.intervention_cost_annual * enrolledMembers
        };
    }
};
