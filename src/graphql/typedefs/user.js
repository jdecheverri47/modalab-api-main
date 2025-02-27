import { gql } from "apollo-server";

const userTypeDefs = gql`
  type User implements BaseUser {
    id: String!
    name: String
    email: String!
    phone_number: String
    jobTitle: String
    orders: [Order!]
    createdAt: String!
    updatedAt: String!
    role: String!
  }

  input CreateUserInput {
    name: String
    email: String!
    password: String!
    phoneNumber: String
    jobTitle: String
  }

  interface BaseCompany {
    id: String!
    name: String!
  }

  type Company implements BaseCompany {
    id: String!
    name: String!
  }

  type RetailerDetails {
    id: String!
    website: String
    social_media: [String]
  }

  type Address {
    id: String!
    address: String!
    city: String!
    state: String!
    country: String!
    zipCode: String!
    moreInfo: String
  }

  input CreateCompanyInput {
    name: String!
  }

  input CreateAddress {
    address: String!
    city: String!
    state: String!
    country: String!
    zipCode: String!
    moreInfo: String
  }

  input CreateRetailerDetailsInput {
    website: String
    social_media: [String!]
  }

  input RegisterRetailer {
    user: CreateUserInput!
    company: CreateCompanyInput!
    retailerDetails: CreateRetailerDetailsInput!
    addresses: [CreateAddress!]
  }

  type RegisterResponse {
    token: String!
    message: String!
  }

  input CreateBrandDetailsInput {
    physical_store: Boolean!
    current_stockists: [String]
    website: String
    social_media: [String!]
    categories: [String!]
    wholesale_markup: Float!
    retail_price_start: Float!
    retail_price_end: Float!
  }

  input RegisterBrand {
    user: CreateUserInput!
    company: CreateCompanyInput!
    brandDetails: CreateBrandDetailsInput!
    addresses: [CreateAddress!]
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    token: String
    user: User
    company: Company
    companyDetails: RetailerDetails
    addresses: [Address]
  }

  type DeleteUserResponse {
    message: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    phoneNumber: String
    jobTitle: String
  }

  type UpdateUserResponse {
    message: String!
    user: User
  }

  input UpdateUserAddress {
    address: String
    city: String
    state: String
    country: String
    zipCode: String
    moreInfo: String
  }

  type AddressPayload {
    message: String!
    address: Address
  }

  type ActivatePayload {
    message: String!
  }

  type BrandPayload {
    token: String!
    message: String!
  }

  input QuickRetailerRegisterType {
    user: CreateUserInput!
    company: CreateCompanyInput!
  }

  type Query {
    users(id: String): [User!]!
    me: User!
    getUserAddresses: [Address!]
  }

  type Mutation {
    registerUser(input: CreateUserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    deleteUser(id: String!): DeleteUserResponse!
    updateUser(input: UpdateUserInput!): UpdateUserResponse!
    registerRetailer(input: RegisterRetailer!): RegisterResponse!
    registerBrand(input: RegisterBrand!): BrandPayload!
    registerAddress(input: CreateAddress!): AddressPayload!
    updateAddress(id: String!, input: UpdateUserAddress!): AddressPayload!
    deleteAddress(id: String!): AddressPayload!
    activateUser(token: String!): ActivatePayload!
    updatePassword(token: String, password: String!): ActivatePayload!
    resetPassword(email: String!): ActivatePayload!
    quickRetailerRegister(input: QuickRetailerRegisterType!): RegisterResponse!
  }
`;

export default userTypeDefs;
