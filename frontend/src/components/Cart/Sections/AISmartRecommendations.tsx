import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Chip, CircularProgress } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StyleIcon from "@mui/icons-material/Style";
import ProductCard from "@/components/Home/ProductCard";
import { api } from "@/services/api";

interface AISmartRecommendationsProps {
  cartItemIds: string[];
}

const AISmartRecommendations: React.FC<AISmartRecommendationsProps> = ({ cartItemIds }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [reasoning, setReasoning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (cartItemIds && cartItemIds.length > 0) {
      const fetchRecommendations = async () => {
        setLoading(true);
        try {
          const { data } = await api.post("/ai/recommend-complementary", { cartItemIds });
          if (data.success) {
            setRecommendations(data.recommendedProducts || []);
            setReasoning(data.reasoning || "");
          }
        } catch (err) {
          console.warn("Failed to fetch AI smart recommendations:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchRecommendations();
    } else {
      setRecommendations([]);
      setReasoning("");
    }
  }, [cartItemIds.join(",")]);

  if (!cartItemIds || cartItemIds.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: 3,
        borderRadius: "1.2rem",
        background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
        border: "1px solid #dbeafe",
        boxShadow: "0 4px 20px rgba(59, 130, 246, 0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: "#2563eb", fontSize: "1.5rem" }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e3a8a", fontSize: "1.1rem" }}>
            ✨ AI Stylist: Complete Your Look
          </Typography>
        </Box>
        <Chip
          icon={<StyleIcon sx={{ fontSize: "1rem !important", color: "#ffffff !important" }} />}
          label="Smart Pairing Advice"
          size="small"
          sx={{ bgcolor: "#2563eb", color: "#ffffff", fontWeight: 700, fontSize: "0.75rem" }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
          <CircularProgress size={20} sx={{ color: "#2563eb" }} />
          <Typography variant="body2" sx={{ color: "#1d4ed8", fontWeight: 600 }}>
            AI Personal Stylist is matching complementary items...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {reasoning && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "10px",
                bgcolor: "rgba(255, 255, 255, 0.8)",
                border: "1px solid #bfdbfe",
              }}
            >
              <Typography variant="body2" sx={{ color: "#1e40af", fontWeight: 600, fontSize: "0.92rem", lineHeight: 1.5 }}>
                💡 <b>Stylist Tip:</b> {reasoning}
              </Typography>
            </Paper>
          )}

          {recommendations && recommendations.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(260px, 1fr))" },
                gap: 2,
                mt: 1,
              }}
            >
              {recommendations.map((product) => (
                <ProductCard key={product._id} product={product} showAddToCart={true} />
              ))}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default AISmartRecommendations;
