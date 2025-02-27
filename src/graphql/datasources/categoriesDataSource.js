import { DataSource } from 'apollo-datasource';
import Categories from '../../models/categoryModel.js';

class CategoriesAPI extends DataSource {
  constructor({ sequelize }) {
    super();
    this.sequelize = sequelize; // Guarda la instancia de Sequelize
  }

  async createCategory({ name, parent_id }) {
    return await Categories.create({
      name,
      parent_id
    });
  }

  async getCategoriesByVerticalId(vertical_id) {
    return await Categories.findAll({
      where: { vertical_id }
    });
  }

  async findCategoryByName(name, vertical_id) {
    return await Categories.findOne({
      where: { name, vertical_id }
    });
  }

  async findOrCreateCategory({ name, vertical_id }) {
    return await Categories.findOrCreate({
      where: { name, vertical_id }
    });
  }

  async findCategoryById(id) {
    return await Categories.findByPk(id);
  }
}

export default CategoriesAPI;