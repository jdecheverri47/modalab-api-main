import { gql } from "apollo-server";

const categoriesTypeDefs = gql`

    type SuccessMessage {
      message: String!
    }

    type Vertical {
      id: ID!
      name: String!
      categories: [Category!]!
    }
    
    type Category {
      id: ID!
      name: String!
      subcategories: [Subcategory!]!
    }

    input CategoryInput {
      name: String!
      parent_name: String
    }
    
    type Subcategory {
      id: ID!
      name: String!
    }

    type Query {
      CategoryTree: [Vertical!]
    }

    type Mutation {
      createCategory(input: CategoryInput!): SuccessMessage!
      deleteCategory(input: CategoryInput!): SuccessMessage!
    }

  `

export default categoriesTypeDefs;