// import React, { Fragment } from "react";
// import "./Cart.css";
// import CartItemCard from "./CartItemCard";
// import { useSelector, useDispatch } from "react-redux";
// import { addItem, removeItem } from "../../features/cart/cartSlice";
// import { Typography } from "@mui/material";
// import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
// import { Link, useNavigate } from "react-router-dom";


// const Cart = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { items } = useSelector((state) => state.cart);

//   const increaseQuantity = (id, quantity, stock) => {
//     const newQty = quantity + 1;
//     if (stock <= quantity) {
//       return;
//     }
//     dispatch(addItem(id, newQty));
//   };

//   const decreaseQuantity = (id, quantity) => {
//     const newQty = quantity - 1;
//     if (1 >= quantity) {
//       return;
//     }
//     dispatch(addItem(id, newQty));
//   };

//   const deleteItem = (id) => {
//     dispatch(removeItem(id));
//   };

//   const checkoutHandler = () => {
//     navigate("/login?redirect=shipping");
//   };

//   return (
//     <Fragment>
//       {items.length === 0 ? (
//         <div className="emptyCart">
//           <RemoveShoppingCartIcon />

//           <Typography>No Product in Your Cart</Typography>
//           <Link to="/products">View Products</Link>
//         </div>
//       ) : (
//         <Fragment>
//           <div className="cartPage">
//             <div className="cartHeader">
//               <p>Product</p>
//               <p>Quantity</p>
//               <p>Subtotal</p>
//             </div>

//             {items &&
//               items.map((item) => (
//                 <div className="cartContainer" key={item.product}>
//                   <CartItemCard item={item} deleteItem={deleteItem} />
//                   <div className="cartInput">
//                     <button
//                       onClick={() =>
//                         decreaseQuantity(item.product, item.quantity)
//                       }
//                     >
//                       -
//                     </button>
//                     <input type="number" value={item.quantity} readOnly />
//                     <button
//                       onClick={() =>
//                         increaseQuantity(
//                           item.product,
//                           item.quantity,
//                           item.stock
//                         )
//                       }
//                     >
//                       +
//                     </button>
//                   </div>
//                   <p className="cartSubtotal">{`₹${
//                     item.price * item.quantity
//                   }`}</p>
//                 </div>
//               ))}

//             <div className="cartGrossProfit">
//               <div></div>
//               <div className="cartGrossProfitBox">
//                 <p>Gross Total</p>
//                 <p>{`₹${items.reduce(
//                   (acc, item) => acc + item.quantity * item.price,
//                   0
//                 )}`}</p>
//               </div>
//               <div></div>
//               <div className="checkOutBtn">
//                 <button onClick={checkoutHandler}>Check Out</button>
//               </div>
//             </div>
//           </div>
//         </Fragment>
//       )}
//     </Fragment>
//   );
// };

// export default Cart;

import React, { Fragment, useEffect } from "react";
import "./Cart.css";
import CartItemCard from "./CartItemCard";
import { useSelector, useDispatch } from "react-redux";
import { removeItem, changeItemQuantityInCart } from "../../features/cart/cartSlice";
import { Typography } from "@mui/material";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);

  const increaseQuantity = (productId, quantity, stock) => {
    // console.log(item);
    let newQty = quantity + 1;
    
    if (stock <= quantity) {
        return;
    }
    // console.log(newQty);
    dispatch(changeItemQuantityInCart({productId, quantity:newQty}));
  };

  const decreaseQuantity = (productId, quantity) => {
    if (quantity <= 1) return;
    const newQty = quantity - 1;
    dispatch(changeItemQuantityInCart({ productId, quantity: newQty }));
  };

  const deleteItem = (productId) => {
    dispatch(removeItem(productId));
  };

  const checkoutHandler = () => {
    navigate("/shipping");
  };

  useEffect(() => {
    console.log(cartItems);
    
  },[])

  return (
    <Fragment>
      {cartItems.length === 0 ? (
        <div className="emptyCart">
          <RemoveShoppingCartIcon />
          <Typography>No Product in Your Cart</Typography>
          <Link to="/products">View Products</Link>
        </div>
      ) : (
        <Fragment>
          <div className="cartPage">
            <div className="cartHeader">
              <p>Product</p>
              <p>Quantity</p>
              <p>Subtotal</p>
            </div>

            {cartItems &&
              cartItems.map((item) => (
                <div className="cartContainer" key={item.productId}>
                  <CartItemCard item={item} deleteItem={deleteItem} />
                  <div className="cartInput">
                    <button
                      onClick={() =>
                        decreaseQuantity(item.productId, item.quantity)
                      }
                    >
                      -
                    </button>
                    <input type="number" value={item.quantity} readOnly />
                    <button
                      onClick={() =>
                        increaseQuantity(item.productId, item.quantity, item.stock)
                      }
                    >
                      +
                    </button>
                  </div>
                  <p className="cartSubtotal">{`₹${
                    item.price * item.quantity
                  }`}</p>
                </div>
              ))}

            <div className="cartGrossProfit">
              <div></div>
              <div className="cartGrossProfitBox">
                <p>Gross Total</p>
                <p>{`₹${cartItems.reduce(
                  (acc, item) => acc + item.quantity * item.price,
                  0
                )}`}</p>
              </div>
              <div></div>
              <div className="checkOutBtn">
                <button onClick={checkoutHandler}>Check Out</button>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Cart;

