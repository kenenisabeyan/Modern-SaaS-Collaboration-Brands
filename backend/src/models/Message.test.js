import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import '../database/index.js';
import sequelize from '../database/sequelize.js';
import User from './User.js';
import Room from './Room.js';
import Message from './Message.js';
import * as fc from 'fast-check';

describe('Message Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Message.destroy({ where: {} });
    await Room.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('Unit Tests', () => {
    it('should create a message with valid data', async () => {
      // Create user and room first
      const user = await User.create({
        username: 'messagesender',
        email: 'sender@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'message-room-123',
        createdBy: user.id,
      });

      const message = await Message.create({
        roomId: room.id,
        sender: user.id,
        message: 'Hello, world!',
      });

      expect(message.id).toBeDefined();
      expect(message.roomId).toBe(room.id);
      expect(message.sender).toBe(user.id);
      expect(message.message).toBe('Hello, world!');
      expect(message.createdAt).toBeDefined();
      expect(message.updatedAt).toBeDefined();
    });

    it('should require roomId', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      expect(
        Message.create({
          sender: user.id,
          message: 'Test message',
        })
      ).rejects.toThrow();
    });

    it('should allow null sender for guest users', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'test-room',
        createdBy: user.id,
      });

      const message = await Message.create({
        roomId: room.id,
        sender: null,
        message: 'Test message',
      });

      expect(message.id).toBeDefined();
      expect(message.sender).toBeNull();
    });

    it('should require message', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'test-room',
        createdBy: user.id,
      });

      expect(
        Message.create({
          roomId: room.id,
          sender: user.id,
        })
      ).rejects.toThrow();
    });

    it('should validate message is not empty', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'test-room',
        createdBy: user.id,
      });

      expect(
        Message.create({
          roomId: room.id,
          sender: user.id,
          message: '',
        })
      ).rejects.toThrow();
    });

    it('should store long messages', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'test-room',
        createdBy: user.id,
      });

      const longMessage = 'A'.repeat(1000);
      const message = await Message.create({
        roomId: room.id,
        sender: user.id,
        message: longMessage,
      });

      expect(message.message).toBe(longMessage);
    });
  });

  describe('Association Tests', () => {
    it('should belong to a room', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'association-room',
        createdBy: user.id,
      });

      const message = await Message.create({
        roomId: room.id,
        sender: user.id,
        message: 'Test message',
      });

      const messageWithRoom = await Message.findByPk(message.id, {
        include: [{ model: Room, as: 'room' }],
      });

      expect(messageWithRoom.room).toBeDefined();
      expect(messageWithRoom.room.id).toBe(room.id);
      expect(messageWithRoom.room.roomId).toBe('association-room');
    });

    it('should belong to a user (sender)', async () => {
      const user = await User.create({
        username: 'senderuser',
        email: 'sender@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'sender-room',
        createdBy: user.id,
      });

      const message = await Message.create({
        roomId: room.id,
        sender: user.id,
        message: 'Test message',
      });

      const messageWithUser = await Message.findByPk(message.id, {
        include: [{ model: User, as: 'senderUser' }],
      });

      expect(messageWithUser.senderUser).toBeDefined();
      expect(messageWithUser.senderUser.id).toBe(user.id);
      expect(messageWithUser.senderUser.username).toBe('senderuser');
    });

    it('should allow multiple messages in a room', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'multi-message-room',
        createdBy: user.id,
      });

      const message1 = await Message.create({
        roomId: room.id,
        sender: user.id,
        message: 'First message',
      });

      const message2 = await Message.create({
        roomId: room.id,
        sender: user.id,
        message: 'Second message',
      });

      expect(message1.id).not.toBe(message2.id);
      expect(message1.roomId).toBe(room.id);
      expect(message2.roomId).toBe(room.id);
    });

    it('should allow multiple users to send messages in a room', async () => {
      const user1 = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const user2 = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'multi-user-room',
        createdBy: user1.id,
      });

      const message1 = await Message.create({
        roomId: room.id,
        sender: user1.id,
        message: 'Message from user1',
      });

      const message2 = await Message.create({
        roomId: room.id,
        sender: user2.id,
        message: 'Message from user2',
      });

      expect(message1.sender).toBe(user1.id);
      expect(message2.sender).toBe(user2.id);
    });
  });

  describe('Property Tests', () => {
    it('should always have non-empty message', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
          async (messageText) => {
            await Message.destroy({ where: {} });
            await Room.destroy({ where: {} });
            await User.destroy({ where: {} });

            const user = await User.create({
              username: `user_${Date.now()}_${Math.random()}`,
              email: `user_${Date.now()}_${Math.random()}@example.com`,
              password: 'password123',
            });

            const room = await Room.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              createdBy: user.id,
            });

            const message = await Message.create({
              roomId: room.id,
              sender: user.id,
              message: messageText,
            });

            expect(message.message).toBe(messageText);
            expect(message.message.trim().length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should reject empty messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(''),
          async (emptyMessage) => {
            await Message.destroy({ where: {} });
            await Room.destroy({ where: {} });
            await User.destroy({ where: {} });

            const user = await User.create({
              username: `user_${Date.now()}_${Math.random()}`,
              email: `user_${Date.now()}_${Math.random()}@example.com`,
              password: 'password123',
            });

            const room = await Room.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              createdBy: user.id,
            });

            let validationError = false;
            try {
              await Message.create({
                roomId: room.id,
                sender: user.id,
                message: emptyMessage,
              });
            } catch (error) {
              validationError = true;
            }

            expect(validationError).toBe(true);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should maintain referential integrity for roomId', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 500 }),
          async (messageText) => {
            await Message.destroy({ where: {} });
            await Room.destroy({ where: {} });
            await User.destroy({ where: {} });

            const user = await User.create({
              username: `user_${Date.now()}_${Math.random()}`,
              email: `user_${Date.now()}_${Math.random()}@example.com`,
              password: 'password123',
            });

            const room = await Room.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              createdBy: user.id,
            });

            // Should succeed with valid roomId
            const message = await Message.create({
              roomId: room.id,
              sender: user.id,
              message: messageText,
            });

            expect(message.roomId).toBe(room.id);

            // Should fail with invalid roomId
            let referentialError = false;
            try {
              await Message.create({
                roomId: '00000000-0000-0000-0000-000000000000', // Invalid UUID
                sender: user.id,
                message: messageText,
              });
            } catch (error) {
              referentialError = true;
            }

            expect(referentialError).toBe(true);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('should maintain referential integrity for sender', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 500 }),
          async (messageText) => {
            await Message.destroy({ where: {} });
            await Room.destroy({ where: {} });
            await User.destroy({ where: {} });

            const user = await User.create({
              username: `user_${Date.now()}_${Math.random()}`,
              email: `user_${Date.now()}_${Math.random()}@example.com`,
              password: 'password123',
            });

            const room = await Room.create({
              roomId: `room_${Date.now()}_${Math.random()}`,
              createdBy: user.id,
            });

            // Should succeed with valid sender
            const message = await Message.create({
              roomId: room.id,
              sender: user.id,
              message: messageText,
            });

            expect(message.sender).toBe(user.id);

            // Should fail with invalid sender
            let referentialError = false;
            try {
              await Message.create({
                roomId: room.id,
                sender: '00000000-0000-0000-0000-000000000000', // Invalid UUID
                message: messageText,
              });
            } catch (error) {
              referentialError = true;
            }

            expect(referentialError).toBe(true);
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});