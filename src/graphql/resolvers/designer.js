import { hasRole } from "../../config/authorization.js";

const designerResolvers = {
  Query: {
    designers: async (parent, { id, slug }, { dataSources }) => {
      if (id) {
        const designerById = await dataSources.designerAPI.getDesignerById(id);
        return [designerById];
      }

      if (slug) {
        const designerBySlug = await dataSources.designerAPI.getDesignerBySlug(
          slug
        );
        return [designerBySlug];
      }

      const allDesigners = await dataSources.designerAPI.getAllDesigners();
      return allDesigners;
    },
  },
  Mutation: {
    registerDesigner: async (parent, { input }, { dataSources, user }) => {
      hasRole({ user }, ["admin"]);
      return await dataSources.designerAPI.createDesigner(input);
    },
  },
  Designer: {
    isFollowedByCurrentUser: async (designer, _, { dataSources, user }) => {
      if (!user) {
        return false;
      }
      return dataSources.followAPI.isFollowing(user.id, designer.id);
    },
    m_favorite: async (parent, args, { dataSources }) => {
      console.log(parent.id);
      return await dataSources.productAPI.getModalabFavorites(parent.id);
    },
    styles: async (parent, _, { dataSources }) => {
      try {
        const styles = await dataSources.designerAPI.getStylesByDesigner(
          parent.id
        );

        return styles.map((style) => style.name);
      } catch (error) {
        console.error("Error en styles:", error);
        return [];
      }
    },
  },
};

export default designerResolvers;
