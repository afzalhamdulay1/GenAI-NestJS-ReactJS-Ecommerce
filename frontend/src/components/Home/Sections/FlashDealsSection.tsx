import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ProductCard from '@/components/Home/ProductCard';
import { Product } from '@/types';

interface FlashDealsSectionProps {
  products: Product[];
}

const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({ products }) => {
  // Filter products that have an active discount (originalPrice > price)
  const dealProducts = products.filter(
    (p) => p.originalPrice && p.originalPrice > 0 && p.originalPrice > p.price
  );

  // Live countdown timer state (24-hour cycle)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (dealProducts.length === 0) return null;

  return (
    <Box sx={{ width: '90vw', maxWidth: '1200px', margin: '3rem auto 1rem auto' }}>
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          border: '1px solid #fecdd3',
          borderRadius: '20px',
          p: { xs: 2.5, md: 3.5 },
          boxShadow: '0 10px 25px -5px rgba(244, 63, 94, 0.1)',
        }}
      >
        {/* Header with Title and Countdown */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justify: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              }}
            >
              <FlashOnIcon sx={{ fontSize: '1.7rem' }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: '#9f1239',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '1.3rem', md: '1.6rem' },
                }}
              >
                Flash Deals of the Day
              </Typography>
              <Typography variant="caption" sx={{ color: '#be123c', fontWeight: 600 }}>
                Grab limited-time discounts before prices reset!
              </Typography>
            </Box>
          </Box>

          {/* Countdown Pill */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#ffffff',
              px: 2,
              py: 0.8,
              borderRadius: '12px',
              border: '1px solid #fda4af',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <AccessTimeIcon sx={{ color: '#e11d48', fontSize: '1.2rem' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#881337', fontSize: '0.9rem' }}>
              Ends in:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <span style={timerBadgeStyle}>{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span style={{ fontWeight: 800, color: '#be123c' }}>:</span>
              <span style={timerBadgeStyle}>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span style={{ fontWeight: 800, color: '#be123c' }}>:</span>
              <span style={timerBadgeStyle}>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </Box>
          </Box>
        </Box>

        {/* Horizontal Scroll Grid for Deal Products */}
        <Box
          sx={{
            display: 'flex',
            gap: 2.5,
            overflowX: 'auto',
            pb: 1.5,
            pt: 0.5,
            '&::-webkit-scrollbar': { height: '6px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#f43f5e', borderRadius: '10px' },
            '&::-webkit-scrollbar-track': { bgcolor: '#ffe4e6', borderRadius: '10px' },
          }}
        >
          {dealProducts.map((product) => (
            <Box key={product._id} sx={{ minWidth: { xs: 220, sm: 260 }, flexShrink: 0 }}>
              <ProductCard product={product} showAddToCart={true} />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

const timerBadgeStyle: React.CSSProperties = {
  backgroundColor: '#be123c',
  color: '#ffffff',
  padding: '2px 7px',
  borderRadius: '6px',
  fontWeight: 800,
  fontSize: '0.82rem',
  fontFamily: 'monospace',
};

export default FlashDealsSection;
