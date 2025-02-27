import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Companies from "./companiesModel.js";

const Addresses = sequelize.define("addresses", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  more_info: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Companies,
      key: "id"
    },
    onDelete: 'CASCADE', // Esto elimina las compañías relacionadas si se elimina un usuario
    onUpdate: 'CASCADE'
  },
},
{
  timestamps: true
}
);

Addresses.belongsTo(Companies, { foreignKey: "company_id", as: "company" });
Companies.hasMany(Addresses, { foreignKey: "company_id", as: "addresses" });

export default Addresses;