import { createAdminApiClient } from '@shopify/admin-api-client';
import { ApiVersion } from '@shopify/shopify-api';
import dotenv from 'dotenv';
dotenv.config({ override: true });

const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const shopifyClient = createAdminApiClient({
  storeDomain: `${SHOPIFY_SHOP}.myshopify.com`,
  accessToken: SHOPIFY_ACCESS_TOKEN,
  apiVersion: ApiVersion.July24,
});

export async function getProductByTitle(productTitle) {
  try {
    const query = `
      query GetProductByTitle($query: String!) {
        products(first: 1, query: $query) {
          edges {
            node {
              id
              title
              description
              vendor
              productType
            }
          }
        }
      }
    `;

    const { data } = await shopifyClient.request(query, {
      variables: {
        query: `title:${productTitle}`,
      },
    });

    return data?.products?.edges?.[0]?.node || null;
  } catch (error) {
    console.error('Error fetching product:', error.message);
    return null;
  }
}
