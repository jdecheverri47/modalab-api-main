import { gql } from "apollo-server";
import userTypeDefs from "../typedefs/user.js";
import designerTypeDefs from "../typedefs/designer.js";
import productTypeDefs from "../typedefs/product.js";
import collectionsTypeDefs from "../typedefs/collections.js";
import categoriesTypeDefs from "./categories.js";
import cartTypeDefs from "./cart.js";
import favoritesTypeDefs from "./favorites.js";
import followsTypeDefs from "./follows.js";
import orderTypeDefs from "./order.js";
import connectionsTypeDefs from "./connections.js";

const typeDefs = gql`
  ${userTypeDefs}
  ${designerTypeDefs}
  ${productTypeDefs}
  ${collectionsTypeDefs}
  ${categoriesTypeDefs}
  ${cartTypeDefs}
  ${favoritesTypeDefs}
  ${followsTypeDefs}
  ${orderTypeDefs}
  ${connectionsTypeDefs}
`;

export default typeDefs;
