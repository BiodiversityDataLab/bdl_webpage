#!/usr/bin/env python3
"""Download Wix-hosted media referenced by the static site and rewrite HTML to local paths.

Run from the site root:
    python3 scripts/localize_wix_media.py --root .

The script uses only Python's standard library. It scans HTML files for images
whose src or data-original-src points to static.wixstatic.com, downloads them to
assets/media/, and rewrites img src values to local files while preserving the
original URL in data-original-src.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import mimetypes
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

IMG_TAG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE)
ATTR_RE = re.compile(r"(?P<name>[\w:-]+)=(?P<quote>['\"])(?P<value>.*?)(?P=quote)", re.DOTALL)


def attrs(tag: str) -> dict[str, str]:
    return {m.group('name').lower(): html.unescape(m.group('value')) for m in ATTR_RE.finditer(tag)}


def replace_attr(tag: str, name: str, value: str) -> str:
    pattern = re.compile(rf"({re.escape(name)}=)(['\"])(.*?)(\2)", re.IGNORECASE | re.DOTALL)
    escaped = html.escape(value, quote=True)
    if pattern.search(tag):
        return pattern.sub(lambda m: f"{m.group(1)}{m.group(2)}{escaped}{m.group(2)}", tag, count=1)
    return tag[:-1] + f' {name}="{escaped}">'


def extension_from_response(url: str, content_type: str | None) -> str:
    if content_type:
        ctype = content_type.split(';', 1)[0].strip().lower()
        ext = mimetypes.guess_extension(ctype)
        if ext:
            if ext == '.jpe':
                return '.jpg'
            return ext
    path = urllib.parse.urlparse(url).path
    suffix = Path(path).suffix.lower()
    if suffix in {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}:
        return suffix
    return '.img'


def safe_name(label: str, url: str, ext: str) -> str:
    label = urllib.parse.unquote(label or Path(urllib.parse.urlparse(url).path).stem or 'media')
    label = re.sub(r'[^A-Za-z0-9]+', '-', label).strip('-').lower()[:52] or 'media'
    digest = hashlib.sha1(url.encode('utf-8')).hexdigest()[:10]
    return f"{label}-{digest}{ext}"


def download(url: str, out_dir: Path, label: str, dry_run: bool) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 static-site-media-localizer'})
    with urllib.request.urlopen(req, timeout=45) as resp:
        data = resp.read()
        ext = extension_from_response(url, resp.headers.get('content-type'))
    filename = safe_name(label, url, ext)
    target = out_dir / filename
    if dry_run:
        print(f"Would download {url} -> {target}")
    else:
        target.write_bytes(data)
        print(f"Downloaded {url} -> {target}")
    return f"/assets/media/{filename}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='.', help='Static site root directory')
    parser.add_argument('--dry-run', action='store_true', help='Print actions without writing files')
    parser.add_argument('--delay', type=float, default=0.15, help='Delay between downloads in seconds')
    args = parser.parse_args()

    root = Path(args.root).resolve()
    media_dir = root / 'assets' / 'media'
    if not args.dry_run:
        media_dir.mkdir(parents=True, exist_ok=True)

    cache: dict[str, str] = {}
    changed_files = 0
    for html_file in sorted(root.rglob('*.html')):
        text = html_file.read_text(encoding='utf-8')
        changed = False

        def replace_tag(match: re.Match[str]) -> str:
            nonlocal changed
            tag = match.group(0)
            at = attrs(tag)
            url = at.get('src', '')
            original = at.get('data-original-src', '')
            candidate = url if url.startswith('https://static.wixstatic.com') else original
            if not candidate.startswith('https://static.wixstatic.com'):
                return tag
            label = at.get('alt') or html_file.stem
            if candidate not in cache:
                try:
                    cache[candidate] = download(candidate, media_dir, label, args.dry_run)
                    time.sleep(args.delay)
                except Exception as exc:
                    print(f"WARNING: failed to download {candidate}: {exc}", file=sys.stderr)
                    return tag
            tag2 = replace_attr(tag, 'src', cache[candidate])
            tag2 = replace_attr(tag2, 'data-original-src', candidate)
            changed = True
            return tag2

        new_text = IMG_TAG_RE.sub(replace_tag, text)
        if changed and not args.dry_run:
            html_file.write_text(new_text, encoding='utf-8')
            changed_files += 1

    print(f"Processed {len(cache)} unique media URLs; changed {changed_files} HTML files.")
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
