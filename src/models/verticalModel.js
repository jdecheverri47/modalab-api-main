import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Verticals = sequelize.define("verticals", {
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
}, {
  timestamps: false
});

export default Verticals;