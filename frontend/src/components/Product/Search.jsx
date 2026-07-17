import React, { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import MetaData from "../Layout/MetaData";
import "./Search.css";

const Search = () => {
  const [keyword, setKeyword] = useState(""); // Local state for the search keyword
  const navigate = useNavigate(); // Replacing history with useNavigate from React Router v6

  const searchSubmitHandler = (e) => {
    e.preventDefault();

    // Redirect based on the search keyword
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      navigate(`/products/${trimmedKeyword}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <Fragment>
      <MetaData title="Search A Product -- ECOMMERCE" />
      <div className="searchBox">
        <MetaData title="Explore Our Products -- ECOMMERCE" />
        
        <div className="searchHeader">
          <h1>Discover Something New</h1>
          <p>Find the best gadgets, fashion, and lifestyle essentials with ease.</p>
        </div>

        <form className="searchInputContainer" onSubmit={searchSubmitHandler}>
          <input
            type="text"
            placeholder="Search our catalog (e.g. Laptop, Nike, Blue)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <input type="submit" value="Search Now" />
        </form>
      </div>
    </Fragment>
  );
};

export default Search;
