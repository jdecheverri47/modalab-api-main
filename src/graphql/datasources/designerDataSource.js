import { DataSource } from "apollo-datasource";
import Designer from "../../models/designerModel.js"; // Asegúrate de que la ruta sea correcta
import DesignerInfo from "../../models/designerInfoModel.js";

class DesignerAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models; // Guarda la instancia de Sequelize
  }

  async getDesignerById(id) {
    return await this.models.Designer.findByPk(id);
  }

  async findDesignersByIds(designerIds) {
    return await this.models.Designer.findAll({
      where: {
        id: designerIds,
      },
    });
  }

  async getDesignerBySlug(slug) {
    return await this.models.Designer.findOne({
      where: { slug },
      include: [
        {
          model: this.models.DesignerInfo,
          as: "designer_info",
          attributes: [
            "physical_store",
            "current_stockists",
            "categories",
            "wholesale_markup",
            "wholesale_price_start",
            "wholesale_price_end",
            "brand_values",
            "retail_price_start",
            "retail_price_end",
            "minimum_order_quantity",
            "minimum_value",
            "website",
            "social_media",
          ],
        },
      ],
    });
  }

  async getAllDesigners() {
    return await this.models.Designer.findAll({
      order: [["name", "ASC"]],
    });
  }

  async createDesigner(designerInput) {
    return await this.models.Designer.create(designerInput);
  }

  async updateDesigner(id, designerInput) {
    const designer = await this.models.Designer.findByPk(id);
    if (designer) {
      return await designer.update(designerInput);
    }
    return null;
  }

  async deleteDesigner(id) {
    const designer = await this.models.Designer.findByPk(id);
    if (designer) {
      await designer.destroy();
      return designer;
    }
    return null;
  }

  async getStylesByDesigner(designerId) {
    return await this.models.Style.findAll({
      include: [
        {
          model: this.models.Designer,
          as: "designers",
          where: { id: designerId },
          through: { attributes: [] }, // Excluye datos de la tabla pivote
        },
      ],
    });
  }
}

export default DesignerAPI;
