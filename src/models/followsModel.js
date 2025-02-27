import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Follows = sequelize.define(
  'follows',
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    designerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'designers',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Follows;
