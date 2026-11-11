import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import '../database/index.js';
import sequelize from '../database/sequelize.js';
import WorkspaceTheme from './WorkspaceTheme.js';

describe('WorkspaceTheme Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await WorkspaceTheme.destroy({ where: {} });
  });

  it('should create a workspace theme with default 60-30-10 brand hex codes', async () => {
    const theme = await WorkspaceTheme.create({
      workspaceId: 'default',
    });

    expect(theme.id).toBeDefined();
    expect(theme.workspaceId).toBe('default');
    expect(theme.colorPrimary).toBe('#1E2761');
    expect(theme.colorPrimaryHover).toBe('#151A44');
    expect(theme.colorSecondary).toBe('#F5F7FA');
    expect(theme.colorBorder).toBe('#E4E8EE');
    expect(theme.colorAccent).toBe('#FF5A36');
    expect(theme.colorAccentHover).toBe('#E04826');
  });

  it('should allow custom theme hex codes for enterprise workspaces', async () => {
    const customTheme = await WorkspaceTheme.create({
      workspaceId: 'enterprise-workspace-1',
      colorPrimary: '#151A44',
      colorPrimaryHover: '#0E112E',
      colorSecondary: '#FFFFFF',
      colorBorder: '#CBD5E1',
      colorAccent: '#FF4500',
      colorAccentHover: '#D03700',
    });

    expect(customTheme.workspaceId).toBe('enterprise-workspace-1');
    expect(customTheme.colorPrimary).toBe('#151A44');
    expect(customTheme.colorAccent).toBe('#FF4500');
  });

  it('should find existing theme or create default', async () => {
    let theme = await WorkspaceTheme.findOne({ where: { workspaceId: 'default' } });
    expect(theme).toBeNull();

    theme = await WorkspaceTheme.create({ workspaceId: 'default' });
    expect(theme).not.toBeNull();
    expect(theme.colorAccent).toBe('#FF5A36');

    const retrieved = await WorkspaceTheme.findOne({ where: { workspaceId: 'default' } });
    expect(retrieved.id).toBe(theme.id);
  });
});
