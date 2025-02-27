// user.typeDefs.js
import { gql } from "apollo-server";

const userTypeDefs = gql`
  type User {
    id: String!
    name: String!
    email: String!
    phoneNumber: String
    jobTitle: String
    createdAt: String!
    updatedAt: String!
    role: String!
  }

  type BaseResponse {
    message: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    phoneNumber: String
    jobTitle: String
  }

  input UpdateUserInput {
    name: String
    email: String
    phoneNumber: String
    jobTitle: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String
    user: User
  }

  type UpdateUserResponse {
    message: String!
    user: User
  }

  type Query {
    users(id: String): [User!]!
    me: User!
  }

  type Mutation {
    registerUser(input: CreateUserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    deleteUser(id: String!): BaseResponse!
    updateUser(input: UpdateUserInput!): UpdateUserResponse!
    activateUser(token: String!): BaseResponse!
    updatePassword(token: String, password: String!): BaseResponse!
    resetPassword(email: String!): BaseResponse!
  }
`;

export default userTypeDefs;
