import React from "react";
import "@/components/Cart/CartItemCard.css";
import { Link } from "react-router-dom";
import { CartItem } from "@/types";

interface CartItemCardProps {
  item: CartItem;
  deleteItem: (payload: { productId: string; selectedVariant?: Record<string, string> }) => void;
  saveForLater?: (payload: { productId: string; selectedVariant?: Record<string, string> }) => void;
  error?: string | null;
  stock?: number;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, deleteItem, saveForLater, error, stock }) => {
  const variantText = item.selectedVariant && Object.keys(item.selectedVariant).length > 0
    ? Object.entries(item.selectedVariant).map(([k, v]) => `${k}: ${v}`).join(" | ")
    : null;

  return (
    <div className="CartItemCard">
      <img src={item.image} alt={item.name} />
      <div>
        <Link to={`/product/${item.product || item.productId}`}>{item.name}</Link>
        {variantText && (
          <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block", marginTop: "2px" }}>
            {variantText}
          </span>
        )}
        <span>{`Price: ₹${item.price}`}</span>
        
        {error ? (
          <div 
            style={{ 
              color: '#dc2626', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '6px', 
              padding: '4px 8px', 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              marginTop: '6px',
              display: 'inline-block' 
            }}
          >
            ⚠️ {error}
          </div>
        ) : (stock !== undefined && stock <= 5 && stock > 0) ? (
          <div 
            style={{ 
              color: '#b45309', 
              backgroundColor: '#fef3c7', 
              border: '1px solid #fcd34d', 
              borderRadius: '6px', 
              padding: '4px 8px', 
              fontSize: '0.8rem', 
              fontWeight: 600, 
              marginTop: '6px',
              display: 'inline-block' 
            }}
          >
            ⚠️ Only {stock} left in stock - order soon!
          </div>
        ) : null}

        <div className="cartActionsGroup">
          {saveForLater && (
            <button 
              type="button"
              className="saveForLaterBtn"
              onClick={() => saveForLater({ productId: item.productId, selectedVariant: item.selectedVariant })}
            >
              ♡ Save for Later
            </button>
          )}
          <button 
            type="button"
            className="removeItemBtn"
            onClick={() => deleteItem({ productId: item.productId, selectedVariant: item.selectedVariant })}
          >
            🗑 Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
