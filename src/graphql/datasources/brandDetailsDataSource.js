import { DataSource } from 'apollo-datasource';
import DesignerInfo from '../../models/designerInfoModel.js';

class BrandDetailsAPI extends DataSource {
  constructor({ sequelize }) {
    super();
    this.sequelize = sequelize; // Guarda la instancia de Sequelize
  }

  async createBrandDetails(details) {
    return await DesignerInfo.create(details);
  }

  async getBrandDetailsById(id) {
    return await DesignerInfo.findByPk(id);
  }
}

export default BrandDetailsAPI;
