#!/bin/sh
# Build the static site into dist/ for Cloudflare Pages.
#
# Apache served this site with mod_include (see the .htaccess files), expanding
#   <!--#include virtual="/navmenu.html" -->
# at request time. Cloudflare Pages serves static files only, so the includes
# are expanded here instead. Sources keep the directives, so the nav is still
# edited in one place.

set -eu

SRC=$(cd "$(dirname "$0")" && pwd)
OUT="$SRC/dist"

rm -rf "$OUT"
mkdir -p "$OUT"

# Everything except VCS, editor leftovers, the build itself, and the Apache
# config that Pages has no use for.
rsync -a \
  --exclude='.git/' \
  --exclude='.git*' \
  --exclude='dist/' \
  --exclude='build.sh' \
  --exclude='.DS_Store' \
  --exclude='*.un~' \
  --exclude='.htaccess' \
  "$SRC/" "$OUT/"

# Expand the SSI includes in place.
python3 - "$SRC" "$OUT" <<'PY'
import os, re, sys

src, out = sys.argv[1], sys.argv[2]
DIRECTIVE = re.compile(rb'<!--#include\s+virtual="([^"]+)"\s*-->')

partials = {}
def partial(path):
    """Read an include target, resolved from the site root like Apache's `virtual`."""
    if path not in partials:
        with open(os.path.join(src, path.lstrip('/')), 'rb') as fh:
            partials[path] = fh.read().rstrip(b'\n')
    return partials[path]

expanded = files = 0
missing = set()

for root, dirs, names in os.walk(out):
    for name in names:
        if not name.endswith(('.html', '.htm')):
            continue
        full = os.path.join(root, name)
        with open(full, 'rb') as fh:
            body = fh.read()
        if b'<!--#' not in body:
            continue

        hits = [0]
        def sub(m):
            target = m.group(1).decode()
            try:
                text = partial(target)
            except FileNotFoundError:
                missing.add(target)
                return m.group(0)
            hits[0] += 1
            return text

        new = DIRECTIVE.sub(sub, body)
        if hits[0]:
            with open(full, 'wb') as fh:
                fh.write(new)
            files += 1
            expanded += hits[0]

print(f"expanded {expanded} includes across {files} files")
if missing:
    print("MISSING include targets: " + ", ".join(sorted(missing)), file=sys.stderr)
    sys.exit(1)

# Nothing may reach production still asking Apache to do work.
left = []
for root, dirs, names in os.walk(out):
    for name in names:
        if name.endswith(('.html', '.htm')):
            with open(os.path.join(root, name), 'rb') as fh:
                if b'<!--#' in fh.read():
                    left.append(os.path.relpath(os.path.join(root, name), out))
if left:
    print("UNEXPANDED directives remain in: " + ", ".join(left), file=sys.stderr)
    sys.exit(1)
PY

echo "built $(find "$OUT" -type f | wc -l | tr -d ' ') files into dist/"
