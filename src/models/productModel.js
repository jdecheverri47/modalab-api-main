// models/productModel.js

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// No importamos otros modelos aquí para evitar dependencias circulares

const Product = sequelize.define(
  "products",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      initialAutoIncrement: 100000,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    composition: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    product_care: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    main_image: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    other_images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    tag: {
      type: DataTypes.STRING,
    },
    detail_bullets: {
      type: DataTypes.TEXT,
    },
    weight: {
      type: DataTypes.FLOAT,
    },
    wholesale_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    retail_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    collection_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "collections",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    designer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "designers",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    vertical_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "verticals",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "categories",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    m_favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    delivery_window_start: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    delivery_window_end: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    style: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    related_products: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
  },
  {
    initialAutoIncrement: 100000,
  }
);

export default Product;
