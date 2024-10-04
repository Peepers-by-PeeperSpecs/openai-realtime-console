import React from 'react';

interface ProductDisplayProps {
  product: {
    title: string;
    featuredMedia?: {
      image: {
        url: string;
      };
    };
    description: string;
  } | null;
}

export const ProductDisplay: React.FC<ProductDisplayProps> = ({ product }) => {
  if (!product) {
    return <div>No product information available</div>;
  }

  return (
    <div className="product-display">
      <h3>{product.title}</h3>
      {product.featuredMedia && (
        <img
          src={product.featuredMedia.image.url}
          alt={product.title}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      )}
      <p>{product.description}</p>
    </div>
  );
};
