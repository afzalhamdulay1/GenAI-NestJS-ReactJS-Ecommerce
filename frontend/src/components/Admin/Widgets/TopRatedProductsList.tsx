import React from 'react';
import StarIcon from '@mui/icons-material/Star';
import { Product } from '@/types';

interface TopRatedProductsListProps {
  products: Product[];
}

const TopRatedProductsList: React.FC<TopRatedProductsListProps> = ({ products }) => {
  return (
    <div className="ratedList">
      {products.map((prod) => (
        <div className="ratedItem" key={prod._id}>
          <img
            src={prod.images && prod.images[0] ? prod.images[0].url : ''}
            alt={prod.name}
          />
          <div className="itemInfo">
            <p>{prod.name}</p>
            <div className="rating">
              <StarIcon />{' '}
              <span>
                {prod.ratings} ({prod.numOfReviews} reviews)
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopRatedProductsList;
