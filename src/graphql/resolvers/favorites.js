const favoritesResolvers = {
  Query: {
    favorites: async (_, __, { user, dataSources }) => {
      if (!user) throw new Error('Not authenticated');
      const favorites = await dataSources.favoritesAPI.getFavoritesByUser(user.id);
      console.log(favorites)
      return favorites.map(fav => fav.product);
    },
  },

  Mutation: {
    addFavorite: async (_, { productId }, { user, dataSources }) => {
      console.log(typeof productId)
      if (!user) throw new Error('No autenticado');
      
      const favorite = await dataSources.favoritesAPI.addFavorite(user.id, productId);
      if (!favorite) throw new Error('Ya marcado como favorito');
      console.log(favorite)
      
      return { message: 'Producto agregado a favoritos exitosamente' };
    },
    
    removeFavorite: async (_, { productId }, { user, dataSources }) => {
      if (!user) throw new Error('No autenticado');
      
      const deletedCount = await dataSources.favoritesAPI.removeFavorite(user.id, productId);
      
      if (deletedCount > 0) {
        return { message: 'Producto eliminado de favoritos exitosamente' };
      } else {
        throw new Error('El producto no estaba en favoritos');
      }
    },
  },
};

export default favoritesResolvers;