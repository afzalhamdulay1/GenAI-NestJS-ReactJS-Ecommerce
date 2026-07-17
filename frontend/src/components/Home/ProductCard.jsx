  import React from 'react'
  import { Link } from 'react-router-dom'
  import ReactStars from "react-rating-stars-component"
  import { Rating } from "@mui/material";


  const ProductCard = ({ product }) => {

      const options1 = {
          edit: false,
          color: "rgba(20,20,20,0.1)",
          activeColor: "rgb(248 113 113)",
          size: window.innerWidth > 600 ? 20 : 25,
          value: product.ratings,
          isHalf: true
      }

      const options2 = {
        value: product.ratings,
        readOnly: true,
        precision: 0.5,
      };
    
    return (
      <Link className="productCard" to={`/product/${product._id}`}>
        <img src={product.images[0].url} alt={product.name} />
        <p>{product.name}</p>
        <p>{product.category}</p>
        <div>
          <Rating {...options2} />{" "}
          {/* <ReactStars {...options2} />{" "} */}
          <span className="productCardSpan">
            {" "}
            ({product.numOfReviews} Reviews)
          </span>
        </div>
        <span>{`₹${product.price}`}</span>
      </Link>
    );
  };

  export default ProductCard;


