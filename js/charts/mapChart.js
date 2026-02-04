// Map Chart Module - Arkansas County Choropleth
const MapChart = {
    geoData: null,
    currentLayer: 'risk',
    chart: null,
    initialized: false,
    initPromise: null,
    buttonsSetup: false,

    setupEarly() {
        if (!this.buttonsSetup) {
            this.setupLayerButtons();
            this.setupRegionClicks();
            this.buttonsSetup = true;
        }
    },

    async init() {
        if (this.initialized) return Promise.resolve();
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            this.setupEarly();

            // Use embedded GeoJSON data (no fetch needed, works offline)
            this.geoData = ARKANSAS_GEOJSON;
            console.log('GeoJSON loaded:', this.geoData.features.length, 'features');
            this.render();
            this.initialized = true;
        })();

        return this.initPromise;
    },

    getLayerData(layer) {
        const countyData = {};
        COUNTIES.forEach(county => {
            let value;
            switch (layer) {
                case 'risk': value = county.risk_multiplier; break;
                case 'cost': value = county.avg_pmpy; break;
                case 'esrd': value = county.esrd_rate_per_1000; break;
                case 'access': value = county.pcp_per_10k; break;
                case 'sdoh': value = county.poverty_rate; break;
                default: value = county.risk_multiplier;
            }
            countyData[county.fips] = { value, name: county.name, region: county.region, ...county };
        });
        return countyData;
    },

    getColorScale(layer) {
        if (layer === 'access') {
            return [[0, '#EF4444'], [0.5, '#EAB308'], [1, '#22C55E']];
        }
        return [[0, '#22C55E'], [0.5, '#EAB308'], [1, '#EF4444']];
    },

    getValueRange(layer) {
        switch (layer) {
            case 'risk': return [0.8, 1.6];
            case 'cost': return [15000, 55000];
            case 'esrd': return [0.8, 3.5];
            case 'access': return [2, 12];
            case 'sdoh': return [10, 35];
            default: return [0, 1];
        }
    },

    getLayerTitle(layer) {
        switch (layer) {
            case 'risk': return 'Risk Multiplier';
            case 'cost': return 'Avg PMPY ($)';
            case 'esrd': return 'ESRD Rate (per 1,000)';
            case 'access': return 'PCPs per 10,000';
            case 'sdoh': return 'Poverty Rate (%)';
            default: return '';
        }
    },

    render() {
        if (!this.geoData) {
            console.error('No GeoJSON data available');
            return;
        }

        const layerData = this.getLayerData(this.currentLayer);
        const [zmin, zmax] = this.getValueRange(this.currentLayer);

        const locations = [];
        const z = [];
        const text = [];
        const customdata = [];

        this.geoData.features.forEach(feature => {
            const fips = feature.id;
            const data = layerData[fips];
            if (data) {
                locations.push(fips);
                z.push(data.value);
                text.push(data.name + ' County');
                customdata.push(data);
            }
        });

        console.log('Rendering map with', locations.length, 'counties');

        const trace = {
            type: 'choroplethmapbox',
            geojson: this.geoData,
            featureidkey: 'id',
            locations: locations,
            z: z,
            text: text,
            customdata: customdata,
            colorscale: this.getColorScale(this.currentLayer),
            zmin: zmin,
            zmax: zmax,
            marker: {
                opacity: 0.7,
                line: { width: 1, color: 'white' }
            },
            colorbar: {
                title: { text: this.getLayerTitle(this.currentLayer), font: { size: 12 } },
                thickness: 15,
                len: 0.7,
                x: 1.0,
                tickfont: { size: 10 }
            },
            hovertemplate: '<b>%{text}</b><br>' + this.getLayerTitle(this.currentLayer) + ': %{z:.2f}<extra></extra>'
        };

        const layout = {
            mapbox: {
                style: 'open-street-map',
                center: { lat: 34.75, lon: -92.3 },
                zoom: 5.8
            },
            margin: { t: 5, b: 5, l: 5, r: 50 },
            paper_bgcolor: 'rgba(0,0,0,0)'
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot('map-chart', [trace], layout, config).then(() => {
            console.log('Map rendered successfully');
            this.setupChartClickHandler();
        }).catch(err => {
            console.error('Plotly error:', err);
        });
    },

    setupChartClickHandler() {
        const chartEl = document.getElementById('map-chart');
        if (chartEl) {
            chartEl.on('plotly_click', (data) => {
                if (data.points && data.points[0]) {
                    const countyData = data.points[0].customdata;
                    if (countyData) {
                        DetailPanel.showCounty(countyData);
                    }
                }
            });
        }
    },

    setupLayerButtons() {
        const buttons = document.querySelectorAll('.map-layer-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentLayer = btn.dataset.layer;
                console.log('Switching to layer:', this.currentLayer);
                if (!this.initialized) {
                    await this.init();
                } else {
                    this.render();
                }
            });
        });
    },

    setupRegionClicks() {
        document.querySelectorAll('.region-stat').forEach(stat => {
            stat.addEventListener('click', async (e) => {
                e.preventDefault();
                const region = stat.dataset.region;
                if (!this.initialized) await this.init();
                DetailPanel.showRegion(region);
                this.highlightRegion(region);
            });
        });
    },

    highlightRegion(region) {
        document.querySelectorAll('.region-stat').forEach(stat => {
            if (stat.dataset.region === region) {
                stat.classList.add('bg-optum-light', 'border-l-4', 'border-optum-orange');
            } else {
                stat.classList.remove('bg-optum-light', 'border-l-4', 'border-optum-orange');
            }
        });
    },

    clearHighlight() {
        document.querySelectorAll('.region-stat').forEach(stat => {
            stat.classList.remove('bg-optum-light', 'border-l-4', 'border-optum-orange');
        });
    }
};
