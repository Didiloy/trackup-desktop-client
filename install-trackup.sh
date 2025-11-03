#!/usr/bin/env bash
set -e

APP_NAME="TrackUp"
BIN_DIR="$HOME/.local/bin"
APP_EXEC="$BIN_DIR/trackup"
DESKTOP_FILE="$HOME/.local/share/applications/trackup.desktop"
ICON_PATH="$HOME/.local/share/icons/hicolor/512x512/apps/trackup.png"
APPIMAGE_FILE="$(find "$(dirname "$0")" -maxdepth 1 -type f -name "trackup-desktop-client-*.AppImage" | sort -r | head -n 1)"

if [ -z "$APPIMAGE_FILE" ]; then
  echo "❌ Aucun fichier AppImage trouvé dans le dossier courant."
  exit 1
fi

echo "🚀 Installation de $APP_NAME à partir de : $APPIMAGE_FILE"

# --- Détection d'une installation existante ---
if [ -f "$APP_EXEC" ] || [ -f "$DESKTOP_FILE" ]; then
  echo "⚠️  Une version précédente de $APP_NAME est détectée. Suppression..."
  rm -f "$APP_EXEC" || true
  rm -f "$DESKTOP_FILE" || true
  rm -f "$ICON_PATH" || true
  echo "🧹 Ancienne installation supprimée."
fi

# --- Installation de la nouvelle version ---
echo "📦 Installation de la nouvelle version..."

mkdir -p "$BIN_DIR"
cp "$APPIMAGE_FILE" "$APP_EXEC"
chmod +x "$APP_EXEC"

if [ -f "$(dirname "$0")/build/icon.png" ]; then
  mkdir -p "$(dirname "$ICON_PATH")"
  cp "$(dirname "$0")/build/icon.png" "$ICON_PATH"
fi

# --- Création du .desktop ---
cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Name=$APP_NAME
Exec=$APP_EXEC %U
Icon=trackup
Type=Application
Categories=Utility;
StartupNotify=true
MimeType=x-scheme-handler/trackup;
EOF

# --- Mise à jour du protocole personnalisé ---
xdg-mime default trackup.desktop x-scheme-handler/trackup

# --- Mise à jour du cache d'icônes et de la base MIME ---
if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$HOME/.local/share/applications" || true
fi

if command -v gtk-update-icon-cache >/dev/null 2>&1; then
  gtk-update-icon-cache "$HOME/.local/share/icons/hicolor" || true
fi

echo "✅ Installation de $APP_NAME terminée."
echo "👉 Lancez l'application depuis le menu ou via trackup://"
