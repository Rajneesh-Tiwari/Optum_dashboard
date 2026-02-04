// Main Application - Optum Cardio-Metabolic Demo
const App = {
    initialized: false,

    init() {
        if (this.initialized) return;

        console.log('Initializing Optum Cardio-Metabolic Demo...');

        // Wait for DOM and data
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    },

    setup() {
        // Verify data is loaded
        if (typeof MEMBERS === 'undefined' || typeof CLUSTERS === 'undefined') {
            console.error('Data files not loaded');
            return;
        }

        console.log(`Loaded ${MEMBERS.length} members, ${Object.keys(CLUSTERS).length} clusters`);

        // Initialize modules
        this.initModules();

        // Setup global event listeners
        this.setupEventListeners();

        // Check for mobile
        this.checkMobile();

        this.initialized = true;
        console.log('Demo initialized successfully');
    },

    initModules() {
        // Navigation
        Navigation.init();

        // Detail Panel
        DetailPanel.init();

        // LLM Insight typewriter
        LLMInsight.init();
        LLMInsight.setupScrollTriggers();

        // Setup map layer buttons to init map on first click
        this.setupMapLayerButtons();

        // Scroll Animations (initializes charts on scroll)
        ScrollAnimations.init();
    },

    setupMapLayerButtons() {
        // Set up map button handlers early so they work before scroll
        MapChart.setupEarly();
    },

    setupEventListeners() {
        // Section change event
        document.addEventListener('sectionChange', (e) => {
            const { index, section } = e.detail;
            this.onSectionChange(index, section);
        });

        // Cluster card clicks
        document.querySelectorAll('.cluster-card').forEach(card => {
            card.addEventListener('click', () => {
                const clusterId = parseInt(card.dataset.cluster);
                DetailPanel.showCluster(clusterId);
            });
        });

        // Keyboard navigation is now handled by Navigation module

        // Window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                ScrollAnimations.refresh();
            }, 250);
        });
    },

    onSectionChange(index, section) {
        // Track section view (for analytics if needed)
        console.log(`Section ${index}: ${section.id}`);
    },

    checkMobile() {
        const isMobile = window.innerWidth < 1280;
        if (isMobile) {
            console.log('Mobile device detected - showing desktop-only message');
        }
    },

    // Utility: Format currency
    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },

    // Utility: Format percentage
    formatPercent(value) {
        return `${value.toFixed(1)}%`;
    },

    // Utility: Format number with commas
    formatNumber(value) {
        return new Intl.NumberFormat('en-US').format(value);
    },

    // Calculate summary statistics
    getSummaryStats() {
        const totalMembers = MEMBERS.length;
        const totalSpend = MEMBERS.reduce((sum, m) => sum + m.pmpy, 0);
        const avgPmpy = totalSpend / totalMembers;
        const avgHcc = MEMBERS.reduce((sum, m) => sum + m.hcc_score, 0) / totalMembers;

        const cluster1Members = MEMBERS.filter(m => m.cluster === 1);
        const cluster1Spend = cluster1Members.reduce((sum, m) => sum + m.pmpy, 0);

        return {
            totalMembers,
            totalSpend,
            avgPmpy,
            avgHcc,
            cluster1Count: cluster1Members.length,
            cluster1SpendPct: (cluster1Spend / totalSpend * 100),
            topDecileSpendPct: this.calculateTopDecileSpend()
        };
    },

    calculateTopDecileSpend() {
        const sortedByPmpy = [...MEMBERS].sort((a, b) => b.pmpy - a.pmpy);
        const topDecile = sortedByPmpy.slice(0, Math.floor(MEMBERS.length * 0.1));
        const topDecileSpend = topDecile.reduce((sum, m) => sum + m.pmpy, 0);
        const totalSpend = MEMBERS.reduce((sum, m) => sum + m.pmpy, 0);
        return (topDecileSpend / totalSpend * 100);
    },

    // Export data for debugging
    exportDebugData() {
        return {
            members: MEMBERS.length,
            clusters: CLUSTERS,
            counties: COUNTIES.length,
            scenarios: SCENARIOS.length,
            davita: DAVITA_INSIGHT,
            regional: REGIONAL_SUMMARY
        };
    }
};

// Initialize on load
App.init();
