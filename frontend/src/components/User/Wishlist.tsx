import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { getWishlist } from '@/features/user/userSlice';
import MetaData from '@/components/Layout/MetaData';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ProductCard from '@/components/Home/ProductCard';
import './Wishlist.css';

const Wishlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { wishlist, isAuthenticated } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      dispatch(getWishlist());
    }
  }, [dispatch, isAuthenticated, navigate]);

  return (
    <>
      <MetaData title="My Wishlist -- ECOMMERCE" />
      <div className="wishlistContainer">
        <div className="wishlistHeader">
          <h1>My Wishlist ❤️</h1>
          <p>Your saved favorites ready to buy whenever you are</p>
        </div>

        {wishlist && wishlist.length > 0 ? (
          <div className="wishlistGrid">
            {wishlist.map((item) => (
              <ProductCard key={item._id} product={item} showAddToCart={true} />
            ))}
          </div>
        ) : (
          <div className="emptyWishlist">
            <FavoriteBorderIcon className="emptyWishlistIcon" />
            <h2>Your Wishlist is Empty</h2>
            <p>Explore our products and heart the items you love to save them for later.</p>
            <Link to="/products" className="exploreBtn">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
