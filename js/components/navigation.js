// Navigation Module - Button-based with smooth transitions
const Navigation = {
    currentSection: 0,
    sections: [],
    totalSections: 10,
    isTransitioning: false,
    sectionNames: [
        'Welcome',
        'Population Overview',
        'Geographic Distribution',
        'Risk Segmentation',
        'Cluster Deep Dive',
        'Provider Network Insight',
        'Scenario Simulator',
        'Implementation Timeline',
        'Member Journey',
        'Next Steps'
    ],

    init() {
        this.container = document.getElementById('sections-container');
        this.sections = document.querySelectorAll('.section');
        this.navDots = document.querySelectorAll('.nav-dot');
        this.progressFill = document.getElementById('progress-fill');
        this.sectionIndicator = document.getElementById('section-indicator');
        this.prevBtn = document.getElementById('nav-prev');
        this.nextBtn = document.getElementById('nav-next');
        this.totalSections = this.sections.length;

        this.setupClickHandlers();
        this.setupKeyboardNavigation();
        this.preventWheelScroll();
        this.updateProgress();
        this.updateIndicator();
        this.updateNavButtons();

        // Show initial section
        this.goTo(0, false);

        // Refresh ScrollTrigger after a short delay
        setTimeout(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }, 500);
    },

    setupClickHandlers() {
        this.navDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionIndex = parseInt(dot.dataset.section);
                this.goTo(sectionIndex);
            });
        });
    },

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                this.next();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                this.prev();
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.goTo(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.goTo(this.totalSections - 1);
            }
        });
    },

    preventWheelScroll() {
        // Prevent mouse wheel scrolling - navigation only via buttons/keys
        if (this.container) {
            this.container.addEventListener('wheel', (e) => {
                e.preventDefault();
            }, { passive: false });
        }
    },

    next() {
        if (this.currentSection < this.totalSections - 1) {
            this.goTo(this.currentSection + 1);
        }
    },

    prev() {
        if (this.currentSection > 0) {
            this.goTo(this.currentSection - 1);
        }
    },

    goTo(index, animate = true) {
        if (index < 0 || index >= this.totalSections) return;
        if (this.isTransitioning && animate) return;

        const previousSection = this.currentSection;
        this.currentSection = index;

        if (animate && previousSection !== index) {
            this.transitionToSection(previousSection, index);
        } else {
            this.scrollToSection(index);
        }

        this.setActiveSection(index);
        this.updateProgress();
        this.updateNavButtons();
        this.showIndicator();
    },

    transitionToSection(fromIndex, toIndex) {
        this.isTransitioning = true;

        // Scroll within the container
        const targetSection = this.sections[toIndex];
        if (this.container && targetSection) {
            this.container.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth'
            });
        }

        // Reset transitioning flag after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    },

    scrollToSection(index) {
        if (index >= 0 && index < this.sections.length) {
            const targetSection = this.sections[index];
            if (this.container && targetSection) {
                this.container.scrollTo({
                    top: targetSection.offsetTop,
                    behavior: 'auto'
                });
            }
        }
    },

    setActiveSection(index) {
        // Update nav dots
        this.navDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Initialize section content
        this.initSectionContent(index);

        // Dispatch custom event for other modules
        document.dispatchEvent(new CustomEvent('sectionChange', {
            detail: { index, section: this.sections[index] }
        }));
    },

    initSectionContent(index) {
        // Make fade-up elements visible in current section
        const section = this.sections[index];
        if (section) {
            section.querySelectorAll('.fade-up').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }

        // Initialize section-specific content
        switch(index) {
            case 1: // Population
                if (typeof PopulationCharts !== 'undefined') {
                    PopulationCharts.init();
                    // Resize after a short delay to ensure proper rendering
                    setTimeout(() => PopulationCharts.resize(), 200);
                }
                break;
            case 2: // Geographic
                if (typeof MapChart !== 'undefined') {
                    MapChart.init();
                }
                break;
            case 3: // Segmentation
                if (typeof ClusterCharts !== 'undefined') {
                    ClusterCharts.init();
                }
                break;
            case 4: // Cluster Detail
                if (typeof ClusterCharts !== 'undefined') {
                    ClusterCharts.renderClusterDetail(1);
                }
                break;
            case 5: // DaVita
                if (typeof ScrollAnimations !== 'undefined') {
                    ScrollAnimations.renderDaVitaCharts();
                }
                break;
            case 6: // Scenario
                if (typeof ScenarioSimulator !== 'undefined') {
                    ScenarioSimulator.init();
                }
                if (typeof ScenarioCharts !== 'undefined') {
                    ScenarioCharts.init();
                }
                break;
            case 7: // Timeline
                if (typeof TimelineChart !== 'undefined') {
                    TimelineChart.init();
                }
                break;
            case 8: // Persona
                if (typeof TimelineChart !== 'undefined') {
                    TimelineChart.renderPersonaTrajectory('james');
                }
                break;
        }
    },

    updateProgress() {
        if (!this.progressFill) return;

        const progress = ((this.currentSection + 1) / this.totalSections) * 100;
        this.progressFill.style.width = `${progress}%`;
    },

    updateIndicator() {
        if (!this.sectionIndicator) return;

        this.sectionIndicator.textContent = `${this.sectionNames[this.currentSection]} (${this.currentSection + 1}/${this.totalSections})`;
    },

    showIndicator() {
        if (!this.sectionIndicator) return;

        this.updateIndicator();
        this.sectionIndicator.classList.add('visible');

        // Hide after 2 seconds
        clearTimeout(this.indicatorTimeout);
        this.indicatorTimeout = setTimeout(() => {
            this.sectionIndicator.classList.remove('visible');
        }, 2000);
    },

    updateNavButtons() {
        if (!this.prevBtn || !this.nextBtn) return;

        // Update prev button
        if (this.currentSection === 0) {
            this.prevBtn.disabled = true;
            this.prevBtn.style.opacity = '0.4';
        } else {
            this.prevBtn.disabled = false;
            this.prevBtn.style.opacity = '1';
        }

        // Update next button
        if (this.currentSection === this.totalSections - 1) {
            this.nextBtn.innerHTML = `
                Restart
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
            `;
            this.nextBtn.onclick = () => this.goTo(0);
        } else {
            this.nextBtn.innerHTML = `
                Next
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
            `;
            this.nextBtn.onclick = () => this.next();
        }
    },

    getCurrentSection() {
        return this.currentSection;
    },

    getSection(index) {
        return this.sections[index];
    }
};
