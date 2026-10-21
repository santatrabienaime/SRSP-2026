import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { verifierSession } from './middlewares/authMiddleware.js';
import { corsOptions } from './config/cors.js';

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
 *
 * Le canal applique **la même vérification de session** que l'API : un
 * compte désactivé, ou dont le mot de passe a été changé, ne garde pas un
 * WebSocket ouvert. Sans cela, la révocation d'une session ne vaudrait que
 * pour les requêtes HTTP — le canal temps réel, lui, resterait ouvert
 * indéfiniment, et c'est par lui que passent les alertes.
 */

let io = null;

export function initRealtime(server) {
  io = new Server(server, {
    // Les mêmes origines que l'API : une origine autorisée par le CORS de
    // l'API ne doit pas être refusée par le WebSocket, et inversement.
    cors: {
      origin: corsOptions.origin,
      credentials: true,
      methods: corsOptions.methods,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentification requise.'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return next(new Error('Jeton invalide.'));

      /* Même contrôle de session que l'API : le canal temps réel ne doit
         pas survivre à la révocation d'une session. */
      const probleme = await verifierSession(decoded);
      if (probleme) return next(new Error(probleme));

      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Jeton invalide.'));
    }
  });

  io.on('connection', (socket) => {
    // Une salle par utilisateur : émettre vers `user:{id}` ne touche que lui.
    socket.join(`user:${socket.userId}`);

    /* Le client sait ainsi que le canal est établi, et l'affiche. */
    socket.emit('canal', { etat: 'connecte' });

    /* Un client qui se déconnecte ne doit pas laisser une salle fantôme :
       Socket.IO le retire lui-même, mais une déconnexion brutale peut
       trainer. On purge au passage. */
    socket.on('disconnect', () => {
      socket.leave(`user:${socket.userId}`);
    });
  });

  return io;
}

/** Signale une notification fraîche à un utilisateur connecté (best effort). */
export function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

/**
 * Signale un changement de dossier aux personnes concernées.
 *
 * Le canal ne transporte que l'alerte — l'identifiant du dossier et son
 * nouveau statut. Le client recharge la fiche ou la liste depuis l'API,
 * qui seule fait foi. Aucun dossier ne transite par le WebSocket.
 */
export function emitDossier(dossierId, statut, userIds = []) {
  if (!io || !dossierId) return;
  const cibles = [...new Set(userIds.filter(Boolean).map(Number))];
  for (const userId of cibles) {
    io.to(`user:${userId}`).emit('dossier', {
      dossier_id: Number(dossierId),
      statut,
      at: new Date().toISOString(),
    });
  }
}

/** Émet un signal vers tous les utilisateurs connectés (usage interne). */
export function emitGlobal(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}
