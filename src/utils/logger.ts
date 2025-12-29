// FILE: src/utils/logger.ts
//--------------------------------------------------------------
// Logger utility for SOMA service
// Provides console-based logging with configurable levels
//--------------------------------------------------------------

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const envLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || 'info';
const currentLevel = LOG_LEVELS[envLevel] ?? LOG_LEVELS.info;

function formatMessage(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug: (message: string): void => {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log(formatMessage('debug', message));
    }
  },

  info: (message: string): void => {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(formatMessage('info', message));
    }
  },

  warn: (message: string): void => {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message));
    }
  },

  error: (message: string): void => {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(formatMessage('error', message));
    }
  }
};

export default logger;
