import React, { Fragment, useEffect } from "react";
import { CgMouse } from "react-icons/cg"; // Correct icon import
import "./Home.css";
import ProductCard from "./ProductCard";
import MetaData from "../Layout/MetaData";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../Layout/Loader/Loader";
import { toast } from "react-toastify";
import { getProducts, clearErrors } from "../../features/products/productsSlice"; // Updated import

const Home = () => {
  
  const dispatch = useDispatch();

  // Using useSelector to access the products, loading, and error states from Redux
  const { products, productsCount, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    // Handle error if it occurs
    if (error) {
      toast.error(error);  // Show error using toast
      dispatch(clearErrors());  // Dispatch to clear error in Redux state
    }

    // Dispatch the getProducts action to fetch products
    dispatch(getProducts({ keyword: "" })); // You can pass search params here (like a keyword) if needed
  }, [dispatch, error, toast]);  // Dependencies: dispatch, error

  return (
    <Fragment>
      {loading ? (
        <Loader /> // Show Loader while fetching data
      ) : (
        <Fragment>
          <MetaData title="ECOMMERCE" />

          <div className="banner">
            <p>Welcome to Ecommerce</p>
            <h1>FIND AMAZING PRODUCTS BELOW</h1>

            <a href="#container">
              <button>
                Scroll <CgMouse />
              </button>
            </a>
          </div>

          <h2 className="homeHeading">Featured Products</h2>

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
