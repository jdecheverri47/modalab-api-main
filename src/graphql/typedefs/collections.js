import { gql } from "apollo-server";

const collectionsTypeDefs = gql`
  type Collection {
    id: ID!
    name: String!
    designer_slug: String!
    lookbook: String
    season: String
    year: Int
    order_type: String
    order_window_start: String
    order_window_end: String
    delivery_window_start: String
    delivery_window_end: String
  }

  input CollectionInput {
    name: String!
    designer_slug: String!
  }

  type SuccessMessage {
    message: String!
  }

  type Mutation {
    createCollection(input: CollectionInput!): SuccessMessage!
    deleteCollection(input: CollectionInput!): SuccessMessage!
  }
`;

export default collectionsTypeDefs;
