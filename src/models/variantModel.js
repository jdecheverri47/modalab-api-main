import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Color from "./colorModel.js";
import Product from "./productModel.js";

const Variant = sequelize.define('variant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sizes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'products',
      key: 'id',
    },
    onDelete: 'CASCADE', // Esto elimina las compañías relacionadas si se elimina un usuario
    onUpdate: 'CASCADE',
    allowNull: false
  },
  color_id: {  // Renombrado a camelCase
    type: DataTypes.INTEGER,
    references: {
      model: Color,
      key: 'id'
    }
  }
});

// Relaciones
Variant.belongsTo(Product, { foreignKey: 'product_id', as: 'products' }); // Relación con Product
Product.hasMany(Variant, { foreignKey: 'product_id', onDelete: 'CASCADE', as: 'variants' });

Variant.belongsTo(Color, { foreignKey: 'color_id', as: 'color' }); // Relación con Color
Color.hasMany(Variant, { foreignKey: 'color_id', as: 'variants' });

export default Variant;
