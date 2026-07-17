
import { Fragment, useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./ProductDetails.css";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProductDetails,
  clearErrors,
} from "../../features/products/productSlice";
import ReviewCard from "./ReviewCard";
import Loader from "../Layout/Loader/Loader";
import { toast } from "react-toastify";
import MetaData from "../Layout/MetaData";
import { addItem } from "../../features/cart/cartSlice";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Rating } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { createNewReview } from "../../features/review/reviewSlice";

const ProductDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { product, loading, error } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.user);

  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const options = {
    size: "large",
    value: product?.ratings || 0,
    readOnly: true,
    precision: 0.5,
  };

  const increaseQuantity = () => {
    if (product?.stock <= quantity) return;
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const addToCartHandler = () => {
    // if (!user) {
    //   toast.error("Please login to add items to the cart");
    //   navigate("/login");
    //   return;
    // }

    dispatch(addItem({ productId: id, name: product.name, price: product.price, image:product.images[0].url ,stock: product.stock, quantity }));
    // toast.success("Item Added To Cart");
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

    const reviewData = { rating, comment, productId: id };
    // Update to your appropriate action to submit a review
    const review = await dispatch(createNewReview(reviewData));
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

    dispatch(fetchProductDetails(id));
  }, [dispatch, id, error, navigate]);

  useEffect(() => {
    if (product?.stock < 1) {
      setQuantity(0);
    } else {
      setQuantity(1);
    }
  }, [product?.stock]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={`${product?.name} -- ECOMMERCE`} />
          <div className="ProductDetails">
            <div>
              <Carousel
                showArrows={true}
                showThumbs={false}
                showStatus={false}
                infiniteLoop={true}
                autoPlay={true}
                interval={3000}
                dynamicHeight={true}
                emulateTouch={true}
              >
                {product.images &&
                  product.images.map((item, i) => (
                    <div key={i}>
                      <img
                        className="CarouselImage"
                        src={item.url}
                        alt={`${i} Slide`}
                        style={{ maxHeight: "400px", objectFit: "contain" }}
                      />
                    </div>
                  ))}
              </Carousel>
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
                    disabled={product?.stock < 1}
                    onClick={addToCartHandler}
                  >
                    Add to Cart
                  </button>
                </div>

                <p>
                  Status:{" "}
                  <b
                    className={product?.stock < 1 ? "redColor" : "greenColor"}
                  >
                    {product?.stock < 1 ? "OutOfStock" : "InStock"}
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

          <Dialog
            aria-labelledby="simple-dialog-title"
            open={open}
            onClose={submitReviewToggle}
          >
            <DialogTitle>Submit Review</DialogTitle>
            <DialogContent className="submitDialog">
              <Rating
                onChange={(e) => setRating(e.target.value)}
                value={rating}
                size="large"
              />

              <textarea
                className="submitDialogTextArea"
                cols="30"
                rows="5"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </DialogContent>
            <DialogActions>
              <Button onClick={submitReviewToggle} color="secondary">
                Cancel
              </Button>
              <Button onClick={reviewSubmitHandler} color="primary">
                Submit
              </Button>
            </DialogActions>
          </Dialog>

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

