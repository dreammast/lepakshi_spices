import { Router } from 'express';
import { verifyToken } from '../utils/jwt.util.js';
import { subscribeClient, clientCount } from '../realtime/hub.js';

const router = Router();

/**
 * GET /api/realtime/events
 * Server-Sent Events stream. Auth is provided via `?token=<jwt>` because the
 * browser EventSource API cannot attach Authorization headers.
 *  - admin/staff/manager tokens  -> admin scope (receives admin events)
 *  - customer tokens             -> user scope, matched by userId/email
 *  - missing/invalid token       -> anon scope (receives public catalog events)
 */
router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const token = String(req.query.token || '');
  let scope: 'admin' | 'user' | 'anon' = 'anon';
  let userId: number | null = null;
  let email: string | null = null;

  if (token) {
    try {
      const payload = verifyToken(token);
      if (['admin', 'staff', 'manager'].includes(payload.role)) {
        scope = 'admin';
      } else {
        scope = 'user';
        userId = payload.sub;
        email = payload.email;
      }
    } catch {
      // Invalid/expired token — treat as anonymous.
    }
  }

  const client = subscribeClient(res, { scope, userId, email });

  res.write(`retry: 5000\n`);
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ clientId: client.id, scope, clients: clientCount() })}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      // Ignore — the socket is being torn down.
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

export default router;
