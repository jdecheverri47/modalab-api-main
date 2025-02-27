import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // Asegúrate de que esta ruta sea correcta

const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Asegura que el correo sea único
      validate: {
        isEmail: true, // Validación de formato de email
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user", // Valor predeterminado
      validate: {
        isIn: [["user", "admin", "designer", "rep"]], // Roles permitidos
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    job_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true, // Activa el manejo automático de createdAt y updatedAt
    defaultScope: {
      attributes: { exclude: ["password"] }, // Excluir la contraseña por defecto
    },
    scopes: {
      withPassword: {
        attributes: {}, // Incluir todos los atributos, incluyendo password
      },
    },
  }
);

export default User;
