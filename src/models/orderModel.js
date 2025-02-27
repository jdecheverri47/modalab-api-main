import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Asegúrate de que esta ruta sea correcta

const Order = sequelize.define(
  "orders",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "addresses",
        key: "id"
      }
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "processed", "shipped", "delivered", "canceled"]]
      }
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "paid", "failed", "refunded"]]
      }
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stripe_charge_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serial_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Para asegurar que no se repitan los seriales
    }
  },
  {
    timestamps: true
  }
);

export default Order;
