import { DataSource } from 'apollo-datasource';
import { Subcategories } from '../../models/index.js';

class SubcategoriesAPI extends DataSource {
  constructor({ sequelize }) {
    super();
    this.sequelize = sequelize; // Guarda la instancia de Sequelize
  }

  async createSubcategory({ name, category_id }) {
    return await Subcategories.create({
      name,
      category_id
    });
  }

  async findSubcategoryByName(name, category_id) {
    return await Subcategories.findOne({
      where: { name, category_id }
    });
  }

  async findSubcategoryById(id) {
    return await Subcategories.findByPk(id);
  }

  async getAllSubcategories() {
    return await Subcategories.findAll();
  }

  async getSubcategoriesByCategoryId(category_id) {
    return await Subcategories.findAll({
      where: { category_id }
    });
  }

  async findOrCreateSubcategories({ category_id, subcategories }) {
    const result = [];
    for (const subcategoryName of subcategories) {
      // Busca o crea cada subcategoría por separado
      const [subcategory, created] = await Subcategories.findOrCreate({
        where: {
          name: subcategoryName,
          category_id: category_id
        }
      });
  
      // Agrega la subcategoría al resultado
      result.push(subcategory.id);
    }

    console.log(result);
    return result;
  }
}

export default SubcategoriesAPI;
