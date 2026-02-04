// Scenario Charts Module
const ScenarioCharts = {
    init() {
        this.renderProjectionChart();
    },

    renderProjectionChart(clusterId = 1, intervention = 'ckd_care', enrollment = 0.7, engagement = 0.6) {
        // Get projection data
        const projection = PROJECTIONS.find(p => p.cluster === clusterId);
        if (!projection) return;

        const months = projection.baseline.map(d => d.month);
        const baselineCosts = projection.baseline.map(d => d.cost);

        // Calculate intervention costs based on scenario
        const scenario = SCENARIOS.find(s =>
            s.cluster === clusterId &&
            s.intervention_id === intervention &&
            Math.abs(s.enrollment - enrollment) < 0.1 &&
            Math.abs(s.engagement - engagement) < 0.1
        );

        const reductionPct = scenario ? scenario.cost_reduction_pct / 100 : 0.12;

        // Calculate intervention trajectory with ramp-up
        const interventionCosts = baselineCosts.map((cost, i) => {
            const month = i + 1;
            const rampUp = Math.min(1, month / 6); // 6-month ramp
            const reduction = reductionPct * rampUp;
            return Math.round(cost * (1 - reduction));
        });

        // Calculate savings area
        const savingsArea = months.map((m, i) => baselineCosts[i] - interventionCosts[i]);

        const traces = [
            // Baseline line
            {
                type: 'scatter',
                mode: 'lines',
                name: 'Baseline',
                x: months,
                y: baselineCosts,
                line: {
                    color: '#EF4444',
                    width: 3
                },
                hovertemplate: 'Month %{x}<br>Baseline: $%{y:,.0f}<extra></extra>'
            },
            // Intervention line
            {
                type: 'scatter',
                mode: 'lines',
                name: 'With Intervention',
                x: months,
                y: interventionCosts,
                line: {
                    color: '#22C55E',
                    width: 3
                },
                fill: 'tonexty',
                fillcolor: 'rgba(34, 197, 94, 0.2)',
                hovertemplate: 'Month %{x}<br>Intervention: $%{y:,.0f}<extra></extra>'
            }
        ];

        const layout = {
            margin: { t: 20, b: 50, l: 70, r: 20 },
            xaxis: {
                title: 'Month',
                tickvals: [1, 6, 12, 18, 24],
                gridcolor: '#e5e5e5'
            },
            yaxis: {
                title: 'Monthly Cost (PMPM)',
                tickformat: '$,.0f',
                gridcolor: '#e5e5e5'
            },
            legend: {
                orientation: 'h',
                y: 1.1,
                x: 0.5,
                xanchor: 'center'
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'Inter, system-ui, sans-serif'
            },
            annotations: [
                {
                    x: 18,
                    y: (baselineCosts[17] + interventionCosts[17]) / 2,
                    text: 'Savings',
                    showarrow: false,
                    font: {
                        color: '#22C55E',
                        size: 14,
                        weight: 'bold'
                    }
                }
            ]
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot('scenario-chart', traces, layout, config);
    },

    updateChart(clusterId, intervention, enrollment, engagement) {
        this.renderProjectionChart(clusterId, intervention, enrollment, engagement);
    },

    animateDrawIn() {
        const chartEl = document.getElementById('scenario-chart');
        if (!chartEl || !chartEl.data) return;

        // Animate lines drawing from left to right
        const trace0Y = [...chartEl.data[0].y];
        const trace1Y = [...chartEl.data[1].y];

        // Start with first point only
        Plotly.restyle('scenario-chart', {
            y: [[trace0Y[0]], [trace1Y[0]]]
        });

        // Animate remaining points
        let currentPoint = 1;
        const interval = setInterval(() => {
            if (currentPoint >= trace0Y.length) {
                clearInterval(interval);
                return;
            }

            Plotly.extendTraces('scenario-chart', {
                y: [[trace0Y[currentPoint]], [trace1Y[currentPoint]]]
            }, [0, 1]);

            currentPoint++;
        }, 50);
    }
};
