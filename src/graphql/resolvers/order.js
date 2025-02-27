import { AuthenticationError, ForbiddenError } from "apollo-server";
import {
  sendOrderConfirmationToUser,
  sendOrderToAdmin
} from "../../config/emails.js";

const ordersResolvers = {
  Query: {
    // Obtener una orden por ID
    getOrder: async (parent, { id }, { dataSources, user }) => {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new AuthenticationError("No autenticado");
      }

      try {
        // Obtener la orden usando el data source
        const order = await dataSources.orderAPI.getOrderById(id);

        if (!order) {
          throw new Error("Orden no encontrada");
        }

        // Verificar que la orden pertenezca al usuario autenticado
        if (order.user_id !== user.id) {
          throw new ForbiddenError("No tienes permiso para ver esta orden");
        }

        return order;
      } catch (error) {
        console.error("Error al obtener la orden:", error);
        throw new Error("Ocurrió un error al obtener la orden");
      }
    },

    // Obtener las órdenes del usuario autenticado
    getMyOrders: async (parent, args, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("No autenticado");
      }

      try {
        const orders = await dataSources.orderAPI.getOrdersByUserId(user.id);
        return orders;
      } catch (error) {
        console.error("Error al obtener las órdenes del usuario:", error);
        throw new Error("Ocurrió un error al obtener tus órdenes");
      }
    }
  },

  Mutation: {
    // Crear una nueva orden
    createOrder: async (parent, { input }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("No autenticado");
      }

      try {
        const { products, stripe_payment_intent_id, addressId } = input;

        // Validar que haya productos en la orden
        if (!products || products.length === 0) {
          throw new Error("La orden debe contener al menos un producto");
        }

        // Calcular el total de la orden
        let totalAmount = 0;
        products.forEach((item) => {
          totalAmount += item.price * item.quantity;
        });

        const userData = await dataSources.userAPI.getUserById(user.id);

        // Obtener la dirección de envío
        const shippingAddress = await dataSources.addressesAPI.getAddressesById(
          addressId
        );

        // Crear la orden usando el data source
        const order = await dataSources.ordersAPI.createOrder({
          user_id: user.id,
          total_amount: totalAmount,
          stripe_payment_intent_id,
          products,
          addressId
        });
        await sendOrderToAdmin(
          userData,
          products,
          shippingAddress,
          totalAmount,
          order.serial_number
        );

        await sendOrderConfirmationToUser(
          userData,
          products,
          totalAmount,
          order.serial_number
        );
        await dataSources.cartAPI.clearCart(user.id);

        return order;
      } catch (error) {
        console.error("Error al crear la orden:", error);
        throw new Error("Ocurrió un error al crear la orden");
      }
    },

    // Actualizar el estado de una orden
    updateOrderStatus: async (parent, { input }, { dataSources, user }) => {
      if (!user) {
        throw new AuthenticationError("No autenticado");
      }

      const { id, status } = input;

      try {
        // Obtener la orden
        const order = await dataSources.orderAPI.getOrderById(id);

        if (!order) {
          throw new Error("Orden no encontrada");
        }

        // Verificar que el usuario tenga permiso para actualizar la orden
        // Asumiendo que solo el administrador puede actualizar el estado
        if (user.role !== "admin") {
          throw new ForbiddenError(
            "No tienes permiso para actualizar esta orden"
          );
        }

        // Actualizar el estado de la orden
        const updatedOrder = await dataSources.orderAPI.updateOrderStatus(
          id,
          status
        );

        return updatedOrder;
      } catch (error) {
        console.error("Error al actualizar el estado de la orden:", error);
        throw new Error("Ocurrió un error al actualizar el estado de la orden");
      }
    }
  },

  Order: {
    // Resolver para el campo user en Order
    user: async (parent, args, { dataSources }) => {
      return await dataSources.userAPI.getUserById(parent.user_id);
    },

    // Resolver para el campo orderDetails en Order
    orderDetails: async (parent, args, { dataSources }) => {
      return await dataSources.orderDetailAPI.getOrderDetailsByOrderId(
        parent.id
      );
    }
  },

  OrderDetail: {
    // Resolver para el campo order en OrderDetail
    order: async (parent, args, { dataSources }) => {
      return await dataSources.orderAPI.getOrderById(parent.order_id);
    }
  }
};

export default ordersResolvers;
