import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import models from '../database/index.js';

const { Message, User, Room } = models;

const activeUsers = new Map(); // socketId -> participant
const roomParticipants = new Map(); // roomId -> Map(socketId -> participant)
const waitingUsers = new Map(); // roomId -> Map(socketId -> waiting participant)

const normalizeRoomId = (roomId) => (typeof roomId === 'string' ? roomId.trim().toLowerCase() : '');
const cleanUsername = (username) => {
  if (typeof username !== 'string') return 'Guest';
  const trimmed = username.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 80) : 'Guest';
};

const toParticipantPayload = (participant) => ({
  socketId: participant.socketId,
  userId: participant.userId,
  username: participant.username,
  audioEnabled: participant.audioEnabled,
  videoEnabled: participant.videoEnabled,
  handRaised: participant.handRaised,
  isHost: participant.isHost,
  joinedAt: participant.joinedAt,
});

const getParticipantMap = (roomId) => {
  if (!roomParticipants.has(roomId)) {
    roomParticipants.set(roomId, new Map());
  }
  return roomParticipants.get(roomId);
};

const getWaitingMap = (roomId) => {
  if (!waitingUsers.has(roomId)) {
    waitingUsers.set(roomId, new Map());
  }
  return waitingUsers.get(roomId);
};

const getParticipants = (roomId) => {
  const participants = roomParticipants.get(roomId);
  return participants ? Array.from(participants.values()).map(toParticipantPayload) : [];
};

const getWaitingList = (roomId) => {
  const users = waitingUsers.get(roomId);
  return users ? Array.from(users.values()) : [];
};

const getHosts = (roomId) => getParticipants(roomId).filter((participant) => participant.isHost);

const emitParticipantsList = (io, roomId) => {
  io.to(roomId).emit('participants-list', getParticipants(roomId));
};

const emitWaitingUsersList = (io, roomId) => {
  const waiting = getWaitingList(roomId);
  getHosts(roomId).forEach((host) => {
    io.to(host.socketId).emit('waiting-users-list', waiting);
  });
};

const deleteRoomMapsIfEmpty = (roomId) => {
  const participants = roomParticipants.get(roomId);
  if (participants && participants.size === 0) {
    roomParticipants.delete(roomId);
  }

  const waiting = waitingUsers.get(roomId);
  if (waiting && waiting.size === 0) {
    waitingUsers.delete(roomId);
  }
};

const removeSocketFromWaiting = (io, socketId) => {
  for (const [roomId, users] of waitingUsers.entries()) {
    if (!users.has(socketId)) continue;

    users.delete(socketId);
    emitWaitingUsersList(io, roomId);
    deleteRoomMapsIfEmpty(roomId);
    return roomId;
  }

  return null;
};

const removeSocketFromActiveRoom = (io, socket, shouldBroadcast = true) => {
  const participant = activeUsers.get(socket.id);
  if (!participant) return null;

  const { roomId } = participant;
  activeUsers.delete(socket.id);
  socket.leave(roomId);

  const participants = roomParticipants.get(roomId);
  if (participants) {
    participants.delete(socket.id);
  }

  if (shouldBroadcast) {
    socket.to(roomId).emit('user-left', {
      socketId: socket.id,
      userId: participant.userId,
      username: participant.username,
    });
    emitParticipantsList(io, roomId);
  }

  deleteRoomMapsIfEmpty(roomId);
  return participant;
};

const getAuthenticatedUser = async (token) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return await User.findByPk(decoded.userId);
  } catch {
    return null;
  }
};

const admitSocketToRoom = ({ io, targetSocket, roomId, userInfo, isHost }) => {
  removeSocketFromWaiting(io, targetSocket.id);
  removeSocketFromActiveRoom(io, targetSocket, false);

  const participant = {
    roomId,
    roomDbId: userInfo.roomDbId,
    socketId: targetSocket.id,
    userId: userInfo.userId,
    username: cleanUsername(userInfo.username),
    audioEnabled: userInfo.audioEnabled !== false,
    videoEnabled: userInfo.videoEnabled !== false,
    handRaised: false,
    isHost: Boolean(isHost),
    joinedAt: new Date().toISOString(),
  };

  targetSocket.join(roomId);
  activeUsers.set(targetSocket.id, participant);
  getParticipantMap(roomId).set(targetSocket.id, participant);

  const payload = toParticipantPayload(participant);
  targetSocket.emit('room-joined', {
    roomId,
    isHost: participant.isHost,
    participant: payload,
    participants: getParticipants(roomId),
  });

  targetSocket.to(roomId).emit('user-joined', payload);
  emitParticipantsList(io, roomId);

  if (participant.isHost) {
    targetSocket.emit('waiting-users-list', getWaitingList(roomId));
  }

  return participant;
};

const canSignalPeer = (sourceSocketId, targetSocketId, roomId) => {
  const source = activeUsers.get(sourceSocketId);
  const target = activeUsers.get(targetSocketId);
  return Boolean(source && target && source.roomId === roomId && target.roomId === roomId);
};

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', async ({ roomId: rawRoomId, username, token }) => {
      try {
        const roomId = normalizeRoomId(rawRoomId);
        if (!roomId) {
          socket.emit('room-error', { message: 'Missing room ID.' });
          return;
        }

        const room = await Room.findOne({ where: { roomId, isActive: true } });
        if (!room) {
          socket.emit('room-not-found', { roomId });
          console.log(`Join rejected: room not found ${roomId} for socket ${socket.id}`);
          return;
        }

        const dbUser = await getAuthenticatedUser(token);
        const userId = dbUser?.id || socket.id;
        const displayName = cleanUsername(username || dbUser?.username);
        const isHost = Boolean(dbUser && String(room.createdBy) === String(dbUser.id));
        const currentParticipant = activeUsers.get(socket.id);

        if (currentParticipant?.roomId === roomId) {
          socket.emit('room-joined', {
            roomId,
            isHost: currentParticipant.isHost,
            participant: toParticipantPayload(currentParticipant),
            participants: getParticipants(roomId),
          });
          if (currentParticipant.isHost) {
            socket.emit('waiting-users-list', getWaitingList(roomId));
          }
          return;
        }

        if (isHost) {
          admitSocketToRoom({
            io,
            targetSocket: socket,
            roomId,
            userInfo: { userId, username: displayName, roomDbId: room.id },
            isHost: true,
          });
          console.log(`Host ${displayName} (${userId}) joined room ${roomId}`);
          return;
        }

        removeSocketFromActiveRoom(io, socket, true);

        const waitingMap = getWaitingMap(roomId);
        const waitingUserInfo = {
          roomId,
          socketId: socket.id,
          userId,
          roomDbId: room.id,
          username: displayName,
          requestedAt: new Date().toISOString(),
          audioEnabled: true,
          videoEnabled: true,
        };

        waitingMap.set(socket.id, waitingUserInfo);
        socket.emit('waiting-for-host', { roomId });

        getHosts(roomId).forEach((host) => {
          io.to(host.socketId).emit('user-waiting', waitingUserInfo);
        });
        emitWaitingUsersList(io, roomId);

        console.log(`User ${displayName} (${userId}) is waiting for host in room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('room-error', { message: 'Failed to join room.' });
      }
    });

    socket.on('admit-user', ({ roomId: rawRoomId, targetSocketId }) => {
      const roomId = normalizeRoomId(rawRoomId);
      const host = activeUsers.get(socket.id);
      if (!host?.isHost || host.roomId !== roomId) {
        socket.emit('admission-error', { message: 'Only the meeting host can admit participants.' });
        return;
      }

      const waitingMap = waitingUsers.get(roomId);
      const waitingUser = waitingMap?.get(targetSocketId);
      if (!waitingUser) {
        emitWaitingUsersList(io, roomId);
        return;
      }

      const targetSocket = io.sockets.sockets.get(targetSocketId);
      waitingMap.delete(targetSocketId);

      if (!targetSocket) {
        emitWaitingUsersList(io, roomId);
        deleteRoomMapsIfEmpty(roomId);
        return;
      }

      admitSocketToRoom({
        io,
        targetSocket,
        roomId,
        userInfo: waitingUser,
        isHost: false,
      });
      emitWaitingUsersList(io, roomId);
      console.log(`User ${waitingUser.username} was admitted to room ${roomId}`);
    });

    socket.on('deny-user', ({ roomId: rawRoomId, targetSocketId }) => {
      const roomId = normalizeRoomId(rawRoomId);
      const host = activeUsers.get(socket.id);
      if (!host?.isHost || host.roomId !== roomId) {
        socket.emit('admission-error', { message: 'Only the meeting host can reject participants.' });
        return;
      }

      const waitingMap = waitingUsers.get(roomId);
      if (!waitingMap?.has(targetSocketId)) return;

      waitingMap.delete(targetSocketId);
      io.to(targetSocketId).emit('join-denied', { roomId });
      emitWaitingUsersList(io, roomId);
      deleteRoomMapsIfEmpty(roomId);
      console.log(`Socket ${targetSocketId} was denied entry to room ${roomId}`);
    });

    socket.on('kick-user', ({ roomId: rawRoomId, targetSocketId }) => {
      const roomId = normalizeRoomId(rawRoomId);
      const host = activeUsers.get(socket.id);
      if (!host?.isHost || host.roomId !== roomId) return;

      const targetParticipant = activeUsers.get(targetSocketId);
      if (targetParticipant && targetParticipant.roomId === roomId && !targetParticipant.isHost) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          removeSocketFromActiveRoom(io, targetSocket, true);
          targetSocket.emit('room-error', { message: 'You have been removed from the meeting by the host.' });
        }
      }
    });

    socket.on('mute-all-users', ({ roomId: rawRoomId }) => {
      const roomId = normalizeRoomId(rawRoomId);
      const host = activeUsers.get(socket.id);
      if (!host?.isHost || host.roomId !== roomId) return;

      const participants = roomParticipants.get(roomId);
      if (participants) {
        for (const [sId, p] of participants.entries()) {
          if (!p.isHost) {
            p.audioEnabled = false;
            const tSocket = io.sockets.sockets.get(sId);
            if (tSocket) tSocket.emit('force-mute');
          }
        }
        emitParticipantsList(io, roomId);
      }
    });

    socket.on('leave-room', ({ roomId: rawRoomId }) => {
      const roomId = normalizeRoomId(rawRoomId);
      removeSocketFromWaiting(io, socket.id);

      const participant = activeUsers.get(socket.id);
      if (participant && (!roomId || participant.roomId === roomId)) {
        removeSocketFromActiveRoom(io, socket, true);
        console.log(`User ${participant.username} (${participant.userId}) left room ${participant.roomId}`);
      }
    });

    socket.on('webrtc-offer', ({ targetSocketId, offer, roomId: rawRoomId }) => {
      const roomId = normalizeRoomId(rawRoomId);
      if (!canSignalPeer(socket.id, targetSocketId, roomId)) return;

      io.to(targetSocketId).emit('webrtc-offer', {
        socketId: socket.id,
        offer,
        roomId,
      });
    });

    socket.on('webrtc-answer', ({ targetSocketId, answer, roomId: rawRoomId }) => {
      const roomId = normalizeRoomId(rawRoomId);
      if (!canSignalPeer(socket.id, targetSocketId, roomId)) return;

      io.to(targetSocketId).emit('webrtc-answer', {
        socketId: socket.id,
        answer,
        roomId,
      });
    });

    socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate, roomId: rawRoomId }) => {
      const roomId = normalizeRoomId(rawRoomId);
      if (!canSignalPeer(socket.id, targetSocketId, roomId)) return;

      io.to(targetSocketId).emit('webrtc-ice-candidate', {
        socketId: socket.id,
        candidate,
        roomId,
      });
    });

    socket.on('chat-message', async ({ roomId: rawRoomId, message, username, timestamp }) => {
      try {
        const roomId = normalizeRoomId(rawRoomId);
        const sender = activeUsers.get(socket.id);
        const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
        if (!sender || sender.roomId !== roomId || !cleanMessage) return;

        const msgData = {
          message: cleanMessage,
          username: sender.username || cleanUsername(username),
          timestamp: timestamp || new Date().toISOString(),
          socketId: socket.id,
        };

        io.to(roomId).emit('chat-message', msgData);

        try {
          if (sender.userId && sender.userId !== socket.id) {
            await Message.create({
              roomId: sender.roomDbId,
              sender: sender.userId,
              message: cleanMessage,
            });
          }
        } catch (dbError) {
          console.warn('Could not save message to database:', dbError.message);
        }
      } catch (error) {
        console.error('Error in chat-message handler:', error);
      }
    });

    socket.on('toggle-audio', ({ roomId: rawRoomId, enabled }) => {
      const roomId = normalizeRoomId(rawRoomId);
      const participant = activeUsers.get(socket.id);
      if (!participant || participant.roomId !== roomId) return;

      participant.audioEnabled = Boolean(enabled);
      roomParticipants.get(roomId)?.set(socket.id, participant);
      socket.to(roomId).emit('user-audio-toggled', { socketId: socket.id, enabled: participant.audioEnabled });
      emitParticipantsList(io, roomId);
    });

    socket.on('toggle-video', ({ roomId: rawRoomId, enabled }) => {
      const roomId = normalizeRoomId(rawRoomId);
      const participant = activeUsers.get(socket.id);
      if (!participant || participant.roomId !== roomId) return;

      participant.videoEnabled = Boolean(enabled);
      roomParticipants.get(roomId)?.set(socket.id, participant);
      socket.to(roomId).emit('user-video-toggled', { socketId: socket.id, enabled: participant.videoEnabled });
      emitParticipantsList(io, roomId);
    });

    socket.on('toggle-hand', ({ roomId: rawRoomId, handRaised }) => {
      const roomId = normalizeRoomId(rawRoomId);
      const participant = activeUsers.get(socket.id);
      if (!participant || participant.roomId !== roomId) return;

      participant.handRaised = Boolean(handRaised);
      roomParticipants.get(roomId)?.set(socket.id, participant);
      socket.to(roomId).emit('user-hand-toggled', { socketId: socket.id, handRaised: participant.handRaised });
      emitParticipantsList(io, roomId);
    });

    socket.on('room-reaction', ({ roomId: rawRoomId, reaction }) => {
      const roomId = normalizeRoomId(rawRoomId);
      const participant = activeUsers.get(socket.id);
      if (!participant || participant.roomId !== roomId) return;
      io.to(roomId).emit('room-reaction', { socketId: socket.id, reaction, username: participant.username });
    });

    socket.on('disconnect', () => {
      removeSocketFromWaiting(io, socket.id);

      const participant = activeUsers.get(socket.id);
      if (participant) {
        removeSocketFromActiveRoom(io, socket, true);
        console.log(`User ${participant.username} (${participant.userId}) disconnected`);
      }
    });
  });
};

export const getRoomParticipants = (roomId) => getParticipants(normalizeRoomId(roomId));
