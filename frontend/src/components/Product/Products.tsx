import React, { Fragment, useEffect, useState } from "react";
import "./Products.css";
import ProductCard from "../Home/ProductCard";
import MetaData from "../Layout/MetaData";
import Loader from "../Layout/Loader/Loader";
import Pagination from "react-js-pagination";
import { toast } from "react-toastify";
import { useParams, useLocation } from "react-router-dom";
import { getProducts, clearErrors } from "../../features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Slider, Typography, Button } from "@mui/material";

const categories = [
  "All",
  "Laptop",
  "Footwear",
  "Bottom",
  "Clothing",
  "Tops",
  "Attire",
  "Camera",
  "SmartPhones",
];

const Products: React.FC = () => {
  const dispatch = useAppDispatch();
  const { keyword } = useParams<{ keyword?: string }>();
  const mykeyword = keyword || "";

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get("category") || "";

  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState<number[]>([0, 250000]);
  const [category, setCategory] = useState(initialCategory);
  const [ratings, setRatings] = useState<number>(0);

  const [filters, setFilters] = useState({
    price: [0, 250000],
    category: initialCategory,
    ratings: 0,
  });

  const { products, resultPerPage, filteredProductsCount, loading, error } = useAppSelector(
    (state) => state.products
  );

  const setCurrentPageNo = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    setFilters({ price, category, ratings });
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    const params: Record<string, any> = {
      keyword: mykeyword,
      "price[lte]": filters.price[1],
      "price[gte]": filters.price[0],
      page: currentPage,
      "ratings[gte]": filters.ratings,
    };

    if (filters.category) {
      params.category = filters.category;
    }

    dispatch(getProducts(params));
  }, [dispatch, mykeyword, currentPage, filters]);

  const count = filteredProductsCount || 0;
  const perPage = resultPerPage || 0;

  return (
    <div className="ProductsPage">
      <Fragment>
        {loading ? (
          <Loader />
        ) : (
          <Fragment>
            <MetaData title="ECOMMERCE" />

            <Fragment>
              <div className="totalProductsText">
                Total Products: {filteredProductsCount}
              </div>

              <div className="productsLayout">
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

                <div className="ProductsContainer">
                  {products && products.length === 0 ? (
                    <div className="noProductsInside">
                      <h2>No Products Found</h2>
                      <p>Try adjusting your filters to find what you're looking for.</p>
                    </div>
                  ) : (
                    products &&
                    products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))
                  )}
                </div>
              </div>
            </Fragment>

            {perPage < count && (
              <div className="paginationBox">
                <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={perPage}
                  totalItemsCount={count}
                  onChange={setCurrentPageNo}
                  nextPageText="Next"
                  prevPageText="Prev"
                  firstPageText="1st"
                  lastPageText="Last"
                  itemClass="page-item"
                  linkClass="page-link"
                  activeClass="pageItemActive"
                  activeLinkClass="pageLinkActive"
                />
              </div>
            )}
          </Fragment>
        )}
      </Fragment>
    </div>
  );
};

export default Products;
