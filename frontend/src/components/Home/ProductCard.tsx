import React from 'react';
import { Link } from 'react-router-dom';
import { Rating } from "@mui/material";
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const options2 = {
    value: product.ratings,
    readOnly: true,
    precision: 0.5,
  };

  return (
    <Link className="productCard" to={`/product/${product._id}`}>
      <img src={product.images && product.images[0] ? product.images[0].url : ''} alt={product.name} />
      <p>{product.name}</p>
      <p>{product.category}</p>
      <div>
        <Rating {...options2} />{" "}
        <span className="productCardSpan">
          {" "}
          ({product.numOfReviews} Reviews)
        </span>
      </div>
      <span>{`₹${product.price}`}</span>
    </Link>
  );
};

export default ProductCard;
