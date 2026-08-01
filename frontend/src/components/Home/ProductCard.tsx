import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rating, IconButton, Button, Box } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { Product } from '@/types';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleWishlist } from '@/features/user/userSlice';
import { addItemsToCart } from '@/features/cart/cartSlice';
import '@/components/Home/ProductCard.css';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  showWishlistHeart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showAddToCart = false,
  showWishlistHeart = true,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { wishlist, isAuthenticated } = useAppSelector((state) => state.user);

  const isWishlisted = wishlist?.some((item) => item._id === product._id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlist(product._id));
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) {
      toast.error('Item is out of stock!');
      return;
    }
    dispatch(addItemsToCart({ id: product._id, quantity: 1 }));
  };

  const options2 = {
    value: product.ratings,
    readOnly: true,
    precision: 0.5,
  };

  return (
    <Link className="productCard" to={`/product/${product._id}`} style={{ position: 'relative' }}>
      {showWishlistHeart && (
        <IconButton
          onClick={handleWishlistToggle}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
          size="small"
        >
          {isWishlisted ? (
            <FavoriteIcon sx={{ color: '#ef4444', fontSize: '1.2rem' }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: '#64748b', fontSize: '1.2rem' }} />
          )}
        </IconButton>
      )}
      {product.stock <= 5 && product.stock > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2,
            backgroundColor: '#fef3c7',
            color: '#b45309',
            border: '1px solid #fcd34d',
            borderRadius: '6px',
            px: 1,
            py: 0.2,
            fontSize: '0.72rem',
            fontWeight: 700,
          }}
        >
          Only {product.stock} left!
        </Box>
      )}
      {/* Offer Discount Badge Pill */}
      {product.originalPrice && product.originalPrice > product.price && (
        <Box
          sx={{
            position: 'absolute',
            top: product.stock <= 5 && product.stock > 0 ? 38 : 10,
            left: 10,
            zIndex: 2,
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: '6px',
            px: 1,
            py: 0.3,
            fontSize: '0.72rem',
            fontWeight: 800,
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)',
          }}
        >
          {Math.min(100, Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100))}% OFF
        </Box>
      )}
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{`₹${product.price}`}</span>
        {product.originalPrice && product.originalPrice > product.price && (
          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
            {`₹${product.originalPrice}`}
          </span>
        )}
      </Box>
      {showAddToCart && (
        <Box
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          sx={{ width: '100%', mt: 2 }}
        >
          <Button
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            variant="contained"
            fullWidth
            startIcon={<ShoppingBagIcon sx={{ fontSize: '1.1rem !important' }} />}
            sx={{
              py: 1,
              borderRadius: '12px',
              background: product.stock < 1 ? '#e2e8f0' : 'linear-gradient(135deg, #0f172a, #1e293b)',
              color: '#ffffff',
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.3px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              '&:hover': {
                background: product.stock < 1 ? '#e2e8f0' : 'linear-gradient(135deg, #1e293b, #334155)',
                boxShadow: '0 6px 16px rgba(15, 23, 42, 0.25)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: '#e2e8f0',
                color: '#94a3b8',
                boxShadow: 'none',
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </Box>
      )}
    </Link>
  );
};

export default ProductCard;
