/**
 * Programmatic SEO Page Generator for Idea Validator
 * Generates 5000+ unique pages for long-tail SEO targeting
 */

const fs = require('fs');
const path = require('path');

// Dimensions for Cartesian product
const industries = [
  'saas', 'ecommerce', 'fintech', 'healthtech', 'edtech', 'foodtech',
  'proptech', 'legaltech', 'insurtech', 'hrtech', 'martech', 'adtech',
  'cleantech', 'agritech', 'biotech', 'medtech', 'regtech', 'govtech',
  'traveltech', 'fashiontech', 'musictech', 'sporttech', 'pettech',
  'retailtech', 'logtech', 'supplychain', 'ai', 'blockchain', 'iot',
  'ar-vr', 'gaming', 'social-media', 'marketplace', 'subscription',
  'mobile-app', 'b2b', 'b2c', 'd2c', 'enterprise', 'smb'
];

const targetAudiences = [
  'startups', 'small-business', 'enterprise', 'freelancers', 'students',
  'developers', 'designers', 'marketers', 'sales-teams', 'hr-teams',
  'finance-teams', 'operations', 'founders', 'investors', 'consultants',
  'agencies', 'nonprofits', 'government', 'healthcare-providers',
  'educators', 'content-creators', 'solopreneurs', 'remote-workers'
];

const businessModels = [
  'subscription', 'freemium', 'one-time-purchase', 'marketplace',
  'commission', 'advertising', 'licensing', 'white-label', 'saas',
  'paas', 'api-first', 'usage-based', 'tiered-pricing', 'enterprise-sales',
  'self-serve', 'hybrid', 'affiliate', 'pay-per-use'
];

const regions = [
  'north-america', 'europe', 'asia-pacific', 'latin-america',
  'middle-east', 'africa', 'global', 'usa', 'uk', 'germany',
  'france', 'japan', 'china', 'india', 'brazil', 'australia',
  'canada', 'singapore', 'uae', 'israel'
];

const stages = [
  'idea-stage', 'pre-seed', 'seed', 'series-a', 'series-b',
  'growth', 'scale', 'mature', 'bootstrapped', 'funded'
];

// Generate page content
function generatePageContent(industry, audience, model, region, stage) {
  const title = `Validate Your ${capitalize(industry)} Idea for ${capitalize(audience)}`;
  const description = `AI-powered validation for ${industry} startups targeting ${audience.replace('-', ' ')} in ${region.replace('-', ' ')} with ${model.replace('-', ' ')} business model`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Idea Validator</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://idea-validator.demo.densematrix.ai/p/${industry}-${audience}-${model}/">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://idea-validator.demo.densematrix.ai/p/${industry}-${audience}-${model}/">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans', sans-serif; background: #0a0a0a; color: #fff; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    header { text-align: center; padding: 4rem 0; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { font-size: 1.25rem; color: #9ca3af; margin-bottom: 2rem; }
    .cta { display: inline-block; padding: 1rem 2rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.2s; }
    .cta:hover { transform: translateY(-2px); }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 4rem 0; }
    .feature { background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
    .feature h3 { font-size: 1.25rem; margin-bottom: 0.5rem; color: #3b82f6; }
    .feature p { color: #9ca3af; }
    .content { background: rgba(255,255,255,0.02); padding: 3rem; border-radius: 16px; margin: 2rem 0; }
    .content h2 { font-size: 1.75rem; margin-bottom: 1.5rem; }
    .content p { color: #d1d5db; margin-bottom: 1rem; }
    .related { margin-top: 4rem; }
    .related h2 { margin-bottom: 1.5rem; }
    .related-links { display: flex; flex-wrap: wrap; gap: 1rem; }
    .related-link { padding: 0.75rem 1.5rem; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; color: #3b82f6; text-decoration: none; transition: all 0.2s; }
    .related-link:hover { background: rgba(59,130,246,0.2); }
    footer { text-align: center; padding: 4rem 0; color: #6b7280; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 4rem; }
    footer a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${title}</h1>
      <p class="subtitle">${description}</p>
      <a href="/" class="cta">Validate Your Idea Now →</a>
    </header>

    <section class="features">
      <div class="feature">
        <h3>📊 Market Analysis</h3>
        <p>Get detailed TAM/SAM/SOM analysis specific to the ${industry} industry and ${audience.replace('-', ' ')} market.</p>
      </div>
      <div class="feature">
        <h3>🎯 Competition Insights</h3>
        <p>Understand your competitive landscape in ${region.replace('-', ' ')} with AI-powered competitor analysis.</p>
      </div>
      <div class="feature">
        <h3>💰 Business Model Validation</h3>
        <p>Evaluate your ${model.replace('-', ' ')} model against industry benchmarks and best practices.</p>
      </div>
      <div class="feature">
        <h3>⚠️ Risk Assessment</h3>
        <p>Identify potential risks and challenges for ${stage.replace('-', ' ')} startups in this space.</p>
      </div>
    </section>

    <section class="content">
      <h2>Why Validate Your ${capitalize(industry)} Startup Idea?</h2>
      <p>Starting a ${industry} business targeting ${audience.replace('-', ' ')} requires careful validation. In ${region.replace('-', ' ')}, the market dynamics are unique, and understanding them before launching can save you significant time and resources.</p>
      <p>Our AI-powered validation tool analyzes your specific idea against thousands of data points, providing you with actionable insights about market opportunity, competition, technical feasibility, and potential revenue models.</p>
      <p>For ${stage.replace('-', ' ')} startups using a ${model.replace('-', ' ')} model, we provide tailored recommendations based on successful patterns in the ${industry} space.</p>
    </section>

    <section class="related">
      <h2>Explore Related Validations</h2>
      <div class="related-links">
        <a href="/p/${industries[(industries.indexOf(industry) + 1) % industries.length]}-${audience}-${model}/" class="related-link">${capitalize(industries[(industries.indexOf(industry) + 1) % industries.length])} for ${capitalize(audience)}</a>
        <a href="/p/${industry}-${targetAudiences[(targetAudiences.indexOf(audience) + 1) % targetAudiences.length]}-${model}/" class="related-link">${capitalize(industry)} for ${capitalize(targetAudiences[(targetAudiences.indexOf(audience) + 1) % targetAudiences.length])}</a>
        <a href="/p/${industry}-${audience}-${businessModels[(businessModels.indexOf(model) + 1) % businessModels.length]}/" class="related-link">${capitalize(industry)} with ${capitalize(businessModels[(businessModels.indexOf(model) + 1) % businessModels.length])}</a>
      </div>
    </section>

    <footer>
      <p>© 2026 Idea Validator. Validate your startup ideas with AI.</p>
      <p><a href="/">Home</a> | <a href="/pricing">Pricing</a></p>
    </footer>
  </div>
</body>
</html>`;
}

function capitalize(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Main generation
function generateAllPages() {
  const outputDir = path.join(__dirname, '..', 'frontend', 'dist', 'p');
  const sitemapDir = path.join(__dirname, '..', 'frontend', 'dist');
  
  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });
  
  const urls = [];
  let count = 0;
  const maxPages = 6000; // Generate slightly more than 5000
  
  // Generate pages using Cartesian product
  for (const industry of industries) {
    for (const audience of targetAudiences) {
      for (const model of businessModels) {
        if (count >= maxPages) break;
        
        const slug = `${industry}-${audience}-${model}`;
        const pageDir = path.join(outputDir, slug);
        fs.mkdirSync(pageDir, { recursive: true });
        
        // Pick region and stage based on index for variety
        const region = regions[count % regions.length];
        const stage = stages[count % stages.length];
        
        const content = generatePageContent(industry, audience, model, region, stage);
        fs.writeFileSync(path.join(pageDir, 'index.html'), content);
        
        urls.push(`https://idea-validator.demo.densematrix.ai/p/${slug}/`);
        count++;
        
        if (count % 1000 === 0) {
          console.log(`Generated ${count} pages...`);
        }
      }
      if (count >= maxPages) break;
    }
    if (count >= maxPages) break;
  }
  
  // Generate sitemap files (max 5000 URLs per sitemap)
  const urlsPerSitemap = 1000;
  for (let i = 0; i < Math.ceil(urls.length / urlsPerSitemap); i++) {
    const chunk = urls.slice(i * urlsPerSitemap, (i + 1) * urlsPerSitemap);
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunk.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>2026-02-24</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;
    
    fs.writeFileSync(path.join(sitemapDir, `sitemap-programmatic-${i + 1}.xml`), sitemapContent);
  }
  
  console.log(`\n✅ Generated ${count} programmatic SEO pages`);
  console.log(`✅ Generated ${Math.ceil(urls.length / urlsPerSitemap)} sitemap files`);
  
  return count;
}

// Run if called directly
if (require.main === module) {
  generateAllPages();
}

module.exports = { generateAllPages };
