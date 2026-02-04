// Detail Panel Module
const DetailPanel = {
    panel: null,
    content: null,
    closeBtn: null,
    isOpen: false,

    init() {
        this.panel = document.getElementById('detail-panel');
        this.content = document.getElementById('panel-content');
        this.closeBtn = document.getElementById('panel-close');

        this.setupEventListeners();
    },

    setupEventListeners() {
        // Close button
        this.closeBtn.addEventListener('click', () => this.close());

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.isOpen &&
                !this.panel.contains(e.target) &&
                !e.target.closest('.region-stat') &&
                !e.target.closest('.cluster-card')) {
                this.close();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Region stat clicks are handled by MapChart.setupRegionClicks()
        // which is called by MapChart.setupEarly() in App.initModules()
    },

    open() {
        this.panel.classList.add('open');
        this.isOpen = true;
    },

    close() {
        this.panel.classList.remove('open');
        this.isOpen = false;
    },

    showCounty(countyData) {
        const members = MEMBERS.filter(m => m.county_fips === countyData.fips);
        const clusterDist = {};
        for (let i = 1; i <= 5; i++) {
            clusterDist[i] = members.filter(m => m.cluster === i).length;
        }

        this.content.innerHTML = `
            <h2 class="text-2xl font-bold text-optum-navy mb-4">${countyData.name} County</h2>
            <div class="text-sm text-optum-gray mb-6">${countyData.region} Region</div>

            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Population</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-optum-orange">${members.length}</div>
                            <div class="text-xs text-optum-gray">Members</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-optum-orange">${countyData.population.toLocaleString()}</div>
                            <div class="text-xs text-optum-gray">Total Pop</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Health Indicators</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm">ESRD Rate (per 1,000)</span>
                            <span class="font-semibold ${countyData.esrd_rate_per_1000 > 2 ? 'text-risk-high' : ''}">${countyData.esrd_rate_per_1000.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Diabetes Prevalence</span>
                            <span class="font-semibold">${countyData.diabetes_prevalence}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Obesity Rate</span>
                            <span class="font-semibold">${countyData.obesity_rate}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Avg PMPY</span>
                            <span class="font-semibold">$${countyData.avg_pmpy.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">SDOH Factors</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm">Poverty Rate</span>
                            <span class="font-semibold ${countyData.poverty_rate > 20 ? 'text-risk-high' : ''}">${countyData.poverty_rate}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Uninsured Rate</span>
                            <span class="font-semibold">${countyData.uninsured_rate}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Food Desert</span>
                            <span class="font-semibold">${countyData.food_desert_pct}%</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Access Metrics</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm">PCPs per 10,000</span>
                            <span class="font-semibold ${countyData.pcp_per_10k < 5 ? 'text-risk-high' : ''}">${countyData.pcp_per_10k}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Specialists per 10,000</span>
                            <span class="font-semibold">${countyData.specialist_per_10k}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Hospital Distance</span>
                            <span class="font-semibold">${countyData.hospital_distance_miles} mi</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Segment Distribution</h3>
                    <div class="space-y-2">
                        ${Object.entries(clusterDist).map(([cluster, count]) => `
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-cluster-${cluster}"></div>
                                <span class="text-sm flex-1">${CLUSTERS[cluster].shortName}</span>
                                <span class="font-semibold">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.open();
    },

    showRegion(region) {
        const regionData = REGIONAL_SUMMARY[region];
        if (!regionData) return;

        const regionCounties = COUNTIES.filter(c => c.region === region);

        this.content.innerHTML = `
            <h2 class="text-2xl font-bold text-optum-navy mb-4">${region} Region</h2>

            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Overview</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-optum-orange">${regionData.member_count}</div>
                            <div class="text-xs text-optum-gray">Members</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-optum-orange">$${regionData.avg_pmpy.toLocaleString()}</div>
                            <div class="text-xs text-optum-gray">Avg PMPY</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-optum-orange">${regionCounties.length}</div>
                            <div class="text-xs text-optum-gray">Counties</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold ${regionData.esrd_rate > 15 ? 'text-risk-high' : 'text-optum-orange'}">${regionData.esrd_rate}%</div>
                            <div class="text-xs text-optum-gray">Critical Renal</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Segment Distribution</h3>
                    <div class="space-y-2">
                        ${Object.entries(regionData.cluster_distribution).map(([cluster, count]) => `
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-cluster-${cluster}"></div>
                                <span class="text-sm flex-1">${CLUSTERS[cluster].shortName}</span>
                                <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-cluster-${cluster} rounded-full" style="width: ${(count / regionData.member_count * 100).toFixed(0)}%"></div>
                                </div>
                                <span class="font-semibold text-sm w-12 text-right">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Counties</h3>
                    <div class="space-y-1 max-h-48 overflow-y-auto">
                        ${regionCounties.map(c => `
                            <div class="flex justify-between text-sm py-1 border-b border-gray-100">
                                <span>${c.name}</span>
                                <span class="text-optum-gray">${c.risk_mult.toFixed(2)}x risk</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-gradient-to-br from-optum-navy to-optum-blue rounded-lg p-4 text-white">
                    <div class="flex items-center gap-2 mb-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3z"/>
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clip-rule="evenodd"/>
                        </svg>
                        <span class="font-semibold text-sm">Regional Insight</span>
                    </div>
                    <p class="text-sm opacity-90">${this.getRegionInsight(region)}</p>
                </div>
            </div>
        `;

        // Highlight region on map
        if (typeof MapChart !== 'undefined') {
            MapChart.highlightRegion(region);
        }

        this.open();
    },

    getRegionInsight(region) {
        const insights = {
            'Delta': 'The Delta region shows the highest concentration of ESRD risk factors, with 2.3x higher rates than state average. Targeted intervention here offers highest impact potential.',
            'Northwest': 'Northwest Arkansas demonstrates best-in-state outcomes despite similar chronic disease prevalence. Key success factors include integrated health systems and strong community health infrastructure.',
            'Little Rock': 'The metro region benefits from good access but shows care fragmentation. Care coordination programs could address 15% of excess utilization.',
            'Southwest': 'SDOH challenges predominate in Southwest counties. Food insecurity affects 34% of high-risk members. SDOH support services show 2.8x ROI in this region.',
            'River Valley': 'Mixed outcomes across River Valley counties suggest targeted, county-specific interventions rather than regional programs.'
        };
        return insights[region] || 'Regional analysis in progress.';
    },

    showCluster(clusterId) {
        const cluster = CLUSTERS[clusterId];
        const members = MEMBERS.filter(m => m.cluster === clusterId);

        // Calculate statistics
        const avgAge = members.reduce((sum, m) => sum + m.age, 0) / members.length;
        const avgHcc = members.reduce((sum, m) => sum + m.hcc_score, 0) / members.length;
        const avgA1c = members.reduce((sum, m) => sum + m.a1c, 0) / members.length;
        const avgEgfr = members.reduce((sum, m) => sum + m.egfr, 0) / members.length;

        this.content.innerHTML = `
            <h2 class="text-2xl font-bold text-optum-navy mb-2">${cluster.shortName}</h2>
            <div class="text-sm text-cluster-${clusterId} font-semibold mb-4">${cluster.name}</div>
            <p class="text-sm text-optum-gray mb-6">${cluster.description}</p>

            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Key Metrics</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-cluster-${clusterId}">${cluster.member_count}</div>
                            <div class="text-xs text-optum-gray">Members</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold text-cluster-${clusterId}">$${cluster.avg_pmpy.toLocaleString()}</div>
                            <div class="text-xs text-optum-gray">Avg PMPY</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold">${avgAge.toFixed(0)}</div>
                            <div class="text-xs text-optum-gray">Avg Age</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-lg">
                            <div class="text-2xl font-bold">${avgHcc.toFixed(2)}</div>
                            <div class="text-xs text-optum-gray">Avg HCC</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Clinical Profile</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm">Avg A1C</span>
                            <span class="font-semibold">${avgA1c.toFixed(1)}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Avg eGFR</span>
                            <span class="font-semibold">${avgEgfr.toFixed(0)} mL/min</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">Common Conditions</h3>
                    <div class="flex flex-wrap gap-2">
                        ${cluster.conditions.map(c => `
                            <span class="px-2 py-1 bg-cluster-${clusterId} bg-opacity-10 text-cluster-${clusterId} rounded text-sm">${c}</span>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-optum-navy mb-3">LOB Distribution</h3>
                    <div class="space-y-2">
                        ${Object.entries(cluster.by_lob).map(([lob, count]) => `
                            <div class="flex items-center gap-2">
                                <span class="text-sm flex-1">${lob}</span>
                                <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div class="h-full bg-optum-orange rounded-full" style="width: ${(count / cluster.member_count * 100).toFixed(0)}%"></div>
                                </div>
                                <span class="font-semibold text-sm w-12 text-right">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.open();
    }
};
