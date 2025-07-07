// contact-form.js - Handle contact form submissions with Cloudflare Workers

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.successMessage = document.getElementById('successMessage');
        this.messageTextarea = document.getElementById('message');
        this.charCount = document.querySelector('.char-count');
        this.charRequirement = document.querySelector('.char-requirement');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateCharCount();
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (this.messageTextarea) {
            this.messageTextarea.addEventListener('input', () => this.updateCharCount());
            this.messageTextarea.addEventListener('keyup', () => this.updateCharCount());
        }
    }

    updateCharCount() {
        if (!this.messageTextarea || !this.charCount) return;

        const currentLength = this.messageTextarea.value.length;
        const maxLength = 1000;
        const minLength = 50;

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

        const formData = new FormData(this.form);
        
        // Custom validation logic
        const contactData = {
            name: formData.get('name'),
            role: formData.get('role'),
            email: formData.get('email'),
            message: formData.get('message'),
            consent: formData.get('consent')
        };

        if (!this.validateForm(contactData)) {
            return;
        }

        this.showLoading();

        // Convert form data to JSON for Web3Forms
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        try {
            const response = await fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const result = await response.json();

            if (response.status === 200) {
                this.showSuccess();
                this.form.reset();
                this.updateCharCount();
            } else {
                console.error('API Error:', result);
                this.showError(result.message || 'Failed to send message. Please try again.');
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Unable to send message. Please check your connection and try again.');
        } finally {
            this.hideLoading();
        }
    }

    validateForm(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 2) {
            errors.push('Please enter your full name');
        }

        if (!data.role || data.role.trim().length < 5) {
            errors.push('Please provide a brief introduction about yourself');
        }

        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!data.message || data.message.trim().length < 50) {
            errors.push('Message must be at least 50 characters long');
        }

        if (data.message && data.message.trim().length > 1000) {
            errors.push('Message must be no more than 1000 characters long');
        }

        if (!data.consent) {
            errors.push('Please consent to being contacted via email');
        }

        if (errors.length > 0) {
            this.showError(errors.join('\n'));
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showLoading() {
        const submitBtn = this.form.querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }
        
        // Create and show loading popup
        this.createLoadingPopup();
        this.showLoadingPopup();
    }

    hideLoading() {
        const submitBtn = this.form.querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
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
                <div class="loading-message">Sending Message</div>
                <div class="loading-description">Please wait while we process your request...</div>
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
        if (!this.form || !this.successMessage) {
            console.error('Required elements not found');
            return;
        }
        
        this.form.style.display = 'none';
        this.successMessage.style.display = 'block';
        
        setTimeout(() => {
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
        errorDiv.innerHTML = `
            <p><strong>Please fix the following errors:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;

        this.form.insertBefore(errorDiv, this.form.firstChild);
        errorDiv.scrollIntoView({ behavior: 'smooth' });
    }

    removeErrorMessages() {
        const existingErrors = this.form.querySelectorAll('.form-error');
        existingErrors.forEach(error => error.remove());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
});