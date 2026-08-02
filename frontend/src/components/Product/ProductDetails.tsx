import React, { Fragment, useEffect, useState, useMemo } from "react";
import "@/components/Product/ProductDetails.css";
import {
  fetchProductDetails,
  clearErrors,
} from "@/features/products/productSlice";
import Loader from "@/components/Layout/Loader/Loader";
import { toast } from "react-toastify";
import MetaData from "@/components/Layout/MetaData";
import { addItemsToCart } from "@/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Rating } from "@mui/material";
import ProductImageGallery from "@/components/Product/Sections/ProductImageGallery";
import SubmitReviewDialog from "@/components/Product/Sections/SubmitReviewDialog";
import ProductReviewsSection from "@/components/Product/Sections/ProductReviewsSection";
import { useParams, useNavigate } from "react-router-dom";
import { createNewReview } from "@/features/review/reviewSlice";
import { toggleWishlist } from "@/features/user/userSlice";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const ProductDetails: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { product, loading, error } = useAppSelector((state) => state.product);
  const { user, wishlist, isAuthenticated } = useAppSelector((state) => state.user);

  const isWishlisted = wishlist?.some((item) => item._id === product?._id);

  const wishlistToggleHandler = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (product?._id) {
      dispatch(toggleWishlist(product._id));
      toast.success(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist");
    }
  };

  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      if (product.hasVariants && product.options && product.options.length > 0) {
        const initialAttrs: Record<string, string> = {};
        product.options.forEach((opt) => {
          if (opt.values && opt.values.length > 0) {
            initialAttrs[opt.name] = opt.values[0];
          }
        });
        setSelectedAttributes(initialAttrs);
      }
    }
  }, [product]);

  const currentVariant = useMemo(() => {
    if (!product?.hasVariants || !product?.variants?.length) return null;
    return product.variants.find((v) => {
      const attrs = v.attributes || {};
      return Object.keys(selectedAttributes).every((k) => attrs[k] === selectedAttributes[k]);
    });
  }, [product, selectedAttributes]);

  const activePrice = currentVariant?.price !== undefined ? currentVariant.price : (product?.price || 0);
  const stockCount = currentVariant ? currentVariant.stock : (product?.stock || 0);

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
    dispatch(
      addItemsToCart({
        id,
        quantity,
        selectedVariant: product?.hasVariants ? selectedAttributes : undefined,
        price: activePrice,
        stock: stockCount,
      })
    );
  };

  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const submitReviewToggle = () => {
    setOpen((prev) => !prev);
  };

  const reviewSubmitHandler = async (images: string[] = []) => {
    if (!id) return;
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        productId: id,
        rating,
        comment,
        images,
      };

      await dispatch(createNewReview(reviewData)).unwrap();
      setOpen(false);
      setRating(0);
      setComment("");
      dispatch(fetchProductDetails(id));
      toast.success("Review submitted successfully");
    } catch (err: unknown) {
      const errorMessage = typeof err === 'string' ? err : err instanceof Error ? err.message : "Failed to submit review";
      toast.error(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
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
    } else if (quantity < 1) {
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.2rem' }}>
                  {(() => {
                    const effectiveOrigPrice = currentVariant?.originalPrice !== undefined
                      ? currentVariant.originalPrice
                      : product?.originalPrice;

                    const hasDiscount = Boolean(effectiveOrigPrice && effectiveOrigPrice > 0 && effectiveOrigPrice > activePrice);
                    const savingsAmount = hasDiscount && effectiveOrigPrice ? effectiveOrigPrice - activePrice : 0;
                    const savingsPct = hasDiscount && effectiveOrigPrice ? Math.min(100, Math.round((savingsAmount / effectiveOrigPrice) * 100)) : 0;

                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                            ₹{activePrice}
                          </span>
                          {hasDiscount && (
                            <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.3rem', fontWeight: 600 }}>
                              ₹{effectiveOrigPrice}
                            </span>
                          )}
                        </div>

                        {hasDiscount && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', width: 'fit-content' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                              Save ₹{savingsAmount}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ef4444', color: '#ffffff', padding: '2px 8px', borderRadius: '12px' }}>
                              {savingsPct}% OFF
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {product?.hasVariants && product.options && product.options.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    {product.options.map((opt) => (
                      <div key={opt.name} style={{ marginBottom: "1rem" }}>
                        <p style={{ fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                          Select {opt.name}: <span style={{ color: "#0284c7" }}>{selectedAttributes[opt.name]}</span>
                        </p>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {opt.values.map((val) => {
                            const isSelected = selectedAttributes[opt.name] === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() =>
                                  setSelectedAttributes((prev) => ({
                                    ...prev,
                                    [opt.name]: val,
                                  }))
                                }
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  border: isSelected ? "2px solid #0284c7" : "1px solid #cbd5e1",
                                  backgroundColor: isSelected ? "#e0f2fe" : "#ffffff",
                                  color: isSelected ? "#0369a1" : "#334155",
                                  fontWeight: isSelected ? 700 : 500,
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="detailsBlock-3-1">
                  <div className="detailsBlock-3-1-1">
                    <button onClick={decreaseQuantity}>-</button>
                    <input readOnly type="number" value={quantity} />
                    <button onClick={increaseQuantity}>+</button>
                  </div>
                  <button
                    className="addToCartBtn"
                    disabled={stockCount < 1}
                    onClick={addToCartHandler}
                  >
                    Add to Cart
                  </button>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <button
                    className={`wishlistBtnDetail ${isWishlisted ? "saved" : "unsaved"}`}
                    onClick={wishlistToggleHandler}
                  >
                    {isWishlisted ? (
                      <FavoriteIcon sx={{ color: "#ef4444", fontSize: "1.2rem" }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: "1.2rem" }} />
                    )}
                    <span>{isWishlisted ? "Wishlisted" : "Save to Wishlist"}</span>
                  </button>
                </div>

                <p>
                  Status:{" "}
                  {stockCount < 1 ? (
                    <b className="redColor">Out of Stock</b>
                  ) : stockCount <= 5 ? (
                    <b style={{ color: "#d97706", fontWeight: 700 }}>
                      ⚠️ Only {stockCount} left in stock - order soon!
                    </b>
                  ) : (
                    <b className="greenColor">In Stock</b>
                  )}
                </p>
              </div>

              <div className="detailsBlock-4">
                Description : <p>{product?.description}</p>
              </div>

              <button onClick={submitReviewToggle} className="submitReview">
                Submit Review
              </button>
            </div>
          </div>

          <SubmitReviewDialog
            open={open}
            rating={rating}
            comment={comment}
            onClose={submitReviewToggle}
            setRating={setRating}
            setComment={setComment}
            onSubmit={reviewSubmitHandler}
            isSubmitting={isSubmittingReview}
          />

          <ProductReviewsSection reviews={product?.reviews} />
        </Fragment>
      )}
    </Fragment>
  );
};

export default ProductDetails;
