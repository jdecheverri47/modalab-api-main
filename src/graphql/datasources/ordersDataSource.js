import { DataSource } from "apollo-datasource";

class OrdersAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models;
  }

  async getOrdersByUserId(userId) {
    return await this.models.Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: this.models.OrderDetail,
          as: "orderDetails"
        }
      ],
      order: [["order_date", "DESC"]]
    });
  }

  // Obtener una orden por ID
  async getOrderById(id) {
    return await this.models.Order.findByPk(id, {
      include: [
        {
          model: this.models.OrderDetail,
          as: "orderDetails"
        }
      ]
    });
  }

  // Obtener las órdenes de un usuario
  async getOrdersByUserId(userId) {
    return await this.models.Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: this.models.OrderDetail,
          as: "orderDetails"
        }
      ],
      order: [["order_date", "DESC"]]
    });
  }

  // Crear una nueva orden
  async createOrder({
    user_id,
    total_amount,
    stripe_payment_intent_id,
    products,
    addressId
  }) {
    // Iniciar una transacción para asegurar la atomicidad
    const transaction = await this.models.Order.sequelize.transaction();

    try {
      const prefix = "ORD";
      const timestamp = Date.now().toString(); // Timestamp único
      const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
      const serial_number = `${prefix}-${timestamp}-${randomDigits}`;

      // Crear la orden
      const order = await this.models.Order.create(
        {
          user_id,
          total_amount,
          stripe_payment_intent_id,
          addressId,
          serial_number
        },
        { transaction }
      );

      // Crear los detalles de la orden
      const orderDetailsData = products.map((product) => ({
        order_id: order.id,
        ...product
      }));

      await this.models.OrderDetail.bulkCreate(orderDetailsData, {
        transaction
      });

      // Confirmar la transacción
      await transaction.commit();

      // Obtener la orden completa con los detalles
      const createdOrder = await this.getOrderById(order.id);

      return createdOrder;
    } catch (error) {
      // Revertir la transacción en caso de error
      await transaction.rollback();
      throw error;
    }
  }

  // Actualizar el estado de una orden
  async updateOrderStatus(id, status) {
    const order = await this.models.Order.findByPk(id);

    if (!order) {
      throw new Error("Orden no encontrada");
    }

    order.status = status;
    await order.save();

    return await this.getOrderById(id);
  }
}

export default OrdersAPI;
