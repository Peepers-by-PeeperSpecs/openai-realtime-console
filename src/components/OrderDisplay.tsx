import React from 'react';

interface OrderDisplayProps {
  order: {
    name: string;
    customer?: {
      email: string;
    };
    lineItems?: {
      edges: Array<{
        node: {
          title: string;
        };
      }>;
    };
    shippingAddress?: {
      zip: string;
    };
  } | null;
}

export const OrderDisplay: React.FC<OrderDisplayProps> = ({ order }) => {
  if (!order) {
    return <div>No order information available.</div>;
  }

  return (
    <div className="order-display">
      <h3 style={{ marginTop: '80px' }}>Order: {order.name}</h3>
      <p>Customer Email: {order.customer?.email || 'N/A'}</p>
      <p>Shipping Zip: {order.shippingAddress?.zip || 'N/A'}</p>
      <h4>Line Items:</h4>
      <ul>
        {order.lineItems?.edges.map((edge, index) => (
          <li key={index}>{edge.node.title}</li>
        )) || 'No items'}
      </ul>
    </div>
  );
};
