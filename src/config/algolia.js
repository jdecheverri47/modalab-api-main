// scripts/indexData.js
import { gql } from 'apollo-server';
import { GraphQLClient } from 'graphql-request';
import { searchClient } from '@algolia/client-search';
// Configurar Algolia
const client = searchClient('WOT8OWMTCP', '92b7ba5796a5f37df0f0b4f3525ac0c1');

// Configurar GraphQL sin autenticación
const graphQLClient = new GraphQLClient("https://modalab-api-700280181785.us-east1.run.app/graphql");

const query = gql`
query Products($filters: FilterProductsInput) {
  listProducts(filters: $filters) {
    products {
      id
      name
      description
      composition
      product_care
      main_image
      other_images
      variants {
        color {
          name
          hex
          brand_color
        }
        sizes
        stock
      }
      collection_name
      vertical
      category
      subcategories
      season
      designer_name
      designer_slug
      slug
      inventory_type
      wholesale_price
      retail_price
    }
  }
}
`;

const fetchData = async () => {
  try {
    const data = await graphQLClient.request(query);
    return data.listProducts.products;
  } catch (error) {
    console.error('Error al obtener datos de GraphQL:', error);
    return [];
  }
};

const indexData = async () => {
  const products = await fetchData();
  return await client.saveObjects({ indexName: 'products_index', objects: products });
}

indexData();

