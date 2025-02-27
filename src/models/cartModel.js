import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cart = sequelize.define(
  'carts',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Cart;
