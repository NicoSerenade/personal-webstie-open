// Portfolio Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations and interactions
    initializeTimelineAnimations();
    initializeProjectAnimations();
    initializeScrollEffects();
});

// Timeline animation on scroll
function initializeTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };

    const timelineObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Set initial state
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateX(-50px)';
                
                // Animate with delay based on order
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 200);
                
                timelineObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    timelineItems.forEach(item => {
        timelineObserver.observe(item);
    });
}

// Project cards animation
function initializeProjectAnimations() {
    const projectCards = document.querySelectorAll('.project-card');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const projectObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Set initial state
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(40px)';
                
                // Animate with staggered delay
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
                
                projectObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    projectCards.forEach(card => {
        projectObserver.observe(card);
        
        // Add subtle hover interaction
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Smooth scroll and section visibility
function initializeScrollEffects() {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Section visibility animation
    const sections = document.querySelectorAll('.trajectory-section, .projects-section');
    
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        sectionObserver.observe(section);
    });

    // Add visible class styles
    const style = document.createElement('style');
    style.textContent = `
        .trajectory-section.visible,
        .projects-section.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Handle project link interactions
function handleProjectLinks() {
    const projectLinks = document.querySelectorAll('.project-link');
    
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'translateY(-4px) scale(0.98)';
            
            setTimeout(() => {
                this.style.transform = 'translateY(-2px) scale(1)';
            }, 150);
            
            // If it's an external link, let it proceed normally
            if (this.getAttribute('href').startsWith('http')) {
                return;
            }
            
            // Handle internal links if needed
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Initialize project links on page load
document.addEventListener('DOMContentLoaded', function() {
    handleProjectLinks();
});

// Performance optimization: Throttle scroll events
let ticking = false;

function optimizeScrollPerformance() {
    if (!ticking) {
        requestAnimationFrame(function() {
            // Any scroll-based animations can go here if needed
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', optimizeScrollPerformance);