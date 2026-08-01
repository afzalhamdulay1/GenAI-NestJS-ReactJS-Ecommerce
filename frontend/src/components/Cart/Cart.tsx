import React, { Fragment, useState, useEffect, useCallback } from "react";
import "@/components/Cart/Cart.css";
import CartItemCard from "@/components/Cart/CartItemCard";
import { removeItem, changeItemQuantityInCart } from "@/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useNavigate } from "react-router-dom";
import EmptyCartState from "@/components/Cart/Sections/EmptyCartState";
import CartSummary from "@/components/Cart/Sections/CartSummary";
import { api } from "@/services/api";
import { toast } from "react-toastify";

import { toggleWishlist } from "@/features/user/userSlice";

const getItemKey = (productId: string, selectedVariant?: Record<string, string>) => {
  return `${productId}-${JSON.stringify(selectedVariant || {})}`;
};

const Cart: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cartItems } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.user);

  const handleSaveForLater = async (payload: { productId: string; selectedVariant?: Record<string, string> }) => {
    if (!isAuthenticated) {
      toast.info("Please login to save items to your wishlist.");
      navigate("/login");
      return;
    }

    try {
      await dispatch(toggleWishlist(payload.productId)).unwrap();
      dispatch(removeItem(payload));
      toast.success("Item saved to your Wishlist!");
    } catch (err) {
      toast.error("Failed to save item to wishlist.");
    }
  };

  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [liveStocks, setLiveStocks] = useState<Record<string, number>>({});

  const validateCartItems = useCallback(async () => {
    if (cartItems.length === 0) {
      setItemErrors({});
      setLiveStocks({});
      return;
    }

    const newErrors: Record<string, string> = {};
    const newLiveStocks: Record<string, number> = {};

    for (const item of cartItems) {
      const key = getItemKey(item.productId, item.selectedVariant);
      try {
        const { data } = await api.get(`/product/${item.productId}`);
        const product = data.product;

        let availableStock = product.stock;

        if (product.hasVariants && item.selectedVariant && product.variants) {
          const match = product.variants.find((v: any) => {
            const keys1 = Object.keys(v.attributes || {});
            const keys2 = Object.keys(item.selectedVariant || {});
            if (keys1.length !== keys2.length) return false;
            return keys1.every((k) => v.attributes[k] === item.selectedVariant![k]);
          });

          if (match) {
            availableStock = match.stock;
          } else {
            availableStock = 0; // Variant combination deleted by admin
          }
        }

        newLiveStocks[key] = availableStock;

        if (availableStock <= 0) {
          newErrors[key] = "Out of stock — please remove";
        } else if (item.quantity > availableStock) {
          newErrors[key] = `Only ${availableStock} available in stock`;
        }
      } catch (err) {
        newLiveStocks[key] = 0;
        newErrors[key] = "Item unavailable — please remove";
      }
    }

    setLiveStocks(newLiveStocks);
    setItemErrors(newErrors);
  }, [cartItems]);

  useEffect(() => {
    validateCartItems();
  }, [validateCartItems]);

  const increaseQuantity = (productId: string, quantity: number, selectedVariant?: Record<string, string>, oldStock?: number) => {
    const key = getItemKey(productId, selectedVariant);
    const maxAllowedStock = liveStocks[key] !== undefined ? liveStocks[key] : (oldStock || 0);

    if (quantity >= maxAllowedStock) {
      toast.error(`Only ${maxAllowedStock} left in stock.`);
      return;
    }
    const newQty = quantity + 1;
    dispatch(changeItemQuantityInCart({ productId, quantity: newQty, selectedVariant }));
  };

  const decreaseQuantity = (productId: string, quantity: number, selectedVariant?: Record<string, string>) => {
    if (quantity <= 1) return;
    const newQty = quantity - 1;
    dispatch(changeItemQuantityInCart({ productId, quantity: newQty, selectedVariant }));
  };

  const deleteItem = (payload: { productId: string; selectedVariant?: Record<string, string> }) => {
    dispatch(removeItem(payload));
  };

  const checkoutHandler = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (Object.keys(itemErrors).length > 0) {
      toast.error("Some items in your cart are out of stock or unavailable.");
      return;
    }

    if (isAuthenticated) {
      navigate("/shipping");
    } else {
      navigate("/checkout/option");
    }
  };

  const grossTotal = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

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
              cartItems.map((item) => {
                const itemKey = getItemKey(item.productId, item.selectedVariant);
                const errorMsg = itemErrors[itemKey];

                return (
                  <div className="cartContainer" key={itemKey}>
                    <CartItemCard 
                      item={item} 
                      deleteItem={deleteItem} 
                      saveForLater={handleSaveForLater}
                      error={errorMsg}
                      stock={liveStocks[itemKey]} 
                    />
                    <div className="cartInput">
                      <button
                        onClick={() =>
                          decreaseQuantity(item.productId, item.quantity, item.selectedVariant)
                        }
                      >
                        -
                      </button>
                      <input type="number" value={item.quantity} readOnly />
                      <button
                        onClick={() =>
                          increaseQuantity(item.productId, item.quantity, item.selectedVariant, item.stock)
                        }
                      >
                        +
                      </button>
                    </div>
                    <p className="cartSubtotal">{`₹${
                      item.price * item.quantity
                    }`}</p>
                  </div>
                );
              })}

            <CartSummary grossTotal={grossTotal} onCheckout={checkoutHandler} />
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default Cart;
