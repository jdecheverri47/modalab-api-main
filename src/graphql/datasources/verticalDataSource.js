import { DataSource } from 'apollo-datasource';
import { Categories, Product, Subcategories, Verticals, Designer, Collections, Variant, Color } from '../../models/index.js';
import sequelize from '../../config/database.js';

class VerticalsAPI extends DataSource {
  constructor({ sequelize }) {
    super();
    this.sequelize = sequelize; // Guarda la instancia de Sequelize
  }

  async getAllVerticals() {
    return await Verticals.findAll();
  }

  async getVerticalById(id) {
    return await Verticals.findByPk(id);
  }

  async createVertical({ name }) {
    return await Verticals.create({
      name
    });
  }

  async findVerticalByName(name) {
    return await Verticals.findOne({
      where: { name }
    });
  }

  async findOrCreateVertical({ name }) {
    return await Verticals.findOrCreate({
      where: { name }
    });
  }

  async getVerticals(filters, priceFilter) {
    return Verticals.findAll({
      include: [{
        model: Categories,
        as: 'categories',
        required: true,
        include: [{
          model: Subcategories,
          as: 'subcategories',
          required: true,
          include: [
            {
              model: Product,
              as: 'products',
              attributes: [],
              required: true,
              where: {
                ...(priceFilter)
              },
              include: [
                {
                  model: Designer,
                  as: 'designer',
                  required: filters?.designer_slug ? true : false,
                  where: filters?.designer_slug ? { slug: filters.designer_slug } : undefined,
                  attributes: ['slug']
                },
                {
                  model: Collections,
                  as: 'collection',
                  required: filters?.collection || filters?.order_type || filters?.season || filters?.year ? true : false,
                  where: {
                    ...(filters?.collection && { name: filters.collection }),
                    ...(filters?.order_type && { order_type: filters.order_type }),
                    ...(filters?.season && { season: filters.season }),
                    ...(filters?.year && { year: filters.year }),
                  },
                  attributes: []
                },
                {
                  model: Variant,
                  as: 'variants',
                  required: filters?.colors ? true : false,
                  attributes: [],
                  include: [
                    {
                      model: Color,
                      as: 'color',
                      attributes: ['name', 'hex', 'brand_color'],
                      required: filters?.colors ? true : false,
                      where: filters?.colors ? { name: filters.colors } : undefined
                    }
                  ]
                }
              ]
            }
          ]
        }]
      }]
    });
  }

}

export default VerticalsAPI;
