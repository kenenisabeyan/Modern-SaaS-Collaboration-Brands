import express from 'express';
import authRoutes from './auth.js';
import roomRoutes from './rooms.js';
import statsRoutes from './stats.js';
import themeRoutes from './theme.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rooms', roomRoutes);
router.use('/stats', statsRoutes);
router.use('/theme', themeRoutes);

router.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export default router;
