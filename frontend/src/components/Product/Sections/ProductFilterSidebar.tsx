import React from "react";
import { Slider, Typography, Button } from "@mui/material";

interface ProductFilterSidebarProps {
  price: number[];
  setPrice: (price: number[]) => void;
  category: string;
  setCategory: (category: string) => void;
  ratings: number;
  setRatings: (ratings: number) => void;
  categories: string[];
  handleSubmit: () => void;
  handleClearFilters: () => void;
  isMobile?: boolean;
}

const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  price,
  setPrice,
  category,
  setCategory,
  ratings,
  setRatings,
  categories,
  handleSubmit,
  handleClearFilters,
  isMobile = false,
}) => {
  return (
    <div className="filterBox">
      <Typography>Price</Typography>
      <Slider
        value={price}
        onChange={(_event: Event, newPrice: number | number[]) => setPrice(newPrice as number[])}
        valueLabelDisplay="auto"
        aria-labelledby="range-slider"
        min={0}
        max={250000}
      />

      <Typography>Categories</Typography>
      <ul className="categoryBox">
        {categories.map((cat) => (
          <li
            className={`category-link ${
              category === cat || (cat === "All" && category === "") ? "active" : ""
            }`}
            key={cat}
            onClick={() => setCategory(cat === "All" ? "" : cat)}
          >
            {cat}
          </li>
        ))}
      </ul>

      <fieldset>
        <Typography component="legend">Ratings Above</Typography>
        <Slider
          value={ratings}
          onChange={(_e: Event, newRating: number | number[]) => setRatings(newRating as number)}
          aria-labelledby="continuous-slider"
          valueLabelDisplay="auto"
          min={0}
          max={5}
        />
      </fieldset>

      {!isMobile && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: 'column' }}>
          <Button variant="contained" className="applyFiltersBtn" onClick={handleSubmit}>
            Apply Filters
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleClearFilters}
            sx={{
              borderRadius: '50px',
              padding: '0.8rem',
              textTransform: 'none',
              fontWeight: 700,
              fontFamily: '"Outfit", sans-serif',
              color: '#64748b',
              borderColor: '#e2e8f0',
              '&:hover': {
                borderColor: '#cbd5e1',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilterSidebar;
