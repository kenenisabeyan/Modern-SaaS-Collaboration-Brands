import { DataTypes } from 'sequelize';
import bcryptjs from 'bcryptjs';
import sequelize from '../database/sequelize.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Optional for OAuth users
      validate: {
        requirePasswordForLocal(value) {
          if (!this.googleId && !value) {
            throw new Error('Password is required for local users');
          }
        },
        len: [6, 255],
      },
    },
    googleId: {
      type: DataTypes.STRING,
      field: 'googleIdd',
      unique: true,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'free',
    },
  },
  {
    tableName: 'Users',
    freezeTableName: true,
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance method to compare passwords
User.prototype.comparePassword = async function (password) {
  return bcryptjs.compare(password, this.password);
};

export default User;
