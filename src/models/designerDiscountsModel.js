import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DesignerDiscount = sequelize.define('designer_discounts', {
  designer_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'designers',
      key: 'id'
    }
  },
  discount_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'discounts',
      key: 'id'
    }
  }
}, {
  timestamps: false
});

export default DesignerDiscount;
