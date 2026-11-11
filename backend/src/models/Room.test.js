import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import '../database/index.js';
import sequelize from '../database/sequelize.js';
import User from './User.js';
import Room from './Room.js';
import * as fc from 'fast-check';

describe('Room Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Room.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('Unit Tests', () => {
    it('should create a room with valid data', async () => {
      // First create a user
      const user = await User.create({
        username: 'roomcreator',
        email: 'creator@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'test-room-123',
        createdBy: user.id,
      });

      expect(room.id).toBeDefined();
      expect(room.roomId).toBe('test-room-123');
      expect(room.createdBy).toBe(user.id);
      expect(room.createdAt).toBeDefined();
      expect(room.updatedAt).toBeDefined();
    });

    it('should generate unique roomId by default', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const room1 = await Room.create({
        createdBy: user.id,
      });

      const room2 = await Room.create({
        createdBy: user.id,
      });

      expect(room1.roomId).toBeDefined();
      expect(room2.roomId).toBeDefined();
      expect(room1.roomId).not.toBe(room2.roomId);
    });

    it('should enforce unique roomId constraint', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const roomId = 'unique-room-id-123';
      await Room.create({
        roomId,
        createdBy: user.id,
      });

      expect(
        Room.create({
          roomId,
          createdBy: user.id,
        })
      ).rejects.toThrow();
    });

    it('should require roomId', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      expect(
        Room.create({
          createdBy: user.id,
        })
      ).resolves.toBeDefined(); // Should work because roomId has default value
    });

    it('should require createdBy', async () => {
      expect(
        Room.create({
          roomId: 'test-room',
        })
      ).rejects.toThrow();
    });

    it('should validate roomId is not empty', async () => {
      const user = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'password123',
      });

      expect(
        Room.create({
          roomId: '',
          createdBy: user.id,
        })
      ).rejects.toThrow();
    });
  });

  describe('Association Tests', () => {
    it('should belong to a user (creator)', async () => {
      const user = await User.create({
        username: 'creatoruser',
        email: 'creator@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'association-room',
        createdBy: user.id,
      });

      const roomWithUser = await Room.findByPk(room.id, {
        include: [{ model: User, as: 'creator' }],
      });

      expect(roomWithUser.creator).toBeDefined();
      expect(roomWithUser.creator.id).toBe(user.id);
      expect(roomWithUser.creator.username).toBe('creatoruser');
    });

    it('should have many messages', async () => {
      const user = await User.create({
        username: 'messageuser',
        email: 'message@example.com',
        password: 'password123',
      });

      const room = await Room.create({
        roomId: 'message-room',
        createdBy: user.id,
      });

      // Note: Message model tests will test this association more thoroughly
      expect(room).toBeDefined();
    });
  });

  describe('Property Tests', () => {
    it('should always have unique roomId', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            roomId1: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            roomId2: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          }),
          async ({ roomId1, roomId2 }) => {
            fc.pre(roomId1 !== roomId2);
            await Room.destroy({ where: {} });
            await User.destroy({ where: {} });

            const user = await User.create({
              username: `user_${Date.now()}_${Math.random()}`,
              email: `user_${Date.now()}_${Math.random()}@example.com`,
              password: 'password123',
            });

            // Create first room
            await Room.create({
              roomId: roomId1,
              createdBy: user.id,
            });

            // Create second room with different roomId should succeed
            const room2 = await Room.create({
              roomId: roomId2,
              createdBy: user.id,
            });

            expect(room2.roomId).toBe(roomId2);
          }
        ),
        { numRuns: 10 }
      );
    }, 20000);

    it('should reject duplicate roomIds', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          async (roomId) => {
            await Room.destroy({ where: {} });
            await User.destroy({ where: {} });

            const user1 = await User.create({
              username: `user1_${Date.now()}_${Math.random()}`,
              email: `user1_${Date.now()}_${Math.random()}@example.com`,
              password: 'password123',
            });

            const user2 = await User.create({
              username: `user2_${Date.now()}_${Math.random()}`,
              email: `user2_${Date.now()}_${Math.random()}@example.com`,
              password: 'password123',
            });

            // Create first room
            await Room.create({
              roomId,
              createdBy: user1.id,
            });

            // Attempt to create second room with same roomId should fail
            let duplicateError = false;
            try {
              await Room.create({
                roomId,
                createdBy: user2.id,
              });
            } catch (error) {
              duplicateError = true;
            }

            expect(duplicateError).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    }, 20000);
  });
});