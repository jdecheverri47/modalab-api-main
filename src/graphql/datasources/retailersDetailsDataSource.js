import { DataSource } from 'apollo-datasource';
import RetailersComp from '../../models/retailersCompModel.js';

class RetailersDetailsAPI extends DataSource {
  constructor({ sequelize }) {
    super();
    this.sequelize = sequelize; // Guarda la instancia de Sequelize
  }

  async createRetailerDetails(details) {
    return await RetailersComp.create(details);
  }

  async getRetailersDetailsByCompanyId(company_id) {
    return await RetailersComp.findOne({ where: { company_id } });
  }

  async getRetailersDetailsById(id) {
    return await RetailersComp.findByPk(id);
  }
}

export default RetailersDetailsAPI;
