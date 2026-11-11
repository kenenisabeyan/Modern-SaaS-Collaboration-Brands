import express from 'express';
import WorkspaceTheme from '../models/WorkspaceTheme.js';

const router = express.Router();

/**
 * GET /api/theme
 * Fetches dynamic workspace theme styling based on the 60-30-10 brand rule:
 * - 60% Canvas / Secondary: #F5F7FA (border: #E4E8EE)
 * - 30% Structural / Primary: #1E2761 (hover: #151A44)
 * - 10% Action / Accent: #FF5A36 (hover: #E04826)
 */
router.get('/', async (_req, res) => {
  try {
    let theme = await WorkspaceTheme.findOne({ where: { workspaceId: 'default' } });
    if (!theme) {
      theme = await WorkspaceTheme.create({
        workspaceId: 'default',
        colorPrimary: '#1E2761',
        colorPrimaryHover: '#151A44',
        colorSecondary: '#F5F7FA',
        colorBorder: '#E4E8EE',
        colorAccent: '#FF5A36',
        colorAccentHover: '#E04826',
      });
    }

    res.json({
      success: true,
      data: theme,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workspace theme',
      error: error.message,
    });
  }
});

export default router;
