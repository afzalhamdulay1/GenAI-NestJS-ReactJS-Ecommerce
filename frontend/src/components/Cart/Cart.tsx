import React, { Fragment, useState, useEffect, useCallback } from "react";
import "@/components/Cart/Cart.css";
import CartItemCard from "@/components/Cart/CartItemCard";
import { removeItem, changeItemQuantityInCart, syncCartPrices } from "@/features/cart/cartSlice";
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
    const syncUpdates: Array<{
      productId: string;
      selectedVariant?: Record<string, string>;
      price: number;
      stock: number;
      name: string;
      image: string;
    }> = [];

    for (const item of cartItems) {
      const key = getItemKey(item.productId, item.selectedVariant);
      try {
        const { data } = await api.get(`/product/${item.productId}`);
        const product = data.product;

        let availableStock = product.stock;
        let realPrice = product.price;

        if (product.hasVariants && item.selectedVariant && product.variants) {
          const match = product.variants.find((v: any) => {
            const keys1 = Object.keys(v.attributes || {});
            const keys2 = Object.keys(item.selectedVariant || {});
            if (keys1.length !== keys2.length) return false;
            return keys1.every((k) => v.attributes[k] === item.selectedVariant![k]);
          });

          if (match) {
            availableStock = match.stock;
            realPrice = match.price;
          } else {
            availableStock = 0; // Variant combination deleted by admin
          }
        }

        newLiveStocks[key] = availableStock;

        syncUpdates.push({
          productId: item.productId,
          selectedVariant: item.selectedVariant,
          price: realPrice,
          stock: availableStock,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0].url : '',
        });

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

    if (syncUpdates.length > 0) {
      dispatch(syncCartPrices(syncUpdates));
    }

    setLiveStocks(newLiveStocks);
    setItemErrors(newErrors);
  }, [cartItems, dispatch]);

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

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const checkoutHandler = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setCheckoutLoading(true);
    let priceChanged = false;
    let hasError = false;

    const syncUpdates: Array<{
      productId: string;
      selectedVariant?: Record<string, string>;
      price: number;
      stock: number;
      name: string;
      image: string;
    }> = [];

    const newErrors: Record<string, string> = {};
    const newLiveStocks: Record<string, number> = {};

    for (const item of cartItems) {
      const key = getItemKey(item.productId, item.selectedVariant);
      try {
        const { data } = await api.get(`/product/${item.productId}`);
        const product = data.product;

        let availableStock = product.stock;
        let realPrice = product.price;

        if (product.hasVariants && item.selectedVariant && product.variants) {
          const match = product.variants.find((v: any) => {
            const keys1 = Object.keys(v.attributes || {});
            const keys2 = Object.keys(item.selectedVariant || {});
            if (keys1.length !== keys2.length) return false;
            return keys1.every((k) => v.attributes[k] === item.selectedVariant![k]);
          });

          if (match) {
            availableStock = match.stock;
            realPrice = match.price;
          } else {
            availableStock = 0;
          }
        }

        newLiveStocks[key] = availableStock;

        if (realPrice !== item.price) {
          priceChanged = true;
        }

        if (availableStock <= 0) {
          newErrors[key] = "Out of stock — please remove";
          hasError = true;
        } else if (item.quantity > availableStock) {
          newErrors[key] = `Only ${availableStock} available in stock`;
          hasError = true;
        }

        syncUpdates.push({
          productId: item.productId,
          selectedVariant: item.selectedVariant,
          price: realPrice,
          stock: availableStock,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0].url : '',
        });
      } catch (err) {
        newLiveStocks[key] = 0;
        newErrors[key] = "Item unavailable — please remove";
        hasError = true;
      }
    }

    if (syncUpdates.length > 0) {
      dispatch(syncCartPrices(syncUpdates));
    }

    setLiveStocks(newLiveStocks);
    setItemErrors(newErrors);
    setCheckoutLoading(false);

    if (hasError) {
      toast.error("Some items in your cart are out of stock or unavailable.");
      return;
    }

    if (priceChanged) {
      toast.info("Cart prices were updated to latest values. Please review your total.");
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
