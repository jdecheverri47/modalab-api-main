import { DataSource } from "apollo-datasource";
import Companies from "../../models/companiesModel.js";

class CompaniesAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models; // Guarda la instancia de Sequelize
  }

  async createCompany(companyData) {
    return await this.models.Companies.create(companyData);
  }

  async getCompanyById(id) {
    return await this.models.Companies.findByPk(id);
  }

  async getCompanyByUserId(user_id) {
    return await this.models.Companies.findOne({ where: { user_id } });
  }

  async getAllCompanies() {
    return await this.models.Companies.findAll();
  }
}

export default CompaniesAPI;
