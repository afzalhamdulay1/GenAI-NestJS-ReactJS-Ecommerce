import React from 'react';
import ProductCard from '@/components/Home/ProductCard';

interface FeaturedProductsProps {
  products: any[]; // Or proper Product interface if available
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  return (
    <>
      <h2 className="sectionHeading">Featured Products</h2>
      <div className="container" id="container">
        {products &&
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
      </div>
    </>
  );
};

export default FeaturedProducts;
