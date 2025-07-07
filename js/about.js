// About Page Specific JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Intersection Observer for timeline animations
    const timelineSections = document.querySelectorAll('.timeline-section');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Animate the timeline point when section comes into view
                const point = entry.target.querySelector('.timeline-point');
                if (point) {
                    point.style.animation = 'none';
                    setTimeout(() => {
                        point.style.animation = '';
                    }, 100);
                }
            }
        });
    }, observerOptions);
    
    timelineSections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Add parallax effect to images on scroll
    const images = document.querySelectorAll('.timeline-section .column-image img');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        images.forEach((img, index) => {
            const rect = img.getBoundingClientRect();
            const speed = 0.05 * (index % 2 === 0 ? 1 : -1); // Alternate direction
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const yPos = -(scrolled - rect.top) * speed;
                img.style.transform = `translateY(${yPos}px) scale(1.1)`;
            }
        });
    });
});