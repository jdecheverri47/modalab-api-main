import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Companies from "./companiesModel.js";

const RetailersComp = sequelize.define("retailer_details", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Companies,
      key: 'id'
    },
    onDelete: 'CASCADE', // Esto elimina las compañías relacionadas si se elimina un usuario
    onUpdate: 'CASCADE'
  },
  social_media: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  }

});

RetailersComp.belongsTo(Companies, { foreignKey: 'company_id', as: 'company_details' });
Companies.hasOne(RetailersComp, { foreignKey: 'company_id', as: 'retailer_details' });

export default RetailersComp;