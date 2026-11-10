import { io, type Socket } from "socket.io-client";
import { refreshSession } from "@/api/client";
import { API_BASE_URL } from "@/lib/env";
import { accessTokenTtl, getAccessToken } from "@/lib/tokens";

// One shared Socket.IO connection for the whole app (same design as the
// website's services/realtime.js). The backend accepts `auth.token`
// (sockets/index.js), and `auth` as a function is re-read on every
// (re)connect, so reconnects always carry the freshest access token.
let socket: Socket | null = null;
let refCount = 0;
let recovering = false;

const ensureFreshToken = async () => {
  if (accessTokenTtl() < 60) {
    try {
      await refreshSession();
    } catch {
      // offline: socket.io will keep retrying
    }
  }
};

export const acquireSocket = (): Socket => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 10000,
      auth: (cb) => cb({ token: getAccessToken() || "" }),
    });
    const s = socket;
    s.on("connect_error", async (err) => {
      // Expired access token → refresh once, then reconnect.
      if (/unauthori[sz]ed/i.test(err?.message || "") && !recovering) {
        recovering = true;
        try {
          const token = await refreshSession();
          if (token && s === socket) s.connect();
        } catch {
          // ignore
        } finally {
          recovering = false;
        }
      }
    });
    ensureFreshToken().then(() => {
      if (s === socket) s.connect();
    });
  }
  refCount += 1;
  return socket;
};

export const releaseSocket = (instance: Socket | null) => {
  if (!instance || instance !== socket) return;
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

/** Re-handshake with the current token (e.g. app returned to foreground). */
export const reconnectSocket = async () => {
  if (!socket) return;
  await ensureFreshToken();
  if (!socket.connected) socket.connect();
};
