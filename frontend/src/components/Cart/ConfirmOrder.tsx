import React, { Fragment, useState, useEffect } from "react";
import CheckoutSteps from "@/components/Cart/CheckoutSteps";
import MetaData from "@/components/Layout/MetaData";
import "@/components/Cart/ConfirmOrder.css";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { removeItem } from "@/features/cart/cartSlice";
import OrderSummaryCard from "@/components/Cart/Sections/OrderSummaryCard";
import { api } from "@/services/api";
import { toast } from "react-toastify";

const ConfirmOrder: React.FC = () => {
  const navigate = useNavigate();
  const { shippingInfo, cartItems } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.user);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [storeSettings, setStoreSettings] = useState({
    taxRate: 18,
    shippingFee: 200,
    freeShippingThreshold: 1000,
    isTaxEnabled: true,
    isShippingFeeEnabled: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        if (data.settings) {
          setStoreSettings(data.settings);
        }
      } catch (err) {
        // Use default fallback settings
      }
    };
    fetchSettings();
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discount);

  const shippingCharges = storeSettings.isShippingFeeEnabled
    ? subtotalAfterDiscount >= storeSettings.freeShippingThreshold
      ? 0
      : storeSettings.shippingFee
    : 0;

  const tax = storeSettings.isTaxEnabled
    ? Math.round(subtotalAfterDiscount * (storeSettings.taxRate / 100))
    : 0;

  const totalPrice = subtotalAfterDiscount + tax + shippingCharges;

  const address = `${shippingInfo?.address}, ${shippingInfo?.city}, ${shippingInfo?.state}, ${shippingInfo?.pinCode}, ${shippingInfo?.country}`;

  const handleCouponInputChange = (val: string) => {
    setCouponInput(val);
    if (couponMessage) setCouponMessage(null);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const { data } = await api.post("/coupons/apply", {
        code: couponInput.trim(),
        subtotal,
      });
      setAppliedCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
      });
      setCouponMessage({
        text: `Coupon "${data.code}" applied! Saved ₹${data.discountAmount}`,
        type: "success",
      });
      toast.success(`🎉 Coupon "${data.code}" applied! Saved ₹${data.discountAmount}`);
    } catch (error: any) {
      setCouponMessage({
        text: error.response?.data?.message || "Failed to apply coupon",
        type: "error",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage(null);
  };

  const dispatch = useAppDispatch();
  const [validating, setValidating] = useState(false);

  const proceedToPayment = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setValidating(true);
    let hasUnavailableItem = false;

    // Validate each cart item against backend database before entering payment
    for (const item of cartItems) {
      try {
        await api.get(`/product/${item.productId}`);
      } catch (err) {
        hasUnavailableItem = true;
        dispatch(removeItem({ productId: item.productId, selectedVariant: item.selectedVariant }));
        toast.error(`"${item.name}" is no longer available and was removed from your cart.`);
      }
    }

    setValidating(false);

    if (hasUnavailableItem) {
      return;
    }

    const data = {
      subtotal,
      shippingCharges,
      tax,
      discount,
      couponCode: appliedCoupon?.code || "",
      totalPrice,
    };

    sessionStorage.setItem("orderInfo", JSON.stringify(data));
    navigate("/process/payment");
  };

  return (
    <Fragment>
      <MetaData title="Confirm Order" />
      <CheckoutSteps activeStep={1} />
      <div className="confirmOrderPage">
        <div>
          <div className="confirmshippingArea">
            <p>Shipping Info</p>
            <div className="confirmshippingAreaBox">
              <div>
                <p>Name:</p>
                <span>{user?.name}</span>
              </div>
              <div>
                <p>Phone:</p>
                <span>{shippingInfo?.phoneNo}</span>
              </div>
              <div>
                <p>Address:</p>
                <span>{address}</span>
              </div>
            </div>
          </div>
          <div className="confirmCartItems">
            <p>Your Cart Items:</p>
            <div className="confirmCartItemsContainer">
              {cartItems &&
                cartItems.map((item, index) => {
                  const variantText = item.selectedVariant && Object.keys(item.selectedVariant).length > 0
                    ? Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(' | ')
                    : null;
                  return (
                    <div key={`${item.productId}-${index}`}>
                      <img src={item.image} alt="Product" />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Link to={`/product/${item.product || item.productId}`}>
                          {item.name}
                        </Link>
                        {variantText && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                            {variantText}
                          </span>
                        )}
                      </div>
                      <span>
                        {item.quantity} X ₹{item.price} ={" "}
                        <b>₹{item.price * item.quantity}</b>
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <OrderSummaryCard
          subtotal={subtotal}
          shippingCharges={shippingCharges}
          tax={tax}
          discount={discount}
          couponCode={appliedCoupon?.code}
          totalPrice={totalPrice}
          onProceedToPayment={proceedToPayment}
          couponInput={couponInput}
          setCouponInput={handleCouponInputChange}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
          couponLoading={couponLoading}
          couponMessage={couponMessage}
        />
      </div>
    </Fragment>
  );
};

export default ConfirmOrder;
