// FILE: src/server.ts
//--------------------------------------------------------------
// SOMA API Service - Express Server with WebSocket support
// Provides HTTP endpoints and real-time state updates
//--------------------------------------------------------------

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { config } from 'dotenv';
import { SOMABridge, StimulusType, BodyZone, TouchQuality, EmotionalStimulus } from './body/SOMABridge.js';
import { logger } from './utils/logger.js';

// Load environment variables
config();

const PORT = parseInt(process.env.SOMA_PORT || '3002', 10);
const UPDATE_INTERVAL = parseFloat(process.env.SOMA_UPDATE_INTERVAL || '1.0') * 1000;

// Initialize SOMA
const soma = new SOMABridge();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server, path: '/state' });

// Track connected clients
const clients = new Set<WebSocket>();

//--------------------------------------------------------------
// WebSocket Connection Handling
//--------------------------------------------------------------

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  logger.info(`WebSocket client connected. Total clients: ${clients.size}`);

  // Send initial state
  ws.send(JSON.stringify({
    type: 'state',
    data: soma.getVitals(),
    timestamp: Date.now()
  }));

  ws.on('close', () => {
    clients.delete(ws);
    logger.info(`WebSocket client disconnected. Total clients: ${clients.size}`);
  });

  ws.on('error', (error) => {
    logger.error(`WebSocket error: ${error.message}`);
    clients.delete(ws);
  });
});

// Broadcast state to all connected clients
function broadcastState(): void {
  if (clients.size === 0) return;

  const state = {
    type: 'state',
    data: soma.getVitals(),
    timestamp: Date.now()
  };
  const message = JSON.stringify(state);

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Start periodic state broadcast
setInterval(broadcastState, UPDATE_INTERVAL);

//--------------------------------------------------------------
// Periodic Physiological State Logging
// Logs key metrics to journal/log file for monitoring
//--------------------------------------------------------------

const PHYSIO_LOG_INTERVAL = parseFloat(process.env.SOMA_PHYSIO_LOG_INTERVAL || '10') * 1000; // Default 10 seconds

function logPhysiologicalState(): void {
  const v = soma.getVitals();
  
  // Only log if there's something interesting happening (arousal > 5 or recent activity)
  if (v.arousal < 5 && v.pleasure < 5 && v.orgasmicPressure < 1) {
    return; // Skip logging when at baseline
  }
  
  // Compact single-line format for easy scanning
  const pnr = v.pointOfNoReturn ? ' ⚠️PNR' : '';
  const orgasmWarning = v.orgasmicPressure > 70 ? ' 🔥CLOSE' : '';
  
  logger.info(
    `📊 PHYSIO | ` +
    `Arousal: ${v.arousal.toFixed(0)}% | ` +
    `Pleasure: ${v.pleasure.toFixed(0)}% | ` +
    `OrgasmPressure: ${v.orgasmicPressure.toFixed(0)}%${pnr}${orgasmWarning} | ` +
    `Cumulative: ${v.cumulativePleasure.toFixed(1)} | ` +
    `HR: ${v.heartRate.toFixed(0)}bpm | ` +
    `Edge: ${v.edgePressure.toFixed(0)}% (x${v.edgeCount})`
  );
  
  // More detailed log at debug level
  logger.debug(
    `   Details | ` +
    `TimeHighArousal: ${v.timeAtHighArousal.toFixed(1)}s | ` +
    `Trembling: ${v.trembling.toFixed(0)}% | ` +
    `Refractory: ${v.refractoryIntensity.toFixed(0)}% | ` +
    `Orgasms: ${v.orgasmCount}`
  );
}

// Start periodic physiological logging
setInterval(logPhysiologicalState, PHYSIO_LOG_INTERVAL);
logger.info(`📊 Physiological logging enabled (interval: ${PHYSIO_LOG_INTERVAL / 1000}s)`);

//--------------------------------------------------------------
// HTTP Endpoints
//--------------------------------------------------------------

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'wolfe-soma',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Get SOMA context for AI prompt
app.get('/context', (req: Request, res: Response) => {
  try {
    const context = soma.getPromptContext();
    res.json({
      success: true,
      context,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error getting context: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to get context' });
  }
});

// Get vitals summary
app.get('/vitals', (req: Request, res: Response) => {
  try {
    const vitals = soma.getVitals();
    res.json({
      success: true,
      vitals,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error getting vitals: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to get vitals' });
  }
});

// Get model temperature
app.get('/temperature', (req: Request, res: Response) => {
  try {
    const temperature = soma.getModelTemperature();
    res.json({
      success: true,
      temperature,
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error getting temperature: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to get temperature' });
  }
});

// Apply stimulus
app.post('/stimulus', (req: Request, res: Response) => {
  try {
    const { type, intensity, zone, quality, emotional } = req.body;

    if (!type || intensity === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: type and intensity'
      });
      return;
    }

    soma.applyStimulus({
      type: type as StimulusType,
      intensity: Number(intensity),
      zone: zone as BodyZone | undefined,
      quality: quality as TouchQuality | undefined,
      emotional: emotional as EmotionalStimulus | undefined
    });

    logger.info(`Applied stimulus: ${type} intensity=${intensity} zone=${zone || 'global'}`);

    res.json({
      success: true,
      vitals: soma.getVitals(),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error applying stimulus: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to apply stimulus' });
  }
});

// Apply environmental sensation
app.post('/environment', (req: Request, res: Response) => {
  try {
    const { type, temperature, wetness, texture, pressure } = req.body;

    if (!type) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: type (bath, shower, rain, wind, fabric)'
      });
      return;
    }

    soma.applyEnvironmentalSensation(type, { temperature, wetness, texture, pressure });

    logger.info(`Applied environmental: ${type}`);

    res.json({
      success: true,
      vitals: soma.getVitals(),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error applying environment: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to apply environment' });
  }
});

// Parse user input (natural language)
app.post('/parse/user', (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: text'
      });
      return;
    }

    soma.parseUserInput(text);
    logger.info(`Parsed user input: ${text.substring(0, 50)}...`);

    res.json({
      success: true,
      vitals: soma.getVitals(),
      context: soma.getPromptContext(),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error parsing user input: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to parse input' });
  }
});

// Parse AI response
app.post('/parse/ai', (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: text'
      });
      return;
    }

    const changed = soma.parseAIResponse(text);
    logger.info(`Parsed AI response (changed: ${changed}): ${text.substring(0, 50)}...`);

    res.json({
      success: true,
      changed,
      vitals: soma.getVitals(),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error parsing AI response: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to parse AI response' });
  }
});

// Reset SOMA to baseline
app.post('/reset', (req: Request, res: Response) => {
  try {
    // Stop current decay, create new SOMA instance
    soma.stopDecay();
    // Note: For a full reset, we'd need to reinitialize SOMABridge
    // For now, this stops the decay cycle
    logger.info('SOMA reset requested');

    res.json({
      success: true,
      message: 'SOMA decay stopped. Restart service for full reset.',
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error resetting SOMA: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to reset SOMA' });
  }
});

// Get available enums for API consumers
app.get('/enums', (req: Request, res: Response) => {
  res.json({
    stimulusTypes: Object.values(StimulusType),
    bodyZones: Object.values(BodyZone),
    touchQualities: Object.values(TouchQuality),
    emotionalStimuli: Object.values(EmotionalStimulus)
  });
});

// Force update cycle
app.post('/update', (req: Request, res: Response) => {
  try {
    soma.update();
    res.json({
      success: true,
      vitals: soma.getVitals(),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error(`Error forcing update: ${error}`);
    res.status(500).json({ success: false, error: 'Failed to update' });
  }
});

// Log current state
app.get('/log', (req: Request, res: Response) => {
  soma.logState();
  res.json({ success: true, message: 'State logged to console' });
});

//--------------------------------------------------------------
// Error handling middleware
//--------------------------------------------------------------

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

//--------------------------------------------------------------
// Start Server
//--------------------------------------------------------------

server.listen(PORT, () => {
  logger.info(`🧠 SOMA Service running on port ${PORT}`);
  logger.info(`   HTTP: http://localhost:${PORT}`);
  logger.info(`   WebSocket: ws://localhost:${PORT}/state`);
  logger.info(`   Update interval: ${UPDATE_INTERVAL}ms`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  soma.stopDecay();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  soma.stopDecay();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
