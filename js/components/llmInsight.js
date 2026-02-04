// LLM Insight Module - Typewriter effect
const LLMInsight = {
    activeAnimations: new Map(),
    defaultSpeed: 15, // ms per character

    init() {
        // Pre-populate insight elements
        document.querySelectorAll('.llm-text').forEach(el => {
            const insightKey = el.dataset.insight;
            if (insightKey && LLM_RESPONSES[insightKey]) {
                el.textContent = ''; // Clear initial content
            }
        });
    },

    typeText(element, text, speed = this.defaultSpeed) {
        // Cancel any existing animation on this element
        if (this.activeAnimations.has(element)) {
            clearInterval(this.activeAnimations.get(element));
            this.activeAnimations.delete(element);
        }

        element.textContent = '';
        element.classList.add('typing');

        let index = 0;
        const interval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
            } else {
                clearInterval(interval);
                element.classList.remove('typing');
                this.activeAnimations.delete(element);
            }
        }, speed);

        this.activeAnimations.set(element, interval);
    },

    // Instant reveal (for already-visible sections)
    revealInstant(element, text) {
        if (this.activeAnimations.has(element)) {
            clearInterval(this.activeAnimations.get(element));
            this.activeAnimations.delete(element);
        }
        element.textContent = text;
        element.classList.remove('typing');
    },

    // Trigger insight for a section
    triggerSectionInsight(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const insightElements = section.querySelectorAll('.llm-text');
        insightElements.forEach(el => {
            const insightKey = el.dataset.insight;
            if (insightKey && LLM_RESPONSES[insightKey]) {
                // Check if element is visible
                if (this.isElementInViewport(el)) {
                    this.typeText(el, LLM_RESPONSES[insightKey]);
                }
            }
        });
    },

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Handle scroll-triggered insights
    setupScrollTriggers() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const insightKey = el.dataset.insight;
                    if (insightKey && LLM_RESPONSES[insightKey] && !el.textContent) {
                        // Small delay for dramatic effect
                        setTimeout(() => {
                            this.typeText(el, LLM_RESPONSES[insightKey]);
                        }, 500);
                    }
                }
            });
        }, {
            threshold: 0.5
        });

        document.querySelectorAll('.llm-text').forEach(el => {
            observer.observe(el);
        });
    },

    // Stop all animations
    stopAll() {
        this.activeAnimations.forEach((interval, element) => {
            clearInterval(interval);
            element.classList.remove('typing');
        });
        this.activeAnimations.clear();
    }
};
