import React, { Fragment } from "react";
import "@/components/Cart/Cart.css";
import CartItemCard from "@/components/Cart/CartItemCard";
import { removeItem, changeItemQuantityInCart } from "@/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useNavigate } from "react-router-dom";
import EmptyCartState from "@/components/Cart/Sections/EmptyCartState";
import CartSummary from "@/components/Cart/Sections/CartSummary";

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cartItems } = useAppSelector((state) => state.cart);

  const increaseQuantity = (productId: string, quantity: number, stock: number) => {
    if (stock <= quantity) return;
    const newQty = quantity + 1;
    dispatch(changeItemQuantityInCart({ productId, quantity: newQty }));
  };

  const decreaseQuantity = (productId: string, quantity: number) => {
    if (quantity <= 1) return;
    const newQty = quantity - 1;
    dispatch(changeItemQuantityInCart({ productId, quantity: newQty }));
  };

  const deleteItem = (payload: { productId: string }) => {
    dispatch(removeItem(payload));
  };

  const checkoutHandler = () => {
    navigate("/shipping");
  };

  return (
    <Fragment>
      {cartItems.length === 0 ? (
        <EmptyCartState />
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

            <CartSummary
              grossTotal={cartItems.reduce(
                (acc, item) => acc + item.quantity * item.price,
                0
              )}
              onCheckout={checkoutHandler}
            />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Cart;
