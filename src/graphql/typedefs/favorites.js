import { gql } from "apollo-server";

const favoritesTypeDefs = gql`
  type Favorite {
    user: User!
    product: Product!
  }

  type ResponseFavoriteMessage {
    message: String!
  }

  type Mutation {
    addFavorite(productId: Int!): ResponseFavoriteMessage!
    removeFavorite(productId: Int!): ResponseFavoriteMessage!
  }

  type Query {
    favorites: [Product!]!
  }
`;

export default favoritesTypeDefs;