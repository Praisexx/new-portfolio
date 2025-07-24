// DOM Elements
const navbar = document.getElementById('navbar');
const navLinks = document.getElementById('nav-links');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const themeToggle = document.getElementById('theme-toggle');
const contactForm = document.getElementById('contact-form');
const navLinkElements = document.querySelectorAll('.nav-link');

// State management
let isMenuOpen = false;
let currentTheme = 'light';
let isScrolling = false;

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        currentTheme = 'dark';
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        currentTheme = 'light';
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Theme toggle functionality
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // Update theme toggle icon with animation
    themeToggle.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        if (currentTheme === 'dark') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        themeToggle.style.transform = 'rotate(0deg)';
    }, 150);
}

// Mobile menu functionality
function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    navLinks.classList.toggle('active', isMenuOpen);
    mobileMenuToggle.classList.toggle('active', isMenuOpen);
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    
    // Update aria attributes for accessibility
    mobileMenuToggle.setAttribute('aria-expanded', isMenuOpen);
    navLinks.setAttribute('aria-hidden', !isMenuOpen);
}

// Close mobile menu
function closeMobileMenu() {
    if (isMenuOpen) {
        isMenuOpen = false;
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuToggle.setAttribute('aria-expanded', false);
        navLinks.setAttribute('aria-hidden', true);
    }
}

// Navbar scroll effect with throttling
function handleNavbarScroll() {
    if (!isScrolling) {
        requestAnimationFrame(() => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            isScrolling = false;
        });
        isScrolling = true;
    }
}

// Active navigation link highlighting
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 150;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    });
    
    // Update active nav link
    navLinkElements.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Smooth scrolling for navigation links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            closeMobileMenu();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Profile image handling
function handleProfileImage() {
    const profileImage = document.querySelector('.profile-image');
    const profileFallback = document.querySelector('.profile-fallback');
    
    if (profileImage && profileFallback) {
        // Hide fallback initially
        profileFallback.style.display = 'none';
        
        profileImage.addEventListener('load', () => {
            profileFallback.style.display = 'none';
            profileImage.style.opacity = '1';
        });
        
        profileImage.addEventListener('error', () => {
            profileImage.style.display = 'none';
            profileFallback.style.display = 'flex';
        });
        
        // Check if image is already loaded (cached)
        if (profileImage.complete) {
            if (profileImage.naturalWidth > 0) {
                profileFallback.style.display = 'none';
                profileImage.style.opacity = '1';
            } else {
                profileImage.style.display = 'none';
                profileFallback.style.display = 'flex';
            }
        }
    }
}

// Contact form functionality
async function handleFormSubmission(e) {
    e.preventDefault();
    
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalContent = submitButton.innerHTML;
    
    // Show loading state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Validate form data
    const validation = validateFormData(data);
    if (!validation.isValid) {
        showNotification(validation.message, 'error');
        resetSubmitButton(submitButton, originalContent);
        return;
    }
    
    try {
        // Simulate form submission (replace with your actual endpoint)
        await submitContactForm(data);
        
        // Success feedback
        showNotification('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
        contactForm.reset();
        
        // Add success animation to form
        contactForm.style.transform = 'scale(0.98)';
        setTimeout(() => {
            contactForm.style.transform = 'scale(1)';
        }, 200);
        
    } catch (error) {
        // Error feedback
        showNotification('Sorry, there was an error sending your message. Please try again or contact me directly.', 'error');
        console.error('Form submission error:', error);
    } finally {
        resetSubmitButton(submitButton, originalContent);
    }
}

// Validate form data
function validateFormData(data) {
    const { name, email, subject, message } = data;
    
    if (!name.trim()) {
        return { isValid: false, message: 'Please enter your name.' };
    }
    
    if (!email.trim()) {
        return { isValid: false, message: 'Please enter your email address.' };
    }
    
    if (!isValidEmail(email)) {
        return { isValid: false, message: 'Please enter a valid email address.' };
    }
    
    if (!subject.trim()) {
        return { isValid: false, message: 'Please enter a subject.' };
    }
    
    if (!message.trim()) {
        return { isValid: false, message: 'Please enter your message.' };
    }
    
    if (message.trim().length < 10) {
        return { isValid: false, message: 'Please enter a message with at least 10 characters.' };
    }
    
    return { isValid: true };
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Reset submit button
function resetSubmitButton(button, originalContent) {
    button.innerHTML = originalContent;
    button.disabled = false;
    button.classList.remove('loading');
}

// Simulate form submission (replace with actual implementation)
function submitContactForm(data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success/failure (90% success rate for demo)
            const success = Math.random() > 0.1;
            if (success) {
                resolve(data);
            } else {
                reject(new Error('Network error'));
            }
        }, 2000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        hideNotification(existingNotification);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Close functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => hideNotification(notification));
    
    // Auto close after 5 seconds
    setTimeout(() => hideNotification(notification), 5000);
    
    return notification;
}

// Hide notification
function hideNotification(notification) {
    if (notification && notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

// Intersection Observer for animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add stagger animation for skill items
                if (entry.target.classList.contains('skill-category')) {
                    animateSkillItems(entry.target);
                }
                
                // Add stagger animation for project cards
                if (entry.target.classList.contains('project-card')) {
                    entry.target.style.animationDelay = `${Array.from(entry.target.parentNode.children).indexOf(entry.target) * 0.1}s`;
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .skill-category, 
        .project-card, 
        .contact-item, 
        .about-card,
        .code-snippet
    `);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Animate skill items with stagger effect
function animateSkillItems(skillCategory) {
    const skillItems = skillCategory.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
        }, index * 100);
    });
}

// Typing effect for hero title (optional)
function createTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.style.borderRight = '2px solid var(--primary-color)';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                heroTitle.style.borderRight = 'none';
            }, 1000);
        }
    };
    
    // Start typing effect after a short delay
    setTimeout(typeWriter, 1000);
}

// Parallax effect for floating elements
function initializeParallax() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        floatingElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Performance optimization: Debounce function
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

// Keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Close mobile menu with Escape key
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }
        
        // Navigate sections with arrow keys (when focused on nav)
        if (e.target.classList.contains('nav-link')) {
            const currentIndex = Array.from(navLinkElements).indexOf(e.target);
            let nextIndex;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIndex = (currentIndex + 1) % navLinkElements.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIndex = (currentIndex - 1 + navLinkElements.length) % navLinkElements.length;
            }
            
            if (nextIndex !== undefined) {
                navLinkElements[nextIndex].focus();
            }
        }
    });
}

// Add loading states to interactive elements
function addLoadingStates() {
    const interactiveElements = document.querySelectorAll('.cta-button');
    
    interactiveElements.forEach(element => {
        element.addEventListener('click', function(e) {
            // Don't add loading state to form buttons or external links
            if (this.type === 'submit' || this.target === '_blank') return;
            
            this.style.pointerEvents = 'none';
            const originalContent = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            
            setTimeout(() => {
                this.innerHTML = originalContent;
                this.style.pointerEvents = 'auto';
            }, 1000);
        });
    });
}

// Initialize everything when DOM is loaded
function initializeApp() {
    // Core functionality
    initializeTheme();
    handleProfileImage();
    setupScrollAnimations();
    initializeSmoothScrolling();
    initializeKeyboardNavigation();
    initializeLazyLoading();
    
    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    contactForm.addEventListener('submit', handleFormSubmission);
    
    // Close mobile menu when clicking on nav links
    navLinkElements.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Scroll event listeners with throttling
    const throttledScrollHandler = debounce(() => {
        handleNavbarScroll();
        updateActiveNavLink();
    }, 10);
    
    window.addEventListener('scroll', throttledScrollHandler);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Close mobile menu if window is resized to desktop
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMobileMenu();
        }
    });
    
    // Optional enhancements (uncomment to enable)
    // createTypingEffect();
    // initializeParallax();
    // addLoadingStates();
    
    // Initial calls
    updateActiveNavLink();
    handleNavbarScroll();
    
    // Add skip link for accessibility
    addSkipLink();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Add loading complete class to body
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
}

// Add skip link for accessibility
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// Enhanced form validation with real-time feedback
function initializeFormValidation() {
    const formInputs = contactForm.querySelectorAll('input, textarea');
    
    formInputs.forEach(input => {
        // Real-time validation on blur
        input.addEventListener('blur', () => validateInput(input));
        
        // Clear validation on focus
        input.addEventListener('focus', () => clearValidation(input));
        
        // Auto-resize textarea
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('input', autoResizeTextarea);
        }
    });
}

// Validate individual input
function validateInput(input) {
    const value = input.value.trim();
    const inputName = input.name;
    let isValid = true;
    let message = '';
    
    // Remove existing validation
    clearValidation(input);
    
    switch (inputName) {
        case 'name':
            isValid = value.length >= 2;
            message = 'Name must be at least 2 characters long';
            break;
        case 'email':
            isValid = isValidEmail(value);
            message = 'Please enter a valid email address';
            break;
        case 'subject':
            isValid = value.length >= 3;
            message = 'Subject must be at least 3 characters long';
            break;
        case 'message':
            isValid = value.length >= 10;
            message = 'Message must be at least 10 characters long';
            break;
    }
    
    if (!isValid && value.length > 0) {
        showInputError(input, message);
    } else if (isValid && value.length > 0) {
        showInputSuccess(input);
    }
}

// Show input error
function showInputError(input, message) {
    input.classList.add('error');
    const errorElement = document.createElement('span');
    errorElement.className = 'input-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: var(--danger-color);
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: block;
    `;
    input.parentNode.appendChild(errorElement);
}

// Show input success
function showInputSuccess(input) {
    input.classList.add('success');
    input.style.borderColor = 'var(--success-color)';
}

// Clear input validation
function clearValidation(input) {
    input.classList.remove('error', 'success');
    input.style.borderColor = '';
    const errorElement = input.parentNode.querySelector('.input-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Auto-resize textarea
function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}

// Preloader functionality
function initializePreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <div class="preloader-logo">CP</div>
            <div class="preloader-spinner"></div>
        </div>
    `;
    
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--background);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    
    document.body.appendChild(preloader);
    
    // Hide preloader when page is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 1000);
    });
}

// Analytics and tracking (placeholder)
function initializeAnalytics() {
    // Track page views
    trackEvent('page_view', {
        page: window.location.pathname,
        title: document.title
    });
    
    // Track form submissions
    contactForm.addEventListener('submit', () => {
        trackEvent('form_submit', {
            form: 'contact'
        });
    });
    
    // Track navigation clicks
    navLinkElements.forEach(link => {
        link.addEventListener('click', (e) => {
            trackEvent('navigation_click', {
                section: e.target.textContent.toLowerCase()
            });
        });
    });
}

// Mock tracking function (replace with your analytics solution)
function trackEvent(eventName, properties = {}) {
    console.log('Analytics Event:', eventName, properties);
    // Example: gtag('event', eventName, properties);
    // Example: analytics.track(eventName, properties);
}

// Performance monitoring
function initializePerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
        // This would require the web-vitals library
        // getCLS(console.log);
        // getFID(console.log);
        // getFCP(console.log);
        // getLCP(console.log);
        // getTTFB(console.log);
    }
    
    // Monitor JavaScript errors
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
        // Send to error tracking service
    });
    
    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled Promise Rejection:', e.reason);
        // Send to error tracking service
    });
}

// Service Worker registration (for PWA functionality)
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Dark mode detection and system preference handling
function handleSystemThemeChange() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            // Only update if user hasn't manually set a preference
            currentTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', currentTheme);
            themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    });
}

// Enhanced error handling
function setupErrorHandling() {
    // Global error handler
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('Global Error:', {
            message,
            source,
            lineno,
            colno,
            error
        });
        
        // Show user-friendly error message
        showNotification('Something went wrong. Please refresh the page and try again.', 'error');
        
        return true; // Prevent default browser error handling
    };
    
    // Promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        
        // Show user-friendly error message
        showNotification('An unexpected error occurred. Please try again.', 'error');
        
        // Prevent the default handling
        event.preventDefault();
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeApp();
        handleSystemThemeChange();
        setupErrorHandling();
        
        // Optional features (uncomment as needed)
        // initializePreloader();
        // initializeAnalytics();
        // initializePerformanceMonitoring();
        // registerServiceWorker();
        
        console.log('🚀 Portfolio initialized successfully!');
    } catch (error) {
        console.error('❌ Failed to initialize portfolio:', error);
        // Fallback: show basic functionality
        document.body.innerHTML = `
            <div style="text-align: center; padding: 2rem; font-family: sans-serif;">
                <h1>Chukwudi Praise</h1>
                <p>Portfolio is loading... Please refresh the page.</p>
            </div>
        `;
    }
});

// Expose useful functions globally for debugging
window.portfolioUtils = {
    toggleTheme,
    showNotification,
    closeMobileMenu,
    trackEvent
};

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is now hidden
        console.log('Page hidden');
    } else {
        // Page is now visible
        console.log('Page visible');
        // Re-initialize animations or update data
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    showNotification('You\'re back online!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You\'re currently offline. Some features may not work.', 'warning');
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    // Clean up any ongoing animations or timers
    // Save any unsaved form data to localStorage
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    if (Object.values(data).some(value => value.trim())) {
        localStorage.setItem('unsaved_form_data', JSON.stringify(data));
    }
});

// Restore unsaved form data on page load
window.addEventListener('load', () => {
    const unsavedData = localStorage.getItem('unsaved_form_data');
    if (unsavedData) {
        try {
            const data = JSON.parse(unsavedData);
            Object.entries(data).forEach(([key, value]) => {
                const input = contactForm.querySelector(`[name="${key}"]`);
                if (input && value.trim()) {
                    input.value = value;
                }
            });
            
            if (Object.values(data).some(value => value.trim())) {
                showNotification('We restored your unsaved form data.', 'info');
            }
            
            localStorage.removeItem('unsaved_form_data');
        } catch (error) {
            console.error('Failed to restore form data:', error);
        }
    }
});