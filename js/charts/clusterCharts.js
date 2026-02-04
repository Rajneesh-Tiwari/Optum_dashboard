// Cluster Charts Module
const ClusterCharts = {
    selectedCluster: 1,

    init() {
        this.renderSegmentationChart();
        this.renderRadarChart();
        this.setupClusterTabs();
        this.renderClusterDetail(1);
    },

    renderSegmentationChart() {
        // Bubble chart showing cost vs population by cluster
        const data = [];

        // Find max member count for scaling
        const maxMembers = Math.max(...Object.values(CLUSTERS).map(c => c.member_count));

        for (let i = 1; i <= 5; i++) {
            const cluster = CLUSTERS[i];
            // Create abbreviated label for bubble
            const shortLabel = cluster.shortName.split(' ').map(w => w[0]).join('');

            // Size proportional to member count (scaled to reasonable bubble size)
            const bubbleSize = (cluster.member_count / maxMembers) * 60 + 20;

            data.push({
                x: [cluster.member_count],
                y: [cluster.avg_pmpy],
                mode: 'markers+text',
                type: 'scatter',
                name: cluster.shortName,
                text: [shortLabel],
                textposition: 'middle center',
                textfont: {
                    color: 'white',
                    size: 11,
                    family: 'Inter, sans-serif'
                },
                marker: {
                    size: bubbleSize,
                    sizemode: 'diameter',
                    color: cluster.color,
                    opacity: 0.85,
                    line: {
                        color: 'white',
                        width: 2
                    }
                },
                hovertemplate: `<b>${cluster.shortName}</b><br>` +
                    `Members: ${cluster.member_count}<br>` +
                    `Avg PMPY: $${cluster.avg_pmpy.toLocaleString()}<br>` +
                    `<extra></extra>`
            });
        }

        const layout = {
            showlegend: false,
            margin: { t: 20, b: 50, l: 70, r: 20 },
            xaxis: {
                title: 'Member Count',
                gridcolor: '#e5e5e5',
                zeroline: false
            },
            yaxis: {
                title: 'Avg PMPY ($)',
                tickformat: '$,.0f',
                gridcolor: '#e5e5e5',
                zeroline: false
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

        Plotly.newPlot('segmentation-chart', data, layout, config);
    },

    renderRadarChart(clusterId = 1) {
        const cluster = CLUSTERS[clusterId];

        // Normalize values for radar display
        const categories = ['HCC Score', 'A1C', 'ER Visits', 'Hospitalizations', 'Cost'];
        const maxValues = [4.5, 12, 5, 3, 150000];

        const clusterMembers = MEMBERS.filter(m => m.cluster === clusterId);
        const avgHcc = clusterMembers.reduce((sum, m) => sum + m.hcc_score, 0) / clusterMembers.length;
        const avgA1c = clusterMembers.reduce((sum, m) => sum + m.a1c, 0) / clusterMembers.length;
        const avgEr = clusterMembers.reduce((sum, m) => sum + m.er_visits_ytd, 0) / clusterMembers.length;
        const avgHosp = clusterMembers.reduce((sum, m) => sum + m.hospitalizations_ytd, 0) / clusterMembers.length;

        const values = [
            avgHcc / maxValues[0] * 100,
            avgA1c / maxValues[1] * 100,
            avgEr / maxValues[2] * 100,
            avgHosp / maxValues[3] * 100,
            cluster.avg_pmpy / maxValues[4] * 100
        ];

        const trace = {
            type: 'scatterpolar',
            r: [...values, values[0]], // Close the shape
            theta: [...categories, categories[0]],
            fill: 'toself',
            fillcolor: cluster.color + '40',
            line: {
                color: cluster.color,
                width: 2
            },
            marker: {
                color: cluster.color,
                size: 6
            },
            hovertemplate: '%{theta}: %{r:.1f}%<extra></extra>'
        };

        const layout = {
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 100],
                    ticksuffix: '%',
                    tickfont: { size: 10 }
                },
                angularaxis: {
                    tickfont: { size: 11 }
                }
            },
            margin: { t: 30, b: 30, l: 60, r: 60 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            font: {
                family: 'Inter, system-ui, sans-serif'
            }
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot('radar-chart', [trace], layout, config);
    },

    setupClusterTabs() {
        const tabs = document.querySelectorAll('.cluster-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const clusterId = parseInt(tab.dataset.cluster);
                this.selectedCluster = clusterId;
                this.renderClusterDetail(clusterId);
            });
        });
    },

    renderClusterDetail(clusterId) {
        const cluster = CLUSTERS[clusterId];
        const members = MEMBERS.filter(m => m.cluster === clusterId);

        // Update clinical metrics
        this.updateClinicalMetrics(members, clusterId);

        // Update utilization metrics
        this.updateUtilizationMetrics(members);

        // Render LOB breakdown
        this.renderLobChart(cluster.by_lob, clusterId);

        // Render cost distribution
        this.renderCostDistribution(members, clusterId);

        // Render geographic concentration
        this.renderGeoConcentration(members, clusterId);

        // Update sub-clusters if Cluster 1
        this.updateSubclusters(clusterId, members);

        // Update LLM insight
        const insightKey = `cluster_${clusterId}_detail`;
        if (LLM_RESPONSES[insightKey]) {
            const insightEl = document.querySelector('#cluster-detail .llm-text');
            if (insightEl) {
                insightEl.dataset.insight = insightKey;
                LLMInsight.typeText(insightEl, LLM_RESPONSES[insightKey]);
            }
        }
    },

    updateClinicalMetrics(members, clusterId) {
        const avgHcc = members.reduce((sum, m) => sum + m.hcc_score, 0) / members.length;
        const avgA1c = members.reduce((sum, m) => sum + m.a1c, 0) / members.length;
        const avgEgfr = members.reduce((sum, m) => sum + m.egfr, 0) / members.length;
        const avgBpSys = members.reduce((sum, m) => sum + m.bp_systolic, 0) / members.length;
        const avgBpDia = members.reduce((sum, m) => sum + m.bp_diastolic, 0) / members.length;

        const metricsEl = document.getElementById('clinical-metrics');
        if (metricsEl) {
            metricsEl.innerHTML = `
                <div class="flex justify-between">
                    <span>Avg HCC Score</span>
                    <span class="font-bold text-cluster-${clusterId}">${avgHcc.toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                    <span>Avg A1C</span>
                    <span class="font-bold">${avgA1c.toFixed(1)}%</span>
                </div>
                <div class="flex justify-between">
                    <span>Avg eGFR</span>
                    <span class="font-bold ${avgEgfr < 30 ? 'text-risk-high' : avgEgfr < 60 ? 'text-risk-medium' : ''}">${avgEgfr.toFixed(0)} mL/min</span>
                </div>
                <div class="flex justify-between">
                    <span>Avg BP</span>
                    <span class="font-bold">${avgBpSys.toFixed(0)}/${avgBpDia.toFixed(0)}</span>
                </div>
            `;
        }
    },

    updateUtilizationMetrics(members) {
        const avgEr = members.reduce((sum, m) => sum + m.er_visits_ytd, 0) / members.length;
        const avgHosp = members.reduce((sum, m) => sum + m.hospitalizations_ytd, 0) / members.length;
        const avgSpec = members.reduce((sum, m) => sum + m.specialist_visits_ytd, 0) / members.length;

        const utilEl = document.getElementById('utilization-metrics');
        if (utilEl) {
            utilEl.innerHTML = `
                <div class="flex justify-between">
                    <span>ER Visits</span>
                    <span class="font-bold">${avgEr.toFixed(1)} avg</span>
                </div>
                <div class="flex justify-between">
                    <span>Hospitalizations</span>
                    <span class="font-bold">${avgHosp.toFixed(1)} avg</span>
                </div>
                <div class="flex justify-between">
                    <span>Specialist Visits</span>
                    <span class="font-bold">${avgSpec.toFixed(1)} avg</span>
                </div>
            `;
        }
    },

    renderLobChart(lobData, clusterId) {
        const lobs = Object.keys(lobData);
        const counts = Object.values(lobData);
        const colors = ['#FF612B', '#002677', '#22C55E', '#3B82F6'];

        const trace = {
            type: 'pie',
            labels: lobs,
            values: counts,
            hole: 0.5,
            marker: {
                colors: colors
            },
            textinfo: 'percent',
            textposition: 'inside',
            hovertemplate: '%{label}: %{value}<extra></extra>'
        };

        const layout = {
            margin: { t: 10, b: 10, l: 10, r: 10 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            font: {
                family: 'Inter, system-ui, sans-serif',
                size: 11
            }
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot('cluster-lob-chart', [trace], layout, config);
    },

    renderCostDistribution(members, clusterId) {
        const costs = members.map(m => m.pmpy);
        const cluster = CLUSTERS[clusterId];

        const trace = {
            type: 'histogram',
            x: costs,
            nbinsx: 20,
            marker: {
                color: cluster.color,
                line: {
                    color: 'white',
                    width: 1
                }
            },
            hovertemplate: 'PMPY Range: $%{x:,.0f}<br>Count: %{y}<extra></extra>'
        };

        const layout = {
            margin: { t: 10, b: 40, l: 50, r: 20 },
            xaxis: {
                title: 'PMPY ($)',
                tickformat: '$,.0f'
            },
            yaxis: {
                title: 'Count'
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

        Plotly.newPlot('cluster-cost-dist', [trace], layout, config);
    },

    renderGeoConcentration(members, clusterId) {
        // Count members by region
        const regionCounts = {};
        members.forEach(m => {
            regionCounts[m.region] = (regionCounts[m.region] || 0) + 1;
        });

        const regions = Object.keys(regionCounts);
        const counts = Object.values(regionCounts);
        const cluster = CLUSTERS[clusterId];

        const trace = {
            type: 'bar',
            x: regions,
            y: counts,
            marker: {
                color: cluster.color
            },
            hovertemplate: '%{x}: %{y} members<extra></extra>'
        };

        const layout = {
            margin: { t: 10, b: 60, l: 50, r: 20 },
            xaxis: {
                tickangle: -45
            },
            yaxis: {
                title: 'Members'
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

        Plotly.newPlot('cluster-geo-chart', [trace], layout, config);
    },

    updateSubclusters(clusterId, members) {
        const card = document.getElementById('subclusters-card');
        const content = document.getElementById('subclusters-content');

        if (clusterId === 1) {
            // Show Medicare Cluster 1 sub-clusters
            const complexFrail = members.filter(m => m.is_complex_frail);
            const nonOutreach = members.filter(m => m.is_non_outreach);
            const standard = members.filter(m => !m.is_complex_frail && !m.is_non_outreach);

            content.innerHTML = `
                <div class="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div class="font-semibold text-risk-high">Complex Frail (${complexFrail.length})</div>
                    <div class="text-sm text-optum-gray">Age 75+, multiple comorbidities, highest cost</div>
                </div>
                <div class="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div class="font-semibold text-cluster-2">Non-Outreach (${nonOutreach.length})</div>
                    <div class="text-sm text-optum-gray">No PCP visit 18+ months, disengaged</div>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="font-semibold">Standard Risk (${standard.length})</div>
                    <div class="text-sm text-optum-gray">Active engagement, care plan in place</div>
                </div>
            `;
        } else if (clusterId === 2) {
            const deteriorating = members.filter(m => m.trajectory === 'deteriorating');
            const stable = members.filter(m => m.trajectory === 'stable');
            const improving = members.filter(m => m.trajectory === 'improving');

            content.innerHTML = `
                <div class="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div class="font-semibold text-risk-high">Deteriorating (${deteriorating.length})</div>
                    <div class="text-sm text-optum-gray">Declining eGFR, worsening A1C</div>
                </div>
                <div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div class="font-semibold text-cluster-3">Stable (${stable.length})</div>
                    <div class="text-sm text-optum-gray">Holding pattern, intervention needed</div>
                </div>
                <div class="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div class="font-semibold text-cluster-4">Improving (${improving.length})</div>
                    <div class="text-sm text-optum-gray">Responding to current treatment</div>
                </div>
            `;
        } else {
            const sdohHigh = members.filter(m => m.food_insecurity || m.transportation_barrier);
            const engaged = members.filter(m => m.engagement === 'active');
            const disengaged = members.filter(m => m.engagement === 'disengaged');

            content.innerHTML = `
                <div class="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div class="font-semibold text-cluster-2">SDOH Challenges (${sdohHigh.length})</div>
                    <div class="text-sm text-optum-gray">Food insecurity or transportation barriers</div>
                </div>
                <div class="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div class="font-semibold text-cluster-4">Actively Engaged (${engaged.length})</div>
                    <div class="text-sm text-optum-gray">Regular appointments, good adherence</div>
                </div>
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="font-semibold">Disengaged (${disengaged.length})</div>
                    <div class="text-sm text-optum-gray">Requires outreach strategy</div>
                </div>
            `;
        }
    }
};
