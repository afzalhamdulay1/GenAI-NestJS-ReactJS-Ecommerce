// import React, { Fragment, useEffect, useState } from "react";
// import "./Products.css";
// import ProductCard from "../Home/ProductCard";
// import MetaData from "../Layout/MetaData";
// import { useSelector, useDispatch } from "react-redux";
// import Loader from "../Layout/Loader/Loader";
// import Pagination from "react-js-pagination";
// import { toast } from "react-toastify";
// import { useParams, useNavigate } from "react-router-dom";
// import { getProducts, clearErrors } from "../../features/products/productsSlice"; // Updated import
// import {Slider, Typography} from '@mui/material'

// const categories = [
//   "All",
//   "Laptop",
//   "Footwear",
//   "Bottom",
//   "Clothing",
//   "Tops",
//   "Attire",
//   "Camera",
//   "SmartPhones",
// ];

// const Products = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate(); // Initialize navigate
//     const { keyword } = useParams();
//     const mykeyword = keyword

//     const [currentPage, setCurrentPage] = useState(1);
//     const [price, setPrice] = useState([0, 250000]);
//     const [category, setCategory] = useState("");
//     const [ratings, setRatings] = useState(0);


//     // Using useSelector to access the products, loading, and error states from Redux
//     const { products, productsCount, resultPerPage,filteredProductsCount, loading, error } = useSelector((state) => state.products);
  
//     const setCurrentPageNo = (e) => {
//       setCurrentPage(e);
//     };

//     const priceHandler = (event, newPrice) => {
//         setPrice(newPrice);
//         console.log(`price: ${price}`);
//         console.log(`newPrice: ${newPrice}`);
        
        
//     };

//     useEffect(() => {
//       // Handle error if it occurs
//       if (error) {
//         toast.error(error);  // Show error using toast
//         dispatch(clearErrors());  // Dispatch to clear error in Redux state
//       }

//       const params = {
//         keyword: mykeyword,
//         "price[lte]": price[1],
//         "price[gte]": price[0],
//         page: currentPage,
//         "ratings[gte]": ratings
//       };
    
//       // Add category to params only if it's selected
//       if (category) {
//         params.category = category;
//       }
  
//       // Dispatch the getProducts action to fetch products
//       dispatch(getProducts( params )); // You can pass search params here (like a keyword) if needed
//     }, [dispatch, error, toast, keyword, currentPage,price,category,ratings]);  // Dependencies: dispatch, error
  
//     let count = filteredProductsCount;
//     return (
//         <div className="w-full h-[130vh]">
//             <Fragment>
//         {loading ? (
//           <Loader /> // Show Loader while fetching data
//         ) : 
//           (
//           <Fragment>
//             <MetaData title="ECOMMERCE" />
            

//             { products && products.length === 0 ? (<div className="flex justify-center items-center h-full"><h2>No Products Found</h2></div> ) :
//                 (
//                   <Fragment>
//                     <p>Total Products: {filteredProductsCount}</p>
//                     <div className="container" id="container">
//                         {products &&
//                             products.map((product) => (
//                             <ProductCard key={product._id} product={product} />
//                         ))}
//                     </div>
//                   </Fragment>
                    
//                 )
//             }
            

//             <div className="filterBox">
//             <Typography>Price</Typography>
//             <Slider
//               value={price}
//               onChange={priceHandler}
//               valueLabelDisplay="auto"
//               aria-labelledby="range-slider"
//               min={0}
//               max={250000}
//             />

//             <Typography>Categories</Typography>
//             <ul className="categoryBox">
//               {categories.map((cat) => (
//                 <li
//                   className={`category-link ${category === cat || (cat === "All" && category === "") ? "active" : ""}`}
//                   key={cat}
//                   onClick={() => setCategory(cat === "All" ? "" : cat)}
//                 >
//                   {cat}
//                 </li>
//               ))}
//             </ul>

//             <fieldset>
//               <Typography component="legend">Ratings Above</Typography>
//               <Slider
//                 value={ratings}
//                 onChange={(e, newRating) => {
//                   setRatings(newRating);
//                 }}
//                 aria-labelledby="continuous-slider"
//                 valueLabelDisplay="auto"
//                 min={0}
//                 max={5}
//               />
//             </fieldset>


//             </div>

//             {resultPerPage < count && (
//             <div className="paginationBox">
//               <Pagination
//                 activePage={currentPage}
//                 itemsCountPerPage={resultPerPage}
//                 totalItemsCount={filteredProductsCount}
//                 onChange={setCurrentPageNo}
//                 nextPageText="Next"
//                 prevPageText="Prev"
//                 firstPageText="1st"
//                 lastPageText="Last"
//                 itemClass="page-item"
//                 linkClass="page-link"
//                 activeClass="pageItemActive"
//                 activeLinkClass="pageLinkActive"
//               />
//             </div>
//           )}
//           </Fragment>
          
//         )}
//       </Fragment>
//         </div>
      
//     );
// }

// export default Products

// import React, { Fragment, useEffect, useState } from "react";
// import "./Products.css";
// import ProductCard from "../Home/ProductCard";
// import MetaData from "../Layout/MetaData";
// import { useSelector, useDispatch } from "react-redux";
// import Loader from "../Layout/Loader/Loader";
// import Pagination from "react-js-pagination";
// import { toast } from "react-toastify";
// import { useParams, useNavigate } from "react-router-dom";
// import { getProducts, clearErrors } from "../../features/products/productsSlice"; // Updated import
// import {Slider, Typography} from '@mui/material'

// const categories = [
//   "All",
//   "Laptop",
//   "Footwear",
//   "Bottom",
//   "Clothing",
//   "Tops",
//   "Attire",
//   "Camera",
//   "SmartPhones",
// ];
// const Products = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { keyword } = useParams();
//   const mykeyword = keyword;

//   const [currentPage, setCurrentPage] = useState(1);
//   const [price, setPrice] = useState([0, 250000]);
//   const [finalPrice, setFinalPrice] = useState(price); // Separate state for API calls
//   const [category, setCategory] = useState("");
//   const [ratings, setRatings] = useState(0);

//   const { products, productsCount, resultPerPage, filteredProductsCount, loading, error } = useSelector((state) => state.products);

//   const setCurrentPageNo = (e) => {
//     setCurrentPage(e);
//   };

//   const priceHandler = (event, newPrice) => {
//     setPrice(newPrice); // Update live feedback state
//   };

//   const priceCommitHandler = (event, newPrice) => {
//     setFinalPrice(newPrice); // Update final state for API call
//   };

//   useEffect(() => {
//     if (error) {
//       toast.error(error);
//       dispatch(clearErrors());
//     }

//     const params = {
//       keyword: mykeyword,
//       "price[lte]": finalPrice[1], // Use finalPrice for API call
//       "price[gte]": finalPrice[0],
//       page: currentPage,
//       "ratings[gte]": ratings,
//     };

//     if (category) {
//       params.category = category;
//     }

//     dispatch(getProducts(params));
//   }, [dispatch, error, mykeyword, currentPage, finalPrice, category, ratings]);

//   let count = filteredProductsCount;

//   return (
//     <div className="w-full h-[130vh]">
//       <Fragment>
//         {loading ? (
//           <Loader />
//         ) : (
//           <Fragment>
//             <MetaData title="ECOMMERCE" />

//             {products && products.length === 0 ? (
//               <div className="flex justify-center items-center h-full">
//                 <h2>No Products Found</h2>
//               </div>
//             ) : (
//               <Fragment>
//                 <p>Total Products: {filteredProductsCount}</p>
//                 <div className="container" id="container">
//                   {products &&
//                     products.map((product) => (
//                       <ProductCard key={product._id} product={product} />
//                     ))}
//                 </div>
//               </Fragment>
//             )}

//             <div className="filterBox">
//               <Typography>Price</Typography>
//               <Slider
//                 value={price}
//                 onChange={priceHandler} // Update temporary state for live feedback
//                 onChangeCommitted={priceCommitHandler} // Finalize the value and trigger API call
//                 valueLabelDisplay="auto"
//                 aria-labelledby="range-slider"
//                 min={0}
//                 max={250000}
//               />

//               <Typography>Categories</Typography>
//               <ul className="categoryBox">
//                 {categories.map((cat) => (
//                   <li
//                     className={`category-link ${
//                       category === cat || (cat === "All" && category === "") ? "active" : ""
//                     }`}
//                     key={cat}
//                     onClick={() => setCategory(cat === "All" ? "" : cat)}
//                   >
//                     {cat}
//                   </li>
//                 ))}
//               </ul>

//               <fieldset>
//                 <Typography component="legend">Ratings Above</Typography>
//                 <Slider
//                   value={ratings}
//                   onChange={(e, newRating) => {
//                     setRatings(newRating);
//                   }}
//                   aria-labelledby="continuous-slider"
//                   valueLabelDisplay="auto"
//                   min={0}
//                   max={5}
//                 />
//               </fieldset>
//             </div>

//             {resultPerPage < count && (
//               <div className="paginationBox">
//                 <Pagination
//                   activePage={currentPage}
//                   itemsCountPerPage={resultPerPage}
//                   totalItemsCount={filteredProductsCount}
//                   onChange={setCurrentPageNo}
//                   nextPageText="Next"
//                   prevPageText="Prev"
//                   firstPageText="1st"
//                   lastPageText="Last"
//                   itemClass="page-item"
//                   linkClass="page-link"
//                   activeClass="pageItemActive"
//                   activeLinkClass="pageLinkActive"
//                 />
//               </div>
//             )}
//           </Fragment>
//         )}
//       </Fragment>
//     </div>
//   );
// };

// export default Products


import React, { Fragment, useEffect, useState } from "react";
import "./Products.css";
import ProductCard from "../Home/ProductCard";
import MetaData from "../Layout/MetaData";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../Layout/Loader/Loader";
import Pagination from "react-js-pagination";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { getProducts, clearErrors } from "../../features/products/productsSlice"; // Updated import
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

const Products = () => {
  const dispatch = useDispatch();
  const { keyword } = useParams();
  const mykeyword = keyword;

  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState([0, 250000]);
  const [category, setCategory] = useState("");
  const [ratings, setRatings] = useState(0);

  const [filters, setFilters] = useState({
    price: [0, 250000],
    category: "",
    ratings: 0,
  });

  const { products, productsCount, resultPerPage, filteredProductsCount, loading, error } = useSelector(
    (state) => state.products
  );

  const setCurrentPageNo = (e) => {
    setCurrentPage(e);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    setFilters({ price, category, ratings }); // Update filters only on button click
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    const params = {
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
  }, [dispatch, error, mykeyword, currentPage, filters]);

  let count = filteredProductsCount;

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
                    onChange={(event, newPrice) => setPrice(newPrice)}
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
                      onChange={(e, newRating) => setRatings(newRating)}
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

            {resultPerPage < count && (
              <div className="paginationBox">
                <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={resultPerPage}
                  totalItemsCount={filteredProductsCount}
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


