/**
 * KENMARK DESIGN - MAIN JAVASCRIPT
 * Professional Printing & Publishing Services
 * All functions follow best practices with proper error handling
 */

'use strict';

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    WHATSAPP_NUMBER: '256750850630', // Replace with actual WhatsApp number
    API_ENDPOINT: '/api', // Replace with actual API endpoint
    EMAIL_API: '/api/send-email', // Replace with actual email API endpoint
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
    ALLOWED_FILE_TYPES: [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/illustrator',
        'image/vnd.adobe.photoshop',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    SCROLL_OFFSET: 80,
    TOAST_DURATION: 5000
};

// Price estimations (in UGX)
const PRICING = {
    'digital-printing': {
        'a4': { 'full-color': 500, 'black-white': 100 },
        'a5': { 'full-color': 300, 'black-white': 50 },
        'a3': { 'full-color': 1000, 'black-white': 200 }
    },
    'book-publishing': {
        base: 50000,
        perPage: 500
    },
    'large-format': {
        base: 20000,
        perSqMeter: 15000
    },
    'graphic-design': {
        base: 30000
    },
    'binding': {
        'perfect': 5000,
        'spiral': 3000,
        'hardcover': 15000,
        'saddle': 2000
    },
    'document-services': {
        'copy': 100,
        'scan': 500,
        'lamination': 1000
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number (Uganda format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
function validatePhone(phone) {
    const re = /^(\+256|0)[37]\d{8}$/;
    return re.test(phone.replace(/\s/g, ''));
}

/**
 * Format number with commas for currency display
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, info)
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} visible`;

    setTimeout(() => {
        toast.classList.remove('visible');
    }, CONFIG.TOAST_DURATION);
}

/**
 * Animate counter from 0 to target value
 * @param {HTMLElement} element - Element to animate
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 */
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ============================================
// NAVIGATION FUNCTIONALITY
// ============================================

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        this.init();
    }

    init() {
        this.setupScrollBehavior();
        this.setupMobileMenu();
        this.setupActiveLink();
        this.setupSmoothScroll();
    }

    setupScrollBehavior() {
        let lastScroll = 0;
        const handleScroll = throttle(() => {
            const currentScroll = window.pageYOffset;

            // Add/remove scrolled class
            if (currentScroll > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    setupMobileMenu() {
        if (!this.navToggle || !this.navMenu) return;

        this.navToggle.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.navToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                this.navMenu.classList.remove('active');
                this.navToggle.classList.remove('active');
            }
        });

        // Close menu when clicking on a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
                this.navToggle.classList.remove('active');
            });
        });
    }

    setupActiveLink() {
        const sections = document.querySelectorAll('section[id]');

        const handleScroll = throttle(() => {
            const scrollY = window.pageYOffset;

            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - CONFIG.SCROLL_OFFSET - 50;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => link.classList.remove('active'));
                    if (navLink) navLink.classList.add('active');
                }
            });
        }, 100);

        window.addEventListener('scroll', handleScroll);
    }

    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetSection = document.getElementById(targetId);

                    if (targetSection) {
                        const targetPosition = targetSection.offsetTop - CONFIG.SCROLL_OFFSET;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ============================================
// HERO SECTION FUNCTIONALITY
// ============================================

class HeroSection {
    constructor() {
        this.statsObserved = false;
        this.init();
    }

    init() {
        this.animateStats();
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        if (!statNumbers.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.statsObserved) {
                    this.statsObserved = true;
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-target'));
                        animateCounter(stat, target);
                    });
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => observer.observe(stat));
    }
}

// ============================================
// PORTFOLIO FILTERING
// ============================================

class PortfolioFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.portfolioItems = document.querySelectorAll('.portfolio-item');
        this.init();
    }

    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterItems(filter);
                this.updateActiveButton(btn);
            });
        });
    }

    filterItems(filter) {
        this.portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    updateActiveButton(activeBtn) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
}

// ============================================
// QUOTE FORM HANDLER
// ============================================

class QuoteForm {
    constructor() {
        this.form = document.getElementById('quoteForm');
        this.summary = document.getElementById('quoteSummary');
        this.fileInput = document.getElementById('artwork');
        this.fileList = document.getElementById('fileList');
        this.whatsappBtn = document.getElementById('whatsappQuote');
        this.uploadedFiles = [];

        this.init();
    }

    init() {
        if (!this.form) return;

        this.setupFormListeners();
        this.setupFileUpload();
        this.setupWhatsAppButton();
        this.setupRealTimeCalculation();
    }

    setupFormListeners() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    setupFileUpload() {
        if (!this.fileInput) return;

        this.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag and drop
        const uploadWrapper = this.fileInput.parentElement;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, () => {
                uploadWrapper.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, () => {
                uploadWrapper.classList.remove('drag-over');
            });
        });

        uploadWrapper.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            this.handleFileUpload(files);
        });
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            // Validate file size
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                showToast(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
                return;
            }

            // Validate file type
            if (!CONFIG.ALLOWED_FILE_TYPES.includes(file.type) && 
                !file.name.match(/\.(pdf|jpg|jpeg|png|ai|psd|doc|docx)$/i)) {
                showToast(`File ${file.name} has an unsupported format.`, 'error');
                return;
            }

            this.uploadedFiles.push(file);
            this.displayFile(file);
        });
    }

    displayFile(file) {
        if (!this.fileList) return;

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-item-name">${sanitizeInput(file.name)}</span>
            <button type="button" class="file-item-remove" data-filename="${sanitizeInput(file.name)}">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        const removeBtn = fileItem.querySelector('.file-item-remove');
        removeBtn.addEventListener('click', () => {
            this.removeFile(file.name);
            fileItem.remove();
        });

        this.fileList.appendChild(fileItem);
    }

    removeFile(filename) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== filename);
    }

    setupRealTimeCalculation() {
        const inputs = this.form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('change', debounce(() => {
                this.updateQuoteSummary();
            }, CONFIG.DEBOUNCE_DELAY));
        });
    }

    updateQuoteSummary() {
        const formData = new FormData(this.form);
        const serviceType = formData.get('servicetype');
        const size = formData.get('size');
        const color = formData.get('color');
        const quantity = parseInt(formData.get('quantity')) || 0;

        if (!serviceType || !quantity) {
            return;
        }

        let estimate = 0;

        // Calculate based on service type
        switch(serviceType) {
            case 'digital-printing':
                if (PRICING['digital-printing'][size] && PRICING['digital-printing'][size][color]) {
                    estimate = PRICING['digital-printing'][size][color] * quantity;
                }
                break;
            case 'book-publishing':
                estimate = PRICING['book-publishing'].base + (quantity * PRICING['book-publishing'].perPage);
                break;
            case 'large-format':
                estimate = PRICING['large-format'].base + (quantity * PRICING['large-format'].perSqMeter);
                break;
            case 'graphic-design':
                estimate = PRICING['graphic-design'].base;
                break;
            default:
                estimate = quantity * 1000; // Default pricing
        }

        // Add finishing costs
        const finishing = formData.getAll('finishing');
        finishing.forEach(option => {
            if (option === 'binding' && PRICING.binding.perfect) {
                estimate += PRICING.binding.perfect * quantity;
            } else if (option === 'lamination') {
                estimate += 1000 * quantity;
            }
        });

        this.displayQuoteSummary(formData, estimate);
    }

    displayQuoteSummary(formData, estimate) {
        const summaryContent = this.summary.querySelector('.summary-content');
        const summaryTotal = this.summary.querySelector('.summary-total');
        const placeholder = this.summary.querySelector('.summary-placeholder');

        if (placeholder) {
            placeholder.style.display = 'none';
        }

        summaryContent.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Service:</span>
                <span class="summary-value">${this.formatServiceName(formData.get('servicetype'))}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Quantity:</span>
                <span class="summary-value">${formData.get('quantity')}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Size:</span>
                <span class="summary-value">${formData.get('size')?.toUpperCase() || 'N/A'}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Color:</span>
                <span class="summary-value">${this.formatColorOption(formData.get('color'))}</span>
            </div>
        `;

        if (summaryTotal) {
            summaryTotal.style.display = 'flex';
            summaryTotal.querySelector('.total-amount').textContent = `UGX ${formatNumber(estimate)}`;
        }
    }

    formatServiceName(service) {
        const names = {
            'digital-printing': 'Digital Printing',
            'book-publishing': 'Book Publishing',
            'large-format': 'Large Format',
            'graphic-design': 'Graphic Design',
            'binding': 'Binding Services',
            'document-services': 'Document Services'
        };
        return names[service] || service;
    }

    formatColorOption(color) {
        const options = {
            'full-color': 'Full Color (CMYK)',
            'black-white': 'Black & White',
            'spot-color': 'Spot Color'
        };
        return options[color] || color;
    }

    setupWhatsAppButton() {
        if (!this.whatsappBtn) return;

        this.whatsappBtn.addEventListener('click', () => {
            const formData = new FormData(this.form);
            const message = this.generateWhatsAppMessage(formData);
            const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    generateWhatsAppMessage(formData) {
        let message = '🖨️ *KENMARK DESIGN - Quote Request*\n\n';
        
        message += `*Service:* ${this.formatServiceName(formData.get('servicetype'))}\n`;
        message += `*Size:* ${formData.get('size')?.toUpperCase()}\n`;
        message += `*Color:* ${this.formatColorOption(formData.get('color'))}\n`;
        message += `*Quantity:* ${formData.get('quantity')}\n`;
        
        if (formData.get('paper')) {
            message += `*Paper Type:* ${formData.get('paper')}\n`;
        }

        const finishing = formData.getAll('finishing');
        if (finishing.length) {
            message += `*Finishing:* ${finishing.join(', ')}\n`;
        }

        message += `\n*Contact Details:*\n`;
        message += `*Name:* ${formData.get('name')}\n`;
        message += `*Email:* ${formData.get('email')}\n`;
        message += `*Phone:* ${formData.get('phone')}\n`;

        if (formData.get('turnaround')) {
            message += `\n*Turnaround:* ${formData.get('turnaround')}\n`;
        }

        if (formData.get('message')) {
            message += `\n*Additional Details:*\n${formData.get('message')}`;
        }

        return message;
    }

    async handleSubmit() {
        try {
            // Validate form
            if (!this.validateForm()) {
                return;
            }

            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';

            const formData = new FormData(this.form);

            // Add files to formData
            this.uploadedFiles.forEach((file, index) => {
                formData.append(`file_${index}`, file);
            });

            // In production, send to actual API
            // const response = await fetch(CONFIG.EMAIL_API, {
            //     method: 'POST',
            //     body: formData
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Success
            showToast('Quote request sent successfully! We\'ll get back to you soon.', 'success');
            this.form.reset();
            this.uploadedFiles = [];
            this.fileList.innerHTML = '';
            this.summary.querySelector('.summary-placeholder').style.display = 'block';
            this.summary.querySelector('.summary-content').innerHTML = '';
            this.summary.querySelector('.summary-total').style.display = 'none';

            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

        } catch (error) {
            console.error('Form submission error:', error);
            showToast('Failed to send quote request. Please try again or contact us directly.', 'error');
            
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        const formData = new FormData(this.form);
        
        // Check required fields
        const requiredFields = ['servicetype', 'size', 'color', 'quantity', 'name', 'email', 'phone', 'turnaround'];
        
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                showToast(`Please fill in the ${field} field.`, 'error');
                return false;
            }
        }

        // Validate email
        const email = formData.get('email');
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return false;
        }

        // Validate phone
        const phone = formData.get('phone');
        if (!validatePhone(phone)) {
            showToast('Please enter a valid Ugandan phone number.', 'error');
            return false;
        }

        return true;
    }
}

// ============================================
// CONTACT FORM HANDLER
// ============================================

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });
    }

    async handleSubmit() {
        try {
            const formData = new FormData(this.form);

            // Validate
            if (!this.validateForm(formData)) {
                return;
            }

            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            // In production, send to actual API
            // const response = await fetch(CONFIG.EMAIL_API, {
            //     method: 'POST',
            //     body: formData
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            showToast('Message sent successfully! We\'ll respond soon.', 'success');
            this.form.reset();

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

        } catch (error) {
            console.error('Contact form error:', error);
            showToast('Failed to send message. Please try again.', 'error');
        }
    }

    validateForm(formData) {
        const email = formData.get('email');
        
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address.', 'error');
            return false;
        }

        return true;
    }
}

// ============================================
// SCROLL TO TOP FUNCTIONALITY
// ============================================

class ScrollToTop {
    constructor() {
        this.button = document.getElementById('scrollToTop');
        this.init();
    }

    init() {
        if (!this.button) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', throttle(() => {
            if (window.pageYOffset > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        }, 100));

        // Scroll to top on click
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new Navigation();
    new HeroSection();
    new PortfolioFilter();
    new QuoteForm();
    new ContactForm();
    new ScrollToTop();

    // Log initialization
    console.log('%cKenmark Design Website Initialized', 'color: #D4AF37; font-size: 16px; font-weight: bold;');
    console.log('%cIt\'s all by the Grace of God', 'color: #1a2332; font-style: italic;');
});

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // In production, send to error tracking service
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // In production, send to error tracking service
});

// ============================================
// PERFORMANCE MONITORING
// ============================================

// Log page load performance
window.addEventListener('load', () => {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${pageLoadTime}ms`);
    }
});
