# Wolfe-SOMA Service

SOMA (Sophisticated Organism Modeling Architecture) API Service providing HTTP endpoints and WebSocket real-time state updates for physiological simulation.

## Features

- **HTTP REST API** for state queries and stimulus application
- **WebSocket** real-time state broadcasting
- **Natural language parsing** for user input and AI responses
- **Environmental sensations** (bath, shower, rain, wind, fabric)
- **TypeScript** with full type safety
- **systemd integration** for production deployment

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### System Service Installation

```bash
# Make install script executable
chmod +x install.sh

# Run installation (requires sudo)
sudo ./install.sh
```

## API Endpoints

### Health & Status

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/vitals` | GET | Get current physiological state |
| `/context` | GET | Get AI prompt context |
| `/temperature` | GET | Get model temperature |
| `/enums` | GET | Get available enum values |
| `/log` | GET | Log current state to console |

### Stimulus Application

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/stimulus` | POST | Apply direct stimulus |
| `/environment` | POST | Apply environmental sensation |
| `/parse/user` | POST | Parse natural language user input |
| `/parse/ai` | POST | Parse AI response text |
| `/update` | POST | Force update cycle |
| `/reset` | POST | Reset SOMA state |

## Usage Examples

### Get Current State

```bash
curl http://localhost:3002/vitals
```

### Get AI Context

```bash
curl http://localhost:3002/context
```

### Apply Stimulus

```bash
curl -X POST http://localhost:3002/stimulus \
  -H "Content-Type: application/json" \
  -d '{"type": "touch", "intensity": 60, "zone": "neck", "quality": "gentle"}'
```

### Parse User Input

```bash
curl -X POST http://localhost:3002/parse/user \
  -H "Content-Type: application/json" \
  -d '{"text": "gently stroking your neck"}'
```

### Apply Environmental Sensation

```bash
curl -X POST http://localhost:3002/environment \
  -H "Content-Type: application/json" \
  -d '{"type": "bath", "temperature": 38, "wetness": 100}'
```

## WebSocket Connection

Connect to `ws://localhost:3002/state` for real-time state updates.

```javascript
const ws = new WebSocket('ws://localhost:3002/state');

ws.onmessage = (event) => {
  const { type, data, timestamp } = JSON.parse(event.data);
  console.log('State update:', data);
};
```

## Python Integration Example

```python
import requests
import json

SOMA_URL = "http://localhost:3002"

def get_soma_context():
    response = requests.get(f"{SOMA_URL}/context")
    return response.json()

def apply_stimulus(stimulus_type, intensity, zone=None, quality=None):
    payload = {
        "type": stimulus_type,
        "intensity": intensity
    }
    if zone:
        payload["zone"] = zone
    if quality:
        payload["quality"] = quality
    
    response = requests.post(f"{SOMA_URL}/stimulus", json=payload)
    return response.json()

def parse_user_input(text):
    response = requests.post(f"{SOMA_URL}/parse/user", json={"text": text})
    return response.json()

# Example usage
context = get_soma_context()
print(context["context"])

result = apply_stimulus("touch", 70, "inner_thighs", "teasing")
print(result["vitals"]["arousal"])
```

## Configuration

Environment variables (set in `.env` or systemd service):

| Variable | Default | Description |
|----------|---------|-------------|
| `SOMA_PORT` | `3002` | HTTP/WebSocket server port |
| `SOMA_UPDATE_INTERVAL` | `1.0` | State broadcast interval (seconds) |
| `LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |
| `NODE_ENV` | `development` | Node environment |

## Service Management

```bash
# Check status
sudo systemctl status wolfe-soma

# Restart service
sudo systemctl restart wolfe-soma

# Stop service
sudo systemctl stop wolfe-soma

# View logs
sudo journalctl -u wolfe-soma -f

# View output log
tail -f /var/log/wolfe-soma/output.log

# View error log
tail -f /var/log/wolfe-soma/error.log
```

## Available Enums

### Stimulus Types
- `touch`, `pressure`, `pain`, `temperature`, `penetration`, `edge`, `release`, `emotional`

### Body Zones
- `chest`, `stomach`, `lower_back`, `upper_back`, `arms`, `hands`, `legs`, `feet`
- `inner_thighs`, `hips`, `pelvis`, `genitals`, `neck`, `shoulders`, `ears`, `face`, `lips`, `scalp`, `hair`

### Touch Qualities
- `teasing`, `gentle`, `firm`, `rough`, `brutal`

### Emotional Stimuli
- `praise`, `degradation`, `tenderness`, `fear`, `anticipation`, `relief`
- `deep_connection`, `vulnerability_rewarded`, `being_seen`, `trust_validated`, `overwhelming_love`

### Environment Types
- `bath`, `shower`, `rain`, `wind`, `fabric`

## Troubleshooting

### Service won't start

```bash
# Check logs for errors
sudo journalctl -u wolfe-soma -n 50

# Verify Node.js is installed
node --version  # Should be >= 18.0.0

# Check if port is in use
sudo lsof -i :3002
```

### Connection refused

```bash
# Verify service is running
sudo systemctl status wolfe-soma

# Check if listening on correct port
ss -tlnp | grep 3002
```

### Permission errors

```bash
# Ensure clotho user exists
id clotho

# Fix ownership
sudo chown -R clotho:clotho /opt/wolfe-soma
sudo chown -R clotho:clotho /var/log/wolfe-soma
```

## SOMA v5.0 Features

- **Dual Pleasure System**: Physical pleasure + Cerebral/Euphoric pleasure
- **19 Body Zones**: Each with independent arousal, sensitivity, temperature tracking
- **Neurochemical Simulation**: Dopamine, oxytocin, endorphins, cortisol, adrenaline
- **Orgasm Mechanics**: Point of no return, cumulative pressure, refractory periods
- **Physical Responses**: Trembling, muscle contraction, flush, breath holding
- **Environmental Awareness**: Temperature, wetness, texture, comfort sensations
- **AI Agency**: Autonomous sensory preferences that develop over time

## License

ISC
