# LLM POST CONVERSION WORKFLOW - SEO OPTIMIZED

**Objective:** Convert a Markdown blog post into a fully SEO-optimized HTML file, integrate it into the website, update all necessary files, and clean up the source file.

**Context:**
- **Input Markdown:** A single `.md` file located in the `post-conversion/` directory.
- **HTML Template:** Use `post-conversion/template-post.html` as the base for the new HTML file.
- **Output Directory:** The final HTML file will be saved in `post-conversion/posts/`.
- **Domain:** All URLs should use `https://nicoserenade.com`

---

### **PART 1: METADATA EXTRACTION & VALIDATION**

1. **Locate Source File:** Find the `.md` blog post file in the `post-conversion/` directory.

2. **Parse Frontmatter:** Read the YAML frontmatter from the Markdown file to extract the following metadata:
   - `title`: The post's official title
   - `reading_time`: The estimated time to read the post (e.g., "7 min")
   - `excerpt`: A short summary for the post preview (150-200 characters)
   - `description`: A more detailed SEO description (up to 160 characters)
   - `date`: The publication date in `YYYY-MM-DD` format
   - `keywords`: A comma-separated list of relevant keywords
   - `tags`: Optional tags for the post (will be used in meta tags)

3. **Data Validation:** Ensure all required metadata fields are present and correctly formatted. If any are missing:
   - `date`: Use today's date in `YYYY-MM-DD` format
   - `reading_time`: Estimate based on word count (250 words per minute)
   - `excerpt`: Use first 150 characters of content (clean text only)
   - `description`: Use excerpt or first paragraph
   - `keywords`: Extract from content or use generic tech-related keywords

4. **Generate Slug:** Create URL-friendly slug from title: lowercase, replace spaces with hyphens, remove special characters.

---

### **PART 2: HTML GENERATION & SEO OPTIMIZATION**

1. **Load Template:** Read the content of `post-conversion/template-post.html`.

2. **Populate ALL Metadata Placeholders:** Replace every `[PLACEHOLDER]` in the template:

   **Basic Meta Tags:**
   - `[POST TITLE]` → Use the `title`
   - `[SEO DESCRIPTION - MORE DETAILED THAN EXCERPT]` → Use `description` 
   - `[POST-SLUG]` → Use generated slug
   - `[YYYY-MM-DD]` → Use `date`
   - `[MONTH DAY, YEAR]` → Format date as "January 7, 2025"
   - `[X min]` → Use `reading_time`
   - `[BRIEF EXCERPT FOR BLOG LISTING - 150-200 CHARACTERS]` → Use `excerpt`
   - `[relevant, keywords, for, this, post]` → Use `keywords`

   **Social Media Meta Tags:**
   - `[COMPELLING SOCIAL DESCRIPTION]` → Use `excerpt` or `description`
   - `[tag1]`, `[tag2]` → Use first two keywords or tags
   - `[POST DESCRIPTION]` → Use `description`
   - `[keyword1, keyword2, keyword3]` → Use `keywords`

3. **Convert Markdown Body to HTML:**
   - Extract the main title (from `# Title` or frontmatter `title`) for the `<h1>` in `.post-header`
   - Convert entire Markdown body using standard transformations:
     - `##` → `<h2>`
     - `###` → `<h3>`
     - `####` → `<h4>`
     - `**bold**` → `<strong>`
     - `*italic*` → `<em>`
     - `[text](url)` → `<a href="url" target="_blank" rel="noopener">text</a>`
     - Lists, blockquotes, code blocks as appropriate

4. **Structure Content Sections:**
   - **Abstract Section:** If content has `## Abstract`, place it in `<div class="abstract">` with keywords
   - **Main Content:** Wrap each `## Section` and its content in `<div class="content-section">`
   - **References Section:** If content has `## References`, place in `<div class="references">`
   - **Ensure proper nesting:** Each section should be self-contained

---

### **PART 3: FILE INTEGRATION & UPDATES**

1. **Generate Final Filename:** Create using pattern: `YYYY-MM-DD-slug.html`
   - Example: `2025-01-07-urban-blue-zones-model.html`

2. **Save HTML File:** Write the complete HTML to `post-conversion/posts/` directory.

3. **Update JavaScript Configuration:**
   
   **Update `js/blog.js`:**
   - Open the file and locate the `POST_FILES` array
   - Add the new filename to the array (maintain chronological order, newest first)
   - Ensure proper JSON formatting with commas

   **Update `js/latest-post.js`:**
   - Open the file and locate the `POST_FILES` array  
   - Add the new filename to the array (maintain chronological order, newest first)
   - Ensure proper JSON formatting with commas

4. **Update Sitemap.xml:**
   - Open `sitemap.xml` in the root directory
   - Add a new `<url>` entry for the blog post:
   ```xml
   <url>
     <loc>https://nicoserenade.com/post-conversion/posts/[FILENAME].html</loc>
     <lastmod>[YYYY-MM-DD]</lastmod>
     <changefreq>yearly</changefreq>
     <priority>0.6</priority>
   </url>
   ```
   - Insert in chronological order (newest posts near the top of blog posts section)
   - Ensure proper XML formatting

5. **Cleanup:** Delete the original `.md` file from the `post-conversion/` directory.

---

### **PART 4: QUALITY ASSURANCE**

Before completing, verify:

1. **All placeholders replaced:** No `[PLACEHOLDER]` text remains in the HTML
2. **Valid HTML structure:** Proper nesting of divs and semantic elements  
3. **Working links:** All internal links use correct relative paths (`../../`)
4. **SEO completeness:** Title, description, keywords, and structured data all populated
5. **File updates:** Confirm blog.js, latest-post.js, and sitemap.xml were updated
6. **Proper encoding:** Ensure special characters are properly encoded in HTML

---

### **PART 5: OUTPUT REQUIREMENTS**

Provide as final output:

1. **Complete HTML file content** (ready to save as the generated filename)
2. **Confirmation of file operations:**
   - ✅ HTML file created in `post-conversion/posts/`
   - ✅ `js/blog.js` updated with new filename
   - ✅ `js/latest-post.js` updated with new filename  
   - ✅ `sitemap.xml` updated with new URL entry
   - ✅ Original `.md` file deleted from `post-conversion/`

3. **Summary of generated metadata:**
   - Final filename
   - Generated slug
   - SEO title and description
   - Publication date
   - Keywords used

---

### **ERROR HANDLING**

If any step fails:
- **Missing frontmatter:** Generate reasonable defaults and continue
- **Malformed markdown:** Clean up content and proceed with conversion
- **File access issues:** Report specific error and halt process
- **Invalid dates:** Use current date and warn user

**Remember:** The goal is to create a fully SEO-optimized, professionally formatted blog post that integrates seamlessly with the existing website structure while maintaining all content integrity.
