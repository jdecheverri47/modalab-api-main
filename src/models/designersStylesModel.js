import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DesignerStyle = sequelize.define(
  "designers_styles",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    designer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    style_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: false }
);

export default DesignerStyle;
