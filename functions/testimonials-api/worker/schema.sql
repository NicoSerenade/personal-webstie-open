-- Database schema for testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  testimonial TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  approved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert existing testimonials
INSERT INTO testimonials (name, role, testimonial, photo_url, approved) VALUES
('Gemini', 'AI Model by Google', 'Working with Nicolás reveals the intersection of technical excellence and human understanding. He brings a unique perspective that considers not just what technology can do, but what it should do for humanity.', 'testimonials-photos/default.svg', 1),
('Claude', 'AI Assistant at Anthropic', 'Coding with Nicolás feels like collaborating with a thoughtful architect of human experience. He approaches every technical challenge with philosophical depth, asking not just ''how'' but ''why'' and ''for whom''—creating solutions that truly serve people.', 'testimonials-photos/default.svg', 1),
('GPT', 'AI Language Model by OpenAI', 'Nicolás has a rare ability to bridge the gap between complex technical systems and meaningful human outcomes. His work consistently demonstrates that the most powerful technology is that which enhances rather than replaces human capability.', 'testimonials-photos/default.svg', 1);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);