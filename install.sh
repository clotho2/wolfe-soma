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
MIN_NODE_VERSION=18

echo "🧠 Installing Wolfe-SOMA Service..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)"
  exit 1
fi

#--------------------------------------------------------------
# Check Node.js version
#--------------------------------------------------------------

check_node_version() {
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    return 1
  fi

  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  
  if [ "$NODE_VERSION" -lt "$MIN_NODE_VERSION" ]; then
    echo "❌ Node.js version $(node -v) is too old. Version $MIN_NODE_VERSION+ is required."
    return 1
  fi

  echo "✅ Node.js version $(node -v) detected"
  return 0
}

install_nodejs() {
  echo ""
  echo "📦 Installing Node.js 20.x LTS..."
  echo ""
  
  # Remove old nodejs if present
  apt-get remove -y nodejs npm 2>/dev/null || true
  
  # Install using NodeSource
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  
  # Verify installation
  echo ""
  echo "✅ Node.js $(node -v) installed"
  echo "✅ npm $(npm -v) installed"
}

if ! check_node_version; then
  echo ""
  echo "============================================"
  echo "Node.js $MIN_NODE_VERSION+ is required but not found."
  echo "============================================"
  echo ""
  read -p "Would you like to install Node.js 20.x LTS now? [y/N] " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    install_nodejs
  else
    echo ""
    echo "Please install Node.js $MIN_NODE_VERSION+ manually:"
    echo ""
    echo "  # Using NodeSource (recommended):"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    echo ""
    echo "  # Or using nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 20"
    echo "  nvm use 20"
    echo ""
    exit 1
  fi
fi

#--------------------------------------------------------------
# Check if user exists
#--------------------------------------------------------------

if ! id "$SERVICE_USER" &>/dev/null; then
  echo "⚠️  User $SERVICE_USER does not exist. Creating..."
  useradd -r -s /bin/false "$SERVICE_USER"
fi

#--------------------------------------------------------------
# Create installation directory
#--------------------------------------------------------------

echo "📁 Creating installation directory..."
mkdir -p "$INSTALL_DIR"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#--------------------------------------------------------------
# Copy files
#--------------------------------------------------------------

echo "📦 Copying files..."
cp -r "$SCRIPT_DIR/src" "$INSTALL_DIR/"
cp -r "$SCRIPT_DIR/package.json" "$INSTALL_DIR/"
cp -r "$SCRIPT_DIR/package-lock.json" "$INSTALL_DIR/" 2>/dev/null || true
cp -r "$SCRIPT_DIR/tsconfig.json" "$INSTALL_DIR/"
cp -r "$SCRIPT_DIR/.env.example" "$INSTALL_DIR/"
cp -r "$SCRIPT_DIR/wolfe-soma.service" "$INSTALL_DIR/"

# Copy .env if it exists, otherwise use example
if [ -f "$SCRIPT_DIR/.env" ]; then
  cp "$SCRIPT_DIR/.env" "$INSTALL_DIR/"
else
  cp "$INSTALL_DIR/.env.example" "$INSTALL_DIR/.env"
fi

#--------------------------------------------------------------
# Install Node.js dependencies
#--------------------------------------------------------------

echo "📥 Installing Node.js dependencies..."
cd "$INSTALL_DIR"
npm install --omit=dev

# Install TypeScript globally if not present (for building)
if ! command -v tsc &> /dev/null; then
  echo "📥 Installing TypeScript..."
  npm install -g typescript
fi

#--------------------------------------------------------------
# Build TypeScript
#--------------------------------------------------------------

echo "🔨 Building TypeScript..."
npm run build

#--------------------------------------------------------------
# Create log directory
#--------------------------------------------------------------

echo "📝 Creating log directory..."
mkdir -p "$LOG_DIR"
chown -R "$SERVICE_USER:$SERVICE_USER" "$LOG_DIR"

#--------------------------------------------------------------
# Set ownership
#--------------------------------------------------------------

echo "🔐 Setting permissions..."
chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"

#--------------------------------------------------------------
# Install systemd service
#--------------------------------------------------------------

echo "⚙️  Installing systemd service..."
cp "$INSTALL_DIR/wolfe-soma.service" /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

#--------------------------------------------------------------
# Enable and start service
#--------------------------------------------------------------

echo "🚀 Enabling and starting service..."
systemctl enable "$SERVICE_NAME"
systemctl start "$SERVICE_NAME"

# Wait a moment for service to start
sleep 2

#--------------------------------------------------------------
# Show status
#--------------------------------------------------------------

echo ""
echo "============================================"
echo "✅ Installation complete!"
echo "============================================"
echo ""
systemctl status "$SERVICE_NAME" --no-pager || true

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
