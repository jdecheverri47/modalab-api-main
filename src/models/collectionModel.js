import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Designer from "./designerModel.js";

const Collections = sequelize.define("collections", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  season: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  order_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_window_start: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  order_window_end: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  delivery_window_start: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  delivery_window_end: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  lookbook: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  designer_id: {
    type: DataTypes.INTEGER,
    references: {
      model: "designers",
      key: "id",
    },
    allowNull: false,
  },
});

Collections.belongsTo(Designer, { foreignKey: "designer_id", as: "designer" });
Designer.hasMany(Collections, { foreignKey: "designer_id", as: "collections" });

export default Collections;
