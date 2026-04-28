# MagicPencil Blog Post Writing Guide

Reference for writing consistent, SEO-optimized blog posts. Two post types: **Resource** and **Product Review**.

---

## Resource Post

**Purpose:** Educational content that ranks for informational queries (e.g. "free elephant coloring pages", "alphabet coloring pages for kids").  
**Example:** `/blog/elephant-coloring-pages.html`

### Head Block

```html
<meta name="description" content="[1 sentence, 150–160 chars, include primary keyword]">
<meta name="keywords" content="[5–8 comma-separated keywords]">
<meta name="author" content="MagicPencil">
<link rel="canonical" href="https://magicpencil.fun/blog/[slug].html" />
<!-- favicons (standard block) -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://magicpencil.fun/blog/[slug].html">
<meta property="og:title" content="[Post title]">
<meta property="og:description" content="[OG description, ~100 chars]">
<meta property="og:image" content="https://magicpencil.fun/assets/og-image.png">
<title>[Title with primary keyword] | MagicPencil</title>
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/responsive.css">
<link rel="stylesheet" href="/css/cookie-consent.css">
```

**JSON-LD Schema (two `<script>` blocks required):**

Block 1 — BlogPosting:
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "[Post title]",
  "description": "[Same as meta description]",
  "image": "https://magicpencil.fun/assets/og-image.png",
  "author": { "@type": "Organization", "name": "MagicPencil" },
  "publisher": { "@type": "Organization", "name": "MagicPencil",
    "logo": { "@type": "ImageObject", "url": "https://magicpencil.fun/assets/logo-128.png" } },
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD"
}
```

Block 2 — BreadcrumbList (immediately after Block 1):
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://magicpencil.fun/"},
    {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://magicpencil.fun/blog/"},
    {"@type": "ListItem", "position": 3, "name": "[Short post title]", "item": "https://magicpencil.fun/blog/[slug].html"}
  ]
}
```

The `"image"` field enables Google rich results. The BreadcrumbList enables sitelinks in search showing `Home › Blog › Post Title`. Both are required for every post.

### Post Structure

```
<main class="blog-wrap">
  <h1 class="blog-title">[Title]</h1>
  <div class="blog-meta">[Date] · [X] min read</div>

  <!-- Intro paragraph: 2–3 sentences, primary keyword in first sentence -->

  <!-- Coloring Page Thumbnails (2×3 grid) -->
  <div class="page-grid">
    <a href="/color/[category]/[id].html" class="page-thumb">
      <img src="/images/[category]/[File].svg" alt="[Name] coloring page">
      <span>[Name]</span>
    </a>
    <!-- × 6 -->
  </div>

  <!-- 2–3 Educational h2 sections -->
  <h2>[Subject] Facts for Kids</h2>
  <ul>...</ul>

  <!-- Tip box -->
  <div class="tip-box">
    <strong>🎨 Coloring Tips</strong>
    <ul>...</ul>
  </div>

  <!-- Affiliate Picks (3 products, tag=arko09-20) -->
  <section class="affiliate-picks">
    <h2>🎨 Recommended Coloring Supplies</h2>
    <div class="affiliate-grid">
      <div class="affiliate-card">
        <div class="affiliate-img-wrap">
          <a href="https://www.amazon.com/dp/[ASIN]?tag=arko09-20" rel="noopener sponsored" target="_blank">
            <img src="https://m.media-amazon.com/images/I/[ImageID]._AC_SL200_.jpg" alt="[Product name]">
          </a>
        </div>
        <div class="affiliate-info">
          <p class="affiliate-name"><a href="https://www.amazon.com/dp/[ASIN]?tag=arko09-20" rel="noopener sponsored" target="_blank">[Product name]</a></p>
          <p class="affiliate-desc">[1-sentence description]</p>
          <a href="https://www.amazon.com/dp/[ASIN]?tag=arko09-20" class="affiliate-btn" rel="noopener sponsored" target="_blank">Check Price on Amazon</a>
        </div>
      </div>
    </div>
    <p class="affiliate-disclaimer">...</p>
  </section>

  <!-- Related Posts (3–4 links) -->
  <section class="related-posts">
    <h2>More Free Coloring Pages</h2>
    <ul>
      <li><a href="/blog/[related-slug].html">[Related title]</a></li>
    </ul>
  </section>
</main>
```

### Checklist

- [ ] Primary keyword in title, h1, first paragraph, and meta description
- [ ] 6 coloring page thumbnails linking to `/color/` pages
- [ ] At least 2 educational h2 sections with facts/tips
- [ ] 3 affiliate product picks with Amazon CDN images (AC_SL200_ for widget)
- [ ] Related posts section (3–4 internal links)
- [ ] Read time estimate in meta line (avg: 5 min = ~900 words)

---

## Product Review Post

**Purpose:** Affiliate revenue content ranking for commercial queries (e.g. "best crayons for kids 2026").  
**Example:** `/blog/best-crayons-for-kids.html`

### Head Block

Same as Resource Post but with commercial-intent description:
```html
<meta name="description" content="Best [product] for kids in 2026 — [N] top picks tested by age. [Key differentiator]. Honest reviews and buying tips.">
```

JSON-LD schema is the same `BlogPosting` type.

### Post Structure

```
<main class="blog-wrap">
  <h1 class="blog-title">[Title]</h1>
  <div class="blog-meta">[Date] · [X] min read</div>

  <!-- Affiliate disclosure (REQUIRED before any affiliate content) -->
  <div class="disclosure">
    As an Amazon Associate, MagicPencil earns from qualifying purchases.
    Links marked with * are affiliate links. This helps keep our coloring pages free!
  </div>

  <!-- Intro paragraph: what the post covers, who it's for -->

  <!-- Quick Comparison Table -->
  <h2>Our Top Picks at a Glance</h2>
  <table class="compare-table">
    <thead>
      <tr><th>Product</th><th>Best For</th><th>Count</th><th>Age</th><th>Rating</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><a href="https://www.amazon.com/dp/[ASIN]?tag=arko09-20" rel="noopener sponsored" target="_blank">[Product Name]</a></td>
        <td>[Use case]</td>
        <td>[Count]</td>
        <td>[Age range]</td>
        <td><span class="badge">⭐ [Rating]</span></td>
      </tr>
    </tbody>
  </table>

  <!-- Individual Review Cards (one per product) -->
  <div class="review-card" id="[product-id]">
    <div class="review-header">
      <h2>[Product Name]</h2>
      <span class="review-badge">[Best For label]</span>
    </div>
    <div class="review-body">
      <div class="review-image">
        <a href="https://www.amazon.com/dp/[ASIN]?tag=arko09-20" rel="noopener sponsored" target="_blank">
          <img src="https://m.media-amazon.com/images/I/[ImageID]._AC_SL500_.jpg" alt="[Product]">
        </a>
        <a href="https://www.amazon.com/dp/[ASIN]?tag=arko09-20" class="review-buy-btn" rel="noopener sponsored" target="_blank">Check Price on Amazon →</a>
      </div>
      <div class="review-details">
        <p>[2–3 paragraph review]</p>
        <div class="pros-cons">
          <div class="pros">
            <strong>Pros</strong>
            <ul><li>...</li></ul>
          </div>
          <div class="cons">
            <strong>Cons</strong>
            <ul><li>...</li></ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Buying Guide h2 section -->
  <h2>How to Choose [Product Type] for Kids</h2>
  <!-- 3–5 factors with explanations -->

  <!-- Verdict box -->
  <div class="verdict-box">
    <h2>Our Verdict</h2>
    <p>[1–2 sentence overall recommendation]</p>
    <p><strong>Best overall:</strong> [Product] | <strong>Best budget:</strong> [Product] | <strong>Best for toddlers:</strong> [Product]</p>
  </div>

  <!-- Related Posts (3–4 links) -->
  <section class="related-posts">
    <h2>More Helpful Posts</h2>
    <ul>
      <li><a href="/blog/[related-slug].html">[Title]</a></li>
    </ul>
  </section>
</main>
```

### Checklist

- [ ] Affiliate disclosure immediately after h1/meta
- [ ] Comparison table with linked product names (Amazon affiliate links)
- [ ] One review card per product with 500px Amazon CDN image (AC_SL500_)
- [ ] Pros and cons list for each product
- [ ] Buying guide section (how to choose)
- [ ] Verdict/recommendation box
- [ ] All Amazon links use `?tag=arko09-20` and `rel="noopener sponsored"`
- [ ] 3–4 internal related post links at bottom

---

## Amazon Image URLs

- Widget (small): `https://m.media-amazon.com/images/I/[ImageID]._AC_SL200_.jpg`
- Review card (large): `https://m.media-amazon.com/images/I/[ImageID]._AC_SL500_.jpg`

Get the ImageID from the Amazon product page URL or the product listing. The `_AC_SL200_` or `_AC_SL500_` suffix controls size.

## Affiliate Link Format

```
https://www.amazon.com/dp/[ASIN]?tag=arko09-20
```

Always add `rel="noopener sponsored"` and `target="_blank"` to every affiliate link.

---

## SEO Rules for Both Post Types

1. **Title tag:** Include primary keyword + year (e.g. "Best Crayons for Kids in 2026")
2. **Meta description:** 150–160 characters, include keyword, write for click-through
3. **H1:** Matches title tag exactly
4. **H2s:** Use keyword variations and semantic phrases (not keyword stuffing)
5. **Internal links:** At minimum, link back to `/blog/` index and 2–3 related posts
6. **Word count:** Resource posts ~900 words (5 min), Review posts ~1200–1500 words (7–8 min)
7. **Images:** All `<img>` tags must have descriptive `alt` text with keyword

## File Naming

- Resource: `/blog/[topic]-coloring-pages.html` (e.g. `elephant-coloring-pages.html`)
- Review: `/blog/best-[product]-for-kids.html` (e.g. `best-crayons-for-kids.html`)
- Use lowercase, hyphens, no underscores

## After Publishing

- Add the new URL to `sitemap.xml` with `<lastmod>` set to publish date
- Add the post card to `blog/index.html` in the correct date order (newest first)
- If replacing a root-level old URL, add a 301 redirect to `_redirects`
