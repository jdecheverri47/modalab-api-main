import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Favorites = sequelize.define(
  'favorites',
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Favorites;
