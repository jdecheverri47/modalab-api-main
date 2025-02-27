import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CartItem = sequelize.define(
  'cart_items',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'carts',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    colorName: {
      type: DataTypes.STRING,
      allowNull: false, // El nombre del color dentro de variants
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false, // Tamaño seleccionado (por ejemplo, "S", "M", "L")
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default CartItem;
