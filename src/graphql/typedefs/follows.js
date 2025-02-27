import { gql } from 'apollo-server';

const followsTypeDefs = gql`
type Follow {
  id: ID!
  userId: ID!
  designerId: Int!
  createdAt: String
}

type Query {
  # Obtiene la lista de diseñadores que el usuario sigue
  followedDesigners: [Designer]

  # Verifica si el usuario ya sigue a un diseñador específico
  isFollowingDesigner(designerId: Int!): Boolean
}

type MessageFollow {
  message: String!
}

type Mutation {
  # Sigue a un diseñador
  followDesigner(designerId: Int!): MessageFollow!

  # Deja de seguir a un diseñador
  unfollowDesigner(designerId: Int!): MessageFollow!
}
`;

export default followsTypeDefs;