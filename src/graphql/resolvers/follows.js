const followResolvers = {
  Query: {
    // Obtiene los diseñadores seguidos por el usuario actual
    followedDesigners: async (_, __, { dataSources, user }) => {
      return dataSources.followAPI.getFollowedDesigners(user.id);
    },

    // Verifica si el usuario sigue a un diseñador específico
    isFollowingDesigner: async (_, { designerId }, { dataSources, user }) => {
      return dataSources.followAPI.isFollowing(user.id, designerId);
    },
  },

  Mutation: {
    // Sigue a un diseñador
    followDesigner: async (_, { designerId }, { dataSources, user }) => {
      await dataSources.followAPI.followDesigner(user.id, designerId);
      return { message: "Designer followed" };
    },

    // Deja de seguir a un diseñador
    unfollowDesigner: async (_, { designerId }, { dataSources, user }) => {
      await dataSources.followAPI.unfollowDesigner(user.id, designerId);
      return { message: "Designer unfollowed" };
    },
  },
};

export default followResolvers;
