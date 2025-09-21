/**
 * ========================================
 * EcoTrack - JavaScript Application
 * Modern ES6+ Carbon Footprint Tracker
 * Version: 15 Compatible
 * ========================================
 */

// ============================
// APPLICATION CONFIGURATION
// ============================

const APP_CONFIG = {
    version: '1.0.0',
    apiEndpoint: '/api/v1',
    animationDuration: {
        short: 300,
        medium: 600,
        long: 1000
    },
    carbonFactors: {
        transport: 0.2,  // kg CO2 per km
        energy: 0.4,     // kg CO2 per kWh
        food: 2.5,       // kg CO2 per meal
        shopping: 5.0    // kg CO2 per item
    },
    ecoTips: {
        transport: "Try walking, cycling, or using public transport to reduce emissions!",
        energy: "Switch to LED bulbs and unplug devices when not in use.",
        food: "Consider plant-based meals - they have a lower carbon footprint!",
        shopping: "Buy only what you need and choose sustainable brands."
    }
};

// ============================
// UTILITY FUNCTIONS
// ============================

/**
 * Utility class for common operations
 */
class Utils {
    /**
     * Safely select DOM element with error handling
     * @param {string} selector - CSS selector
     * @returns {Element|null} - DOM element or null
     */
    static safeSelect(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Element not found: ${selector}`);
            return null;
        }
    }

    /**
     * Safely select multiple DOM elements
     * @param {string} selector - CSS selector
     * @returns {NodeList} - NodeList of elements
     */
    static safeSelectAll(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Elements not found: ${selector}`);
            return [];
        }
    }

    /**
     * Add event listener with error handling
     * @param {Element} element - DOM element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    static addSafeListener(element, event, handler) {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Cannot add listener: invalid element or handler`);
        }
    }

    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Generate random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random number
     */
    static randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
}

// ============================
// SMOOTH SCROLLING MODULE
// ============================

/**
 * Smooth scrolling functionality with custom easing
 */
class SmoothScroller {
    constructor() {
        this.init();
    }

    /**
     * Initialize smooth scrolling for navigation links
     */
    init() {
        const navLinks = Utils.safeSelectAll('a[href^="#"]');
        navLinks.forEach(anchor => {
            Utils.addSafeListener(anchor, 'click', (e) => this.handleNavClick(e));
        });
    }

    /**
     * Handle navigation link clicks
     * @param {Event} e - Click event
     */
    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = Utils.safeSelect(targetId);
        
        if (targetElement) {
            const elementRect = targetElement.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            
            // Calculate offset based on section
            let offset = 120; // Default offset for fixed header
            if (targetId === '#home') {
                offset = 0; // No offset for hero section
            }
            
            const targetPosition = absoluteElementTop - offset;
            this.smoothScrollTo(targetPosition, APP_CONFIG.animationDuration.long);
        }
    }

    /**
     * Custom smooth scroll with easing animation
     * @param {number} target - Target scroll position
     * @param {number} duration - Animation duration in milliseconds
     */
    smoothScrollTo(target, duration) {
        const start = window.pageYOffset;
        const distance = target - start;
        let startTime = null;

        // Easing function (easeInOutQuad)
        const easeInOutQuad = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, start, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }
}

// ============================
// HEADER ANIMATION MODULE
// ============================

/**
 * Header scroll effects and animations
 */
class HeaderAnimator {
    constructor() {
        this.header = Utils.safeSelect('.header');
        this.scrollThreshold = 100;
        this.init();
    }

    /**
     * Initialize header animations
     */
    init() {
        if (!this.header) return;

        // Debounced scroll handler for performance
        const debouncedScrollHandler = Utils.debounce(() => this.handleScroll(), 10);
        Utils.addSafeListener(window, 'scroll', debouncedScrollHandler);
    }

    /**
     * Handle scroll events for header transformation
     */
    handleScroll() {
        const scrolled = window.pageYOffset > this.scrollThreshold;
        
        if (scrolled) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }
}

// ============================
// TYPING ANIMATION MODULE (FIXED)
// ============================

/**
 * Enhanced Typewriter effect with proper backspace functionality
 */
class TypingAnimation {
    constructor(selector, lines) {
        // More robust element selection
        this.container = typeof selector === 'string' ? Utils.safeSelect(selector) : selector;
        this.textElement = this.container ? Utils.safeSelect('.typing-text', this.container) || this.container.querySelector('.typing-text') : null;
        this.cursorElement = this.container ? Utils.safeSelect('.typing-cursor', this.container) || this.container.querySelector('.typing-cursor') : null;
        
        this.lines = lines || [
            "Track your carbon footprint with AI",
            "Your Green Journey, Powered by AI", 
            "AI for a Cleaner, Greener World",
            "Measure Today, Save Tomorrow"
        ];
        
        this.currentLineIndex = 0;
        this.isAnimating = false;
        this.currentText = '';
        
        // Animation timing (in milliseconds)
        this.config = {
            typingSpeed: 80,        // Speed of typing each character
            backspaceSpeed: 30,     // Speed of removing each character
            pauseAfterType: 2500,   // Pause after finishing typing
            pauseAfterBackspace: 800, // Pause after finishing backspacing
            initialDelay: 1500      // Initial delay before starting
        };
        
        this.init();
    }

    /**
     * Initialize typing animation with comprehensive error checking
     */
    init() {
        // Debug logging
        console.log('TypingAnimation Init - Container:', this.container);
        console.log('TypingAnimation Init - TextElement:', this.textElement);
        console.log('TypingAnimation Init - CursorElement:', this.cursorElement);
        
        if (!this.container) {
            console.error('TypingAnimation: Container element not found');
            return;
        }

        if (!this.textElement) {
            console.error('TypingAnimation: Text element not found. Creating fallback...');
            this.createFallbackElements();
        }

        // Ensure cursor is visible and blinking
        if (this.cursorElement) {
            this.cursorElement.style.display = 'inline-block';
            this.cursorElement.style.animation = 'blink 1s infinite';
        }

        // Clear any existing text
        if (this.textElement) {
            this.textElement.textContent = '';
        }

        // Start animation after delay
        setTimeout(() => {
            console.log('Starting typing animation...');
            this.startAnimation();
        }, this.config.initialDelay);
    }

    /**
     * Create fallback elements if not found in DOM
     */
    createFallbackElements() {
        if (!this.textElement && this.container) {
            // Clear container and create proper structure
            this.container.innerHTML = `
                <span class="typing-text"></span>
                <span class="typing-cursor">|</span>
            `;
            
            this.textElement = this.container.querySelector('.typing-text');
            this.cursorElement = this.container.querySelector('.typing-cursor');
            
            console.log('Created fallback elements:', {
                textElement: this.textElement,
                cursorElement: this.cursorElement
            });
        }
    }

    /**
     * Start the main animation loop
     */
    startAnimation() {
        if (this.isAnimating) {
            console.log('Animation already running, skipping...');
            return;
        }

        if (!this.textElement) {
            console.error('Cannot start animation: text element not available');
            return;
        }

        console.log(`Starting line ${this.currentLineIndex}: "${this.lines[this.currentLineIndex]}"`);
        
        this.typeText(this.lines[this.currentLineIndex])
            .then(() => {
                console.log('Typing complete, starting backspace...');
                return this.backspaceText();
            })
            .then(() => {
                console.log('Backspace complete, moving to next line...');
                this.currentLineIndex = (this.currentLineIndex + 1) % this.lines.length;
                // Recursive call to continue the loop
                setTimeout(() => this.startAnimation(), this.config.pauseAfterBackspace);
            })
            .catch(error => {
                console.error('Animation error:', error);
                this.isAnimating = false;
            });
    }

    /**
     * Type text with promise-based approach
     * @param {string} text - Text to type
     * @returns {Promise} - Resolves when typing is complete
     */
    typeText(text) {
        return new Promise((resolve) => {
            if (this.isAnimating) {
                console.log('Already animating, rejecting typeText');
                resolve();
                return;
            }

            this.isAnimating = true;
            this.currentText = '';
            let charIndex = 0;

            console.log('Starting to type:', text);

            const typeNextChar = () => {
                if (charIndex < text.length) {
                    this.currentText += text[charIndex];
                    
                    if (this.textElement) {
                        this.textElement.textContent = this.currentText;
                        console.log('Current text:', this.currentText);
                    }
                    
                    charIndex++;
                    setTimeout(typeNextChar, this.config.typingSpeed);
                } else {
                    console.log('Typing finished:', this.currentText);
                    this.isAnimating = false;
                    setTimeout(resolve, this.config.pauseAfterType);
                }
            };

            // Start typing
            typeNextChar();
        });
    }

    /**
     * Backspace text with promise-based approach
     * @returns {Promise} - Resolves when backspacing is complete
     */
    backspaceText() {
        return new Promise((resolve) => {
            if (this.isAnimating) {
                console.log('Already animating, rejecting backspaceText');
                resolve();
                return;
            }

            this.isAnimating = true;
            let currentLength = this.currentText.length;

            console.log('Starting backspace, initial length:', currentLength);

            const removeNextChar = () => {
                if (currentLength > 0) {
                    this.currentText = this.currentText.slice(0, -1);
                    
                    if (this.textElement) {
                        this.textElement.textContent = this.currentText;
                        console.log('Backspace - current text:', this.currentText);
                    }
                    
                    currentLength--;
                    setTimeout(removeNextChar, this.config.backspaceSpeed);
                } else {
                    console.log('Backspace finished, text cleared');
                    this.isAnimating = false;
                    resolve();
                }
            };

            // Add small delay before starting backspace
            setTimeout(removeNextChar, 200);
        });
    }

    /**
     * Stop animation and reset state
     */
    stop() {
        this.isAnimating = false;
        this.currentText = '';
        if (this.textElement) {
            this.textElement.textContent = '';
        }
        console.log('Typing animation stopped');
    }

    /**
     * Change animation speed
     * @param {Object} newConfig - New configuration object
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('Animation config updated:', this.config);
    }

    /**
     * Get current animation state
     * @returns {Object} - Current state information
     */
    getState() {
        return {
            isAnimating: this.isAnimating,
            currentLineIndex: this.currentLineIndex,
            currentText: this.currentText,
            hasElements: !!(this.textElement && this.cursorElement)
        };
    }
}

// ============================
// COUNTER ANIMATION MODULE
// ============================

/**
 * Animated counters for metrics display
 */
class CounterAnimator {
    constructor() {
        this.counters = new Map();
    }

    /**
     * Animate counter from 0 to target value
     * @param {string} elementId - Element ID
     * @param {number} targetValue - Target value
     * @param {string} suffix - Suffix to append (optional)
     * @param {number} duration - Animation duration in milliseconds
     */
    animateCounter(elementId, targetValue, suffix = '', duration = 2000) {
        const element = Utils.safeSelect(`#${elementId}`);
        if (!element) return;

        let current = 0;
        const increment = targetValue / (duration / 20);
        const isNegative = targetValue < 0;
        
        const timer = setInterval(() => {
            if (isNegative) {
                current -= Math.abs(increment);
                if (current <= targetValue) {
                    element.textContent = targetValue + suffix;
                    clearInterval(timer);
                    return;
                }
            } else {
                current += increment;
                if (current >= targetValue) {
                    element.textContent = targetValue + suffix;
                    clearInterval(timer);
                    return;
                }
            }
            
            const displayValue = Math.floor(current * 10) / 10;
            element.textContent = displayValue + suffix;
        }, 20);

        // Store timer reference for cleanup if needed
        this.counters.set(elementId, timer);
    }

    /**
     * Stop all counter animations
     */
    stopAll() {
        this.counters.forEach((timer) => clearInterval(timer));
        this.counters.clear();
    }
}

// ============================
// CARBON CALCULATOR MODULE
// ============================

/**
 * Interactive carbon footprint calculator
 */
class CarbonCalculator {
    constructor() {
        this.form = Utils.safeSelect('#carbon-calculator-form');
        this.activityType = Utils.safeSelect('#activity-type');
        this.activityAmount = Utils.safeSelect('#activity-amount');
        this.activityUnit = Utils.safeSelect('#activity-unit');
        this.calculateBtn = Utils.safeSelect('#calculate-carbon-btn');
        this.resultDiv = Utils.safeSelect('#carbon-result');
        this.amountSpan = Utils.safeSelect('#carbon-amount');
        this.tipDiv = Utils.safeSelect('#carbon-tip');
        
        this.init();
    }

    /**
     * Initialize carbon calculator
     */
    init() {
        if (this.calculateBtn) {
            Utils.addSafeListener(this.calculateBtn, 'click', () => this.calculate());
        }
        
        // Add form validation
        if (this.form) {
            Utils.addSafeListener(this.form, 'submit', (e) => {
                e.preventDefault();
                this.calculate();
            });
        }

        // Add real-time validation
        [this.activityType, this.activityAmount].forEach(element => {
            if (element) {
                Utils.addSafeListener(element, 'change', () => this.validateForm());
            }
        });
    }

    /**
     * Validate form inputs
     * @returns {boolean} - Form validity
     */
    validateForm() {
        const activityType = this.activityType?.value;
        const amount = parseFloat(this.activityAmount?.value) || 0;
        
        const isValid = activityType && amount > 0;
        
        if (this.calculateBtn) {
            this.calculateBtn.disabled = !isValid;
            this.calculateBtn.style.opacity = isValid ? '1' : '0.5';
        }
        
        return isValid;
    }

    /**
     * Calculate carbon footprint
     */
    calculate() {
        if (!this.validateForm()) {
            this.showError('Please select an activity and enter a valid amount!');
            return;
        }

        const activityType = this.activityType.value;
        const amount = parseFloat(this.activityAmount.value);
        
        const carbonAmount = (amount * APP_CONFIG.carbonFactors[activityType]).toFixed(2);
        const tip = APP_CONFIG.ecoTips[activityType];
        
        this.displayResult(carbonAmount, tip);
    }

    /**
     * Display calculation result with animation
     * @param {string} carbonAmount - Carbon amount
     * @param {string} tip - Eco tip
     */
    displayResult(carbonAmount, tip) {
        if (!this.resultDiv || !this.amountSpan || !this.tipDiv) return;

        // Show result container
        this.resultDiv.style.display = 'block';
        
        // Animate entrance
        this.resultDiv.style.transform = 'scale(0.9)';
        this.resultDiv.style.opacity = '0';
        
        // Reset content opacity
        this.amountSpan.style.opacity = '0';
        this.tipDiv.style.opacity = '0';
        
        // Animate container
        setTimeout(() => {
            this.resultDiv.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            this.resultDiv.style.transform = 'scale(1)';
            this.resultDiv.style.opacity = '1';
            
            // Set content
            setTimeout(() => {
                this.amountSpan.textContent = carbonAmount;
                this.tipDiv.textContent = tip;
                
                // Animate content
                this.amountSpan.style.transition = 'opacity 0.5s ease';
                this.tipDiv.style.transition = 'opacity 0.5s ease 0.2s';
                this.amountSpan.style.opacity = '1';
                this.tipDiv.style.opacity = '1';
            }, 200);
        }, 100);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        // Create or update error display
        let errorDiv = Utils.safeSelect('#carbon-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'carbon-error';
            errorDiv.style.cssText = `
                background: #ff6b6b;
                color: white;
                padding: 1rem;
                border-radius: 10px;
                margin-top: 1rem;
                text-align: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            if (this.calculateBtn && this.calculateBtn.parentNode) {
                this.calculateBtn.parentNode.insertBefore(errorDiv, this.calculateBtn.nextSibling);
            }
        }
        
        errorDiv.textContent = message;
        errorDiv.style.opacity = '1';
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorDiv.style.opacity = '0';
        }, 3000);
    }
}

// ============================
// INTERSECTION OBSERVER MODULE
// ============================

/**
 * Handle scroll-based animations using Intersection Observer
 */
class ScrollAnimator {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.init();
    }

    /**
     * Initialize intersection observer for scroll animations
     */
    init() {
        // Create observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            this.observerOptions
        );

        // Observe animatable elements
        const animatedElements = Utils.safeSelectAll('.feature-card, .pricing-card, .dashboard-card');
        animatedElements.forEach(element => {
            element.classList.add('animate-on-scroll');
            this.observer.observe(element);
        });
    }

    /**
     * Handle intersection events
     * @param {IntersectionObserverEntry[]} entries - Observed entries
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Stop observing after animation triggers
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// ============================
// DYNAMIC CONTENT MODULE
// ============================

/**
 * Generate dynamic content for features and pricing
 */
class ContentGenerator {
    constructor() {
        this.featuresData = [
            {
                icon: 'fas fa-brain',
                title: 'AI-Powered Insights',
                description: 'Get personalized recommendations based on your lifestyle patterns and carbon footprint analysis using advanced machine learning algorithms.'
            },
            {
                icon: 'fas fa-chart-bar',
                title: 'Real-time Analytics',
                description: 'Track your progress with beautiful visualizations and detailed reports that show your environmental impact across different activities.'
            },
            {
                icon: 'fas fa-users',
                title: 'Team Collaboration',
                description: 'Perfect for businesses and organizations looking to achieve sustainability goals together with team challenges and leaderboards.'
            },
            {
                icon: 'fas fa-mobile-alt',
                title: 'Mobile App',
                description: 'Log activities on-the-go with our intuitive mobile app that makes carbon tracking as easy as taking a photo.'
            },
            {
                icon: 'fas fa-leaf',
                title: 'Eco-friendly Marketplace',
                description: 'Discover and purchase sustainable products from our curated marketplace of eco-friendly brands and partners.'
            },
            {
                icon: 'fas fa-certificate',
                title: 'Carbon Offsetting',
                description: 'Automatically offset your carbon footprint through verified projects including reforestation and renewable energy initiatives.'
            }
        ];

        this.pricingData = [
            {
                name: 'Personal',
                price: 'Free',
                description: 'Perfect for individuals starting their eco-journey',
                features: [
                    'Basic carbon tracking',
                    '3 activity categories',
                    'Monthly reports',
                    'Mobile app access'
                ],
                buttonText: 'Get Started',
                featured: false
            },
            {
                name: 'Pro',
                price: '$9<span style="font-size: 1rem;">/month</span>',
                description: 'Advanced features for serious eco-warriors',
                features: [
                    'Unlimited tracking',
                    'AI recommendations',
                    'Real-time analytics',
                    'Carbon offsetting',
                    'Priority support'
                ],
                buttonText: 'Choose Pro',
                featured: true
            },
            {
                name: 'Business',
                price: '$29<span style="font-size: 1rem;">/month</span>',
                description: 'Complete solution for organizations',
                features: [
                    'Team management',
                    'Custom reporting',
                    'API access',
                    'White-label options',
                    'Dedicated support'
                ],
                buttonText: 'Contact Sales',
                featured: false
            }
        ];

        this.init();
    }

    /**
     * Initialize dynamic content generation
     */
    init() {
        this.generateFeatures();
        this.generatePricing();
        this.updateCurrentYear();
    }

    /**
     * Generate features section dynamically
     */
    generateFeatures() {
        const featuresGrid = Utils.safeSelect('#features-grid');
        if (!featuresGrid) return;

        featuresGrid.innerHTML = this.featuresData.map(feature => `
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="${feature.icon}"></i>
                </div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            </div>
        `).join('');
    }

    /**
     * Generate pricing section dynamically
     */
    generatePricing() {
        const pricingGrid = Utils.safeSelect('#pricing-grid');
        if (!pricingGrid) return;

        pricingGrid.innerHTML = this.pricingData.map(plan => `
            <div class="pricing-card ${plan.featured ? 'featured' : ''}">
                <h3>${plan.name}</h3>
                <div class="price">${plan.price}</div>
                <p>${plan.description}</p>
                <ul style="text-align: left; margin: 2rem 0;">
                    ${plan.features.map(feature => `<li>✅ ${feature}</li>`).join('')}
                </ul>
                <button class="btn-primary" ${plan.featured ? 'style="background: white; color: var(--primary);"' : ''}>
                    ${plan.buttonText}
                </button>
            </div>
        `).join('');
    }

    /**
     * Update current year in footer
     */
    updateCurrentYear() {
        const yearElement = Utils.safeSelect('#current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// ============================
// DEBUGGING UTILITIES
// ============================

/**
 * Debugging utilities for troubleshooting animations
 */
class DebugUtils {
    static enabled = false;

    /**
     * Enable debugging mode
     */
    static enable() {
        this.enabled = true;
        console.log('🔧 Debug mode enabled');
        this.addVisualIndicators();
    }

    /**
     * Add visual indicators for debugging
     */
    static addVisualIndicators() {
        const typingContainer = Utils.safeSelect('#typing-animation');
        const typingText = Utils.safeSelect('.typing-text');
        
        if (typingContainer) {
            typingContainer.classList.add('typing-animation-debug');
        }
        
        if (typingText) {
            typingText.classList.add('typing-text-debug');
        }
    }

    /**
     * Log typing animation state
     * @param {TypingAnimation} animation - Animation instance
     */
    static logAnimationState(animation) {
        if (!this.enabled) return;
        
        const state = animation.getState();
        console.table(state);
    }

    /**
     * Test typing animation manually
     * @param {TypingAnimation} animation - Animation instance
     */
    static testAnimation(animation) {
        if (!animation) {
            console.error('No animation instance provided');
            return;
        }

        console.log('🧪 Testing animation manually...');
        
        // Stop current animation
        animation.stop();
        
        // Test typing
        setTimeout(() => {
            console.log('Testing typing...');
            animation.typeText('Debug Test Message')
                .then(() => {
                    console.log('✅ Typing test successful');
                    // Test backspacing
                    setTimeout(() => {
                        console.log('Testing backspacing...');
                        animation.backspaceText()
                            .then(() => {
                                console.log('✅ Backspace test successful');
                                // Restart normal animation
                                setTimeout(() => {
                                    animation.startAnimation();
                                }, 1000);
                            })
                            .catch(err => console.error('❌ Backspace test failed:', err));
                    }, 1000);
                })
                .catch(err => console.error('❌ Typing test failed:', err));
        }, 500);
    }
}

// Make debug utilities globally available
window.DebugUtils = DebugUtils;

/**
 * Main application class
 */
class EcoTrackApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize modules
            this.modules.smoothScroller = new SmoothScroller();
            this.modules.headerAnimator = new HeaderAnimator();
            this.modules.counterAnimator = new CounterAnimator();
            this.modules.carbonCalculator = new CarbonCalculator();
            this.modules.scrollAnimator = new ScrollAnimator();
            this.modules.contentGenerator = new ContentGenerator();

            // Initialize typing animation with better element targeting
            const typingContainer = Utils.safeSelect('#typing-animation');
            if (typingContainer) {
                this.modules.typingAnimation = new TypingAnimation(typingContainer);
            } else {
                console.error('Typing animation container not found');
            }

            // Start counter animations after page load
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.modules.counterAnimator.animateCounter('carbon-today', 2.4);
                    this.modules.counterAnimator.animateCounter('monthly-trend', -12, '%');
                }, 1000);
            });

            this.isInitialized = true;
            console.log('EcoTrack application initialized successfully');

        } catch (error) {
            console.error('Failed to initialize EcoTrack application:', error);
        }
    }

    /**
     * Get module instance
     * @param {string} moduleName - Module name
     * @returns {Object|null} - Module instance
     */
    getModule(moduleName) {
        return this.modules[moduleName] || null;
    }

    /**
     * Cleanup application resources
     */
    destroy() {
        // Stop all counter animations
        if (this.modules.counterAnimator) {
            this.modules.counterAnimator.stopAll();
        }

        // Disconnect scroll observer
        if (this.modules.scrollAnimator && this.modules.scrollAnimator.observer) {
            this.modules.scrollAnimator.observer.disconnect();
        }

        this.modules = {};
        this.isInitialized = false;
    }
}

// ============================
// APPLICATION STARTUP
// ============================

// Create and initialize the application
const app = new EcoTrackApp();

// Start the application
app.init().then(() => {
    console.log('🌱 EcoTrack is ready!');
}).catch(error => {
    console.error('❌ Failed to start EcoTrack:', error);
});

// Make app globally available for debugging
window.EcoTrackApp = app;

// Handle page unload
window.addEventListener('beforeunload', () => {
    app.destroy();
});