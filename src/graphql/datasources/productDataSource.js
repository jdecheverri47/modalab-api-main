import { DataSource } from "apollo-datasource";
import { Op } from "sequelize";
import {
  Subcategories,
  Categories,
  Verticals,
  Variant,
  Color,
  Product,
  Collections,
  Designer,
  DesignerInfo,
} from "../../models/index.js";

class ProductAPI extends DataSource {
  constructor({ sequelize }) {
    super();
    this.sequelize = sequelize;
  }

  async listProducts(options) {
    const { minPrice, ...otherFilters } = options;

    // Filtro condicional si `minPrice` está presente
    const priceCondition = minPrice
      ? { wholesale_price: { [Op.gte]: minPrice } }
      : {};

    return await Product.findAll({
      where: {
        ...otherFilters,
        ...priceCondition,
      },
      include: [
        {
          model: Variant,
          include: [Color],
        },
      ],
    });
  }

  async getProductById(id, options = {}) {
    return await Product.findByPk(id, options);
  }

  async getProductBySlug(slug) {
    return await Product.findOne({
      where: {
        slug,
      },
      include: [
        {
          model: Variant,
          as: "variants",
          include: [
            {
              model: Color,
              as: "color",
            },
          ],
        },
        {
          model: Collections,
          as: "collection",
          attributes: [
            "order_type",
            "delivery_window_start",
            "delivery_window_end",
            "order_window_start",
            "order_window_end",
            "name",
            "season",
            "year",
          ],
        },
        {
          model: Subcategories,
          as: "subcategories",
        },
        {
          model: Categories,
          as: "category",
        },
        {
          model: Verticals,
          as: "vertical",
        },
        {
          model: Designer,
          as: "designer",
          include: [
            {
              model: DesignerInfo,
              as: "designer_info",
              attributes: ["size_chart"],
            },
          ],
        },
      ],
    });
  }

  // Obtener todos los productos, incluyendo variantes y colores
  async getAllProducts(options = {}) {
    return await Product.findAll(options);
  }

  // Método para obtener productos por categoría
  async getProductsByCategory(category) {
    return await Product.findAll({
      where: {
        categories: {
          [Op.contains]: [category], // Si categories es un array en la base de datos
        },
      },
      include: [
        {
          model: Variant,
          include: [Color], // Incluir variantes y colores
        },
      ],
    });
  }

  // Método para obtener productos por diseñador
  async getProductsByDesigner(designer_slug) {
    return await Product.findAll({
      where: {
        designer_slug,
      },
      include: [
        {
          model: Variant,
          include: [Color],
        },
      ],
    });
  }

  async assignProductToSubcategories({ product_id, subcategories }) {
    // Iterar sobre cada subcategoría para crear la relación en la tabla intermedia
    for (const subcategory of subcategories) {
      await ProductSubcategories.findOrCreate({
        where: {
          product_id: product_id,
          subcategory_id: subcategory, // El campo id de la subcategoría
        },
      });
    }
  }

  // Crear un producto nuevo
  async createProduct(input) {
    return await Product.create(input);
  }

  async getProductCount(options) {
    return await Product.count(options); // Usamos `count` en lugar de `findAll` para contar los registros
  }

  // Crear una nueva variante
  async createVariant(input) {
    return await Variant.create(input);
  }

  // Crear un nuevo color
  async createColor(input) {
    return await Color.create(input);
  }

  // Actualizar un producto existente
  async updateProduct(id, input) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error("Product not found");
    await product.update(input);
    return product;
  }

  // Eliminar un producto
  async deleteProduct(id) {
    const product = await this.getProductById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    await product.destroy(); // Sequelize elimina automáticamente las variantes por 'CASCADE'
    return true;
  }

  async getColors(filters, priceFilter) {
    return await Color.findAll({
      attributes: [
        [this.sequelize.fn("MIN", this.sequelize.col("color.id")), "color_id"],
        "name",
      ],
      include: [
        {
          model: Variant,
          as: "variants",
          attributes: [],
          required: true,
          include: [
            {
              model: Product,
              attributes: [],
              as: "products",
              required: true,
              where: {
                ...priceFilter,
              },
              include: [
                {
                  model: Designer,
                  as: "designer",
                  required: true,
                  attributes: [],
                  where: filters?.designer_slug
                    ? { slug: filters.designer_slug }
                    : undefined,
                },
                {
                  model: Subcategories,
                  as: "subcategories",
                  attributes: [],
                  required: true,
                  where: filters?.subcategories
                    ? { name: { [Op.in]: filters.subcategories } }
                    : undefined,
                  through: { attributes: [] },
                },
                {
                  model: Categories,
                  as: "category",
                  required: true,
                  where: filters?.category
                    ? { name: filters.category }
                    : undefined,
                  attributes: [],
                },
                {
                  model: Verticals,
                  as: "vertical",
                  required: true,
                  where: filters?.vertical
                    ? { name: filters.vertical }
                    : undefined,
                  attributes: [],
                },
                {
                  model: Collections,
                  as: "collection",
                  required: true,
                  where: {
                    ...(filters?.collection && { name: filters.collection }),
                    ...(filters?.order_type && {
                      order_type: filters.order_type,
                    }),
                    ...(filters?.season && { season: filters.season }),
                    ...(filters?.year && { year: filters.year }),
                  },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
      group: ["color.name", "color.id"],
    });
  }

  async getModalabFavorites(designer_id) {
    return await Product.findAll({
      where: {
        designer_id,
        m_favorite: true,
      },
      include: [
        {
          model: Variant,
          as: "variants",
          include: [
            {
              model: Color,
              as: "color",
            },
          ],
        },
        {
          model: Collections,
          as: "collection",
        },
        {
          model: Subcategories,
          as: "subcategories",
        },
        {
          model: Categories,
          as: "category",
        },
        {
          model: Verticals,
          as: "vertical",
        },
        {
          model: Designer,
          as: "designer",
        },
      ],
      order: [[{ model: Collections, as: "collection" }, "year", "DESC"]], // Ordena del año más alto al más bajo
    });
  }

  async countProducts(options = {}) {
    const count = await Product.count(options);
    return count;
  }
}

export default ProductAPI;
