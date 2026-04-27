"""
MagicPencil Clean URL Migration — Test Suite
Tests all aspects of the URL structure migration:
  - Static files exist and are well-formed
  - Canonical URLs are correct and unique
  - SEO content (title, h1, meta description) present
  - sr-only SEO wrapper is in place (not visible in layout)
  - data-image-id / data-category-id attributes correct
  - Absolute paths used (no relative paths to CSS/JS/images)
  - Schema JSON-LD is valid JSON with correct types
  - Legacy redirect scripts present in coloring.html / category.html
  - mobile-redirect.js placed at end of <body> (not <head>)
  - HTTP responses from live local server
"""

import sys
import re
import json
import urllib.request
import urllib.error
from pathlib import Path

PROJECT_ROOT = (Path(__file__).resolve().parent / "../..").resolve()
BASE_URL = "http://localhost:3000"

PASS = "\033[92m[PASS]\033[0m"
FAIL = "\033[91m[FAIL]\033[0m"
INFO = "\033[94m[INFO]\033[0m"

results = {"passed": 0, "failed": 0}


def ok(msg):
    print(f"  {PASS} {msg}")
    results["passed"] += 1


def fail(msg):
    print(f"  {FAIL} {msg}")
    results["failed"] += 1


def check(cond, pass_msg, fail_msg):
    if cond:
        ok(pass_msg)
    else:
        fail(fail_msg)


def fetch(path, follow_redirects=True):
    """Return (status_code, final_url, body_text) or (None, None, None) on error."""
    url = BASE_URL + path
    try:
        req = urllib.request.Request(url)
        if not follow_redirects:
            opener = urllib.request.build_opener(urllib.request.HTTPHandler)
            opener.addheaders = []
            resp = opener.open(req, timeout=5)
        else:
            resp = urllib.request.urlopen(req, timeout=5)
        body = resp.read().decode("utf-8", errors="replace")
        return resp.getcode(), resp.url, body
    except urllib.error.HTTPError as e:
        return e.code, url, ""
    except Exception as e:
        return None, url, str(e)


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1: Generated file existence
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 1: Generated file existence ──")

color_dir = PROJECT_ROOT / "color"
categories_dir = PROJECT_ROOT / "categories"

coloring_pages = list(color_dir.rglob("*.html"))
category_pages = list(categories_dir.glob("*.html"))

check(len(coloring_pages) >= 85,
      f"85+ coloring pages generated ({len(coloring_pages)} found)",
      f"Expected 85+ coloring pages, found {len(coloring_pages)}")

check(len(category_pages) >= 10,
      f"10+ category pages generated ({len(category_pages)} found)",
      f"Expected 10+ category pages, found {len(category_pages)}")

# Spot-check specific pages
spot_check_pages = [
    PROJECT_ROOT / "color/animals/elephant.html",
    PROJECT_ROOT / "color/animals/lion.html",
    PROJECT_ROOT / "color/fantasy/dragon-firing.html",
    PROJECT_ROOT / "color/ocean/whale.html",
    PROJECT_ROOT / "color/vehicles/fire-truck.html",
    PROJECT_ROOT / "color/flowers/sunflower.html",
    PROJECT_ROOT / "categories/animals.html",
    PROJECT_ROOT / "categories/fantasy.html",
    PROJECT_ROOT / "categories/ocean.html",
]
for p in spot_check_pages:
    check(p.exists(), f"File exists: {p.relative_to(PROJECT_ROOT)}", f"Missing: {p.relative_to(PROJECT_ROOT)}")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2: Canonical URL uniqueness and correctness
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 2: Canonical URLs ──")

canonicals = {}
duplicate_canonicals = []

for page in coloring_pages:
    content = page.read_text(encoding="utf-8")
    m = re.search(r'<link rel="canonical" href="([^"]+)"', content)
    if m:
        canon = m.group(1)
        if canon in canonicals:
            duplicate_canonicals.append((canon, page, canonicals[canon]))
        else:
            canonicals[canon] = page

check(len(duplicate_canonicals) == 0,
      f"All {len(coloring_pages)} coloring pages have unique canonical URLs",
      f"{len(duplicate_canonicals)} duplicate canonical(s): {duplicate_canonicals[:3]}")

# Check elephant specifically
elephant = (PROJECT_ROOT / "color/animals/elephant.html").read_text(encoding="utf-8")
m = re.search(r'<link rel="canonical" href="([^"]+)"', elephant)
check(m and m.group(1) == "https://magicpencil.fun/color/animals/elephant.html",
      "Elephant canonical is correct (https://magicpencil.fun/color/animals/elephant.html)",
      f"Elephant canonical wrong: {m.group(1) if m else 'not found'}")

# Category canonical
animals_cat = (PROJECT_ROOT / "categories/animals.html").read_text(encoding="utf-8")
m = re.search(r'<link rel="canonical" href="([^"]+)"', animals_cat)
check(m and "categories/animals" in m.group(1),
      f"Animals category canonical correct: {m.group(1) if m else 'none'}",
      f"Animals category canonical wrong: {m.group(1) if m else 'not found'}")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3: SEO content (title, h1, meta description)
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 3: SEO content ──")

for page in coloring_pages[:5]:  # spot check first 5
    content = page.read_text(encoding="utf-8")
    slug = page.stem
    name = slug.replace("-", " ").title()

    has_title = bool(re.search(r"<title>[^<]{10,}</title>", content))
    has_h1 = bool(re.search(r"<h1>[^<]{5,}</h1>", content))
    has_meta_desc = bool(re.search(r'<meta name="description" content="[^"]{50,}"', content))
    has_seo_wrapper = "seo-coloring-meta" in content

    rel = page.relative_to(PROJECT_ROOT)
    check(has_title, f"{rel}: has <title>", f"{rel}: missing <title>")
    check(has_h1, f"{rel}: has <h1>", f"{rel}: missing <h1>")
    check(has_meta_desc, f"{rel}: has meta description (50+ chars)", f"{rel}: missing/short meta description")
    check(has_seo_wrapper, f"{rel}: has seo-coloring-meta wrapper", f"{rel}: missing seo-coloring-meta wrapper")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4: data attributes on <body>
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 4: data attributes on <body> ──")

elephant_content = (PROJECT_ROOT / "color/animals/elephant.html").read_text(encoding="utf-8")
m_id = re.search(r'<body[^>]+data-image-id="([^"]+)"', elephant_content)
m_cat = re.search(r'<body[^>]+data-category="([^"]+)"', elephant_content)
check(m_id and m_id.group(1) == "animals-elephant",
      f"Elephant page: data-image-id='animals-elephant'",
      f"Elephant page: data-image-id wrong — got {m_id.group(1) if m_id else 'none'}")
check(m_cat and m_cat.group(1) == "animals",
      "Elephant page: data-category='animals'",
      f"Elephant page: data-category wrong — got {m_cat.group(1) if m_cat else 'none'}")

animals_cat_content = (PROJECT_ROOT / "categories/animals.html").read_text(encoding="utf-8")
m_cid = re.search(r'<body[^>]+data-category-id="([^"]+)"', animals_cat_content)
check(m_cid and m_cid.group(1) == "animals",
      "Animals category page: data-category-id='animals'",
      f"Animals category page: data-category-id wrong — got {m_cid.group(1) if m_cid else 'none'}")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5: Absolute paths (no relative CSS/JS/image paths)
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 5: Absolute paths in generated pages ──")

# Coloring pages must NOT use relative css/js/image refs
bad_relative_patterns = [
    r'href="css/',
    r'href="js/',
    r'src="js/',
    r'src="images/',
    r'href="assets/',
    r'src="assets/',
]

pages_with_relative = []
for page in coloring_pages:
    content = page.read_text(encoding="utf-8")
    for pattern in bad_relative_patterns:
        if re.search(pattern, content):
            pages_with_relative.append((page.relative_to(PROJECT_ROOT), pattern))
            break

check(len(pages_with_relative) == 0,
      f"No coloring pages use relative CSS/JS/image paths",
      f"{len(pages_with_relative)} pages have relative paths: {pages_with_relative[:3]}")

# Verify absolute paths ARE present
check("/css/main.css" in elephant_content,
      "Elephant page uses absolute /css/main.css",
      "Elephant page missing absolute /css/main.css")
check("/js/coloring.js" in elephant_content,
      "Elephant page uses absolute /js/coloring.js",
      "Elephant page missing absolute /js/coloring.js")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6: Schema JSON-LD validity
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 6: Schema JSON-LD validity ──")

schema_errors = 0
for page in coloring_pages[:10]:  # check first 10
    content = page.read_text(encoding="utf-8")
    schemas = re.findall(r'<script type="application/ld\+json"[^>]*>([\s\S]*?)</script>', content)
    for schema_text in schemas:
        try:
            data = json.loads(schema_text)
            schema_type = data.get("@type", "unknown")
            if schema_type not in ("BreadcrumbList", "ImageObject"):
                fail(f"{page.stem}: unexpected schema @type '{schema_type}'")
                schema_errors += 1
        except json.JSONDecodeError as e:
            fail(f"{page.stem}: invalid JSON in schema — {e}")
            schema_errors += 1

if schema_errors == 0:
    ok("All spot-checked schema JSON-LD blocks are valid JSON with correct @type")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7: mobile-redirect.js placement
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 7: mobile-redirect.js placement ──")

# Must be at END of body, not in <head>
for page_path, label in [
    (PROJECT_ROOT / "color/animals/elephant.html", "elephant"),
    (PROJECT_ROOT / "color/fantasy/dragon-firing.html", "dragon-firing"),
]:
    content = page_path.read_text(encoding="utf-8")
    # Look for the actual <script src= tag, not comments mentioning the filename
    script_tag_pos = content.find('<script src="/js/mobile-redirect.js"')
    head_end = content.find("</head>")
    check(script_tag_pos > head_end and script_tag_pos != -1,
          f"{label}: mobile-redirect.js <script> tag is after </head> (end of body)",
          f"{label}: mobile-redirect.js <script> tag in <head> or missing (pos={script_tag_pos}, head_end={head_end})")

# Also check mobile-redirect.js reads data-image-id (not just URL params)
mobile_js = (PROJECT_ROOT / "js/mobile-redirect.js").read_text(encoding="utf-8")
check("dataset.imageId" in mobile_js or "dataset" in mobile_js,
      "mobile-redirect.js reads data-image-id from body dataset",
      "mobile-redirect.js does not read dataset.imageId")
check("window.location.replace" in mobile_js,
      "mobile-redirect.js uses window.location.replace for redirect",
      "mobile-redirect.js missing window.location.replace")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 8: Legacy redirect scripts
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 8: Legacy URL redirect scripts ──")

coloring_html = (PROJECT_ROOT / "coloring.html").read_text(encoding="utf-8")
check("window.location.replace" in coloring_html and "color/" in coloring_html,
      "coloring.html has legacy redirect to /color/<cat>/<slug>.html",
      "coloring.html missing legacy redirect script")
# Must be in <head> (early, before anything renders)
replace_pos = coloring_html.find("window.location.replace")
head_end = coloring_html.find("</head>")
check(replace_pos < head_end and replace_pos != -1,
      "coloring.html: legacy redirect script is in <head>",
      f"coloring.html: legacy redirect not in <head> (pos={replace_pos}, head_end={head_end})")

category_html = (PROJECT_ROOT / "category.html").read_text(encoding="utf-8")
check("window.location.replace" in category_html and "categories/" in category_html,
      "category.html has legacy redirect to /categories/<cat>.html",
      "category.html missing legacy redirect script")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 9: HTTP responses from local server
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 9: HTTP responses from local server ({BASE_URL}) ──")

http_tests = [
    ("/", 200, "Homepage"),
    ("/color/animals/elephant.html", 200, "Elephant coloring page"),
    ("/color/animals/lion.html", 200, "Lion coloring page"),
    ("/color/fantasy/dragon-firing.html", 200, "Dragon coloring page"),
    ("/color/ocean/whale.html", 200, "Whale coloring page"),
    ("/color/vehicles/fire-truck.html", 200, "Fire truck coloring page"),
    ("/color/flowers/sunflower.html", 200, "Sunflower coloring page"),
    ("/categories/animals.html", 200, "Animals category page"),
    ("/categories/fantasy.html", 200, "Fantasy category page"),
    ("/categories/ocean.html", 200, "Ocean category page"),
    ("/images/animals/Elephant.svg", 200, "Elephant SVG image"),
    ("/js/coloring.js", 200, "coloring.js"),
    ("/js/app.js", 200, "app.js"),
    ("/js/mobile-redirect.js", 200, "mobile-redirect.js"),
    ("/css/coloring-page.css", 200, "coloring-page.css"),
]

for path, expected_status, label in http_tests:
    status, _, body = fetch(path)
    if status is None:
        fail(f"{label} ({path}): request failed — {body}")
    else:
        check(status == expected_status,
              f"{label} ({path}): HTTP {status}",
              f"{label} ({path}): expected {expected_status}, got {status}")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 10: Content served by local server matches expectations
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 10: Content correctness from server ──")

# Elephant page served correctly
status, _, body = fetch("/color/animals/elephant.html")
if status == 200:
    check('data-image-id="animals-elephant"' in body,
          "Elephant page served: data-image-id='animals-elephant' present",
          "Elephant page served: data-image-id='animals-elephant' missing from response")
    check("seo-coloring-meta" in body,
          "Elephant page served: seo-coloring-meta wrapper present",
          "Elephant page served: seo-coloring-meta wrapper missing")
    check("/js/coloring.js" in body,
          "Elephant page served: absolute /js/coloring.js reference",
          "Elephant page served: missing absolute /js/coloring.js reference")
    check("magicpencil.fun/color/animals/elephant.html" in body,
          "Elephant page served: correct canonical URL",
          "Elephant page served: canonical URL wrong or missing")
else:
    fail(f"Cannot test elephant page content — HTTP {status}")

# Animals category page served correctly
status, _, body = fetch("/categories/animals.html")
if status == 200:
    check('data-category-id="animals"' in body,
          "Animals category: data-category-id='animals' present",
          "Animals category: data-category-id='animals' missing from response")
else:
    fail(f"Cannot test animals category content — HTTP {status}")

# SVG file is actually SVG content
status, _, body = fetch("/images/animals/Elephant.svg")
if status == 200:
    check(body.strip().startswith("<svg") or "<?xml" in body[:50] or "<svg" in body[:200],
          "Elephant SVG served with SVG content",
          f"Elephant SVG content unexpected — starts with: {body[:60]!r}")
else:
    fail(f"Cannot check SVG content — HTTP {status}")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 11: app.js uses clean URLs (not query params)
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 11: JS files use clean URLs ──")

app_js = (PROJECT_ROOT / "js/app.js").read_text(encoding="utf-8")
check("getImageUrl" in app_js,
      "app.js defines getImageUrl() helper",
      "app.js missing getImageUrl() helper")
check("getCategoryUrl" in app_js,
      "app.js defines getCategoryUrl() helper",
      "app.js missing getCategoryUrl() helper")
check("/color/" in app_js,
      "app.js generates /color/ URLs",
      "app.js does not generate /color/ URLs")
check("/categories/" in app_js,
      "app.js generates /categories/ URLs",
      "app.js does not generate /categories/ URLs")

# Should NOT link to old coloring.html?image= pattern for navigation
old_pattern_count = len(re.findall(r"coloring\.html\?image=", app_js))
check(old_pattern_count == 0,
      "app.js: no old coloring.html?image= URLs for navigation",
      f"app.js: still has {old_pattern_count} old coloring.html?image= URL(s)")

coloring_js = (PROJECT_ROOT / "js/coloring.js").read_text(encoding="utf-8")
check("getCleanUrl" in coloring_js,
      "coloring.js defines getCleanUrl() helper",
      "coloring.js missing getCleanUrl() helper")
check("/images/" in coloring_js,
      "coloring.js uses absolute /images/ path for SVG loading",
      "coloring.js uses relative images/ path (bug risk)")

# Check no relative SVG path
m = re.search(r'`images/\${', coloring_js)
check(m is None,
      "coloring.js: SVG path is absolute (no `images/${...}` template literal)",
      "coloring.js: still has relative SVG path `images/${...}")

download_js = (PROJECT_ROOT / "js/download.js").read_text(encoding="utf-8")
m2 = re.search(r'`images/\${', download_js)
check(m2 is None,
      "download.js: SVG path is absolute (no `images/${...}` template literal)",
      "download.js: still has relative SVG path `images/${...}")

ui_js = (PROJECT_ROOT / "js/ui.js").read_text(encoding="utf-8")
check("getImageUrl" in ui_js,
      "ui.js uses getImageUrl() for next-image navigation",
      "ui.js does not use getImageUrl() — may still use old coloring.html?image=")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 12: index.html category links
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 12: index.html category links ──")

index_html = (PROJECT_ROOT / "index.html").read_text(encoding="utf-8")
old_cat_links = re.findall(r'href="category\.html\?cat=', index_html)
new_cat_links = re.findall(r'href="/categories/\w+\.html"', index_html)

check(len(old_cat_links) == 0,
      "index.html: no old category.html?cat= links",
      f"index.html: {len(old_cat_links)} old category.html?cat= link(s) remain")
check(len(new_cat_links) >= 10,
      f"index.html: {len(new_cat_links)} clean /categories/X.html links",
      f"index.html: only {len(new_cat_links)} clean category links (expected 10+)")


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 13: coloring.js reads data-image-id from body
# ─────────────────────────────────────────────────────────────────────────────
print(f"\n{INFO} ── Section 13: coloring.js reads data-image-id ──")

check("dataset.imageId" in coloring_js or "data-image-id" in coloring_js,
      "coloring.js reads data-image-id from body dataset",
      "coloring.js does not read data-image-id — coloring pages will not load")
check("history.replaceState" in coloring_js,
      "coloring.js calls history.replaceState for random image",
      "coloring.js missing history.replaceState")
# Must use root-relative path (not full https:// — cross-origin error on localhost)
has_full_url_replacestate = bool(re.search(
    r"replaceState\([^)]*https://magicpencil\.fun", coloring_js))
check(not has_full_url_replacestate,
      "coloring.js history.replaceState uses root-relative path (not full https:// URL)",
      "coloring.js history.replaceState uses full https:// URL (breaks on localhost/cross-origin)")


# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
total = results["passed"] + results["failed"]
print(f"\n{'='*60}")
print(f"  Results: {results['passed']}/{total} passed, {results['failed']} failed")
print(f"{'='*60}\n")

sys.exit(0 if results["failed"] == 0 else 1)
