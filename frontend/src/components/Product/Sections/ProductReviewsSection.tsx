import React from "react";
import ReviewCard from "@/components/Product/ReviewCard";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  user: string;
}

interface ProductReviewsSectionProps {
  reviews?: Review[];
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ reviews }) => {
  return (
    <>
      {reviews && reviews.length > 0 ? (
        <div className="reviews">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      ) : (
        <p className="noReviews">No Reviews Yet</p>
      )}
    </>
  );
};

export default ProductReviewsSection;
