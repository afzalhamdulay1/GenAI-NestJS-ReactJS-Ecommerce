import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ProductCard from '@/components/Home/ProductCard';
import { Product } from '@/types';

interface BestSellersSectionProps {
  products: Product[];
}

const BestSellersSection: React.FC<BestSellersSectionProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  // Filter & sort best sellers by highest ratings and highest review counts
  const bestSellers = [...products]
    .sort((a, b) => (b.numOfReviews || 0) - (a.numOfReviews || 0) || (b.ratings || 0) - (a.ratings || 0))
    .slice(0, 8);

  return (
    <Box sx={{ width: '90vw', maxWidth: '1200px', margin: '3rem auto' }}>
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          borderRadius: '20px',
          p: { xs: 2.5, md: 3.5 },
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.1)',
        }}
      >
        {/* Header Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
            }}
          >
            <LocalFireDepartmentIcon sx={{ fontSize: '1.7rem' }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                color: '#0369a1',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.3rem', md: '1.6rem' },
              }}
            >
              Best Sellers
            </Typography>
            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 600 }}>
              Top customer favorites and most highly rated products
            </Typography>
          </Box>
        </Box>

        {/* Horizontal Carousel */}
        <Box
          sx={{
            display: 'flex',
            gap: 2.5,
            overflowX: 'auto',
            pb: 1.5,
            pt: 0.5,
            '&::-webkit-scrollbar': { height: '6px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#0284c7', borderRadius: '10px' },
            '&::-webkit-scrollbar-track': { bgcolor: '#e0f2fe', borderRadius: '10px' },
          }}
        >
          {bestSellers.map((product) => (
            <Box key={product._id} sx={{ minWidth: { xs: 220, sm: 260 }, flexShrink: 0 }}>
              <ProductCard product={product} showAddToCart={true} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default BestSellersSection;
