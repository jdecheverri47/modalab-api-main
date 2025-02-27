import { gql } from "apollo-server";

const designerTypeDefs = gql`
  type Subscription {
    designerFollowStatusChanged(designerId: Int!): Designer
  }

  type Designer {
    id: ID!
    name: String!
    description: String!
    slug: String
    country: String
    coverImage: String
    profile_image: String
    createdAt: String!
    designer_info: DesignerInfo
    isFollowedByCurrentUser: Boolean
    about: String
    m_favorite: [Product]
    styles: [String]
    since: Int
    terms: String
  }

  type DesignerInfo {
    physical_store: Boolean
    current_stockists: [String]
    categories: [String]
    wholesale_markup: Float
    wholesale_price_start: Float
    wholesale_price_end: Float
    brand_values: [String]
    retail_price_start: Float
    retail_price_end: Float
    minimum_order_quantity: Int
    minimum_value: Float
    website: String
    social_media: [String]
  }

  input CreateDesignerInput {
    name: String!
    description: String!
    slug: String!
    coverImage: String
  }

  type Query {
    designers(id: ID, slug: String): [Designer]
  }

  type Mutation {
    registerDesigner(input: CreateDesignerInput!): Designer
  }
`;

export default designerTypeDefs;
