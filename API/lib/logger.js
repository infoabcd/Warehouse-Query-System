/**
 * 按模块与 LOG_LEVEL 控制输出，减少控制台噪音。
 * LOG_LEVEL: error | warn | info | http | debug（默认 info）
 */
const LEVELS = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase();
const threshold =
  LEVELS[envLevel] !== undefined ? LEVELS[envLevel] : LEVELS.info;

function emit(level, namespace, msg, meta) {
  if (LEVELS[level] > threshold) return;
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}] [${namespace}] ${msg}`;
  if (meta !== undefined) {
    const fn = level === "error" ? console.error : console.log;
    fn(prefix, meta);
  } else {
    const fn = level === "error" ? console.error : console.log;
    fn(prefix);
  }
}

function createLogger(namespace) {
  return {
    error: (msg, meta) => emit("error", namespace, msg, meta),
    warn: (msg, meta) => emit("warn", namespace, msg, meta),
    info: (msg, meta) => emit("info", namespace, msg, meta),
    http: (msg, meta) => emit("http", namespace, msg, meta),
    debug: (msg, meta) => emit("debug", namespace, msg, meta),
  };
}

module.exports = { createLogger, LEVELS };
