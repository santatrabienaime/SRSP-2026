const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
  reset: '\x1b[0m',
};

const currentLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function log(level, message, meta = '') {
  if (levels[level] > levels[currentLevel]) return;
  const timestamp = new Date().toISOString();
  const color = colors[level];
  const prefix = `${color}[${level.toUpperCase()}]${colors.reset}`;
  console.log(`${prefix} ${timestamp} - ${message}`, meta ? meta : '');
}

export const logger = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};

export default logger;