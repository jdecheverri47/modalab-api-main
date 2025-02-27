import { gql } from 'apollo-server';

const navigatorTypeDefs = gql`
  type Navigator {
    id: ID!
    name: String!
    items: [NavigatorItem]
  }

  type NavigatorItem {
    id: ID!
    name: String!
    subItems: [NavigatorItem]
  }

  type NavigatorSubItem {
    id: ID!
    name: String!
    href: String!
  }

  type Query {
    Navigator(id: ID): [Navigator]
  }

`;

export default navigatorTypeDefs;
