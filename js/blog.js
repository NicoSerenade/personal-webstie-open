// ===== ADD YOUR POST FILENAMES HERE =====
const POST_FILES = [
    '2025-06-28-zonas-azules-urbanas-un-modelo-para-reconciliar-ciudad-y-bienestar.html'
    // Add new post filenames here when you create them
];
// =========================================

class BlogLoader {
    constructor() {
        this.postsContainer = document.getElementById('posts-container');
        this.loadingMessage = document.getElementById('loading-message');
        this.noPostsMessage = document.getElementById('no-posts-message');
        this.posts = [];
        this.init();
    }

    async init() {
        try {
            await this.loadPosts();
            console.log('Total posts loaded:', this.posts.length);
            this.renderPosts();
        } catch (error) {
            console.error('Error loading blog posts:', error);
            this.showNoPostsMessage();
        }
    }

    async loadPosts() {
        const loadPromises = POST_FILES.map(async (filename) => {
            try {
                const response = await fetch(`post-conversion/posts/${filename}`);
                if (response.ok) {
                    const htmlContent = await response.text();
                    const postData = this.parsePostData(htmlContent, filename);
                    if (postData) {
                        return postData;
                    }
                }
            } catch (error) {
                console.log(`Error loading post ${filename}:`, error);
            }
            return null;
        });

        const results = await Promise.all(loadPromises);
        this.posts = results.filter(post => post !== null);

        // Sort posts by date (newest first)
        this.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    parsePostData(htmlContent, filename) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Extract metadata from meta tags first
            const metaTitle = doc.querySelector('meta[name="post-title"]')?.getAttribute('content');
            const metaDate = doc.querySelector('meta[name="post-date"]')?.getAttribute('content');
            const metaExcerpt = doc.querySelector('meta[name="post-excerpt"]')?.getAttribute('content');
            const metaReadingTime = doc.querySelector('meta[name="reading-time"]')?.getAttribute('content');
            
            // Fallback to HTML elements
            const titleElement = doc.querySelector('title');
            const title = metaTitle || (titleElement ? titleElement.textContent.replace(' - Nicolás Castañeda', '') : 'Untitled Post');
            
            const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
            
            const dateElement = doc.querySelector('time[datetime]');
            const date = metaDate || dateElement?.getAttribute('datetime') || new Date().toISOString().split('T')[0];
            const displayDate = dateElement?.textContent || this.formatDate(date);
            
            // Extract excerpt
            let excerpt = metaExcerpt || metaDescription;
            if (!excerpt) {
                const firstParagraph = doc.querySelector('.post-content p, main p');
                excerpt = firstParagraph?.textContent?.substring(0, 200) + '...' || 'No excerpt available.';
            }
            
            const readingTime = metaReadingTime || this.estimateReadingTime(htmlContent);
            
            return {
                title,
                excerpt,
                date,
                displayDate,
                readingTime,
                filename,
                url: `post-conversion/posts/${filename}`
            };
        } catch (error) {
            console.error(`Error parsing post ${filename}:`, error);
            return null;
        }
    }

    estimateReadingTime(htmlContent) {
        const wordsPerMinute = 200;
        const text = htmlContent.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return Math.max(1, minutes);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    renderPosts() {
        this.loadingMessage.style.display = 'none';
        
        if (this.posts.length === 0) {
            this.showNoPostsMessage();
            return;
        }

        this.postsContainer.innerHTML = this.posts.map(post => `
            <article class="blog-post-card">
                <div class="post-meta">
                    <time datetime="${post.date}">${post.displayDate}</time>
                    <span class="reading-time">${post.readingTime} min read</span>
                </div>
                <h3><a href="${post.url}">${post.title}</a></h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <a href="${post.url}" class="btn-blog">Read Article</a>
            </article>
        `).join('');

        // Add fade-in animation
        const postCards = this.postsContainer.querySelectorAll('.blog-post-card');
        postCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    showNoPostsMessage() {
        this.loadingMessage.style.display = 'none';
        this.noPostsMessage.style.display = 'block';
    }
}

// Initialize blog loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogLoader();
});