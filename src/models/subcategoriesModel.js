import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Subcategories = sequelize.define("subcategories", {
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
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: "categories",
      key: 'id'
    },
  }
}, {
  timestamps: false
});

export default Subcategories;