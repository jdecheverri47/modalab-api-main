import { DataSource } from "apollo-datasource";

class OrderDetailAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models;
  }

  // Obtener los detalles de una orden
  async getOrderDetailsByOrderId(orderId) {
    return await this.models.OrderDetail.findAll({
      where: { order_id: orderId }
    });
  }

  // Otros métodos si es necesario...
}

export default OrderDetailAPI;
