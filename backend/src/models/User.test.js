import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import '../database/index.js';
import sequelize from '../database/sequelize.js';
import User from './User.js';
import Room from './Room.js';
import Message from './Message.js';
import * as fc from 'fast-check';

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Message.destroy({ where: {} }).catch(() => {});
    await Room.destroy({ where: {} }).catch(() => {});
    await User.destroy({ where: {} });
  });

  describe('Unit Tests', () => {
    it('should create a user with valid data', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.password).not.toBe('password123'); // Should be hashed
      expect(user.createdAt).toBeDefined();
    });

    it('should hash password on creation', async () => {
      const plainPassword = 'mySecurePassword123';
      const user = await User.create({
        username: 'hashtest',
        email: 'hash@example.com',
        password: plainPassword,
      });

      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(plainPassword.length);
    });

    it('should compare password correctly', async () => {
      const plainPassword = 'correctPassword123';
      const user = await User.create({
        username: 'comparetest',
        email: 'compare@example.com',
        password: plainPassword,
      });

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongPassword');
      expect(isNotMatch).toBe(false);
    });

    it('should enforce unique username constraint', async () => {
      await User.create({
        username: 'uniqueuser',
        email: 'unique1@example.com',
        password: 'password123',
      });

      expect(
        User.create({
          username: 'uniqueuser',
          email: 'unique2@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      await User.create({
        username: 'user1',
        email: 'unique@example.com',
        password: 'password123',
      });

      expect(
        User.create({
          username: 'user2',
          email: 'unique@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should require username', async () => {
      expect(
        User.create({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should require email', async () => {
      expect(
        User.create({
          username: 'testuser',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should require password', async () => {
      expect(
        User.create({
          username: 'testuser',
          email: 'test@example.com',
        })
      ).rejects.toThrow();
    });

    it('should validate email format', async () => {
      expect(
        User.create({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should validate username length (min 3)', async () => {
      expect(
        User.create({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should validate password length (min 6)', async () => {
      expect(
        User.create({
          username: 'testuser',
          email: 'test@example.com',
          password: 'short',
        })
      ).rejects.toThrow();
    });
  });

  describe('Property Tests', () => {
    it('Property 1: User Registration Idempotency - duplicate usernames are rejected', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 6, maxLength: 20 }),
          }),
          async (userData) => {
            await User.destroy({ where: {} });
            // Create first user
            await User.create(userData);

            // Attempt to create second user with same username
            let duplicateError = false;
            try {
              await User.create({
                ...userData,
                email: `different-${userData.email}`,
              });
            } catch (error) {
              duplicateError = true;
            }

            expect(duplicateError).toBe(true);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('Property 1: User Registration Idempotency - duplicate emails are rejected', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 6, maxLength: 20 }),
          }),
          async (userData) => {
            await User.destroy({ where: {} });
            // Create first user
            await User.create(userData);

            // Attempt to create second user with same email
            let duplicateError = false;
            try {
              await User.create({
                ...userData,
                username: `different_${userData.username}`,
              });
            } catch (error) {
              duplicateError = true;
            }

            expect(duplicateError).toBe(true);
          }
        ),
        { numRuns: 15 }
      );
    });

    it('Property 2: Password Security - passwords are always hashed, never plaintext', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string({ minLength: 3, maxLength: 20 }).filter((s) => /^[a-zA-Z0-9_]+$/.test(s)),
            email: fc.emailAddress(),
            password: fc.string({ minLength: 6, maxLength: 20 }),
          }),
          async (userData) => {
            await User.destroy({ where: {} });
            const user = await User.create(userData);

            // Password should never be plaintext
            expect(user.password).not.toBe(userData.password);

            // Password should be a bcrypt hash (starts with $2a$, $2b$, or $2y$)
            expect(user.password).toMatch(/^\$2[aby]\$/);

            // Retrieve from database and verify again
            const retrievedUser = await User.findByPk(user.id);
            expect(retrievedUser.password).not.toBe(userData.password);
            expect(retrievedUser.password).toMatch(/^\$2[aby]\$/);
          }
        ),
        { numRuns: 15 }
      );
    });
  });
});
