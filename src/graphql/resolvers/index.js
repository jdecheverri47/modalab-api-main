import userResolvers from "../resolvers/user.js";
import designerResolvers from "../resolvers/designer.js";
import productResolvers from "./product.js";
import collectionsResolvers from "./collection.js";
import categoriesResolvers from "./categories.js";
import cartResolvers from "./cart.js";
import favoritesResolvers from "./favorites.js";
import followResolvers from "./follows.js";
import ordersResolvers from "./order.js";
import connectionsResolvers from "./connections.js";

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...designerResolvers.Query,
    ...productResolvers.Query,
    ...categoriesResolvers.Query,
    ...cartResolvers.Query,
    ...favoritesResolvers.Query,
    ...followResolvers.Query,
    ...ordersResolvers.Query,
    ...connectionsResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...designerResolvers.Mutation,
    ...productResolvers.Mutation,
    ...collectionsResolvers.Mutation,
    ...cartResolvers.Mutation,
    ...favoritesResolvers.Mutation,
    ...followResolvers.Mutation,
    ...ordersResolvers.Mutation,
    ...connectionsResolvers.Mutation,
  },
  User: {
    ...userResolvers.User,
  },
  Product: {
    ...productResolvers.Product,
  },
  Vertical: {
    ...categoriesResolvers.Vertical,
  },
  Category: {
    ...categoriesResolvers.Category,
  },
  Designer: {
    ...designerResolvers.Designer,
  },
  Order: {
    ...ordersResolvers.Order,
  },
  OrderDetail: {
    ...ordersResolvers.OrderDetail,
  },
  Connection: {
    ...connectionsResolvers.Connection,
  },
};

export default resolvers;
