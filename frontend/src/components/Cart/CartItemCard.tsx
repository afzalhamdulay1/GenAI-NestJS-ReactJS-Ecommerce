import React from "react";
import "./CartItemCard.css";
import { Link } from "react-router-dom";
import { CartItem } from "../../features/cart/cartSlice";

interface CartItemCardProps {
  item: CartItem;
  deleteItem: (payload: { productId: string }) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, deleteItem }) => {
  return (
    <div className="CartItemCard">
      <img src={item.image} alt={item.name} />
      <div>
        <Link to={`/product/${item.product || item.productId}`}>{item.name}</Link>
        <span>{`Price: ₹${item.price}`}</span>
        <p onClick={() => deleteItem({ productId: item.productId })}>Remove</p>
      </div>
    </div>
  );
};

export default CartItemCard;
