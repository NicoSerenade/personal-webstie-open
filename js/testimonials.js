// testimonials.js - Testimonial slider with proper photo handling
// Your R2 domain: https://pub-674ab82eb45f4181a06daa6326d277fb.r2.dev

class TestimonialSlider {
    constructor() {
        this.testimonials = [];
        this.slider = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.animationId = null;
        this.scrollSpeed = 0.5; // Pixels per frame for fluid movement
        this.isUserInteracting = false;
        this.currentScrollLeft = 0;
        this.apiEndpoint = 'https://testimonials-api.itsnicomusic.workers.dev/api/testimonials';
        this.init();
    }

    async init() {
        try {
            await this.loadTestimonials();
            this.setupSlider();
            this.renderTestimonials();
            this.bindEvents();
            // this.startFluidAutoScroll(); // Auto-scroll disabled
        } catch (error) {
            console.error('Error initializing testimonial slider:', error);
            this.showError();
        }
    }

    async loadTestimonials() {
        try {
            console.log('📡 Calling D1 API:', this.apiEndpoint);
            const response = await fetch(this.apiEndpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const testimonials = await response.json();
            console.log('📄 Raw D1 API response:', testimonials);
            
            if (!Array.isArray(testimonials)) {
                throw new Error('Invalid testimonials data format');
            }
            
            // Validate and filter testimonials
            this.testimonials = testimonials.filter(testimonial => {
                return testimonial && 
                       testimonial.name && 
                       testimonial.role && 
                       testimonial.testimonial &&
                       testimonial.testimonial.trim() !== '';
            });
            
            if (this.testimonials.length === 0) {
                this.loadDefaultTestimonials();
                return;
            }
            
            // The API now returns testimonials sorted by approval date, so no need to reverse.
            // this.testimonials.reverse();
            
            console.log(`✅ Loaded ${this.testimonials.length} testimonials from D1`);
            
            // Log photo URLs to verify R2 links
            this.testimonials.forEach(t => {
                console.log(`🖼️ ${t.name} photo:`, t.photo);
                if (t.photo && t.photo.includes('pub-674ab82eb45f4181a06daa6326d277fb.r2.dev')) {
                    console.log(`✅ R2 URL detected for ${t.name}`);
                } else if (t.photo && !t.photo.includes('default-testimonial.svg')) {
                    console.log(`⚠️ Non-R2 URL for ${t.name}, will construct fallback`);
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading testimonials from D1 API:', error);
            this.loadDefaultTestimonials();
        }
    }

    loadDefaultTestimonials() {
        // Fallback testimonials in case API fails
        this.testimonials = [
            {
                name: "Claude",
                role: "AI Assistant at Anthropic",
                testimonial: "Coding with Nicolás feels like collaborating with a thoughtful architect of human experience. He approaches every technical challenge with philosophical depth, asking not just 'how' but 'why' and 'for whom'—creating solutions that truly serve people.",
                photo: "images/default-testimonial.svg"
            },
            {
                name: "Gemini",
                role: "AI Model by Google",
                testimonial: "Working with Nicolás reveals the intersection of technical excellence and human understanding. He brings a unique perspective that considers not just what technology can do, but what it should do for humanity.",
                photo: "images/default-testimonial.svg"
            },
            {
                name: "GPT",
                role: "AI Language Model by OpenAI",
                testimonial: "Nicolás has a rare ability to bridge the gap between complex technical systems and meaningful human outcomes. His work consistently demonstrates that the most powerful technology is that which enhances rather than replaces human capability.",
                photo: "images/default-testimonial.svg"
            }
        ];
        console.log('Using default testimonials due to API error');
    }

    setupSlider() {
        this.slider = document.querySelector('.testimonial-slider');
        this.prevBtn = document.querySelector('.slider-btn.prev');
        this.nextBtn = document.querySelector('.slider-btn.next');
        
        if (!this.slider) {
            console.error('Testimonial slider not found');
            return;
        }

        // Setup for fluid scrolling
        this.slider.style.scrollBehavior = 'auto';
        this.slider.style.overflowX = 'hidden';
        this.slider.style.cursor = 'default';
        this.slider.classList.add('testimonial-slider-fluid');
    }

    renderTestimonials() {
        if (!this.slider || this.testimonials.length === 0) {
            this.showError();
            return;
        }

        // Clear existing content
        this.slider.innerHTML = '';

        // Render testimonials twice for infinite loop
        const testimonialsToRender = [...this.testimonials, ...this.testimonials];

        testimonialsToRender.forEach((testimonial, index) => {
            const testimonialElement = this.createTestimonialElement(testimonial, index);
            if (index >= this.testimonials.length) {
                testimonialElement.classList.add('testimonial-clone');
                testimonialElement.setAttribute('aria-hidden', 'true');
            }
            this.slider.appendChild(testimonialElement);
        });

        // Set initial position
        this.currentScrollLeft = 0;
        this.slider.scrollLeft = 0;
    }

    createTestimonialElement(testimonial, index) {
        const article = document.createElement('article');
        article.className = 'testimonial';
        article.setAttribute('data-index', index);

        // Process photo URL with detailed logging
        const photoUrl = this.constructPhotoUrl(testimonial.photo);
        console.log(`🎯 Final photo URL for ${testimonial.name}:`, photoUrl);

        article.innerHTML = `
            <div class="testimonial-photo">
                <img src="${photoUrl}" 
                     alt="${this.escapeHtml(testimonial.name)}" 
                     loading="lazy" 
                     onerror="
                        console.log('❌ Photo failed to load for ${testimonial.name}:', this.src); 
                        this.src='images/default-testimonial.svg'; 
                        console.log('🔄 Switched to default image');
                     "
                     onload="
                        console.log('✅ Photo loaded successfully for ${testimonial.name}:', this.src);
                        if (this.src.includes('pub-674ab82eb45f4181a06daa6326d277fb.r2.dev')) {
                            console.log('🎉 R2 image loaded successfully!');
                        }
                     ">
            </div>
            <blockquote>
                <p>"${this.escapeHtml(testimonial.testimonial)}"</p>
                <footer>
                    <strong>${this.escapeHtml(testimonial.name)}</strong><br>
                    <span class="testimonial-role">${this.escapeHtml(testimonial.role)}</span>
                </footer>
            </blockquote>
        `;

        return article;
    }

    constructPhotoUrl(photoPath) {
        console.log(`🔄 Processing photo URL: "${photoPath}"`);
        
        // Handle empty or null paths
        if (!photoPath) {
            console.log('❌ No photo path, using default');
            return 'images/default-testimonial.svg';
        }

        // If worker already constructed full R2 URL, use it directly
        if (photoPath.startsWith('https://pub-674ab82eb45f4181a06daa6326d277fb.r2.dev/')) {
            console.log('✅ Full R2 URL from worker, using directly');
            return photoPath;
        }

        // If it's already any full URL, use it
        if (photoPath.startsWith('http')) {
            console.log('✅ Full HTTP URL, using directly');
            return photoPath;
        }

        // If it's a default image path, use it as is
        if (photoPath.includes('default-testimonial.svg') || photoPath.startsWith('images/default')) {
            console.log('✅ Default image path');
            return 'images/default-testimonial.svg';
        }

        // If it's just a filename (worker didn't construct URL), build R2 URL
        if (photoPath && !photoPath.includes('/')) {
            const R2_PUBLIC_URL = 'https://pub-674ab82eb45f4181a06daa6326d277fb.r2.dev';
            const fullUrl = `${R2_PUBLIC_URL}/${photoPath}`;
            console.log(`🔧 Constructing R2 URL client-side: ${photoPath} -> ${fullUrl}`);
            return fullUrl;
        }

        // If it starts with images/ but isn't default, extract filename
        if (photoPath.startsWith('images/') && !photoPath.includes('default')) {
            const filename = photoPath.replace('images/', '');
            const R2_PUBLIC_URL = 'https://pub-674ab82eb45f4181a06daa6326d277fb.r2.dev';
            const fullUrl = `${R2_PUBLIC_URL}/${filename}`;
            console.log(`🔧 Extracting filename and building R2 URL: ${photoPath} -> ${fullUrl}`);
            return fullUrl;
        }

        // Fallback to default
        console.warn('⚠️ Unknown photo path format, using default:', photoPath);
        return 'images/default-testimonial.svg';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindEvents() {
        // Button events for discrete navigation
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.navigateDiscrete('prev'));
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.navigateDiscrete('next'));
        }

        // Remove hover events for fluid scroll
        // if (this.slider) {
        //     this.slider.addEventListener('mouseenter', () => this.pauseFluidScroll());
        //     this.slider.addEventListener('mouseleave', () => this.resumeFluidScroll());
        // }

        // Button focus events
        [this.prevBtn, this.nextBtn].forEach(btn => {
            if (btn) {
                // btn.addEventListener('focus', () => this.pauseFluidScroll());
                // btn.addEventListener('blur', () => this.resumeFluidScroll());
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    navigateDiscrete(direction) {
        if (!this.slider) return;

        const sliderWidth = this.slider.offsetWidth;
        const totalScrollWidth = this.slider.scrollWidth;
        const singleSetWidth = totalScrollWidth / 2;

        if (direction === 'next') {
            this.slider.scrollLeft += sliderWidth;
        } else {
            this.slider.scrollLeft -= sliderWidth;
        }

        // Use a timeout to check for loop conditions after scroll animation
        setTimeout(() => {
            if (this.slider.scrollLeft >= singleSetWidth) {
                this.slider.scrollLeft -= singleSetWidth;
            } else if (this.slider.scrollLeft < 0) {
                this.slider.scrollLeft += singleSetWidth;
            }
            this.currentScrollLeft = this.slider.scrollLeft;
        }, 650); // A bit longer than animation
    }

    animateToPosition(targetPosition) {
        const startPosition = this.slider.scrollLeft;
        const distance = targetPosition - startPosition;
        const duration = 600;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.slider.scrollLeft = startPosition + distance * easeOut;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentScrollLeft = this.slider.scrollLeft; // Update with final position
            }
        };
        
        requestAnimationFrame(animate);
    }

    startFluidAutoScroll() {
        // This function is no longer called but kept for reference
        if (this.testimonials.length <= 1) return;
        
        this.isUserInteracting = false;
        this.fluidAnimate();
    }

    fluidAnimate() {
        // This function is no longer called
        if (!this.isUserInteracting && this.slider) {
            // Fluid continuous scroll
            this.currentScrollLeft += this.scrollSpeed;
            
            // Calculate bounds for infinite loop using fixed dimensions
            const testimonialWidth = 350; // Fixed width from CSS
            const gap = 32;
            const singleSetWidth = this.testimonials.length * (testimonialWidth + gap);
            
            // Reset position when we've scrolled through one complete set
            if (this.currentScrollLeft >= singleSetWidth) {
                this.currentScrollLeft = 0;
            }
            
            // Apply scroll position
            this.slider.scrollLeft = this.currentScrollLeft;
        }
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.fluidAnimate());
    }

    pauseFluidScroll() {
        this.isUserInteracting = true;
    }

    resumeFluidScroll() {
        this.isUserInteracting = false;
    }

    handleResize() {
        // Recalculate positions on resize
        if (this.slider) {
            // No complex logic needed, CSS handles item sizes.
            // Just ensure scroll position is valid.
            const totalScrollWidth = this.slider.scrollWidth;
            const singleSetWidth = totalScrollWidth / 2;
            if (this.slider.scrollLeft >= singleSetWidth) {
                this.slider.scrollLeft -= singleSetWidth;
            }
            this.currentScrollLeft = this.slider.scrollLeft;
        }
    }

    showError() {
        if (!this.slider) return;
        
        this.slider.innerHTML = `
            <div class="testimonial-error">
                <p>Unable to load testimonials. Please try again later.</p>
            </div>
        `;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialSlider();
});

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestimonialSlider;
}