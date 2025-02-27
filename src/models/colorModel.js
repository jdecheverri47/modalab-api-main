import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Color = sequelize.define("color", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hex: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand_color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Color;
