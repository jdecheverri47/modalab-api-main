import { DataSource } from "apollo-datasource";

class FavoritesAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models;
  }

  async getFavoritesByUser(userId) {
    return this.models.Favorites.findAll({
      where: { userId },
      include: [
        {
          model: this.models.Product,
          as: "product", // Alias si está definido en el modelo de asociación
          include: [
            { model: this.models.Designer, as: "designer" },
            { model: this.models.Categories, as: "category" },
            { model: this.models.Subcategories, as: "subcategories" },
            {
              model: this.models.Variant,
              as: "variants",
              include: [
                {
                  model: this.models.Color,
                  as: "color",
                  attributes: ["name", "hex", "brand_color"],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async addFavorite(userId, productId) {
    const [favorite, created] = await this.models.Favorites.findOrCreate({
      where: { userId, productId },
    });
    return created ? favorite : null;
  }

  async removeFavorite(userId, productId) {
    return this.models.Favorites.destroy({
      where: { userId, productId },
    });
  }
}

export default FavoritesAPI;
