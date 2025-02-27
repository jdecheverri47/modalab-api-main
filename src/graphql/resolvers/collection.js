import { hasRole } from "../../config/authorization.js";

const collectionsResolvers = {
  Mutation: {
    createCollection: async (parent, { input }, { dataSources, user }) => {
      hasRole({ user }, ['admin']);
      const designer = await dataSources.designerAPI.getDesignerBySlug(input.designer_slug);

      if (!designer) {
        throw new Error("Designer not found");
      }

      const collection = await dataSources.collectionsAPI.createCollection({
        name: input.name,
        designer_id: designer.id
      });


      return {
        message: "Collection created successfully!",
        collection
      };
    },

    deleteCollection: async (parent, { input }, { dataSources, user }) => {
      hasRole({ user }, ['admin']);
      const designer = await dataSources.designerAPI.getDesignerBySlug(input.designer_slug);

      if (!designer) {
        throw new Error("Designer not found");
      }

      const collection = await dataSources.collectionsAPI.deleteCollection({
        name: input.name,
        designerId: designer.id
      });


      return {
        message: "Collection deleted successfully!",
        collection
      };
    },
  },
};

export default collectionsResolvers;
