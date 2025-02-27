import { DataSource } from "apollo-datasource";

class AddressesAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models; // Guarda la instancia de Sequelize
  }

  async createAddress(address) {
    return await this.models.Addresses.create(address);
  }

  async getAddressesByCompanyId(company_id) {
    return await this.models.Addresses.findAll({ where: { company_id } });
  }

  async getAddressesById(id) {
    return await this.models.Addresses.findByPk(id);
  }

  async getAddressesByUserId(user_id) {
    return await this.models.Addresses.findAll({
      include: {
        model: this.models.Companies,
        as: "company",
        where: { user_id },
      },
    });
  }

  async updateAddress(id, address) {
    await this.models.Addresses.update(address, { where: { id } });
    return await this.models.Addresses.findByPk(id);
  }

  async deleteAddress(id) {
    const address = await this.models.Addresses.findByPk(id);
    await this.models.Addresses.destroy({ where: { id } });
    return address;
  }
}

export default AddressesAPI;
