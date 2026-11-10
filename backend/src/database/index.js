import User from '../models/User.js';
import Room from '../models/Room.js';
import Message from '../models/Message.js';
import WorkspaceTheme from '../models/WorkspaceTheme.js';

// Setup associations
const setupAssociations = () => {
  // User has many Rooms (one-to-many)
  User.hasMany(Room, {
    foreignKey: 'createdBy',
    as: 'createdRooms',
  });

  // Room belongs to User
  Room.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  // Room has many Messages (one-to-many)
  Room.hasMany(Message, {
    foreignKey: 'roomId',
    as: 'messages',
  });

  // Message belongs to Room
  Message.belongsTo(Room, {
    foreignKey: 'roomId',
    as: 'room',
  });

  // User has many Messages (one-to-many)
  User.hasMany(Message, {
    foreignKey: 'sender',
    as: 'sentMessages',
  });

  // Message belongs to User
  Message.belongsTo(User, {
    foreignKey: 'sender',
    as: 'senderUser',
  });
};

// Setup associations when models are loaded
setupAssociations();

export const models = {
  User,
  Room,
  Message,
  WorkspaceTheme,
};

export default models;
