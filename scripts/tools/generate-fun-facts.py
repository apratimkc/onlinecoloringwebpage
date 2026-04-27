#!/usr/bin/env python3
"""
Fun Fact Generator for MagicPencil — powered by a local Ollama model.

For each image in the catalog that doesn't yet have a fun fact, this script
calls Ollama to generate a short, child-friendly paragraph (35-55 words).
Results are saved to scripts/tools/fun-facts.json (persistent cache) and
also written to js/data/fun-facts.js (JS bundle for mobile page).

Usage:
    python generate-fun-facts.py                  # generate only missing facts
    python generate-fun-facts.py --regenerate     # overwrite all existing facts
    python generate-fun-facts.py --model llama3.2 # choose Ollama model (default: llama3.2)
    python generate-fun-facts.py --dry-run        # print prompts, don't call Ollama

Ollama must be running locally (http://localhost:11434).
"""

import sys
import json
import re
import time
import argparse
import urllib.request
import urllib.error
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).resolve().parent
PROJECT_ROOT = (SCRIPT_DIR / '../..').resolve()

CATALOG_FILE    = PROJECT_ROOT / 'js' / 'data' / 'image-catalog.js'
FUN_FACTS_JSON  = SCRIPT_DIR / 'fun-facts.json'          # persistent cache
FUN_FACTS_JS    = PROJECT_ROOT / 'js' / 'data' / 'fun-facts.js'  # web bundle

OLLAMA_URL    = 'http://localhost:11434'
DEFAULT_MODEL = 'gemma4:e2b'

# ── Helpers ───────────────────────────────────────────────────────────────────
def ok(msg):   print(f"\033[92m[OK]\033[0m {msg}")
def info(msg): print(f"\033[94m[INFO]\033[0m {msg}")
def warn(msg): print(f"\033[93m[WARN]\033[0m {msg}")
def err(msg):  print(f"\033[91m[ERROR]\033[0m {msg}")

# ── Prompt template ───────────────────────────────────────────────────────────
#
# REVIEW THIS PROMPT before running for the first time.
# Edit it here if you want different tone, length, or style.
#
PROMPT_TEMPLATE = """\
You are a children's content writer for a free online coloring website called MagicPencil.
Your job is to write a fun, educational paragraph about "{name}" for kids aged 5–10.

Structure — write exactly 4–5 paragraphs:
  Paragraph 1: A surprising or funny opening fact that instantly grabs attention.
  Paragraph 2: A second interesting fact that builds curiosity (behaviour, habitat, size, diet, or a world record).
  Paragraph 3: A third fun fact — something interactive or relatable, like a comparison to everyday life ("as tall as a school bus!").
  Paragraph 4 (optional): A bonus wow-fact or a silly/funny detail kids will love.
  Final paragraph: One sentence encouraging the child to color. Always mention what the real color of the subject is, then invite them to use any color they like. Example: "Real elephants are grey, but yours can be any color you dream up — even rainbow! 🌈" — adapt the color and the name to fit the actual topic "{name}".

Rules — follow every one:
1. Use simple, friendly words a 5-year-old can understand. No difficult vocabulary.
2. Every fact must be accurate and child-appropriate. Nothing scary, violent, or disturbing.
3. Do NOT start any paragraph with "Did you know" — it is overused.
4. Each paragraph should feel like a new discovery. Vary the sentence rhythm.
5. Total word count: minimum 300 words.
6. Respond with ONLY the paragraph text — no headings, no labels, no bullet points, no preamble.

Topic: {name}
Category: {category}
"""

def display_name(image):
    """
    For alphabets like 'A Apple' or 'B Balloons', return just the subject word(s).
    For all other categories, return the name as-is.
    """
    if image['category'] == 'alphabets':
        # Strip leading letter + space: "A Apple" -> "Apple", "B Balloons" -> "Balloons"
        return re.sub(r'^[A-Za-z]\s+', '', image['name']).strip()
    return image['name']


def build_prompt(image):
    name = display_name(image)
    return PROMPT_TEMPLATE.format(
        name=name,
        category=image['category']
    )

# ── Image catalog parser ──────────────────────────────────────────────────────
def parse_image_catalog():
    content = CATALOG_FILE.read_text(encoding='utf-8')
    pattern = (
        r"\{\s*id:\s*'([^']+)',\s*category:\s*'([^']+)',\s*"
        r"name:\s*'([^']+)',\s*filename:\s*'([^']+)',\s*"
        r"difficulty:\s*'([^']+)',\s*regions:\s*(\d+)\s*\}"
    )
    images = []
    for m in re.finditer(pattern, content, re.DOTALL):
        images.append({
            'id':         m.group(1),
            'category':   m.group(2),
            'name':       m.group(3),
            'filename':   m.group(4),
            'difficulty': m.group(5),
            'regions':    int(m.group(6))
        })
    return images

# ── Ollama API ────────────────────────────────────────────────────────────────
def ollama_health_check():
    try:
        req = urllib.request.urlopen(f'{OLLAMA_URL}/', timeout=5)
        return req.status == 200
    except Exception:
        return False

def ollama_generate(prompt, model):
    """Call Ollama /api/chat and return the response text.
    Uses the chat endpoint so we can send a system message (/no_think for qwen3).
    """
    payload = json.dumps({
        'model': model,
        'messages': [
            {'role': 'system', 'content': '/no_think'},
            {'role': 'user',   'content': prompt}
        ],
        'stream': False,
        'options': {
            'temperature': 0.8,
            'top_p': 0.9,
            'num_predict': 1200   # enough for 300+ words; model stops naturally when done
        }
    }).encode('utf-8')

    req = urllib.request.Request(
        f'{OLLAMA_URL}/api/chat',
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return (data.get('message', {}) or {}).get('content', '').strip()
    except urllib.error.URLError as e:
        raise RuntimeError(f"Ollama request failed: {e}") from e


def clean_response(text):
    """Strip thinking blocks, markdown formatting, and stray labels."""
    # Remove <think>...</think> blocks (qwen3 leakage)
    text = re.sub(r'<think>[\s\S]*?</think>', '', text, flags=re.IGNORECASE).strip()
    # Remove markdown bold/italic: **text**, *text*, ***text***
    text = re.sub(r'\*{1,3}([^*]+)\*{1,3}', r'\1', text)
    # Remove leading labels like "Fun Fact:", "Here's a fun fact:"
    text = re.sub(r'^(fun fact\s*[:—\-]+|here\s+(is|\'?s)\s+(a\s+)?fun fact\s*[:—\-]+)',
                  '', text, flags=re.IGNORECASE).strip()
    # Remove surrounding quotation marks
    if text.startswith('"') and text.endswith('"'):
        text = text[1:-1].strip()
    return text

# ── JS bundle writer ──────────────────────────────────────────────────────────
def write_js_bundle(fun_facts):
    """Write js/data/fun-facts.js — loaded by coloring-mobile.html for mobile fun facts."""
    lines = [
        '// Auto-generated by generate-fun-facts.py — do not edit by hand.',
        '// Keyed by image ID (e.g. "animals-elephant").',
        'const FUN_FACTS = {'
    ]
    for image_id, fact in sorted(fun_facts.items()):
        escaped = fact.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ')
        lines.append(f"  '{image_id}': '{escaped}',")
    lines.append('};')
    lines.append('')
    FUN_FACTS_JS.write_text('\n'.join(lines), encoding='utf-8')
    ok(f"Wrote JS bundle -> js/data/fun-facts.js ({len(fun_facts)} entries)")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    # Force UTF-8 output on Windows so emoji in prompts/facts print correctly
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    parser = argparse.ArgumentParser(description='Generate fun facts via Ollama')
    parser.add_argument('--model',       default=DEFAULT_MODEL, help='Ollama model name')
    parser.add_argument('--regenerate',  action='store_true',   help='Overwrite all existing facts')
    parser.add_argument('--dry-run',     action='store_true',   help='Print prompts, skip Ollama calls')
    parser.add_argument('--fix-short',   action='store_true',   help='Re-generate facts shorter than 200 words (fixes truncated entries)')
    args = parser.parse_args()

    print("=" * 60)
    print("  MagicPencil — Fun Fact Generator (Ollama)")
    print("=" * 60)

    # Check catalog
    if not CATALOG_FILE.exists():
        err(f"Catalog not found: {CATALOG_FILE}")
        sys.exit(1)

    images = parse_image_catalog()
    if not images:
        err("No images found in catalog.")
        sys.exit(1)
    info(f"Catalog: {len(images)} images")

    # Load existing fun facts
    if FUN_FACTS_JSON.exists():
        fun_facts = json.loads(FUN_FACTS_JSON.read_text(encoding='utf-8'))
        ok(f"Loaded {len(fun_facts)} existing fun facts from cache")
    else:
        fun_facts = {}

    # Determine which images need generation
    if args.regenerate:
        to_generate = images
        warn("--regenerate: will overwrite all existing fun facts")
    elif args.fix_short:
        # Delete entries that are too short (truncated by token limit), then re-generate them
        short = [img_id for img_id, text in fun_facts.items() if len(text.split()) < 200]
        if short:
            warn(f"--fix-short: removing {len(short)} truncated entries: {short}")
            for img_id in short:
                del fun_facts[img_id]
        to_generate = [img for img in images if img['id'] not in fun_facts]
        info(f"Need to generate: {len(to_generate)} | Already cached: {len(images) - len(to_generate)}")
    else:
        to_generate = [img for img in images if img['id'] not in fun_facts]
        info(f"Need to generate: {len(to_generate)} | Already cached: {len(images) - len(to_generate)}")

    if not to_generate:
        ok("All fun facts already generated. Nothing to do.")
        write_js_bundle(fun_facts)
        return

    # Ollama health check
    if not args.dry_run:
        info(f"Checking Ollama at {OLLAMA_URL}...")
        if not ollama_health_check():
            err(f"Ollama is not running at {OLLAMA_URL}.")
            err("Start it with: ollama serve")
            err(f"Then pull a model: ollama pull {args.model}")
            sys.exit(1)
        ok(f"Ollama is running. Using model: {args.model}")
    else:
        warn("--dry-run mode: Ollama will NOT be called")

    # Generate
    generated = 0
    errors    = 0

    for i, image in enumerate(to_generate, 1):
        print()
        info(f"[{i}/{len(to_generate)}] {image['id']} — {image['name']}")

        prompt = build_prompt(image)

        if args.dry_run:
            print("  PROMPT:")
            for line in prompt.strip().split('\n'):
                print(f"    {line}")
            fun_facts[image['id']] = "[dry-run placeholder]"
            generated += 1
            continue

        try:
            raw  = ollama_generate(prompt, args.model)
            fact = clean_response(raw)

            if not fact:
                warn(f"  Empty response for {image['id']} — skipping")
                errors += 1
                continue

            word_count = len(fact.split())
            if word_count < 100:
                warn(f"  Response too short ({word_count} words, need 300+) — skipping")
                warn(f"  Response was: {fact!r}")
                errors += 1
                continue

            fun_facts[image['id']] = fact
            generated += 1
            ok(f"  ({word_count} words) {fact[:80]}{'...' if len(fact) > 80 else ''}")

            # Save after each successful generation (safe to interrupt)
            FUN_FACTS_JSON.write_text(
                json.dumps(fun_facts, indent=2, ensure_ascii=False),
                encoding='utf-8'
            )

            # Small delay to avoid hammering the local model
            time.sleep(0.5)

        except Exception as e:
            err(f"  Failed: {e}")
            errors += 1

    # Write JS bundle
    print()
    write_js_bundle(fun_facts)

    # Summary
    print()
    print("=" * 60)
    print(f"  Done! Generated {generated} | Errors {errors} | Total cached {len(fun_facts)}")
    print("=" * 60)
    if errors:
        warn(f"{errors} image(s) failed — re-run to retry them")
    print()
    print("Next steps:")
    print("  1. Run generate-pages.py to bake fun facts into HTML pages")
    print("  2. The JS bundle (js/data/fun-facts.js) is ready for the mobile page")


if __name__ == '__main__':
    main()

