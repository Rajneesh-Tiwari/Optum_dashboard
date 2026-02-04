// Population Charts Module
const PopulationCharts = {
    initialized: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Small delay to ensure container is ready
        setTimeout(() => {
            this.renderCostByCluster();
        }, 100);
    },

    renderCostByCluster() {
        const chartEl = document.getElementById('population-chart');
        if (!chartEl) return;

        const clusterData = [];

        for (let i = 1; i <= 5; i++) {
            const cluster = CLUSTERS[i];
            clusterData.push({
                cluster: i,
                shortName: cluster.shortName,
                name: cluster.name,
                count: cluster.member_count,
                avgPmpy: cluster.avg_pmpy,
                color: cluster.color
            });
        }

        // Sort by cost descending
        clusterData.sort((a, b) => b.avgPmpy - a.avgPmpy);

        const trace = {
            type: 'bar',
            orientation: 'h',
            y: clusterData.map(d => d.shortName),
            x: clusterData.map(d => d.avgPmpy),
            text: clusterData.map(d => `$${d.avgPmpy.toLocaleString()}`),
            textposition: 'outside',
            marker: {
                color: clusterData.map(d => d.color)
            },
            hovertemplate: '<b>%{y}</b><br>' +
                'Avg PMPY: $%{x:,.0f}<br>' +
                '<extra></extra>'
        };

        const layout = {
            margin: { t: 20, b: 40, l: 120, r: 80 },
            xaxis: {
                title: 'Average PMPY ($)',
                tickformat: '$,.0f',
                gridcolor: '#e5e5e5',
                range: [0, Math.max(...clusterData.map(d => d.avgPmpy)) * 1.15]
            },
            yaxis: {
                automargin: true
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'Inter, system-ui, sans-serif'
            }
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot('population-chart', [trace], layout, config).then(() => {
            // Force a resize after rendering
            Plotly.Plots.resize(chartEl);
        });
    },

    // Resize chart (call when section becomes visible)
    resize() {
        const chartEl = document.getElementById('population-chart');
        if (chartEl) {
            Plotly.Plots.resize(chartEl);
        }
    }
};
