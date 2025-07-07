// Enhanced testimonial-form.js with Cloudflare API integration

class TestimonialForm {
    constructor() {
        this.form = document.getElementById('testimonialForm');
        this.successMessage = document.getElementById('successMessage');
        this.testimonialTextarea = document.getElementById('testimonial');
        this.charCount = document.querySelector('.char-count');
        this.charRequirement = document.querySelector('.char-requirement');
        this.photoInput = document.getElementById('photo');
        this.photoPreview = document.getElementById('photoPreview');
        this.previewImage = document.getElementById('previewImage');
        this.photoPlaceholder = document.getElementById('photoPlaceholder');
        this.removePhotoBtn = document.getElementById('removePhoto');
        
        this.selectedPhoto = null;
        this.apiEndpoint = '';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCharCount();
        this.setupPhotoUpload();
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (this.testimonialTextarea) {
            this.testimonialTextarea.addEventListener('input', () => this.updateCharCount());
            this.testimonialTextarea.addEventListener('keyup', () => this.updateCharCount());
        }
    }

    setupPhotoUpload() {
        // Debug: Log if elements are found
        console.log('Photo input found:', !!this.photoInput);
        console.log('Photo preview found:', !!this.photoPreview);
        console.log('Photo placeholder found:', !!this.photoPlaceholder);
        console.log('Remove photo btn found:', !!this.removePhotoBtn);

        // Handle file input change
        if (this.photoInput) {
            this.photoInput.addEventListener('change', (e) => {
                console.log('File input changed:', e.target.files);
                this.handlePhotoSelect(e);
            });
        }

        // Handle remove photo button
        if (this.removePhotoBtn) {
            this.removePhotoBtn.addEventListener('click', () => this.removePhoto());
        }

        // Handle click on placeholder to trigger file input
        if (this.photoPlaceholder) {
            this.photoPlaceholder.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Placeholder clicked, triggering file input');
                if (this.photoInput) {
                    this.photoInput.click();
                }
            });
        }

        // Also handle click on upload container
        const uploadContainer = document.querySelector('.photo-upload-container');
        if (uploadContainer) {
            uploadContainer.addEventListener('click', (e) => {
                // Only trigger if clicking on container or placeholder, not on preview
                if (e.target === uploadContainer || e.target.closest('#photoPlaceholder')) {
                    e.preventDefault();
                    if (this.photoInput) {
                        this.photoInput.click();
                    }
                }
            });
        }
    }

    handlePhotoSelect(event) {
        console.log('handlePhotoSelect called');
        const file = event.target.files[0];
        console.log('Selected file:', file);
        
        // Remove any existing error messages first
        this.removeFileErrorMessage();
        this.removeCompressionHelp();
        
        if (!file) {
            console.log('No file selected, removing photo');
            this.removePhoto();
            return;
        }

        console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        // Validate file type
        if (!file.type.startsWith('image/')) {
            console.log('Invalid file type:', file.type);
            this.showFileError('⚠️ Please select a valid image file (JPG, PNG, or GIF).');
            this.removePhoto();
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            console.log('File too large:', file.size);
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            this.showFileError(`⚠️ Photo is too large (${fileSizeMB}MB). Maximum allowed size is 5MB. Please compress your image or choose a smaller one.`);
            this.removePhoto();
            // Show additional help
            this.showCompressionHelp();
            return;
        }

        console.log('File validation passed, setting selectedPhoto');
        this.selectedPhoto = file;
        this.displayPhotoPreview(file);
    }

    displayPhotoPreview(file) {
        console.log('displayPhotoPreview called with file:', file.name);
        
        if (!this.previewImage || !this.photoPreview || !this.photoPlaceholder) {
            console.error('Preview elements not found:', {
                previewImage: !!this.previewImage,
                photoPreview: !!this.photoPreview,
                photoPlaceholder: !!this.photoPlaceholder
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('File reader loaded successfully');
            this.previewImage.src = e.target.result;
            this.photoPlaceholder.style.display = 'none';
            this.photoPreview.style.display = 'flex'; // Changed to flex for centering
            console.log('Photo preview displayed');
        };
        
        reader.onerror = (e) => {
            console.error('File reader error:', e);
            this.showFileError('Failed to load image preview. Please try again.');
        };
        
        reader.readAsDataURL(file);
    }

    removePhoto() {
        this.selectedPhoto = null;
        this.photoInput.value = '';
        this.previewImage.src = '';
        this.photoPreview.style.display = 'none';
        this.photoPlaceholder.style.display = 'flex';
        this.removeFileErrorMessage();
        this.removeCompressionHelp();
    }

    showFileError(message) {
        this.removeFileErrorMessage();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'file-error-message';
        errorDiv.innerHTML = message;
        
        // Insert after the photo upload container
        const uploadContainer = document.querySelector('.photo-upload-container');
        if (uploadContainer && uploadContainer.parentNode) {
            uploadContainer.parentNode.insertBefore(errorDiv, uploadContainer.nextSibling);
        }
    }

    showCompressionHelp() {
        this.removeCompressionHelp();
        
        const helpDiv = document.createElement('div');
        helpDiv.className = 'compression-help';
        helpDiv.innerHTML = `
            <p><strong>💡 Quick tips to reduce image size:</strong></p>
            <ul>
                <li>Use online tools like <a href="https://tinypng.com" target="_blank" rel="noopener">TinyPNG</a> or <a href="https://squoosh.app" target="_blank" rel="noopener">Squoosh</a></li>
                <li>Resize the image to max 800x800 pixels</li>
                <li>Save as JPEG with 80-90% quality</li>
                <li>Or take a screenshot of the photo (often reduces size)</li>
            </ul>
        `;
        
        // Insert after the error message
        const errorMsg = document.querySelector('.file-error-message');
        if (errorMsg && errorMsg.parentNode) {
            errorMsg.parentNode.insertBefore(helpDiv, errorMsg.nextSibling);
        }
    }

    removeFileErrorMessage() {
        const existingError = document.querySelector('.file-error-message');
        if (existingError) {
            existingError.remove();
        }
    }

    removeCompressionHelp() {
        const existingHelp = document.querySelector('.compression-help');
        if (existingHelp) {
            existingHelp.remove();
        }
    }

    updateCharCount() {
        if (!this.testimonialTextarea || !this.charCount) return;

        const currentLength = this.testimonialTextarea.value.length;
        const maxLength = 300;
        const minLength = 150;

        this.charCount.textContent = `${currentLength}/${maxLength} characters`;

        if (currentLength >= minLength) {
            this.charRequirement.textContent = '✓ Minimum length met';
            this.charRequirement.style.color = '#2ecc71';
        } else {
            const remaining = minLength - currentLength;
            this.charRequirement.textContent = `(${remaining} more characters needed)`;
            this.charRequirement.style.color = '#e74c3c';
        }

        if (currentLength > maxLength) {
            this.charCount.style.color = '#e74c3c';
        } else if (currentLength >= minLength) {
            this.charCount.style.color = '#2ecc71';
        } else {
            this.charCount.style.color = '#666';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log('Form submission started');

        // Remove any existing error messages
        this.removeErrorMessages();

        const formData = new FormData(this.form);
        
        // Add photo to form data
        if (this.selectedPhoto) {
            console.log('Adding photo to form data:', this.selectedPhoto.name);
            formData.set('photo', this.selectedPhoto);
        } else {
            console.log('No photo selected for submission');
        }

        // Debug: Log all form data
        console.log('Form data contents:');
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        const testimonialData = {
            name: formData.get('name'),
            role: formData.get('role'),
            testimonial: formData.get('testimonial'),
            email: formData.get('email'),
            consent: formData.get('consent'),
            photo: this.selectedPhoto
        };

        console.log('Testimonial data for validation:', testimonialData);

        if (!this.validateForm(testimonialData)) {
            return;
        }

        this.showLoading();

        try {
            const result = await this.submitTestimonial(formData);
            console.log('Testimonial submission completed successfully:', result);
            this.showSuccess();
        } catch (error) {
            console.error('Error submitting testimonial:', error);
            this.showError(`Failed to submit testimonial: ${error.message || 'Please try again later.'}`);
        } finally {
            this.hideLoading();
        }
    }

    validateForm(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('Please enter your full name');
        }

        if (!data.role || data.role.trim().length < 2) {
            errors.push('Please enter your role or achievement');
        }

        if (!data.testimonial || data.testimonial.trim().length < 150) {
            errors.push('Testimonial must be at least 150 characters long');
        }

        if (data.testimonial && data.testimonial.trim().length > 300) {
            errors.push('Testimonial must be no more than 300 characters long');
        }

        if (!data.photo) {
            errors.push('Please upload a photo');
        }

        if (!data.consent) {
            errors.push('Please consent to having your testimonial displayed');
        }

        if (data.email && data.email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                errors.push('Please enter a valid email address');
            }
        }

        if (errors.length > 0) {
            this.showError(errors.join('\n'));
            return false;
        }

        return true;
    }

    async submitTestimonial(formData) {
        try {
            console.log('Making API request to:', this.apiEndpoint);
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            let result;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.log('Non-JSON response:', text);
                throw new Error('Invalid response format from server');
            }

            console.log('Response result:', result);

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}: Failed to submit testimonial`);
            }

            if (!result.success) {
                throw new Error(result.error || 'Submission failed');
            }

            console.log('Testimonial submitted successfully:', result);
            return result;
        } catch (error) {
            console.error('API submission error:', error);
            
            // Provide more specific error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Please check your internet connection and try again.');
            } else if (error.message.includes('CORS')) {
                throw new Error('Security error: Please contact support.');
            } else {
                throw error;
            }
        }
    }

    showLoading() {
        const submitBtn = this.form.querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            console.log('Submit button set to loading state');
        } else {
            console.error('Submit button not found');
        }
        
        // Create and show loading popup
        this.createLoadingPopup();
        this.showLoadingPopup();
    }

    hideLoading() {
        const submitBtn = this.form.querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Testimonial';
            console.log('Submit button reset from loading state');
        } else {
            console.error('Submit button not found for reset');
        }
        
        // Hide loading popup
        this.hideLoadingPopup();
    }

    createLoadingPopup() {
        // Remove existing popup if any
        this.removeLoadingPopup();
        
        const popup = document.createElement('div');
        popup.className = 'loading-popup';
        popup.id = 'loadingPopup';
        popup.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                </div>
                <div class="loading-message">Submitting Testimonial</div>
                <div class="loading-description">Please wait while we process your submission...</div>
            </div>
        `;
        
        document.body.appendChild(popup);
    }

    showLoadingPopup() {
        const popup = document.getElementById('loadingPopup');
        if (popup) {
            popup.classList.add('show');
        }
    }

    hideLoadingPopup() {
        const popup = document.getElementById('loadingPopup');
        if (popup) {
            popup.classList.remove('show');
            // Remove popup after animation
            setTimeout(() => {
                this.removeLoadingPopup();
            }, 300);
        }
    }

    removeLoadingPopup() {
        const existingPopup = document.getElementById('loadingPopup');
        if (existingPopup) {
            existingPopup.remove();
        }
    }

    showSuccess() {
        console.log('Attempting to show success message...');
        
        // Ensure both elements exist
        if (!this.form) {
            console.error('Form element not found');
            return;
        }
        
        if (!this.successMessage) {
            console.error('Success message element not found');
            return;
        }
        
        console.log('Both form and success message elements found, proceeding...');
        
        // Update success message content for automatic workflow
        const successContent = this.successMessage.querySelector('p');
        if (successContent) {
            successContent.innerHTML = `
                Thank you for your testimonial! Your submission has been received and is pending approval. 
                Once approved, it will automatically appear on the testimonials section of the homepage.
                <br><br>
                We appreciate you taking the time to share your experience!
            `;
        }
        
        // Hide the form and show success message
        this.form.style.display = 'none';
        this.successMessage.style.display = 'block';
        
        console.log('Form hidden and success message displayed');
        
        // Smooth scroll to success message with delay to ensure rendering
        setTimeout(() => {
            console.log('Scrolling to success message...');
            this.successMessage.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
        }, 200);
    }

    showError(message) {
        this.removeErrorMessages();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 2px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            color: #dc2626;
        `;
        errorDiv.innerHTML = `
            <p><strong>Please fix the following errors:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        this.form.insertBefore(errorDiv, this.form.firstChild);
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    removeErrorMessages() {
        const existingErrors = this.form.querySelectorAll('.form-error');
        existingErrors.forEach(error => error.remove());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialForm();
});
