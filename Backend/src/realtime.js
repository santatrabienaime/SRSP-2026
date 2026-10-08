import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

/**
 * Temps réel : WebSocket branché sur le serveur HTTP existant.
 *
 * Une notification est signalée à l'utilisateur concerné dès son insertion
 * en base — la table reste la source de vérité, le socket ne fait que dire
 * « il y a du neuf » : le client recharge sa liste et son compteur. Rien de
 * sensible ne transite par le canal, seulement l'alerte.
 *
 * L'authentification réutilise le même jeton JWT que l'API : pas de second
 * mécanisme de session à administrer, et un jeton expiré ne passe pas.
 */
export function initRealtime(server) {
  io = new Server(server, {
    // Même origine en production (proxy de développement compris).
    cors: { origin: true, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentification requise.'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return next(new Error('Jeton invalide.'));
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Jeton invalide.'));
    }
  });

  io.on('connection', (socket) => {
    // Une salle par utilisateur : émettre vers `user:{id}` ne touche que lui.
    socket.join(`user:${socket.userId}`);
  });

  return io;
}

/** Signale une notification fraîche à un utilisateur connecté (best effort). */
export function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}
