import { io } from "socket.io-client";

export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket = null;

/**
 * Lazily creates a single shared socket connection. The backend authenticates
 * the socket handshake off the same JWT cookie as the REST API, so this must
 * be called only once the user is known to be logged in — it relies on the
 * browser sending the cookie automatically (withCredentials).
 */
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
