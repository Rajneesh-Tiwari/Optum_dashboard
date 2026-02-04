// Timeline Chart Module
const TimelineChart = {
    init() {
        this.renderTimelineChart();
    },

    renderTimelineChart() {
        // Aggregate projections across clusters
        const months = Array.from({ length: 24 }, (_, i) => i + 1);

        // Calculate weighted baseline and intervention costs
        const baselineCosts = months.map(month => {
            let total = 0;
            PROJECTIONS.forEach(proj => {
                const cluster = CLUSTERS[proj.cluster];
                const monthData = proj.baseline.find(d => d.month === month);
                if (monthData) {
                    total += monthData.cost * cluster.member_count;
                }
            });
            return total;
        });

        const interventionCosts = months.map(month => {
            let total = 0;
            PROJECTIONS.forEach(proj => {
                const cluster = CLUSTERS[proj.cluster];
                const monthData = proj.intervention.find(d => d.month === month);
                if (monthData) {
                    total += monthData.cost * cluster.member_count;
                }
            });
            return total;
        });

        // Calculate cumulative savings
        let cumulativeSavings = 0;
        const savingsOverTime = months.map((month, i) => {
            cumulativeSavings += (baselineCosts[i] - interventionCosts[i]);
            return cumulativeSavings;
        });

        const traces = [
            // Baseline area
            {
                type: 'scatter',
                mode: 'lines',
                name: 'Baseline Trajectory',
                x: months,
                y: baselineCosts.map(c => c / 1000), // Convert to thousands
                line: {
                    color: '#EF4444',
                    width: 2
                },
                fill: 'tozeroy',
                fillcolor: 'rgba(239, 68, 68, 0.1)',
                hovertemplate: 'Month %{x}<br>Baseline: $%{y:.0f}K<extra></extra>'
            },
            // Intervention area
            {
                type: 'scatter',
                mode: 'lines',
                name: 'With Intervention',
                x: months,
                y: interventionCosts.map(c => c / 1000),
                line: {
                    color: '#22C55E',
                    width: 2
                },
                fill: 'tozeroy',
                fillcolor: 'rgba(34, 197, 94, 0.3)',
                hovertemplate: 'Month %{x}<br>Intervention: $%{y:.0f}K<extra></extra>'
            },
            // Cumulative savings line (secondary y-axis)
            {
                type: 'scatter',
                mode: 'lines',
                name: 'Cumulative Savings',
                x: months,
                y: savingsOverTime.map(s => s / 1000000), // Convert to millions
                line: {
                    color: '#3B82F6',
                    width: 3,
                    dash: 'dot'
                },
                yaxis: 'y2',
                hovertemplate: 'Month %{x}<br>Cumulative Savings: $%{y:.1f}M<extra></extra>'
            }
        ];

        // Add milestone markers
        const milestones = [
            { month: 1, label: 'Launch' },
            { month: 3, label: 'Full Enrollment' },
            { month: 6, label: 'Break-Even' },
            { month: 12, label: 'Year 1 Review' },
            { month: 24, label: 'Maturity' }
        ];

        const layout = {
            margin: { t: 30, b: 50, l: 70, r: 70 },
            xaxis: {
                title: 'Month',
                tickvals: [1, 6, 12, 18, 24],
                gridcolor: '#e5e5e5',
                zeroline: false
            },
            yaxis: {
                title: 'Monthly Cost ($K)',
                tickformat: '$,.0f',
                gridcolor: '#e5e5e5',
                zeroline: false
            },
            yaxis2: {
                title: 'Cumulative Savings ($M)',
                tickformat: '$,.1f',
                overlaying: 'y',
                side: 'right',
                showgrid: false,
                zeroline: false
            },
            legend: {
                orientation: 'h',
                y: 1.12,
                x: 0.5,
                xanchor: 'center'
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'Inter, system-ui, sans-serif'
            },
            shapes: milestones.map(m => ({
                type: 'line',
                x0: m.month,
                x1: m.month,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                    color: '#FF612B',
                    width: 1,
                    dash: 'dash'
                }
            }))
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot('timeline-chart', traces, layout, config);
    },

    animateDrawIn() {
        const chartEl = document.getElementById('timeline-chart');
        if (!chartEl || !chartEl.data) return;

        const traces = chartEl.data;
        const finalData = traces.map(t => [...t.y]);

        // Start with empty
        Plotly.restyle('timeline-chart', {
            y: traces.map(() => [])
        });

        // Animate points appearing
        let currentPoint = 0;
        const totalPoints = finalData[0].length;

        const interval = setInterval(() => {
            if (currentPoint >= totalPoints) {
                clearInterval(interval);
                return;
            }

            const newY = finalData.map(data => data.slice(0, currentPoint + 1));
            Plotly.restyle('timeline-chart', { y: newY });
            currentPoint++;
        }, 40);
    },

    renderPersonaTrajectory(persona = 'james') {
        const containerId = persona === 'james' ? 'persona-trajectory-chart' : 'persona-maria-trajectory';

        let months, baseline, intervention, label;

        if (persona === 'james') {
            // James - Cluster 2, showing A1C trajectory
            months = ['Now', '3mo', '6mo', '12mo', '18mo', '24mo'];
            baseline = [10.2, 10.4, 10.8, 11.2, 11.5, 12.0];
            intervention = [10.2, 9.8, 9.2, 8.4, 7.9, 7.6];
            label = 'A1C (%)';
        } else {
            // Maria - Cluster 1, showing cost trajectory
            months = ['Now', '3mo', '6mo', '12mo', '18mo', '24mo'];
            baseline = [142, 148, 156, 168, 180, 195];
            intervention = [142, 138, 130, 122, 118, 115];
            label = 'PMPY ($K)';
        }

        const traces = [
            {
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Without Intervention',
                x: months,
                y: baseline,
                line: { color: '#EF4444', width: 2 },
                marker: { size: 8 }
            },
            {
                type: 'scatter',
                mode: 'lines+markers',
                name: 'With Intervention',
                x: months,
                y: intervention,
                line: { color: '#22C55E', width: 2 },
                marker: { size: 8 }
            }
        ];

        const layout = {
            margin: { t: 10, b: 40, l: 50, r: 20 },
            xaxis: {
                tickangle: -45
            },
            yaxis: {
                title: label
            },
            legend: {
                orientation: 'h',
                y: -0.3,
                x: 0.5,
                xanchor: 'center',
                font: { size: 10 }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'Inter, system-ui, sans-serif',
                size: 11
            }
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot(containerId, traces, layout, config);
    }
};
