// Simple hash function for password (in production, use proper crypto)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  // Convert ArrayBuffer to base64 the same way as Node.js crypto
  const hashArray = new Uint8Array(hashBuffer);
  let binary = '';
  for (let i = 0; i < hashArray.length; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  return btoa(binary);
}

// Generate a secure token
function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Verify admin password
async function verifyPassword(password, env) {
  // Get the stored password hash from environment variable
  const storedHash = env.ADMIN_PASSWORD_HASH;
  if (!storedHash) {
    // If no password is set, use a default (you should set this in your environment)
    console.warn('No ADMIN_PASSWORD_HASH set in environment');
    return false;
  }
  
  const inputHash = await hashPassword(password);
  return inputHash === storedHash;
}

// Admin authentication endpoints
async function handleAdminLogin(request, env, corsHeaders) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return new Response(JSON.stringify({ error: 'Password is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Verify password
    const isValid = await verifyPassword(password, env);
    
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Generate auth token
    const token = generateToken();
    
    // Store token in KV with 24 hour expiration
    if (env.AUTH_TOKENS) {
      await env.AUTH_TOKENS.put(`token:${token}`, JSON.stringify({
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }), {
        expirationTtl: 86400 // 24 hours in seconds
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      token: token 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleAdminVerify(request, env, corsHeaders) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const token = authHeader.substring(7);
  
  // Check token in KV
  if (env.AUTH_TOKENS) {
    const tokenData = await env.AUTH_TOKENS.get(`token:${token}`);
    if (tokenData) {
      const { expiresAt } = JSON.parse(tokenData);
      if (new Date(expiresAt) > new Date()) {
        return new Response(JSON.stringify({ valid: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
  }
  
  return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Middleware to check authentication for admin routes
async function requireAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  
  // Check token in KV
  if (env.AUTH_TOKENS) {
    const tokenData = await env.AUTH_TOKENS.get(`token:${token}`);
    if (tokenData) {
      const { expiresAt } = JSON.parse(tokenData);
      if (new Date(expiresAt) > new Date()) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper functions moved outside the main export
async function handleGetTestimonials(env, corsHeaders) {
  try {
    const stmt = env.DB.prepare(`
      SELECT id, name, role, testimonial, photo_url, created_at, approved
      FROM testimonials 
      WHERE approved = 1 
      ORDER BY updated_at DESC
    `);
    
    const { results } = await stmt.all();
    
    // Transform to match existing format and construct proper photo URLs
    const testimonials = results.map(row => ({
      name: row.name,
      role: row.role,
      testimonial: row.testimonial,
      photo: constructPhotoUrl(row.photo_url, env)
    }));
    
    return new Response(JSON.stringify(testimonials), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch testimonials' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetAllTestimonials(request, env, corsHeaders) {
  // Require authentication for this endpoint
  const isAuthenticated = await requireAuth(request, env);
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const stmt = env.DB.prepare(`
      SELECT id, name, role, testimonial, email, photo_url, created_at, approved
      FROM testimonials 
      ORDER BY created_at DESC
    `);
    
    const { results } = await stmt.all();
    
    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch all testimonials' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleApproveTestimonial(testimonialId, request, env, corsHeaders) {
  // Require authentication
  const isAuthenticated = await requireAuth(request, env);
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const stmt = env.DB.prepare(`
      UPDATE testimonials 
      SET approved = 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    const result = await stmt.bind(testimonialId).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Testimonial not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Testimonial approved successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to approve testimonial' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleHideTestimonial(testimonialId, request, env, corsHeaders) {
  // Require authentication
  const isAuthenticated = await requireAuth(request, env);
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Simply update the testimonial to hidden (approved = 0)
    // DO NOT delete the photo from R2
    const updateStmt = env.DB.prepare(`
      UPDATE testimonials 
      SET approved = 0, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    const result = await updateStmt.bind(testimonialId).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Testimonial not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Testimonial hidden successfully. It has been moved back to pending.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to hide testimonial' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleDeleteTestimonial(testimonialId, request, env, corsHeaders) {
  // Require authentication
  const isAuthenticated = await requireAuth(request, env);
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // First, get the testimonial to check if we need to delete a photo
    const getStmt = env.DB.prepare(`
      SELECT photo_url FROM testimonials WHERE id = ?
    `);
    
    const testimonial = await getStmt.bind(testimonialId).first();
    
    if (!testimonial) {
      return new Response(JSON.stringify({ error: 'Testimonial not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Delete photo from R2 if it's not the default image
    if (testimonial.photo_url && 
        testimonial.photo_url !== 'testimonials-photos/default.svg' && 
        !testimonial.photo_url.startsWith('testimonials-photos/default')) {
      
      console.log('Deleting photo from R2:', testimonial.photo_url);
      
      try {
        await deletePhotoFromR2(testimonial.photo_url, env);
        console.log('Photo deleted successfully from R2');
      } catch (error) {
        console.error('Failed to delete photo from R2:', error);
        // Continue with deletion even if photo deletion fails
      }
    }
    
    // Delete testimonial from database
    const deleteStmt = env.DB.prepare(`DELETE FROM testimonials WHERE id = ?`);
    const result = await deleteStmt.bind(testimonialId).run();
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Failed to delete testimonial' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Testimonial and photo permanently deleted' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete testimonial' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handlePostTestimonial(request, env, corsHeaders) {
  try {
    console.log('Starting testimonial submission...');
    
    const formData = await request.formData();
    
    const name = formData.get('name')?.toString().trim();
    const role = formData.get('role')?.toString().trim();
    const testimonial = formData.get('testimonial')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const consent = formData.get('consent');
    const photo = formData.get('photo');
    
    console.log('Form data received:', {
      name,
      role,
      testimonialLength: testimonial?.length,
      email,
      consent: !!consent,
      photoSize: photo?.size,
      photoType: photo?.type
    });
    
    // Validation
    const errors = [];
    if (!name || name.length < 2) errors.push('Name is required');
    if (!role || role.length < 2) errors.push('Role is required');
    if (!testimonial || testimonial.length < 150) errors.push('Testimonial must be at least 150 characters');
    if (testimonial && testimonial.length > 300) errors.push('Testimonial must be no more than 300 characters');
    if (!photo || !photo.size) errors.push('Photo is required');
    if (!consent) errors.push('Consent is required');
    
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) errors.push('Invalid email format');
    }
    
    if (photo && photo.size > 5 * 1024 * 1024) errors.push('Photo must be less than 5MB');
    if (photo && !photo.type.startsWith('image/')) errors.push('Invalid photo format');
    
    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return new Response(JSON.stringify({ error: errors.join(', ') }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    let photoUrl = 'testimonials-photos/default.svg';
    
    // Upload photo to R2 if provided
    if (photo && photo.size > 0) {
      console.log('Starting photo upload to R2...');
      
      try {
        // Validate R2 binding
        if (!env.testimonials_photos) {
          throw new Error('R2 bucket binding not found');
        }
        
        // Get proper file extension
        const fileExtension = getFileExtension(photo.type, photo.name);
        console.log('File extension determined:', fileExtension);
        
        // Generate clean filename
        const fileName = generateFileName(name);
        const photoKey = `${fileName}-${Date.now()}.${fileExtension}`;
        
        console.log('Uploading to R2 with key:', photoKey);
        
        // Convert photo to ArrayBuffer for more reliable upload
        const photoArrayBuffer = await photo.arrayBuffer();
        console.log('Photo converted to ArrayBuffer, size:', photoArrayBuffer.byteLength);
        
        // Upload to R2
        const uploadResult = await env.testimonials_photos.put(photoKey, photoArrayBuffer, {
          httpMetadata: {
            contentType: photo.type,
            cacheControl: 'public, max-age=31536000', // 1 year cache
          },
          customMetadata: {
            uploadedAt: new Date().toISOString(),
            originalName: photo.name,
            uploaderName: name,
          }
        });
        
        if (uploadResult) {
          photoUrl = photoKey; // Store just the key, construct full URL when serving
          console.log('Photo uploaded successfully to R2:', photoKey);
        } else {
          throw new Error('R2 upload returned null');
        }
        
      } catch (error) {
        console.error('Photo upload error details:', {
          error: error.message,
          stack: error.stack,
          photoType: photo.type,
          photoSize: photo.size,
          r2Binding: !!env.testimonials_photos
        });
        
        // For debugging purposes, return the error instead of silently failing
        return new Response(JSON.stringify({ 
          error: `Photo upload failed: ${error.message}. Please try again or contact support.`,
          debug: {
            photoType: photo.type,
            photoSize: photo.size,
            hasR2Binding: !!env.testimonials_photos
          }
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    console.log('Final photo URL:', photoUrl);
    
    // Insert into database
    const stmt = env.DB.prepare(`
      INSERT INTO testimonials (name, role, testimonial, email, photo_url, approved)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const dbResult = await stmt.bind(name, role, testimonial, email || null, photoUrl, 0).run();
    console.log('Database insert result:', dbResult);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Testimonial submitted successfully and is pending approval',
      debug: {
        photoUploaded: photoUrl !== 'testimonials-photos/default.svg',
        photoUrl: photoUrl
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Submission error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to submit testimonial',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Helper function to construct proper photo URLs using your specific R2 domain
function constructPhotoUrl(photoPath, env) {
  // If it's the default image, return as relative path (will be handled by frontend)
  if (!photoPath || 
      photoPath === 'testimonials-photos/default.svg' || 
      photoPath.startsWith('testimonials-photos/default')) {
    return 'testimonials-photos/default.svg';
  }
  
  // If it's already a full URL, return as is
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  // For uploaded photos, construct the full R2 URL
  const R2_PUBLIC_URL = '';
  
  // If it's just a filename (uploaded photo), use the public R2 URL
  if (photoPath && !photoPath.includes('/')) {
    const fullUrl = `${R2_PUBLIC_URL}/${photoPath}`;
    console.log(`Constructing R2 URL: ${photoPath} -> ${fullUrl}`);
    return fullUrl;
  }
  
  // If it contains testimonials-photos/ but isn't default, extract filename and use R2
  if (photoPath.startsWith('testimonials-photos/') && !photoPath.includes('default')) {
    const filename = photoPath.replace('testimonials-photos/', '');
    const fullUrl = `${R2_PUBLIC_URL}/${filename}`;
    console.log(`Extracting filename and constructing R2 URL: ${photoPath} -> ${fullUrl}`);
    return fullUrl;
  }
  
  // Fallback to default
  console.warn('Unknown photo path format, using default:', photoPath);
  return 'testimonials-photos/default.svg';
}

// Helper function to delete photo from R2
async function deletePhotoFromR2(photoPath, env) {
  if (!env.testimonials_photos) {
    throw new Error('R2 bucket binding not found');
  }
  
  // Extract just the filename if it's a path
  let photoKey = photoPath;
  if (photoPath.startsWith('testimonials-photos/')) {
    photoKey = photoPath.replace('testimonials-photos/', '');
  }
  
  console.log('Attempting to delete photo key:', photoKey);
  
  try {
    await env.testimonials_photos.delete(photoKey);
    console.log('Successfully deleted photo from R2:', photoKey);
  } catch (error) {
    console.error('R2 deletion error:', error);
    throw error;
  }
}

function getFileExtension(mimeType, fileName) {
  // First try to get extension from MIME type
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg', 
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg'
  };
  
  if (mimeToExt[mimeType]) {
    return mimeToExt[mimeType];
  }
  
  // Fallback to filename extension
  if (fileName && fileName.includes('.')) {
    const ext = fileName.split('.').pop().toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    if (validExts.includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }
  }
  
  // Default fallback
  return 'jpg';
}

function generateFileName(name) {
  return name.toLowerCase()
             .replace(/[áàäâã]/g, 'a')
             .replace(/[éèëê]/g, 'e')
             .replace(/[íìïî]/g, 'i')
             .replace(/[óòöôõ]/g, 'o')
             .replace(/[úùüû]/g, 'u')
             .replace(/[ñ]/g, 'n')
             .replace(/[ç]/g, 'c')
             .replace(/[^a-z0-9\s]/g, '')
             .replace(/\s+/g, '-')
             .replace(/-+/g, '-')
             .replace(/^-|-$/g, '')
             .substring(0, 20); // Limit length
}

// Main worker export
export default {
  async fetch(request, env, ctx) {
    // Handle CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    try {
      // Public endpoints (no auth required)
      if (url.pathname === '/api/testimonials' && request.method === 'GET') {
        return await handleGetTestimonials(env, corsHeaders);
      }
      
      if (url.pathname === '/api/testimonials' && request.method === 'POST') {
        return await handlePostTestimonial(request, env, corsHeaders);
      }

      // Auth endpoints
      if (url.pathname === '/api/admin/login' && request.method === 'POST') {
        return await handleAdminLogin(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/admin/verify' && request.method === 'GET') {
        return await handleAdminVerify(request, env, corsHeaders);
      }

      // Protected admin endpoints (auth required)
      if (url.pathname === '/api/testimonials/all' && request.method === 'GET') {
        return await handleGetAllTestimonials(request, env, corsHeaders);
      }

      if (url.pathname.match(/^\/api\/testimonials\/(\d+)\/approve$/) && request.method === 'POST') {
        const testimonialId = url.pathname.match(/^\/api\/testimonials\/(\d+)\/approve$/)[1];
        return await handleApproveTestimonial(testimonialId, request, env, corsHeaders);
      }

      if (url.pathname.match(/^\/api\/testimonials\/(\d+)\/hide$/) && request.method === 'POST') {
        const testimonialId = url.pathname.match(/^\/api\/testimonials\/(\d+)\/hide$/)[1];
        return await handleHideTestimonial(testimonialId, request, env, corsHeaders);
      }

      if (url.pathname.match(/^\/api\/testimonials\/(\d+)$/) && request.method === 'DELETE') {
        const testimonialId = url.pathname.match(/^\/api\/testimonials\/(\d+)$/)[1];
        return await handleDeleteTestimonial(testimonialId, request, env, corsHeaders);
      }
      
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
