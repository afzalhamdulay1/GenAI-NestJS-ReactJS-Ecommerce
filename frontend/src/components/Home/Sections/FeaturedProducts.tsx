import React, { useState } from 'react';
import ProductCard from '@/components/Home/ProductCard';
import { Product } from '@/types';
import { Box, Button, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

interface FeaturedProductsProps {
  products: Product[];
}

type TabType = 'all' | 'bestSellers' | 'newArrivals';

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  const [activeTab, setActiveTab] = useState<TabType>('newArrivals');

  const getFilteredProducts = () => {
    if (!products) return [];

    if (activeTab === 'bestSellers') {
      // Highest ratings or review count
      return [...products].sort((a, b) => (b.ratings || 0) - (a.ratings || 0) || (b.numOfReviews || 0) - (a.numOfReviews || 0));
    }

    if (activeTab === 'newArrivals') {
      // Most recently created products
      return [...products].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return products;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <Box sx={{ width: '90vw', maxWidth: '1200px', margin: '2.5rem auto' }} id="container">
      {/* Header with Title & Filter Tabs */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'center' },
          gap: 2,
          mb: 3.5,
          borderBottom: '2px solid #e2e8f0',
          pb: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            position: 'relative',
            fontSize: { xs: '1.4rem', md: '1.75rem' },
          }}
        >
          Explore Catalog
        </Typography>

        {/* Tab Buttons */}
        <Box
          sx={{
            display: 'flex',
            bgcolor: '#f1f5f9',
            p: 0.5,
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            gap: 0.5,
          }}
        >
          <Button
            type="button"
            startIcon={<AutoAwesomeIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => setActiveTab('all')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2,
              py: 0.8,
              fontSize: '0.88rem',
              color: activeTab === 'all' ? '#0f172a' : '#64748b',
              bgcolor: activeTab === 'all' ? '#ffffff' : 'transparent',
              boxShadow: activeTab === 'all' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              '&:hover': { bgcolor: activeTab === 'all' ? '#ffffff' : 'rgba(255,255,255,0.5)' },
            }}
          >
            All Products
          </Button>

          <Button
            type="button"
            startIcon={<TrendingUpIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => setActiveTab('bestSellers')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2,
              py: 0.8,
              fontSize: '0.88rem',
              color: activeTab === 'bestSellers' ? '#0f172a' : '#64748b',
              bgcolor: activeTab === 'bestSellers' ? '#ffffff' : 'transparent',
              boxShadow: activeTab === 'bestSellers' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              '&:hover': { bgcolor: activeTab === 'bestSellers' ? '#ffffff' : 'rgba(255,255,255,0.5)' },
            }}
          >
            Top Rated
          </Button>

          <Button
            type="button"
            startIcon={<NewReleasesIcon sx={{ fontSize: '1rem' }} />}
            onClick={() => setActiveTab('newArrivals')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              px: 2,
              py: 0.8,
              fontSize: '0.88rem',
              color: activeTab === 'newArrivals' ? '#0f172a' : '#64748b',
              bgcolor: activeTab === 'newArrivals' ? '#ffffff' : 'transparent',
              boxShadow: activeTab === 'newArrivals' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              '&:hover': { bgcolor: activeTab === 'newArrivals' ? '#ffffff' : 'rgba(255,255,255,0.5)' },
            }}
          >
            New Arrivals
          </Button>
        </Box>
      </Box>

      {/* Grid Display */}
      <div className="container" style={{ margin: 0, width: '100%', maxWidth: 'none' }}>
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <Typography variant="body1" sx={{ color: '#64748b', textAlign: 'center', py: 4, width: '100%' }}>
            No products found in this category.
          </Typography>
        )}
      </div>
    </Box>
  );
};

export default FeaturedProducts;
