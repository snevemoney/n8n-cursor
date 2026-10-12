#!/bin/sh
# Installs the public-guard pre-commit hook into this clone (keeps any existing hook as pre-commit.local).
set -e
top=$(git rev-parse --show-toplevel); hooks=$(git rev-parse --git-common-dir)/hooks; mkdir -p "$hooks"
if [ -f "$hooks/pre-commit" ] && ! grep -q public_guard "$hooks/pre-commit"; then mv "$hooks/pre-commit" "$hooks/pre-commit.local"; fi
cat > "$hooks/pre-commit" <<'H'
#!/bin/sh
top=$(git rev-parse --show-toplevel)
[ -x "$(git rev-parse --git-common-dir)/hooks/pre-commit.local" ] && { "$(git rev-parse --git-common-dir)/hooks/pre-commit.local" || exit 1; }
g="$top/scripts/guard/public_guard.py"; [ -f "$g" ] || g="$HOME/.local/share/public-guard/public_guard.py"
[ -f "$g" ] || { echo "public-guard: guard script missing, commit not checked" >&2; exit 0; }
exec python3 "$g" --staged
H
mkdir -p "$HOME/.local/share/public-guard" && cp "$(cd "$(dirname "$0")" && pwd)/public_guard.py" "$HOME/.local/share/public-guard/"
chmod +x "$hooks/pre-commit"; echo "public-guard pre-commit installed in $hooks"
