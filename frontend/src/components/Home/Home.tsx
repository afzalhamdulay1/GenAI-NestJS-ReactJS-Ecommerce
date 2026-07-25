import React, { Fragment, useEffect } from "react";
import { CgMouse } from "react-icons/cg";
import { FaShippingFast, FaShieldAlt, FaHeadset, FaUndoAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Home.css";
import ProductCard from "./ProductCard";
import MetaData from "../Layout/MetaData";
import Loader from "../Layout/Loader/Loader";
import { toast } from "react-toastify";
import { getProducts, clearErrors } from "../../features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    dispatch(getProducts({ keyword: "" }));
  }, [dispatch]);

  const categories = [
    "Laptop",
    "Footwear",
    "Bottom",
    "Tops",
    "Attire",
    "Camera",
    "SmartPhones",
  ];

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="ECOMMERCE - Premium Store" />

          {/* Hero Banner */}
          <div className="banner">
            <div className="bannerContent">
              <p>Welcome to our store</p>
              <h1>Curated Collections</h1>
              <p className="subtitle">Handpicked essentials for your everyday lifestyle.</p>
              
              <a href="#container" className="scrollButton">
                Shop Now <CgMouse />
              </a>
            </div>
          </div>

          {/* Value Proposition Services */}
          <section className="servicesSection">
            <div className="serviceCard">
              <FaShippingFast className="serviceIcon" />
              <h3>Free Shipping</h3>
              <p>On all orders over $100</p>
            </div>
            <div className="serviceCard">
              <FaShieldAlt className="serviceIcon" />
              <h3>Secure Payment</h3>
              <p>100% secure checkout</p>
            </div>
            <div className="serviceCard">
              <FaHeadset className="serviceIcon" />
              <h3>24/7 Support</h3>
              <p>Dedicated support anytime</p>
            </div>
            <div className="serviceCard">
              <FaUndoAlt className="serviceIcon" />
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
          </section>

          {/* Shop By Category */}
          <section className="categoriesSection">
            <h2 className="sectionHeading">Shop By Category</h2>
            <div className="categoriesGrid">
              {categories.map((cat) => (
                <Link to={`/products?category=${cat}`} className="categoryItem" key={cat}>
                  <div className="categoryImagePlaceholder">
                    <span>{cat}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <h2 className="sectionHeading">Featured Products</h2>

          <div className="container" id="container">
            {products &&
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
