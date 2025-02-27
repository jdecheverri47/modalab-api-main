import { hasRole } from "../../config/authorization.js";
import Variant from "../../models/variantModel.js";
import Color from "../../models/colorModel.js";
import Designer from "../../models/designerModel.js";
import Collections from "../../models/collectionModel.js";
import Categories from "../../models/categoryModel.js";
import { Op } from "sequelize";
import Verticals from "../../models/verticalModel.js";
import Subcategories from "../../models/subcategoriesModel.js";
import { DesignerInfo, Product, Style } from "../../models/index.js";

const productResolvers = {
  Query: {
    product: async (_, { slug }, { dataSources }) => {
      const product = await dataSources.productAPI.getProductBySlug(slug);

      return product;
    },

    products: async (_, __, { dataSources }) => {
      return dataSources.productAPI.getAllProducts({
        include: [
          {
            model: Variant,
            include: [Color],
          },
        ],
      });
    },

    listProducts: async (
      _,
      { filters, page = 1, limit = 160 },
      { dataSources }
    ) => {
      const offset = (page - 1) * limit;
      const validSortDirections = ["ASC", "DESC"];
      let orderClause;
      if (filters?.sort_by_price) {
        const sortDirection = filters.sort_by_price.toUpperCase();
        if (validSortDirections.includes(sortDirection)) {
          orderClause = [["wholesale_price", sortDirection]];
        } else {
          throw new Error('El valor de sort_by_price debe ser "asc" o "desc".');
        }
      }

      const createProductFilters = (filters) => ({
        ...(filters?.available !== undefined && {
          available: filters.available,
        }),
        ...(filters?.m_favorite !== undefined && {
          m_favorite: filters.m_favorite,
        }),
      });

      const createWholesalePriceFilter = (filters) => {
        if (filters?.wholesale_price_range) {
          switch (filters.wholesale_price_range) {
            case "less_than_100":
              return { wholesale_price: { [Op.lt]: 100 } };
            case "between_100_and_250":
              return { wholesale_price: { [Op.between]: [100, 250] } };
            case "more_than_250":
              return { wholesale_price: { [Op.gt]: 250 } };
            default:
              throw new Error("Valor no válido para wholesale_price_range");
          }
        }
        return {}; // Si no hay filtro de precio, devuelve un objeto vacío
      };

      const createRetailPriceFilter = (filters) => {
        if (filters?.retail_price_range) {
          switch (filters.retail_price_range) {
            case "less_than_500":
              return { retail_price: { [Op.lt]: 500 } };
            case "between_500_and_1500":
              return { retail_price: { [Op.between]: [500, 1500] } };
            case "more_than_1500":
              return { retail_price: { [Op.gt]: 1500 } };
            default:
              throw new Error("Valor no válido para retail_price_range");
          }
        }
        return {}; // Si no hay filtro de precio, devuelve un objeto vacío
      };

      const createCollectionFilters = (filters) => ({
        ...(filters?.designer_slug && {
          "$designer.slug$": filters.designer_slug,
        }),
        ...(filters?.season && { season: filters.season }),
        ...(filters?.order_type && { order_type: filters.order_type }),
        ...(filters?.year && { year: filters.year }),
      });

      const queryProductFilters = createProductFilters(filters);
      const priceFilter = {
        ...createWholesalePriceFilter(filters),
        ...createRetailPriceFilter(filters),
      };
      const queryCollectionFilters = createCollectionFilters(filters);

      const [
        products,
        totalProducts,
        collections,
        designers,
        categoryTree,
        colors,
      ] = await Promise.all([
        dataSources.productAPI.getAllProducts({
          where: {
            ...queryProductFilters,
            ...priceFilter,
          },
          include: [
            {
              model: Variant,
              as: "variants",
              include: [
                {
                  model: Color,
                  as: "color",
                  attributes: ["name", "hex", "brand_color"],
                  required: !!filters?.colors,
                  where: filters?.colors
                    ? { name: { [Op.in]: filters.colors } }
                    : undefined,
                },
              ],
            },
            {
              model: Designer,
              attributes: ["name", "slug"],
              as: "designer",
              required: !!filters?.designer_slug,
              where: filters?.designer_slug
                ? { slug: filters.designer_slug }
                : undefined,
              include: [
                {
                  model: DesignerInfo,
                  as: "designer_info",
                  attributes: ["size_chart"],
                },
              ],
            },
            {
              model: Collections,
              attributes: ["name", "year", "order_type", "season", "lookbook"],
              as: "collection",
              required:
                filters?.collection ||
                filters?.order_type ||
                filters?.season ||
                filters?.year,
              where: {
                ...(filters?.collection && { name: filters.collection }),
                ...(filters?.order_type && {
                  order_type: filters.order_type,
                }),
                ...(filters?.season && { season: filters.season }),
                ...(filters?.year && { year: filters.year }),
              },
            },
            {
              model: Categories,
              attributes: ["name"],
              as: "category",
              required: !!filters?.category,
              where: filters?.category ? { name: filters.category } : undefined,
            },
            {
              model: Verticals,
              attributes: ["name"],
              as: "vertical",
              required: !!filters?.vertical,
              where: filters?.vertical ? { name: filters.vertical } : undefined,
            },
            {
              model: Subcategories,
              attributes: ["name"],
              as: "subcategories",
              through: { attributes: [] },
              required: !!filters?.subcategories,
              where: filters?.subcategories
                ? { name: { [Op.in]: filters.subcategories } }
                : undefined,
            },
          ],
          ...(orderClause && { order: orderClause }),
          offset,
          limit,
        }),
        dataSources.productAPI.countProducts({
          where: {
            ...queryProductFilters,
            ...priceFilter,
          },
          include: [
            {
              model: Variant,
              as: "variants",
              include: [
                {
                  model: Color,
                  as: "color",
                  attributes: ["name", "hex", "brand_color"],
                  required: !!filters?.colors,
                  where: filters?.colors
                    ? { name: { [Op.in]: filters.colors } }
                    : undefined,
                },
              ],
            },
            {
              model: Designer,
              attributes: ["name", "slug"],
              as: "designer",
              required: !!filters?.designer_slug,
              where: filters?.designer_slug
                ? { slug: filters.designer_slug }
                : undefined,
            },
            {
              model: Collections,
              attributes: ["name", "year", "order_type", "season"],
              as: "collection",
              required:
                filters?.collection ||
                filters?.order_type ||
                filters?.season ||
                filters?.year,
              where: {
                ...(filters?.collection && { name: filters.collection }),
                ...(filters?.order_type && {
                  order_type: filters.order_type,
                }),
                ...(filters?.season && { season: filters.season }),
                ...(filters?.year && { year: filters.year }),
              },
            },
            {
              model: Categories,
              attributes: ["name"],
              as: "category",
              required: !!filters?.category,
              where: filters?.category ? { name: filters.category } : undefined,
            },
            {
              model: Verticals,
              attributes: ["name"],
              as: "vertical",
              required: !!filters?.vertical,
              where: filters?.vertical ? { name: filters.vertical } : undefined,
            },
            {
              model: Subcategories,
              attributes: ["name"],
              as: "subcategories",
              through: { attributes: [] },
              required: !!filters?.subcategories,
              where: filters?.subcategories
                ? { name: { [Op.in]: filters.subcategories } }
                : undefined,
            },
          ],
          distinct: true,
          col: "id",
        }),
        dataSources.collectionsAPI.getAllCollections({
          where: queryCollectionFilters,
          include: [
            {
              model: Designer,
              as: "designer",
            },
            {
              model: Product,
              as: "products",
              attributes: [],
              required: true,
              where: {
                ...priceFilter,
              },
              include: [
                {
                  model: Subcategories,
                  as: "subcategories",
                  attributes: [],
                  through: { attributes: [] },
                  required: !!filters?.subcategories,
                  where: filters?.subcategories
                    ? { name: { [Op.in]: filters.subcategories } }
                    : undefined,
                },
                {
                  model: Categories,
                  as: "category",
                  attributes: [],
                  required: !!filters?.category,
                  where: filters?.category
                    ? { name: filters.category }
                    : undefined,
                },
                {
                  model: Verticals,
                  as: "vertical",
                  attributes: [],
                  required: !!filters?.vertical,
                  where: filters?.vertical
                    ? { name: filters.vertical }
                    : undefined,
                },
                {
                  model: Variant,
                  as: "variants",
                  attributes: [],
                  required: !!filters?.colors,
                  include: [
                    {
                      model: Color,
                      as: "color",
                      attributes: [],
                      required: !!filters?.colors,
                      where: filters?.colors
                        ? { name: { [Op.in]: filters.colors } }
                        : undefined,
                    },
                  ],
                },
              ],
            },
          ],
          subQuery: false,
          order: [["createdAt", "DESC"]],
        }),
        dataSources.designerAPI.getAllDesigners({
          include: [
            {
              model: Product,
              as: "products",
              attributes: [],
              required: true,
              include: [
                {
                  model: Subcategories,
                  as: "subcategories",
                  attributes: [],
                  through: { attributes: [] },
                  required: !!filters?.subcategories,
                  where: filters?.subcategories
                    ? { name: { [Op.in]: filters.subcategories } }
                    : undefined,
                },
                {
                  model: Categories,
                  as: "category",
                  attributes: [],
                  required: !!filters?.category,
                  where: filters?.category
                    ? { name: filters.category }
                    : undefined,
                },
                {
                  model: Verticals,
                  as: "vertical",
                  attributes: [],
                  required: !!filters?.vertical,
                  where: filters?.vertical
                    ? { name: filters.vertical }
                    : undefined,
                },
              ],
            },
            {
              model: Style,
              as: "styles",
              attributes: [],
              required: !!filters?.styles,
              through: { attributes: [] },
              where: filters?.styles
                ? { name: { [Op.in]: filters.styles } }
                : undefined,
            },
          ],
          subQuery: false,
        }),
        dataSources.verticalsAPI.getVerticals(filters, priceFilter),
        dataSources.productAPI.getColors(filters, priceFilter),
      ]);

      const filter_colors = Array.from(
        new Set(colors.map((color) => color.name))
      ).map((name) => ({ name }));

      const order_type = collections.reduce((acc, collection) => {
        if (
          collection.order_type &&
          !acc.some((item) => item.type === collection.order_type)
        ) {
          acc.push({ type: collection.order_type });
        }
        return acc;
      }, []);

      const seasons = collections
        .reduce((acc, collection) => {
          if (collection.season) {
            const seasonName = collection.season;
            const seasonYear = collection.year || 0;

            const exists = acc.some(
              (item) => item.name === seasonName && item.year === seasonYear
            );
            if (!exists) {
              acc.push({ name: seasonName, year: seasonYear });
            }
          }
          return acc;
        }, [])
        .sort((a, b) => b.year - a.year);

      return {
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        collections,
        designers,
        categoryTree,
        filter_colors,
        order_type,
        seasons,
      };
    },
  },

  Product: {
    designer_slug: (product) => product.designer?.slug,
    designer_name: (product) => product.designer?.name,
    collection_name: (product) => product.collection?.name,
    vertical: (product) => product.vertical?.name,
    category: (product) => product.category?.name,
    subcategories: (product) =>
      product.subcategories?.map((subcategory) => subcategory.name) || [],
    season: (product) => product.collection?.season,
    suggested_products: async (parent, args, { models }) => {
      const relatedIds = parent.related_products;
      if (!relatedIds || relatedIds.length === 0) return [];

      return await models.Product.findAll({
        where: {
          id: {
            [Op.in]: relatedIds,
          },
        },
        include: [
          {
            model: Variant,
            as: "variants",
            include: [
              {
                model: Color,
                as: "color",
                attributes: ["name", "hex", "brand_color"],
              },
            ],
          },
          {
            model: Designer,
            attributes: ["name", "slug"],
            as: "designer",
          },
          {
            model: Collections,
            attributes: ["name", "year", "order_type", "season"],
            as: "collection",
          },
          {
            model: Categories,
            attributes: ["name"],
            as: "category",
          },
          {
            model: Verticals,
            attributes: ["name"],
            as: "vertical",
          },
          {
            model: Subcategories,
            attributes: ["name"],
            as: "subcategories",
            through: { attributes: [] },
          },
        ],
      });
    },
    size_chart: (product) => product.designer?.designer_info?.size_chart || [],
  },

  Mutation: {
    uploadProduct: async (_, { input }, { dataSources }) => {
      // 1. Buscar el diseñador por su slug
      const designer = await dataSources.designerAPI.getDesignerBySlug(
        input.designer_slug
      );
      console.log(designer.id);
      // Si no se encuentra el diseñador, devolver un error
      if (!designer) {
        throw new Error("Designer not found");
      }

      // 2. Buscar la colección por el nombre y el designerId
      const collection =
        await dataSources.collectionsAPI.findCollectionByNameAndDesigner({
          collection_name: input.collection_name,
          designer_id: designer.id,
        });

      // Si no se encuentra la colección, devolver un error
      if (!collection) {
        throw new Error("Collection not found for this designer");
      }

      const [vertical, createdVertical] =
        await dataSources.verticalsAPI.findOrCreateVertical({
          name: input.vertical,
        });
      if (!vertical) {
        throw new Error("Vertical not found");
      }

      const [category, createdCategory] =
        await dataSources.categoriesAPI.findOrCreateCategory({
          vertical_id: vertical.id,
          name: input.category,
        });
      if (!category) {
        throw new Error("Category not found");
      }

      const subcategories =
        await dataSources.subcategoriesAPI.findOrCreateSubcategories({
          category_id: category.id,
          subcategories: input.subcategories,
        });

      console.log(Array.isArray(subcategories));
      // 3. Crear el producto usando el dataSource productsAPI y pasar el collectionId
      const product = await dataSources.productAPI.createProduct({
        name: input.name,
        description: input.description,
        composition: input.composition,
        product_care: input.product_care,
        main_image: input.main_image,
        other_images: input.other_images,
        season: input.season,
        slug: input.slug,
        tag: input.tag,
        detail_bullets: input.detail_bullets,
        wholesale_price: input.wholesale_price,
        retail_price: input.retail_price,
        weight: input.weight,
        collection_id: collection.id, // Usamos el `id` de la colección encontrada
        vertical_id: vertical.id,
        category_id: category.id,
        designer_id: designer.id,
      });

      // 4. Asignar el producto a las subcategorías
      await dataSources.productAPI.assignProductToSubcategories({
        product_id: product.id,
        subcategories: subcategories,
      });

      // 4. Crear las variantes asociadas al producto
      for (const variantInput of input.variants) {
        // Crear el color asociado con la variante
        const color = await dataSources.productAPI.createColor({
          name: variantInput.color.name,
          hex: variantInput.color.hex,
          brand_color: variantInput.color.brand_color,
        });

        // Crear la variante asociada al producto y al color
        await dataSources.productAPI.createVariant({
          product_id: product.id,
          color_id: color.id,
          sizes: variantInput.sizes,
          stock: variantInput.stock,
        });
      }

      return {
        message: "Product created successfully!",
      };
    },

    updateProduct: async (_, { id, input }, { dataSources, user }) => {
      hasRole({ user }, ["admin"]);
      return dataSources.productAPI.updateProduct(id, input);
    },

    deleteProduct: async (_, { id }, { dataSources, user }) => {
      hasRole({ user }, ["admin"]);
      const product = await dataSources.productAPI.getProductById(id);
      if (!product) {
        throw new Error("Product not found");
      }

      await product.destroy();
      return true;
    },
  },
};

export default productResolvers;
