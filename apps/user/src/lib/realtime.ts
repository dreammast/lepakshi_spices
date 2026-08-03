export type RealtimeEvent = { type: string; data: any };
export type RealtimeNotification = {
  id: string;
  type: string;
  title: string;
  description?: string;
  createdAt: number;
  meta?: Record<string, unknown>;
};
export type ConnectionState = "connecting" | "open" | "fallback" | "off";

type EventListener = (ev: RealtimeEvent) => void;
type NotifListener = (n: RealtimeNotification) => void;

const VITE_API_URL = import.meta.env.VITE_API_URL;
const API_BASE = (VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');
const SSE_URL = `${API_BASE}/api/realtime/events`;

const POLL_INTERVAL = 30_000;

let source: EventSource | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 2000;
let retryCount = 0;
let started = false;
let tokenProvider: () => string | null = () => null;
let state: ConnectionState = "off";

const eventListeners = new Set<EventListener>();
const notifListeners = new Set<NotifListener>();
const stateListeners = new Set<(s: ConnectionState) => void>();

function setState(next: ConnectionState) {
  if (next === state) return;
  state = next;
  stateListeners.forEach((fn) => fn(next));
}

export function getConnectionState(): ConnectionState {
  return state;
}

export function onConnectionStateChange(fn: (s: ConnectionState) => void): () => void {
  stateListeners.add(fn);
  return () => {
    stateListeners.delete(fn);
  };
}

export function configureRealtime(opts: { getToken: () => string | null }) {
  tokenProvider = opts.getToken;
}

export function onRealtimeEvent(fn: EventListener): () => void {
  eventListeners.add(fn);
  return () => {
    eventListeners.delete(fn);
  };
}

export function onRealtimeNotification(fn: NotifListener): () => void {
  notifListeners.add(fn);
  return () => {
    notifListeners.delete(fn);
  };
}

function handleIncoming(type: string, payload: any) {
  if (type === "notification") {
    notifListeners.forEach((fn) => fn(payload as RealtimeNotification));
    return;
  }
  const ev: RealtimeEvent = { type, data: payload };
  eventListeners.forEach((fn) => fn(ev));
}

function scheduleReconnect() {
  if (retryTimer) clearTimeout(retryTimer);
  if (!started) return;
  retryCount += 1;
  if (retryCount >= 4) setState("fallback");
  retryTimer = setTimeout(connect, retryDelay);
  retryDelay = Math.min(retryDelay * 1.5, 15000);
}

function dispatchPoll() {
  if (source) return;
  handleIncoming("poll", { at: Date.now() });
}

function connect() {
  if (!started) return;
  if (!('EventSource' in window)) {
    setState("fallback");
    return;
  }
  setState("connecting");
  try {
    const token = tokenProvider();
    const url = token
      ? `${SSE_URL}?token=${encodeURIComponent(token)}`
      : SSE_URL;
    const es = new EventSource(url);
    source = es;
    es.onopen = () => {
      retryDelay = 2000;
      retryCount = 0;
      setState("open");
    };
    es.onerror = () => {
      es.close();
      source = null;
      scheduleReconnect();
    };
    es.onmessage = (e: MessageEvent) => {
      try {
        const raw = JSON.parse(e.data);
        handleIncoming(raw.type, raw.data);
      } catch {
        /* ignore malformed frames */
      }
    };
  } catch {
    scheduleReconnect();
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

export function startRealtime() {
  if (started) return;
  started = true;
  retryDelay = 2000;
  retryCount = 0;
  connect();
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(dispatchPoll, POLL_INTERVAL);
}

export function stopRealtime() {
  started = false;
  if (source) {
    source.close();
    source = null;
  }
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  setState("off");
}
