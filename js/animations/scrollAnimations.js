// Scroll Animations Module - GSAP ScrollTrigger
const ScrollAnimations = {
    initialized: false,

    init() {
        if (this.initialized) return;

        gsap.registerPlugin(ScrollTrigger);

        // Get the scroll container
        this.scroller = document.getElementById('sections-container');

        // Configure ScrollTrigger to use our container
        ScrollTrigger.defaults({
            scroller: this.scroller
        });

        this.setupFadeUpAnimations();
        this.setupStatCounters();
        this.setupSectionTriggers();

        this.initialized = true;
    },

    setupFadeUpAnimations() {
        // Animate all fade-up elements
        gsap.utils.toArray('.fade-up').forEach(elem => {
            gsap.fromTo(elem,
                {
                    opacity: 0,
                    y: 40
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: elem,
                        scroller: this.scroller,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    },

    setupStatCounters() {
        // Animate stat numbers counting up
        gsap.utils.toArray('.stat-number').forEach(elem => {
            const target = parseInt(elem.dataset.target) || 0;

            ScrollTrigger.create({
                trigger: elem,
                scroller: this.scroller,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(elem, {
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: function() {
                            const progress = this.progress();
                            const current = Math.round(target * progress);
                            elem.textContent = current.toLocaleString();
                        }
                    });
                },
                once: true
            });
        });
    },

    setupSectionTriggers() {
        const scroller = this.scroller;

        // Section 1: Welcome
        ScrollTrigger.create({
            trigger: '#welcome',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                // Trigger stat counters
            }
        });

        // Section 2: Population Overview
        ScrollTrigger.create({
            trigger: '#population',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                PopulationCharts.init();
                setTimeout(() => PopulationCharts.resize(), 300);
                LLMInsight.triggerSectionInsight('population');
            },
            once: true
        });

        // Section 3: Geographic View
        ScrollTrigger.create({
            trigger: '#geographic',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                MapChart.init();
                LLMInsight.triggerSectionInsight('geographic');
            },
            once: true
        });

        // Section 4: Segmentation
        ScrollTrigger.create({
            trigger: '#segmentation',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                ClusterCharts.init();
                LLMInsight.triggerSectionInsight('segmentation');
            },
            once: true
        });

        // Section 5: Cluster Detail
        ScrollTrigger.create({
            trigger: '#cluster-detail',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                ClusterCharts.renderClusterDetail(1);
                LLMInsight.triggerSectionInsight('cluster-detail');
            },
            once: true
        });

        // Section 6: DaVita Insight
        ScrollTrigger.create({
            trigger: '#davita-insight',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                this.renderDaVitaCharts();
                LLMInsight.triggerSectionInsight('davita-insight');
            },
            once: true
        });

        // Section 7: Scenario Simulator
        ScrollTrigger.create({
            trigger: '#scenario',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                ScenarioSimulator.init();
                ScenarioCharts.init();
                LLMInsight.triggerSectionInsight('scenario');
            },
            once: true
        });

        // Section 8: Timeline
        ScrollTrigger.create({
            trigger: '#timeline',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                TimelineChart.init();
                setTimeout(() => TimelineChart.animateDrawIn(), 300);
                LLMInsight.triggerSectionInsight('timeline');
            },
            once: true
        });

        // Section 9: Persona
        ScrollTrigger.create({
            trigger: '#persona',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                this.setupPersonaToggle();
                TimelineChart.renderPersonaTrajectory('james');
                LLMInsight.triggerSectionInsight('persona');
            },
            once: true
        });

        // Section 10: CTA
        ScrollTrigger.create({
            trigger: '#cta',
            scroller: scroller,
            start: 'top center',
            onEnter: () => {
                LLMInsight.triggerSectionInsight('cta');
            },
            once: true
        });
    },

    renderDaVitaCharts() {
        // Update DaVita insight values from data
        if (typeof DAVITA_INSIGHT !== 'undefined') {
            document.getElementById('davita-count').textContent = DAVITA_INSIGHT.davita_count;
            document.getElementById('davita-cost').textContent = `$${DAVITA_INSIGHT.davita_avg_pmpy.toLocaleString()}`;
            document.getElementById('nondavita-count').textContent = DAVITA_INSIGHT.non_davita_count;
            document.getElementById('nondavita-cost').textContent = `$${DAVITA_INSIGHT.non_davita_avg_pmpy.toLocaleString()}`;
            document.getElementById('cost-gap').textContent = `${DAVITA_INSIGHT.gap_pct}%`;
        }

        // Render waterfall chart
        this.renderWaterfallChart();
    },

    renderWaterfallChart() {
        const rawGap = DAVITA_INSIGHT.davita_avg_pmpy - DAVITA_INSIGHT.non_davita_avg_pmpy;
        const severityAdjustment = rawGap * 0.18; // 18% explained by severity
        const unexplained = rawGap - severityAdjustment;

        const trace = {
            type: 'waterfall',
            orientation: 'v',
            x: ['Non-DaVita<br>Baseline', 'Raw Gap', 'Severity<br>Adjustment', 'Unexplained<br>Gap', 'DaVita<br>Actual'],
            y: [DAVITA_INSIGHT.non_davita_avg_pmpy, rawGap, -severityAdjustment, 0, 0],
            measure: ['absolute', 'relative', 'relative', 'relative', 'total'],
            text: [
                `$${DAVITA_INSIGHT.non_davita_avg_pmpy.toLocaleString()}`,
                `+$${rawGap.toLocaleString()}`,
                `-$${severityAdjustment.toLocaleString()}`,
                '',
                `$${DAVITA_INSIGHT.davita_avg_pmpy.toLocaleString()}`
            ],
            textposition: 'outside',
            connector: {
                line: { color: '#e5e5e5', width: 1 }
            },
            increasing: { marker: { color: '#EF4444' } },
            decreasing: { marker: { color: '#22C55E' } },
            totals: { marker: { color: '#002677' } }
        };

        const layout = {
            margin: { t: 20, b: 60, l: 70, r: 20 },
            yaxis: {
                title: 'PMPY ($)',
                tickformat: '$,.0f'
            },
            xaxis: {
                tickangle: 0
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                family: 'Inter, system-ui, sans-serif',
                size: 11
            },
            showlegend: false
        };

        const config = {
            responsive: true,
            displayModeBar: false
        };

        Plotly.newPlot('waterfall-chart', [trace], layout, config);
    },

    setupPersonaToggle() {
        const buttons = document.querySelectorAll('.persona-btn');
        const panels = document.querySelectorAll('.persona-panel');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const persona = btn.dataset.persona;

                // Update button states
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update panels
                panels.forEach(panel => {
                    if (panel.dataset.persona === persona) {
                        panel.style.display = 'block';
                        // Animate in
                        gsap.fromTo(panel,
                            { opacity: 0, x: 20 },
                            { opacity: 1, x: 0, duration: 0.3 }
                        );
                    } else {
                        panel.style.display = 'none';
                    }
                });

                // Update trajectory chart
                TimelineChart.renderPersonaTrajectory(persona);

                // Update LLM insight
                const insightKey = `persona_${persona}`;
                const insightEl = document.querySelector(`[data-persona="${persona}"] .llm-text`);
                if (insightEl && LLM_RESPONSES[insightKey]) {
                    LLMInsight.typeText(insightEl, LLM_RESPONSES[insightKey]);
                }
            });
        });
    },

    // Progress bar animations
    animateProgressBars(container) {
        const bars = container.querySelectorAll('.progress-bar');
        bars.forEach(bar => {
            const width = bar.dataset.width || '0%';
            gsap.to(bar, {
                width: width,
                duration: 1,
                ease: 'power2.out'
            });
        });
    },

    // Stagger children animation
    animateStaggerChildren(container, delay = 0.1) {
        const children = container.children;
        gsap.fromTo(children,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: delay,
                ease: 'power2.out'
            }
        );
    },

    // Refresh ScrollTrigger (call after dynamic content)
    refresh() {
        ScrollTrigger.refresh();
    }
};
