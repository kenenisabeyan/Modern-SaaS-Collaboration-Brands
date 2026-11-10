import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';

const WorkspaceTheme = sequelize.define(
  'WorkspaceTheme',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    workspaceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'default',
    },
    colorPrimary: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#1E2761', // 30% structural weight: Deep Midnight Blue
    },
    colorPrimaryHover: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#151A44',
    },
    colorSecondary: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#F5F7FA', // 60% background canvas weight: Soft Slate Gray / Off-White
    },
    colorBorder: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#E4E8EE', // Thin borders & subtle dividers
    },
    colorAccent: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#FF5A36', // 10% action weight: Electric Coral / Orange-Red
    },
    colorAccentHover: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '#E04826',
    },
  },
  {
    timestamps: true,
  }
);

export default WorkspaceTheme;

