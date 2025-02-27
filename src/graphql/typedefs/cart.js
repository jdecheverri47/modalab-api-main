import { gql } from "apollo-server";

const cartTypeDefs = gql`
  # ============================
  # Tipos e Inputs para Mutaciones
  # ============================

  input CartItemInput {
    productId: Int!
    colorName: String!
    size: String!
    quantity: Int!
  }

  input AddToCartInput {
    item: [CartItemInput!]!
  }

  input UpdateCartItemInput {
    cartItemId: ID!
    quantity: Int!
  }

  input UpdateCartItemsInput {
    items: [UpdateCartItemInput!]!
  }

  type UpdatedCartItem {
    cartItemId: ID!
    quantity: Int!
  }

  type CartItemError {
    cartItemId: ID!
    message: String!
  }

  type UpdateCartItemsResponse {
    message: String!
    updatedItems: [UpdatedCartItem!]!
    errors: [CartItemError!]!
  }

  type Message {
    message: String!
  }

  # ============================
  # Tipos Base
  # ============================

  type CartItem {
    id: ID!
    product: Product!
    colorName: String!
    size: String!
    quantity: Int!
  }

  # Nuevo tipo para representar un item sin la data redundante del producto
  type ItemGroup {
    quantity: Int!
    size: String!
    id: ID!
  }

  type ColorGroup {
    color: String!
    items: [ItemGroup!]!
  }

  type ProductGroup {
    id: ID!
    product: Product!
    colors: [ColorGroup!]!
    totalQuantity: Int!
  }

  type DesignerCart {
    name: String!
    designer_slug: String
    main_image: String
    designer_info: DesignerInfo
    products: [ProductGroup!]!
    totalQuantity: Int!
    totalItems: Int!
    totalAmount: Float!
  }

  type ProductData {
    designer: String!
    designer_slug: String
    product_name: String!
    slug: String!
    size: String!
    color: String!
    quantity: Int!
    price: Float!
  }

  type Subtotal {
    productId: ID!
    value: Float!
  }

  type CartResponse {
    itemsByDesigners: [DesignerCart!]!
    productsArray: [ProductData!]!
    subtotals: [Subtotal!]!
    totalAmount: Float!
    totalServiceAmount: Float!
    totalItemCount: Int!
  }

  type Cart {
    id: ID!
    userId: ID!
    items: [CartItem!]!
    createdAt: String!
    updatedAt: String!
  }

  # ============================
  # Mutations y Querys
  # ============================

  type Mutation {
    addToCart(input: AddToCartInput!): Cart!
    updateCartItem(input: UpdateCartItemInput!): CartItem!
    updateCartItems(input: UpdateCartItemsInput!): UpdateCartItemsResponse
    removeCartItem(cartItemId: ID!): Message
    removeCartItemById(id: String!): Message
  }

  type Query {
    getCart: CartResponse
  }
`;

export default cartTypeDefs;
