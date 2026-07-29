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

      <Button variant="contained" className="applyFiltersBtn" onClick={handleSubmit}>
        Apply Filters
      </Button>
    </div>
  );
};

export default ProductFilterSidebar;
