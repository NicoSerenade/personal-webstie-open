// ===== ADD YOUR POST FILENAMES HERE =====
const POST_FILES = [
    '2025-06-28-zonas-azules-urbanas-un-modelo-para-reconciliar-ciudad-y-bienestar.html'
    // Add new post filenames here when you create them
];
// =========================================

class LatestPostsLoader {
    constructor() {
        this.latestPostContainer = document.querySelector('.latest-post');
        this.init();
    }

    async init() {
        if (!this.latestPostContainer) return;
        
        try {
            const latestPost = await this.loadLatestPost();
            if (latestPost) {
                this.renderLatestPost(latestPost);
            } else {
                this.renderNoPostsMessage();
            }
        } catch (error) {
            console.error('Error loading latest post:', error);
            this.renderNoPostsMessage();
        }
    }

    async loadLatestPost() {
        const posts = [];

        for (const filename of POST_FILES) {
            try {
                const response = await fetch(`post-conversion/posts/${filename}`);
                if (response.ok) {
                    const htmlContent = await response.text();
                    const postData = this.parsePostData(htmlContent, filename);
                    if (postData) {
                        posts.push(postData);
                    }
                }
            } catch (error) {
                console.log(`Post ${filename} not found:`, error);
            }
        }

        // Sort by date and return the latest
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        return posts[0] || null;
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
                excerpt = firstParagraph?.textContent?.substring(0, 150) + '...' || 'No excerpt available.';
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

    renderLatestPost(post) {
        // Show loading state
        this.latestPostContainer.classList.add('loading');
        
        setTimeout(() => {
            this.latestPostContainer.innerHTML = `
                <div class="latest-post-header">
                    <h3>Latest from the Blog</h3>
                    <div class="post-date">
                        <time datetime="${post.date}">${post.displayDate}</time>
                    </div>
                </div>
                <div class="latest-post-content">
                    <h4><a href="${post.url}">${post.title}</a></h4>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-actions">
                        <a href="${post.url}" class="read-post-btn">Read Article</a>
                        <span class="reading-time">${post.readingTime} min read</span>
                    </div>
                </div>
            `;

            // Remove loading state and add animation
            this.latestPostContainer.classList.remove('loading');
            this.latestPostContainer.style.opacity = '0';
            this.latestPostContainer.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                this.latestPostContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                this.latestPostContainer.style.opacity = '1';
                this.latestPostContainer.style.transform = 'translateY(0)';
            }, 50);
        }, 300);
    }

    renderNoPostsMessage() {
        this.latestPostContainer.classList.remove('loading');
        this.latestPostContainer.innerHTML = `
            <div class="latest-post-header">
                <h3>Latest from the Blog</h3>
            </div>
            <div class="latest-post-content">
                <p>No posts available yet. Check back soon for new content!</p>
                <div class="post-actions" style="justify-content: center; margin-top: 2rem;">
                    <a href="blog.html" class="read-post-btn">Visit Blog</a>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LatestPostsLoader();
});