#!/usr/bin/env python3
"""
Pre-publish validator for blog posts.
Run BEFORE git commit on any new/modified blog post.

Usage:  python3 tools/validate_blog.py blog/my-new-post.html
        python3 tools/validate_blog.py blog/*.html     (validate all)

Exits with code 1 if any check fails (so a pre-commit hook can block bad posts).
"""
import sys
import re
from pathlib import Path

# Required strings — every blog post MUST contain these EXACTLY
REQUIRED_CSS = [
    # CTA button — bulletproof colors (NOT CSS variables)
    'background:#C9A84C !important;color:#1A0F00 !important',
    '[data-theme="light"] .cta-btn{background:#8B6914 !important;color:#FFFFFF !important',
    # Related posts section
    'class="related-posts"',
    # Theme toggle support
    'data-theme',
]

# Forbidden patterns (regex) — these cause visual bugs
FORBIDDEN_PATTERNS = [
    # Old broken CTA button using CSS variables (becomes invisible in light mode)
    (re.compile(r'\.cta-btn\{[^}]*color:var\(--black\)[^}]*\}'),
     "❌ .cta-btn uses var(--black) — becomes INVISIBLE in light mode. Use #1A0F00 instead."),
    # .calc-box without [data-theme="light"] prefix in light-mode chain
    (re.compile(r',\s*\.calc-box\{background:#FFFFFF'),
     "❌ .calc-box missing [data-theme=\"light\"] prefix — will be WHITE in dark mode."),
    # Missing aria-label on logo link (check inside same tag)
    (re.compile(r'<a(?![^>]*aria-label)[^>]*class="(?:nav-logo|logo-link)"[^>]*>'),
     "❌ Logo link missing aria-label — accessibility violation."),
]

# Required HTML elements
REQUIRED_HTML = [
    ('<link rel="canonical"', "Missing canonical URL"),
    ('class="cta-btn"', "Missing CTA button"),
    ('class="related-posts"', "Missing 'related posts' section (3 internal links required)"),
    ('aria-label=', "Missing aria-labels (accessibility)"),
    ('application/ld+json', "Missing JSON-LD schema markup"),
    ('property="og:image"', "Missing og:image (post will show as blank when shared on WhatsApp/Facebook)"),
    ('property="og:title"', "Missing og:title"),
    ('property="og:description"', "Missing og:description"),
    ('property="og:type"', "Missing og:type"),
    ('name="twitter:card"', "Missing Twitter Card (covers Slack/Discord/X previews)"),
]

def validate(path):
    """Return (passed, errors) for a single file."""
    if not path.exists():
        return False, [f"File not found: {path}"]

    content = path.read_text(encoding='utf-8')
    errors = []

    # Required CSS
    for css in REQUIRED_CSS:
        if css not in content:
            errors.append(f"❌ Missing required CSS: `{css[:80]}`")

    # Forbidden patterns
    for pattern, msg in FORBIDDEN_PATTERNS:
        if pattern.search(content):
            errors.append(msg)

    # Required HTML elements
    for html, msg in REQUIRED_HTML:
        if html not in content:
            errors.append(f"❌ {msg} (looking for: `{html}`)")

    # Related posts must have exactly 3 cards
    cards = content.count('class="related-post-card"')
    if cards != 3:
        errors.append(f"❌ Related posts has {cards} cards, must be exactly 3")

    # Title length check (SEO)
    title_match = re.search(r'<title>([^<]+)</title>', content)
    if title_match:
        title_len = len(title_match.group(1))
        if title_len < 30 or title_len > 70:
            errors.append(f"⚠️  Title length {title_len} chars (recommended 30-70)")

    # Description meta
    desc_match = re.search(r'<meta name="description" content="([^"]+)"', content)
    if desc_match:
        desc_len = len(desc_match.group(1))
        if desc_len < 120 or desc_len > 165:
            errors.append(f"⚠️  Description length {desc_len} chars (recommended 120-165)")

    return len(errors) == 0, errors

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 tools/validate_blog.py blog/post.html [blog/post2.html ...]")
        sys.exit(1)

    total_errors = 0
    for arg in sys.argv[1:]:
        path = Path(arg)
        if path.name == "index.html":
            continue
        passed, errors = validate(path)
        if passed:
            print(f"✅ {path.name}: PASSED")
        else:
            print(f"\n🚫 {path.name}: FAILED ({len(errors)} issues)")
            for e in errors:
                print(f"   {e}")
            total_errors += len(errors)

    # Distinguish critical errors (❌) from warnings (⚠️)
    # Only ❌ blocks commit. ⚠️ are SEO suggestions.
    critical_count = 0
    for arg in sys.argv[1:]:
        path = Path(arg)
        if path.name == "index.html":
            continue
        _, errors = validate(path)
        critical_count += sum(1 for e in errors if e.startswith('❌'))

    print(f"\n{'='*60}")
    if critical_count == 0:
        print(f"✅ No critical errors. {total_errors - critical_count} warnings (non-blocking).")
        sys.exit(0)
    else:
        print(f"🚫 {critical_count} CRITICAL errors block commit. Fix them first.")
        sys.exit(1)

if __name__ == "__main__":
    main()
