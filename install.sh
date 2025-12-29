#!/bin/bash
#--------------------------------------------------------------
# Wolfe-SOMA Installation Script
# Installs the SOMA service as a systemd service
#--------------------------------------------------------------

set -e

INSTALL_DIR="/opt/wolfe-soma"
LOG_DIR="/var/log/wolfe-soma"
SERVICE_NAME="wolfe-soma"
SERVICE_USER="clotho"

echo "🧠 Installing Wolfe-SOMA Service..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)"
  exit 1
fi

# Check if user exists
if ! id "$SERVICE_USER" &>/dev/null; then
  echo "⚠️  User $SERVICE_USER does not exist. Creating..."
  useradd -r -s /bin/false "$SERVICE_USER"
fi

# Create installation directory
echo "📁 Creating installation directory..."
mkdir -p "$INSTALL_DIR"

# Copy files
echo "📦 Copying files..."
cp -r . "$INSTALL_DIR/"

# Install Node.js dependencies
echo "📥 Installing Node.js dependencies..."
cd "$INSTALL_DIR"
npm install --production

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create log directory
echo "📝 Creating log directory..."
mkdir -p "$LOG_DIR"
chown -R "$SERVICE_USER:$SERVICE_USER" "$LOG_DIR"

# Set ownership
echo "🔐 Setting permissions..."
chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"

# Install systemd service
echo "⚙️  Installing systemd service..."
cp "$INSTALL_DIR/wolfe-soma.service" /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable and start service
echo "🚀 Enabling and starting service..."
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# Wait a moment for service to start
sleep 2

# Check status
echo ""
echo "============================================"
echo "✅ Installation complete!"
echo "============================================"
echo ""
systemctl status "$SERVICE_NAME" --no-pager

echo ""
echo "Service endpoints:"
echo "  HTTP:      http://localhost:3002"
echo "  WebSocket: ws://localhost:3002/state"
echo ""
echo "Management commands:"
echo "  sudo systemctl status $SERVICE_NAME"
echo "  sudo systemctl restart $SERVICE_NAME"
echo "  sudo systemctl stop $SERVICE_NAME"
echo "  sudo journalctl -u $SERVICE_NAME -f"
echo ""
echo "Test with:"
echo "  curl http://localhost:3002/health"
echo "  curl http://localhost:3002/context"
