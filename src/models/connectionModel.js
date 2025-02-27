import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Connections = sequelize.define(
  "connections",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACCEPTED", "IGNORED"),
      defaultValue: "PENDING",
      allowNull: false,
    },
    connectionType: {
      type: DataTypes.ENUM("BRAND_REP", "REP_RETAILER"),
      allowNull: false,
    },
  },
  {
    tableName: "connections",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["requesterId", "receiverId"],
      },
    ],
  }
);

export default Connections;
