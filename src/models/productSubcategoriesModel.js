import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ProductSubcategories = sequelize.define('product_subcategories', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products', // Referencia al modelo de productos
      key: 'id'
    },
    onDelete: 'CASCADE', // Elimina la relación si el producto es eliminado
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subcategories', // Referencia al modelo de subcategorías
      key: 'id'
    },
    onDelete: 'CASCADE', // Elimina la relación si la subcategoría es eliminada
  }
}, {
  timestamps: false // No necesitas createdAt y updatedAt en esta tabla intermedia
});


export default ProductSubcategories;
