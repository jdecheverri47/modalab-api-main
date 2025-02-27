import { hasRole } from "../../config/authorization.js";

const cartResolvers = {
  Query: {
    getCart: async (_, __, { dataSources, user }) => {
      console.log("Checking authentication...");
      if (!user) {
        console.log("User not authenticated");
        throw new Error("Not authenticated");
      }

      // Obtenemos el carrito desde el datasource
      const cart = await dataSources.cartAPI.getCart(user.id);

      // Transformamos la respuesta para ajustarla a CartResponse
      return transformCart(cart);
    },
  },
  Mutation: {
    addToCart: async (_, { input }, { dataSources, user }) => {
      // Verificar que el usuario esté autenticado
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { item } = input;

      // Asegurarnos de que 'item' es un array
      if (!Array.isArray(item)) {
        throw new Error("'item' must be an array");
      }

      // Procesar cada ítem en el array
      for (const cartItem of item) {
        const { productId, colorName, size, quantity } = cartItem;

        // Llamar a addOrUpdateCartItem para cada ítem
        await dataSources.cartAPI.addOrUpdateCartItem({
          userId: user.id, // Utilizar el ID del usuario autenticado
          productId,
          colorName,
          size,
          quantity,
        });
      }

      // Después de agregar todos los ítems, devolver el carrito actualizado
      return dataSources.cartAPI.getCart(user.id);
    },

    updateCartItem: async (_, { input }, { dataSources, user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { cartItemId, quantity } = input;
      const cartItem = await dataSources.cartAPI.updateCartItemQuantity(
        cartItemId,
        quantity,
        user.id
      );

      return { message: "Item updated" };
    },

    updateCartItems: async (_, { input }, { dataSources, user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { items } = input;

      // Verificar que 'items' es un array
      if (!Array.isArray(items)) {
        throw new Error("'items' must be an array");
      }

      const errors = [];
      const updatedItems = [];

      // Procesar cada item en el array
      for (const item of items) {
        const { cartItemId, quantity } = item;

        try {
          // Actualizar la cantidad del item en el carrito
          const cartItem = await dataSources.cartAPI.updateCartItemQuantity(
            cartItemId,
            quantity,
            user.id
          );
          // Agregar el item actualizado al array de resultados exitosos
          updatedItems.push({
            cartItemId: cartItem.id,
            quantity: cartItem.quantity,
          });
        } catch (error) {
          // Capturar el error y agregarlo al array de errores
          errors.push({
            cartItemId,
            message: error.message,
          });
        }
      }

      // Retornar el resultado con los items actualizados y los errores
      return {
        message: "Cart update completed",
        updatedItems,
        errors,
      };
    },

    removeCartItem: async (_, { cartItemId }, { dataSources, user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      console.log("Checking access rights...");
      console.log("User ID: ", user.id);
      console.log("Cart Item ID: ", cartItemId);
      const cartItem = await dataSources.cartAPI.removeCartItem(
        cartItemId,
        user.id
      );
      console.log("Cart Item: ", cartItem);

      return { message: "Item removed from cart" };
    },

    removeCartItemById: async (_, { id }, { dataSources, user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      const cartItem = await dataSources.cartAPI.removeCartItemById(
        id,
        user.id
      );
      console.log("Cart Item: ", cartItem);

      return { message: "Items removed from cart" };
    },
  },
};

function transformCart(cart) {
  if (!cart || !cart.items) {
    return {
      itemsByDesigners: [],
      productsArray: [],
      subtotals: [],
      totalAmount: 0,
      totalServiceAmount: 0,
      totalItemCount: 0,
    };
  }

  const designerMap = new Map();

  cart.items.forEach((item) => {
    const { product, colorName, size, quantity } = item;
    const designer = product.designer;
    const designerKey = designer.name;

    if (!designerMap.has(designerKey)) {
      designerMap.set(designerKey, {
        name: designer.name,
        designer_slug: designer.slug,
        main_image: designer.coverImage || null,
        designer_info: {
          minimum_order_quantity: designer.info.minimum_order_quantity || null,
          minimum_value: designer.info.minimum_value || null,
        },
        productsMap: new Map(),
        totalQuantity: 0,
        totalItems: 0,
        totalAmount: 0,
      });
    }
    const designerGroup = designerMap.get(designerKey);

    // Usamos el id del producto para agrupar
    const productId = product.id;
    if (!designerGroup.productsMap.has(productId)) {
      designerGroup.productsMap.set(productId, {
        // En ProductGroup, asignamos la info del producto una sola vez
        productGroup: {
          id: productId,
          product: product, // Información del producto extraída de item.product
          colors: [],
          totalQuantity: 0,
        },
        colorsMap: new Map(),
      });
      designerGroup.totalItems += 1;
    }
    const productGroupData = designerGroup.productsMap.get(productId);

    // Agrupar por color (usando colorName)
    if (!productGroupData.colorsMap.has(colorName)) {
      productGroupData.colorsMap.set(colorName, {
        color: colorName,
        items: [],
      });
      productGroupData.productGroup.colors.push(
        productGroupData.colorsMap.get(colorName)
      );
    }
    const colorGroup = productGroupData.colorsMap.get(colorName);

    // Guardamos quantity, size e id (para poder editar individualmente cada item)
    colorGroup.items.push({
      id: item.id,
      quantity,
      size,
    });

    productGroupData.productGroup.totalQuantity += quantity;
    designerGroup.totalQuantity += quantity;
    designerGroup.totalAmount += quantity * product.wholesale_price;
  });

  // Convertir mapas a arreglos y construir la data final
  const itemsByDesigners = [];
  const subtotals = {};

  designerMap.forEach((designerGroup) => {
    const products = [];
    designerGroup.productsMap.forEach((productGroupData) => {
      products.push(productGroupData.productGroup);

      // Calcular subtotal para cada producto
      const productSubtotal = productGroupData.productGroup.colors.reduce(
        (acc, colorGroup) =>
          acc +
          colorGroup.items.reduce(
            (innerAcc, item) =>
              innerAcc +
              item.quantity *
                productGroupData.productGroup.product.wholesale_price,
            0
          ),
        0
      );
      subtotals[productGroupData.productGroup.id] = productSubtotal;
    });

    itemsByDesigners.push({
      name: designerGroup.name,
      designer_slug: designerGroup.designer_slug,
      main_image: designerGroup.main_image,
      designer_info: designerGroup.designer_info,
      products,
      totalQuantity: designerGroup.totalQuantity,
      totalItems: designerGroup.totalItems,
      totalAmount: designerGroup.totalAmount,
    });
  });

  const totalAmount = Object.values(subtotals).reduce(
    (acc, val) => acc + val,
    0
  );
  const totalServiceAmount = totalAmount + totalAmount * 0.02;
  const totalItemCount = Array.from(designerMap.values()).reduce(
    (acc, designerGroup) => acc + designerGroup.totalQuantity,
    0
  );

  // Convertir los subtotales a un arreglo
  const subtotalsArray = Object.entries(subtotals).map(
    ([productId, value]) => ({
      productId,
      value,
    })
  );

  // Además, si se requiere un arreglo plano de productos (ProductData) se puede construir aquí

  return {
    itemsByDesigners,
    productsArray: [], // Puedes omitirlo o construirlo si lo necesitas
    subtotals: subtotalsArray,
    totalAmount,
    totalServiceAmount,
    totalItemCount,
  };
}

export default cartResolvers;
