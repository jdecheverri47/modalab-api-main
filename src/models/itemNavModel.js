import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Navigator from "./navigatorModel.js";

const ItemNav = sequelize.define("navigator_item", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  navigator_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Navigator,
      key: 'id'
    }
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

ItemNav.belongsTo(Navigator, { foreignKey: 'navigator_id' });
Navigator.hasMany(ItemNav, { foreignKey: 'navigator_id' });


export default ItemNav;
