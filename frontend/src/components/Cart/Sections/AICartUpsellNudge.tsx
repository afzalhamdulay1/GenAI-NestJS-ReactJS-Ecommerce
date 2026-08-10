import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { api } from "@/services/api";
import { useAppDispatch } from "@/app/hooks";
import { addItemsToCart } from "@/features/cart/cartSlice";
import { toast } from "react-toastify";

interface AICartUpsellNudgeProps {
  cartItemIds: string[];
  subtotal: number;
}

interface SuggestedProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images?: Array<{ url: string }>;
  category?: string;
}

interface NudgeResponse {
  qualifiesForFreeShipping: boolean;
  freeShippingThreshold: number;
  gap: number;
  nudgeText: string;
  suggestedProduct: SuggestedProduct | null;
}

const AICartUpsellNudge: React.FC<AICartUpsellNudgeProps> = ({
  cartItemIds,
  subtotal,
}) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [nudgeData, setNudgeData] = useState<NudgeResponse | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    if (!cartItemIds || cartItemIds.length === 0) return;

    let isMounted = true;
    const fetchNudge = async () => {
      setLoading(true);
      try {
        const { data } = await api.post("/ai/cart-upsell-nudge", {
          cartItemIds,
          subtotal,
        });
        if (isMounted) {
          setNudgeData(data);
        }
      } catch (err) {
        console.warn("Failed to fetch AI cart upsell nudge:", err);
        if (isMounted) {
          const defaultThreshold = 1000;
          const defaultGap = Math.max(0, defaultThreshold - subtotal);

          let fallbackProd: SuggestedProduct | null = null;
          try {
            const prodRes = await api.get("/products");
            const prods = prodRes.data?.products || [];
            const nonCartProds = prods.filter(
              (p: any) => !cartItemIds.includes(String(p._id))
            );
            const candidates = nonCartProds.length > 0 ? nonCartProds : prods;
            const sortedCandidates = [...candidates].sort((a: any, b: any) => {
              const diffA = Math.abs((a.price || 0) - defaultGap);
              const diffB = Math.abs((b.price || 0) - defaultGap);
              return diffA - diffB;
            });
            const chosen = sortedCandidates[0];
            if (chosen) {
              fallbackProd = {
                _id: chosen._id,
                name: chosen.name,
                price: chosen.price,
                originalPrice: chosen.originalPrice,
                images: chosen.images,
                category: chosen.category,
              };
            }
          } catch (e) {
            // Ignore fallback product fetch errors
          }

          const nudgeText = fallbackProd
            ? subtotal >= defaultThreshold
              ? `🎉 Great news! You qualify for FREE Express Shipping! Add "${fallbackProd.name}" (₹${fallbackProd.price}) to complete your order!`
              : `✨ You are only ₹${defaultGap} away from FREE Shipping! Add "${fallbackProd.name}" (₹${fallbackProd.price}) to qualify!`
            : subtotal >= defaultThreshold
            ? "🎉 Great news! You qualify for FREE Express Shipping on this order!"
            : `✨ You are only ₹${defaultGap} away from unlocking FREE Shipping!`;

          setNudgeData({
            qualifiesForFreeShipping: subtotal >= defaultThreshold,
            freeShippingThreshold: defaultThreshold,
            gap: defaultGap,
            nudgeText,
            suggestedProduct: fallbackProd,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNudge();

    return () => {
      isMounted = false;
    };
  }, [cartItemIds.join(","), subtotal]);

  if (!cartItemIds || cartItemIds.length === 0) return null;

  const threshold = nudgeData?.freeShippingThreshold || 1000;
  const progressPercent = Math.min(100, Math.round((subtotal / threshold) * 100));
  const qualifies = subtotal >= threshold || nudgeData?.qualifiesForFreeShipping;
  const gap = Math.max(0, threshold - subtotal);

  const handleQuickAdd = async (product: SuggestedProduct) => {
    setAddingProduct(true);
    try {
      await dispatch(addItemsToCart({ id: product._id, quantity: 1 }));
    } catch (err) {
      toast.error("Could not add item to cart.");
    } finally {
      setAddingProduct(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        borderRadius: "16px",
        background: qualifies
          ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
          : "linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)",
        border: qualifies ? "1px solid #86efac" : "1px solid #d8b4fe",
        boxShadow: qualifies
          ? "0 4px 20px rgba(34, 197, 94, 0.08)"
          : "0 4px 20px rgba(168, 85, 247, 0.12)",
      }}
    >
      {/* Free Shipping Progress Section */}
      <Box sx={{ mb: qualifies ? 0 : 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {qualifies ? (
              <CheckCircleIcon sx={{ color: "#16a34a", fontSize: "1.3rem" }} />
            ) : (
              <LocalShippingIcon sx={{ color: "#9333ea", fontSize: "1.3rem" }} />
            )}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: qualifies ? "#15803d" : "#6b21a8",
                fontSize: "0.95rem",
              }}
            >
              {qualifies
                ? "🎉 FREE Express Shipping Unlocked!"
                : `🚚 Add ₹${gap} more for FREE Shipping`}
            </Typography>
          </Box>

          <Chip
            label={`${progressPercent}%`}
            size="small"
            sx={{
              fontWeight: 800,
              bgcolor: qualifies ? "#22c55e" : "#a855f7",
              color: "#ffffff",
              height: 22,
              fontSize: "0.75rem",
            }}
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: qualifies ? "#bbf7d0" : "#e9d5ff",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: qualifies
                ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                : "linear-gradient(90deg, #a855f7 0%, #6366f1 100%)",
            },
          }}
        />
      </Box>

      {/* AI Nudge & Recommendations - Only rendered when shopper has NOT reached free shipping threshold */}
      {!qualifies &&
        (loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
            <CircularProgress size={16} sx={{ color: "#a855f7" }} />
            <Typography
              variant="caption"
              sx={{ color: "#64748b", fontWeight: 600 }}
            >
              Afzal AI is finding the best add-on for your order...
            </Typography>
          </Box>
        ) : nudgeData ? (
          <Box>
            {/* AI Nudge Message Box */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid rgba(168, 85, 247, 0.2)",
                display: "flex",
                alignItems: "flex-start",
                gap: 1.2,
                mb: nudgeData.suggestedProduct ? 2 : 0,
              }}
            >
              <AutoAwesomeIcon
                sx={{ color: "#9333ea", fontSize: "1.2rem", mt: 0.2, flexShrink: 0 }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  lineHeight: 1.5,
                }}
              >
                {nudgeData.nudgeText}
              </Typography>
            </Box>

            {/* 1-Click Quick Add Suggested Product Card */}
            {nudgeData.suggestedProduct && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  bgcolor: "#ffffff",
                  borderRadius: "14px",
                  border: "1px dashed #c084fc",
                  gap: 1.5,
                  flexWrap: { xs: "wrap", sm: "nowrap" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    src={nudgeData.suggestedProduct.images?.[0]?.url || ""}
                    variant="rounded"
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: "#f1f5f9",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: "#0f172a",
                        fontSize: "0.88rem",
                        lineHeight: 1.2,
                      }}
                    >
                      {nudgeData.suggestedProduct.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#9333ea", fontWeight: 800 }}
                    >
                      ₹{nudgeData.suggestedProduct.price}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    addingProduct ? (
                      <CircularProgress size={14} sx={{ color: "#ffffff" }} />
                    ) : (
                      <FlashOnIcon />
                    )
                  }
                  disabled={addingProduct}
                  onClick={() => handleQuickAdd(nudgeData.suggestedProduct!)}
                  sx={{
                    bgcolor: "#9333ea",
                    "&:hover": { bgcolor: "#7e22ce" },
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 2,
                    py: 0.8,
                    fontSize: "0.82rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {addingProduct ? "Adding..." : "⚡ 1-Click Add to Cart"}
                </Button>
              </Box>
            )}
          </Box>
        ) : null)}
    </Paper>
  );
};

export default AICartUpsellNudge;
