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
    const query = `#graphql
      query GetProductByTitle($query: String!) {
        products(first: 1, query: $query) {
          edges {
            node {
              id
              title
              featuredMedia {
                ...on MediaImage {
                  image {
                    url
                  }
                }
              }
              description
              vendor
              productType
              variants (first: 100) {
                edges {
                  node {
                    title
                    price
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
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

export async function getOrderByName(orderName) {
  try {
    const ORDER_QUERY = `#graphql
      query ($query: String!) {
        orders(query: $query, first: 6, reverse: true) {
          edges {
            node {
              customer {
                id
                email
              }
              legacyResourceId
              displayFinancialStatus
              id
              name
              createdAt
              cancelledAt
              cancelReason
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              shippingAddress {
                zip
              }
              displayFulfillmentStatus
              returnStatus
              lineItems(first: 5) {
                edges {
                  node {
                    id
                    title
                    variantTitle
                    quantity
                    currentQuantity
                    fulfillmentStatus
                    discountAllocations {
                      discountApplication {
                        allocationMethod
                        targetSelection
                        value {
                          ... on MoneyV2 {
                            amount
                            currencyCode
                          }
                          ... on PricingPercentageValue {
                            percentage
                          }
                        }
                      }
                    }
                    discountedUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    discountedTotalSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    discountedUnitPriceAfterAllDiscountsSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    originalTotalSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    product {
                      productType
                    }
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    console.log('orderName', orderName);

    const { data } = await shopifyClient.request(ORDER_QUERY, {
      variables: {
        query: `name:${orderName}`,
      },
    });

    return data?.orders?.edges?.[0]?.node || null;
  } catch (error) {
    console.error('Error fetching order:', error.message);
    return null;
  }
}
