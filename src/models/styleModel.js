import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Style = sequelize.define(
  "styles",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default Style;
