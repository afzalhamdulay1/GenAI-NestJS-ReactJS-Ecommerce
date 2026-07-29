import React from 'react';
import { Link } from 'react-router-dom';

interface CategorySectionProps {
  categories: string[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  return (
    <section className="categoriesSection">
      <h2 className="sectionHeading">Shop By Category</h2>
      <div className="categoriesGrid">
        {categories.map((cat) => (
          <Link
            to={`/products?category=${cat}`}
            className="categoryItem"
            key={cat}
          >
            <div className="categoryImagePlaceholder">
              <span>{cat}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
