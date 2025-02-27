import { gql } from "apollo-server";

const productTypeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String!
    composition: String!
    product_care: String!
    main_image: String!
    other_images: [String!]!
    variants: [Variant!]!
    collection_name: String!
    collection: Collection
    vertical: String!
    category: String!
    subcategories: [String!]!
    season: String!
    designer_name: String
    designer_slug: String
    slug: String!
    tag: String
    detail_bullets: String
    inventory_type: Inventory
    weight: Float
    wholesale_price: Float!
    retail_price: Float!
    delivery_window_start: Int
    delivery_window_end: Int
    suggested_products: [Product]
    size_chart: [String]
  }

  type Variant {
    color: Color!
    sizes: [String!]!
    stock: Int!
  }

  type Color {
    name: String!
    hex: String!
    brand_color: String!
  }

  input CreateVariantInput {
    color: CreateColorInput!
    sizes: [String!]!
    stock: Int!
  }

  input CreateColorInput {
    name: String!
    hex: String!
    brand_color: String!
  }

  enum Inventory {
    ATS
    PRE_ORDER
  }

  input CreateProductInput {
    name: String!
    description: String!
    composition: String!
    product_care: String!
    main_image: String!
    other_images: [String!]!
    collection_name: String!
    vertical: String!
    category: String!
    subcategories: [String!]!
    season: String!
    designer_slug: String!
    slug: String!
    tag: String
    detail_bullets: String
    wholesale_price: Float!
    retail_price: Float!
    weight: Float
    variants: [CreateVariantInput!]!
  }

  input UpdateProductInput {
    name: String
    description: String
    composition: String
    product_care: String
    main_image: String
    other_images: [String]
    collection: String!
    categories: [String]
    season: String
    designer_name: String
    designer_slug: String
    slug: String
    subcategory: [String]
    vertical: String
    tag: String
    detail_bullets: String
    wholesale_price: Float
    retail_price: Float
    weight: Float
  }

  type ProductResponse {
    message: String!
  }

  type ProductConnection {
    products: [Product!]!
  }

  type FacetCollections {
    name: String!
    order_window_start: String!
    order_window_end: String!
    season: String!
    year: Int
    lookbook: String
    order_type: String
  }

  type FacetColors {
    name: String!
  }

  type FacetOrderType {
    type: String!
  }

  type FacetSeasons {
    name: String!
    year: Int
  }

  type NameSlugFacet {
    name: String!
    slug: String!
  }

  enum SortOrder {
    ASC
    DESC
  }

  type listProductsResponse {
    products: [Product!]!
    totalProducts: Int!
    currentPage: Int!
    totalPages: Int!
    collections: [FacetCollections!]!
    designers: [NameSlugFacet!]!
    categoryTree: [Vertical!]!
    filter_colors: [FacetColors!]!
    order_type: [FacetOrderType!]
    seasons: [FacetSeasons!]!
  }

  input FilterProductsInput {
    designer_slug: [String!]
    collection: [String!]
    category: String
    subcategories: [String!]
    season: [String!]
    year: [Int!]
    vertical: String
    tag: String
    colors: [String!]
    available: Boolean
    m_favorite: Boolean
    order_type: String
    wholesale_price_range: String
    retail_price_range: String
    sort_by_price: SortOrder
    styles: [String!]
  }

  type Query {
    product(slug: String!): Product
    products: [Product!]!
    listProducts(
      filters: FilterProductsInput
      page: Int = 1
      limit: Int = 160
    ): listProductsResponse!
  }

  type Mutation {
    uploadProduct(input: CreateProductInput!): ProductResponse!
    deleteProduct(id: ID!): Boolean!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
  }
`;

export default productTypeDefs;
