import { DataSource } from "apollo-datasource";

class CartAPI extends DataSource {
  constructor({ models }) {
    super();
    this.models = models; // Guarda la instancia de Sequelize
  }

  async verifyCartOwner(cartId, userId) {
    const cart = await this.models.Cart.findByPk(cartId);
    if (!cart) {
      throw new Error(`Carrito con ID ${cartId} no encontrado`);
    }
    if (cart.userId !== userId) {
      throw new Error("Access Denied: No eres el dueño de este carrito");
    }
    return cart;
  }

  async getCart(userId) {
    const { Cart, CartItem } = this.models;

    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: this.models.Product,
              as: "product",
              include: [
                {
                  model: this.models.Designer,
                  as: "designer",
                  include: [{ model: this.models.DesignerInfo, as: "info" }],
                },
                {
                  model: this.models.Collections,
                  as: "collection",
                  attributes: [
                    "order_type",
                    "delivery_window_start",
                    "delivery_window_end",
                    "order_window_start",
                    "order_window_end",
                    "name",
                    "season",
                    "year",
                  ],
                },
              ],
            },
          ],
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!cart) {
      console.log(`No se encontró carrito para el usuario ${userId}`);
      return cart;
    }

    // Convierte el objeto a un formato plano y loguea la respuesta
    console.log(
      "Respuesta del carrito:",
      JSON.stringify(cart.get({ plain: true }), null, 2)
    );

    return cart;
  }

  async createCart(userId) {
    const { Cart } = this.models;
    return Cart.create({ userId });
  }

  async addOrUpdateCartItem({ userId, productId, colorName, size, quantity }) {
    console.log("Adding item to cart:", {
      userId,
      productId,
      colorName,
      size,
      quantity,
    });
    const { Cart, CartItem } = this.models;

    // Obtén o crea el carrito del usuario
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Verifica si el producto ya está en el carrito
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId, colorName, size },
    });

    if (cartItem) {
      // Si ya existe, actualiza la cantidad
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Si no existe, crea uno nuevo
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        colorName,
        size,
        quantity,
      });
    }

    // Devuelve el carrito actualizado
    return this.getCart(userId);
  }

  async updateCartItemQuantity(cartItemId, quantity, userId) {
    const cartItem = await this.models.CartItem.findByPk(cartItemId);
    if (!cartItem)
      throw new Error(`Item con ID ${cartItemId} no encontrado en el carrito`);

    // Verificación de permisos antes de actualizar
    await this.verifyCartOwner(cartItem.cartId, userId);

    cartItem.quantity = quantity;
    await cartItem.save();
    return cartItem;
  }

  async removeCartItem(id, userId) {
    const cartItem = await this.models.CartItem.findByPk(id);
    console.log(cartItem);
    if (!cartItem) throw new Error("Item no encontrado en el carrito");

    await this.verifyCartOwner(cartItem.cartId, userId);

    await cartItem.destroy();
    return this.getCart(userId);
  }

  async removeCartItemById(id, userId) {
    const { CartItem } = this.models;

    await CartItem.destroy({
      where: { productId: id },
      include: [
        {
          model: this.models.Cart,
          where: { userId },
        },
      ],
    });

    return this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await this.getCart(userId);
    if (!cart) throw new Error("Carrito no encontrado");

    await this.models.CartItem.destroy({ where: { cartId: cart.id } });
    return cart;
  }
}

export default CartAPI;
