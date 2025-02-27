import { gql } from "apollo-server";

const orderTypeDefs = gql`
  type OrderDetail {
    id: ID!
    order_id: ID!
    designer: String!
    product_name: String!
    size: String!
    color: String!
    quantity: Int!
    price: Float!
    createdAt: String!
    updatedAt: String!
    order: Order!
  }

  # Tipo para Order
  type Order {
    id: ID!
    user_id: ID!
    order_date: String!
    status: String!
    total_amount: Float!
    payment_status: String!
    stripe_payment_intent_id: String
    stripe_charge_id: String
    createdAt: String!
    updatedAt: String!
    user: User!
    orderDetails: [OrderDetail!]!
    serial_number: String
  }

  # Entradas para crear una orden y detalles
  input OrderDetailInput {
    designer: String!
    product_name: String!
    size: String!
    color: String!
    quantity: Int!
    price: Float!
  }

  input CreateOrderInput {
    products: [OrderDetailInput!]!
    stripe_payment_intent_id: String
    addressId: Int!
  }

  input UpdateOrderStatusInput {
    id: ID!
    status: String!
  }

  # Tipos de Query y Mutation
  type Query {
    getOrder(id: ID!): Order
    getOrdersByUser(user_id: ID!): [Order!]!
    getMyOrders: [Order!]!
    # Otras consultas según tus necesidades
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(input: UpdateOrderStatusInput!): Order!

    # Otras mutaciones según tus necesidades
  }
`;

export default orderTypeDefs;
