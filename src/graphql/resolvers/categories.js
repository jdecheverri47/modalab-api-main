import { hasRole } from "../../config/authorization.js";

const categoriesResolvers = {
  Query: {
    CategoryTree: async (_, __, { dataSources }) => {
      return dataSources.verticalsAPI.getVerticals();
    },
  },
  Vertical: {
    categories: (parent) => parent.categories,
  },
  Category: {
    subcategories: (parent) => parent.subcategories,
  },
  Mutation: {
    createCategory: async (parent, { input }, { dataSources, user }) => {
      hasRole({ user }, ['admin']);
      const category = await dataSources.categoriesAPI.createCategory(input);
      return {
        message: "Category created successfully!",
        category
      };
    },
    deleteCategory: async (parent, { id }, { dataSources, user }) => {
      hasRole({ user }, ['admin']);
      const category = await dataSources.categoriesAPI.deleteCategory(id);
      return {
        message: "Category deleted successfully!",
        category
      };
    },
  },
};

export default categoriesResolvers;