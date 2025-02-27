import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Designer from "./designerModel.js";

const DesignerInfo = sequelize.define(
  "designer_info",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    physical_store: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    current_stockists: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    categories: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    wholesale_markup: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    wholesale_price_start: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    wholesale_price_end: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    brand_values: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    retail_price_start: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    retail_price_end: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    social_media: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    designer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "designers",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    minimum_order_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    minimum_value: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    size_chart: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  {
    tableName: "designer_info",
    timestamps: true,
  }
);

DesignerInfo.belongsTo(Designer, {
  foreignKey: "designer_id",
  as: "designer_details",
});
Designer.hasOne(DesignerInfo, {
  foreignKey: "designer_id",
  as: "designer_info",
});
export default DesignerInfo;
