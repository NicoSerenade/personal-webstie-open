# Nicolás Castañeda - Personal Website

This is the complete source code for my personal website—available publicly as a real-world example of ethical web development.

## 🌟 Why This Code Is Public

As someone who advocates for technology that serves humanity, I practice what I preach. You can see exactly how my digital presence works: no hidden trackers, no data harvesting, just honest technology.

I believe in transparency, education, and that sharing knowledge accelerates collective progress. Whether you're a student learning web development, a fellow developer seeking inspiration, or someone curious about how websites work, this code serves as a practical example.

## 🏗️ How This Website Works

### When You Visit My Website

When you type `nicoserenade.com` in your browser, here's what happens:

1. **Your browser asks**: "Where is this website?"
2. **Cloudflare responds**: "Here it is, served from a location near you"
3. **Your browser downloads**: The frontend files of my website (The files that handle what you see.)
4. **Your browser runs**: The downloaded files
5. **Your browser displays**: The website you see

### 💬 When You Submit a Testimonial

Here's the behind-the-scenes flow when someone adds a testimonial:

1. **You fill the form**: Upload your photo and write your testimonial
2. **JavaScript validates**: Checks if everything is filled correctly
3. **Data travels to Cloudflare Worker**: Your submission goes to a mini-program running at the edge
4. **Worker processes**: 
   - Validates your data again (security first!)
   - Sends your photo and testimonial to Cloudflare to save them
   - Marks it as "pending approval"
5. **I review**: I get notified and can approve testimonials through an admin interface
6. **Goes live**: Once approved, your testimonial gets marked as "approved" and automatically appears on the homepage

### 🌐 What is Cloudflare?

**Cloudflare** is like a global network of smart post offices. Instead of having one central server (like one post office), Cloudflare has hundreds of locations worldwide. When you visit my website:

- **Faster loading**: Files are served from the location closest to you
- **Always available**: If one location has issues, others take over
- **Secure**: Built-in protection against attacks and threats
- **Global reach**: Works the same whether you're in Tokyo, Buenos Aires, or Barrancabermeja

### ⚡ What are Cloudflare Workers?

**Workers** are like helpful assistants that run small programs in Cloudflare's network. For my website, they:

- **Handle testimonials**: When someone submits a testimonial, a worker processes it
- **Manage the database**: Store and retrieve testimonials securely
- **Dynamic content**: Generate personalized responses

Think of workers as mini-programs that run "at the edge" - close to you, not on a distant server.

### 📄 HTML Files - The Structure
- **`index.html`** - Homepage
- **`about.html`** - About page  
- **`portfolio.html`** - Work showcase
- **`blog.html`** - Blog listing
- **`contact.html`** - Contact form
- **`testimonial-form.html`** - Testimonial submission

Each HTML file defines the content structure and layout for that page.

### 🎨 CSS Files - The Styling
- **`style.css`** - Main styles used across all pages
- **`about.css`** - About page specific styles
- **`blog.css`** - Blog styling
- **`contact-form.css`** - Contact form design
- **`portfolio.css`** - Portfolio layout
- **`testimonials.css`** - Testimonials section

These control colors, fonts, spacing, animations, and responsive design.

### ⚡ JavaScript Files - The Functionality
- **`script.js`** - Core interactions and navigation
- **`testimonials.js`** - Loads testimonials from database
- **`contact-form.js`** - Handles form submissions
- **`blog.js`** - Displays blog posts
- **`latest-post.js`** - Shows newest post on homepage

These make the site interactive and dynamic.

### 🔄 Key Systems
- **Blog System**: Converts Markdown files to HTML pages with SEO optimization
- **Testimonials**: Cloudflare D1 database with admin approval system
- **Forms**: Web3Forms for contact, custom API for testimonials
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🔒 Security Note

**For developers**: You'll notice some files are missing from this repository. Certain configuration files, environment variables, and deployment scripts have been excluded for security reasons. So if you download the code and try to run it right after, some functionalities wouldn't work.

## 🛠️ Technical Stack

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2 for images
- **API**: Cloudflare Workers
- **Forms**: Web3Forms + Custom API
- **Hosting**: Static hosting with edge functions

## 🔒 Privacy & Ethics

Built with privacy by design:
- No tracking cookies or analytics spy tools
- Minimal data collection
- Transparent data handling
- Secure, encrypted storage

## 🌱 Performance & Sustainability

- Lightweight, fast-loading code
- Energy-efficient hosting
- No unnecessary bloat
- Optimized images and assets

## 📚 What You Can Learn

This code demonstrates:
- Semantic HTML and modern CSS (Grid/Flexbox)
- Vanilla JavaScript without frameworks
- Responsive design principles
- API integration and database operations
- Progressive enhancement
- Ethical web development practices

## 🤝 Contributing

Have style suggestions? Open an issue or reach out through the contact form.

## 📄 License

MIT License - Feel free to learn from this code. Please don't copy the content or design for commercial use.

## 🔗 Connect

- **Website**: [nicoserenade.com](https://nicoserenade.com)
- **GitHub**: [@NicoSerenade](https://github.com/NicoSerenade)
- **Twitter**: [@NicoSerenade](https://x.com/NicoSerenade)

---

*Questions about the code or web development? Feel free to reach out through my contact form at https://nicoserenade.com/contact*