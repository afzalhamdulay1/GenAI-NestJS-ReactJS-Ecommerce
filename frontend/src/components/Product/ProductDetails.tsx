import React, { Fragment, useEffect, useState } from "react";
import "@/components/Product/ProductDetails.css";
import {
  fetchProductDetails,
  clearErrors,
} from "@/features/products/productSlice";
import ReviewCard from "@/components/Product/ReviewCard";
import Loader from "@/components/Layout/Loader/Loader";
import { toast } from "react-toastify";
import MetaData from "@/components/Layout/MetaData";
import { addItemsToCart } from "@/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Rating } from "@mui/material";
import ProductImageGallery from "@/components/Product/Sections/ProductImageGallery";
import SubmitReviewDialog from "@/components/Product/Sections/SubmitReviewDialog";
import { useParams, useNavigate } from "react-router-dom";
import { createNewReview } from "@/features/review/reviewSlice";

const ProductDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { product, loading, error } = useAppSelector((state) => state.product);
  const { user } = useAppSelector((state) => state.user);

  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [stock, setStock] = useState(0);
  const stockCount = stock;

  useEffect(() => {
    if (product) {
      setStock(product.stock || 0);
    }
  }, [product]);

  const options = {
    size: "large" as const,
    value: product?.ratings || 0,
    readOnly: true,
    precision: 0.5,
  };

  const increaseQuantity = () => {
    if (stockCount <= quantity) return;
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const addToCartHandler = () => {
    if (!id) return;
    dispatch(addItemsToCart({ id, quantity }));
  };

  const submitReviewToggle = () => {
    setOpen((prev) => !prev);
  };

  const reviewSubmitHandler = async () => {
    if (!user) {
      toast.error("Please login to submit a review");
      navigate("/login");
      return;
    }

    if (rating === 0 || !comment.trim()) {
      toast.error("Please provide a rating and a comment");
      return;
    }

    if (!id) return;

    const reviewData = { rating, comment, productId: id };
    await dispatch(createNewReview(reviewData));
    dispatch(fetchProductDetails(id));
    setOpen(false);
    toast.success("Review submitted successfully");
  };

  useEffect(() => {
    if (error) {
      if (error === "Product not found") {
        toast.error("Product not found");
        navigate("/");
      } else {
        toast.error(error);
      }
      dispatch(clearErrors());
    }

    if (id) {
      dispatch(fetchProductDetails(id));
    }
  }, [dispatch, id, error, navigate]);

  useEffect(() => {
    if (stockCount < 1) {
      setQuantity(0);
    } else {
      setQuantity(1);
    }
  }, [stockCount]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={`${product?.name || 'Product'} -- ECOMMERCE`} />
          <div className="ProductDetails">
            <div>
              <ProductImageGallery images={product?.images} />
            </div>

            <div>
              <div className="detailsBlock-1">
                <h2>{product?.name}</h2>
                <p>Product # {product?._id}</p>
              </div>
              <div className="detailsBlock-2">
                <Rating {...options} />
                <span className="detailsBlock-2-span">
                  ({product?.numOfReviews} Reviews)
                </span>
              </div>
              <div className="detailsBlock-3">
                <h1>{`₹${product?.price}`}</h1>
                <div className="detailsBlock-3-1">
                  <div className="detailsBlock-3-1-1">
                    <button onClick={decreaseQuantity}>-</button>
                    <input readOnly type="number" value={quantity} />
                    <button onClick={increaseQuantity}>+</button>
                  </div>
                  <button
                    disabled={stockCount < 1}
                    onClick={addToCartHandler}
                  >
                    Add to Cart
                  </button>
                </div>

                <p>
                  Status:{" "}
                  <b
                    className={stockCount < 1 ? "redColor" : "greenColor"}
                  >
                    {stockCount < 1 ? "OutOfStock" : "InStock"}
                  </b>
                </p>
              </div>

              <div className="detailsBlock-4">
                Description: <p>{product?.description}</p>
              </div>

              <button onClick={submitReviewToggle} className="submitReview">
                Submit Review
              </button>
            </div>
          </div>

          <h3 className="reviewsHeading">REVIEWS</h3>

          <SubmitReviewDialog
            open={open}
            onClose={submitReviewToggle}
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            onSubmit={reviewSubmitHandler}
          />

          {product?.reviews?.length ? (
            <div className="reviews">
              {product.reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          ) : (
            <p className="noReviews">No Reviews Yet</p>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default ProductDetails;
