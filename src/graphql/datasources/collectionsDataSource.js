import { DataSource } from 'apollo-datasource';
import Collections from '../../models/collectionModel.js';
import Designer from '../../models/designerModel.js';
import Verticals from '../../models/verticalModel.js';

class CollectionsAPI extends DataSource {
  constructor({ sequelize }) {
    super();
    this.sequelize = sequelize; // Guarda la instancia de Sequelize
  }

  async createCollection({ name, designer_id }) {
    return await Collections.create({
      name,
      designer_id
    });
  }

  async getAllCollectionsById(collectionsIds) {
    return await Collections.findAll({
      where: {
        id: collectionsIds
      }
    });
  }

  async findCollectionByName(name) {
    return await Collections.findOne({
      where: { name },
      include: [Designer]  // Incluir el diseñador relacionado, si es necesario
    });
  }

  async getAllCollections(options = {}) {
    return await Collections.findAll(options);
  }

  async findCollectionByNameAndDesigner({ collection_name, designer_id }) {
    return await Collections.findOne({
      where: {
        name: collection_name,
        designer_id
      }
    });
  }

  async getAllOrderTypes(filters) {
    return await Collections.findAll({
      include: [{
        model: Designer,
        as: 'designer',
        required: filters?.designer_slug ? true : false,
        where: filters?.designer_slug ? { slug: filters.designer_slug } : undefined,
        attributes: ['slug']
      },{
        model: Product,
        as: 'products',
        required: true,
        attributes: [],
        include: [
          {
            model: Variant,
            as: 'variants',
            required: true,
            attributes: [],
            include: [
              {
                model: Color,
                as: 'color',
                required: true,
                where: filters?.colors ? { name: { [Op.in]: filters.colors } } : undefined,
                attributes: []
              }
            ]
          },
          {
            model: Verticals,
            as: 'vertical',
            required: true,
            where: filters?.vertical ? { name: filters.vertical } : undefined,
            attributes: []
          },
          {
            model: Subcategories,
            as: 'subcategories',
            required: true,
            where: filters?.subcategories ? { name: { [Op.in]: filters.subcategories } } : undefined,
            attributes: [],
            through: { attributes: [] },
          },
          {
            model: Categories,
            as: 'category',
            required: true,
            where: filters?.category ? { name: filters.category } : undefined,
            attributes: [],
          }
        ]
      }]
    });

  }
}

export default CollectionsAPI;
