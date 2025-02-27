import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Verticals from "./verticalModel.js";

const Categories = sequelize.define("categories", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  vertical_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Verticals,
      key: 'id'
    },
  }

}, {
  timestamps: false
});

Verticals.hasMany(Categories, { foreignKey: 'vertical_id', as: 'categories' });
Categories.belongsTo(Verticals, { foreignKey: 'vertical_id', as: 'vertical' });

export default Categories;