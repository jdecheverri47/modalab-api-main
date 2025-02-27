import { gql } from "apollo-server";

const connectionsTypeDefs = gql`
  enum ConnectionStatus {
    PENDING
    ACCEPTED
    IGNORED
  }

  enum ConnectionType {
    BRAND_REP
    REP_RETAILER
  }

  type ConnectionReps {
    id: ID!
    name: String!
    email: String!
    phone_number: String
    job_title: String
    createdAt: String!
    updatedAt: String!
  }

  type Connection {
    id: ID!
    requester: User!
    receiver: User!
    status: ConnectionStatus!
    connectionType: ConnectionType!
    createdAt: String
    updatedAt: String
  }

  input CreateConnectionInput {
    receiverId: ID!
  }

  input UpdateConnectionStatusInput {
    connectionId: ID!
  }

  type Reps {
    user: User!
    company: Company!
  }

  interface BaseUser {
    id: String!
    name: String
    email: String!
    phone_number: String
    jobTitle: String
    createdAt: String!
    updatedAt: String!
    role: String!
  }

  type BrandUser implements BaseUser {
    id: String!
    name: String
    email: String!
    phone_number: String
    jobTitle: String
    createdAt: String!
    updatedAt: String!
    role: String!
    companies: [BrandsCompany!]
  }

  type BrandsCompany {
    id: String!
    name: String!
    designer: Designer
  }

  type RepBrandsConnection {
    id: ID!
    requester: BrandUser
    status: ConnectionStatus!
    connectionType: ConnectionType!
  }

  type Query {
    getConnection(id: ID!): Connection
    getConnections: [Connection!]
    availableReps: [Reps!]
    getRepBrands: [RepBrandsConnection!]!
  }

  type Mutation {
    createConnection(input: CreateConnectionInput!): Connection!
    acceptConnection(input: UpdateConnectionStatusInput!): Connection!
    ignoreConnection(input: UpdateConnectionStatusInput!): Boolean!
  }
`;

export default connectionsTypeDefs;
