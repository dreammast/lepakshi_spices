import { useEffect } from 'react';

const HEARTBEAT_INTERVAL_MS = 10 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;

function getHealthUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const base = apiUrl.replace(/\/api\/?$/, '');
  return `${base}/health`;
}

let timerId: number | null = null;
let activeCount = 0;

function ping() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  fetch(getHealthUrl(), { cache: 'no-store', signal: controller.signal })
    .catch(() => {})
    .finally(() => window.clearTimeout(timeout));
}

function start() {
  activeCount += 1;
  if (timerId !== null) return;
  ping();
  timerId = window.setInterval(ping, HEARTBEAT_INTERVAL_MS);
}

function stop() {
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount > 0) return;
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
}

export function useHeartbeat(active: boolean) {
  useEffect(() => {
    if (!active) {
      stop();
      return;
    }
    start();
    return () => stop();
  }, [active]);
}
