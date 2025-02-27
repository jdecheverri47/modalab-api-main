// models/index.js

import Product from "./productModel.js";
import Subcategories from "./subcategoriesModel.js";
import ProductSubcategories from "./productSubcategoriesModel.js";
import Categories from "./categoryModel.js";
import Designer from "./designerModel.js";
import Collections from "./collectionModel.js";
import Verticals from "./verticalModel.js";
import Variant from "./variantModel.js";
import Color from "./colorModel.js";
import Discounts from "./discountsModel.js";
import DesignerInfo from "./designerInfoModel.js";
import Cart from "./cartModel.js";
import CartItem from "./cartItem.js";
import Favorites from "./favoritesModel.js";
import User from "./userModel.js";
import Follows from "./followsModel.js";
import Order from "./orderModel.js";
import OrderDetail from "./orderDetail.js";
import Addresses from "./addressesModel.js";
import Companies from "./companiesModel.js";
import Style from "./styleModel.js";
import DesignerStyle from "./designersStylesModel.js";
import Connections from "./connectionModel.js";

Product.belongsTo(Verticals, { foreignKey: "vertical_id", as: "vertical" });
Verticals.hasMany(Product, { foreignKey: "vertical_id", as: "products" });

Product.belongsTo(Collections, {
  foreignKey: "collection_id",
  as: "collection",
});
Collections.hasMany(Product, { foreignKey: "collection_id", as: "products" });

Product.belongsTo(Designer, { foreignKey: "designer_id", as: "designer" });
Designer.hasMany(Product, { foreignKey: "designer_id", as: "products" });

Product.belongsTo(Categories, { foreignKey: "category_id", as: "category" });
Categories.hasMany(Product, { foreignKey: "category_id", as: "products" });

Designer.belongsToMany(Discounts, {
  through: "designer_discounts",
  foreignKey: "designer_id",
  as: "discounts",
});

Discounts.belongsToMany(Designer, {
  through: "designer_discounts",
  foreignKey: "discount_id",
  as: "designers",
});

Designer.hasOne(DesignerInfo, { foreignKey: "designer_id", as: "info" });
DesignerInfo.belongsTo(Designer, { foreignKey: "designer_id", as: "designer" });

Product.belongsToMany(Subcategories, {
  through: ProductSubcategories,
  foreignKey: "product_id",
  otherKey: "subcategory_id",
  as: "subcategories",
});

Subcategories.belongsToMany(Product, {
  through: ProductSubcategories,
  foreignKey: "subcategory_id",
  otherKey: "product_id",
  as: "products",
});

Subcategories.belongsTo(Categories, {
  foreignKey: "category_id",
  as: "categories",
});
Categories.hasMany(Subcategories, {
  foreignKey: "category_id",
  as: "subcategories",
});

Cart.hasMany(CartItem, { foreignKey: "cartId", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cartId", as: "cart" });

CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(CartItem, { foreignKey: "productId", as: "cartItems" });

Favorites.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(Favorites, { foreignKey: "productId", as: "favorites" });

Favorites.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Favorites, { foreignKey: "userId", as: "favorites" });

Follows.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Follows, { foreignKey: "userId", as: "follows" });

Follows.belongsTo(Designer, { foreignKey: "designerId", as: "designer" });
Designer.hasMany(Follows, { foreignKey: "designerId", as: "follows" });

OrderDetail.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Order.hasMany(OrderDetail, { foreignKey: "order_id", as: "orderDetails" });

Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });

Order.hasOne(Addresses, { foreignKey: "order_id", as: "address" });
Addresses.belongsTo(Order, { foreignKey: "order_id", as: "order" });

Style.belongsToMany(Designer, {
  through: DesignerStyle,
  foreignKey: "style_id",
  as: "designers",
});

Designer.belongsToMany(Style, {
  through: DesignerStyle,
  foreignKey: "designer_id",
  as: "styles",
});

Connections.belongsTo(User, {
  as: "requester",
  foreignKey: "requesterId",
});

Connections.belongsTo(User, {
  as: "receiver",
  foreignKey: "receiverId",
});

User.hasMany(Connections, {
  as: "sentConnections",
  foreignKey: "requesterId",
});
User.hasMany(Connections, {
  as: "receivedConnections",
  foreignKey: "receiverId",
});

Companies.hasOne(Designer, {
  foreignKey: "company_id",
  as: "designer",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Designer.belongsTo(Companies, {
  foreignKey: "company_id",
  as: "company",
});

User.hasMany(Companies, { foreignKey: "user_id", as: "companies" });
Companies.belongsTo(User, { foreignKey: "user_id", as: "owner" });

export {
  Product,
  Subcategories,
  ProductSubcategories,
  Categories,
  Designer,
  Collections,
  Verticals,
  Variant,
  Color,
  Discounts,
  DesignerInfo,
  Cart,
  CartItem,
  Favorites,
  User,
  Follows,
  Order,
  OrderDetail,
  Addresses,
  Companies,
  Style,
  DesignerStyle,
  Connections,
};
