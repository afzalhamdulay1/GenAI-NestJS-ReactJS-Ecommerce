import React, { useState, useEffect } from "react";
import ReviewCard from "@/components/Product/ReviewCard";
import { Review } from "@/types";
import { Box, Typography, Dialog, IconButton, Paper, Chip, CircularProgress } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { api } from "@/services/api";

interface ProductReviewsSectionProps {
  reviews?: Review[];
  productId?: string;
}

interface ReviewSummaryData {
  overallSummary: string;
  pros: string[];
  cons: string[];
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ reviews, productId }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<ReviewSummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (productId && reviews && reviews.length > 0) {
      const fetchSummary = async () => {
        setLoadingSummary(true);
        try {
          const { data } = await api.get(`/ai/summarize-reviews/${productId}`);
          if (data.success && data.summary) {
            setAiSummary(data.summary);
          }
        } catch (err) {
          console.warn("Failed to fetch AI review summary:", err);
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    }
  }, [productId, reviews]);

  // Aggregate all review photos for the Customer Photo Gallery
  const allCustomerPhotos = reviews
    ? reviews.flatMap((r) => (r.photos ? r.photos.map((p) => ({ url: p.url, author: r.name, rating: r.rating })) : []))
    : [];

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", margin: "3rem auto", px: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 3, textAlign: "center" }}>
        Customer Reviews & Feedback
      </Typography>

      {/* ✨ AI Review Sentiment Summary Card */}
      {reviews && reviews.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            borderRadius: "1.2rem",
            background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
            border: "1px solid #e9d5ff",
            boxShadow: "0 4px 20px rgba(168, 85, 247, 0.08)",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "row", sm: "row" }, alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AutoAwesomeIcon sx={{ color: "#9333ea", fontSize: { xs: "1.25rem", sm: "1.5rem" } }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#581c87", fontSize: { xs: "0.95rem", sm: "1.1rem" }, lineHeight: 1.2 }}>
                AI Review Insights
              </Typography>
            </Box>
            <Chip
              label="⚡ Gemini AI"
              size="small"
              sx={{ bgcolor: "#7e22ce", color: "#ffffff", fontWeight: 700, fontSize: "0.7rem", height: "24px" }}
            />
          </Box>

          {loadingSummary ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
              <CircularProgress size={20} sx={{ color: "#9333ea" }} />
              <Typography variant="body2" sx={{ color: "#7e22ce", fontWeight: 600 }}>
                Analyzing customer reviews & sentiment...
              </Typography>
            </Box>
          ) : aiSummary ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {aiSummary.overallSummary && (
                <Typography variant="body2" sx={{ color: "#3b0764", fontWeight: 600, fontSize: { xs: "0.85rem", sm: "0.95rem" }, lineHeight: 1.6 }}>
                  {aiSummary.overallSummary}
                </Typography>
              )}

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mt: 1 }}>
                {/* Pros */}
                {aiSummary.pros && aiSummary.pros.length > 0 && (
                  <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.8)", borderRadius: "12px", border: "1px solid #dcfce7" }}>
                    <Typography variant="caption" sx={{ color: "#166534", fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5, mb: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: "1rem", color: "#16a34a" }} /> Key Highlights (Pros)
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                      {aiSummary.pros.map((pro, i) => (
                        <Typography key={i} variant="body2" sx={{ color: "#14532d", fontWeight: 500, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 1 }}>
                          <span style={{ color: "#22c55e" }}>•</span> {pro}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Cons */}
                {aiSummary.cons && aiSummary.cons.length > 0 && (
                  <Box sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.8)", borderRadius: "12px", border: "1px solid #fef3c7" }}>
                    <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 800, display: "flex", alignItems: "center", gap: 0.5, mb: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <ErrorOutlineIcon sx={{ fontSize: "1rem", color: "#d97706" }} /> Points to Note (Cons)
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                      {aiSummary.cons.map((con, i) => (
                        <Typography key={i} variant="body2" sx={{ color: "#78350f", fontWeight: 500, fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 1 }}>
                          <span style={{ color: "#f59e0b" }}>•</span> {con}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: "#7e22ce", fontStyle: "italic" }}>
              Add more reviews to unlock AI sentiment insights!
            </Typography>
          )}
        </Paper>
      )}

      {/* Customer Photos Aggregated Gallery Bar */}
      {allCustomerPhotos.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: "1rem",
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <PhotoCameraIcon sx={{ color: "#6366f1" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Customer Photos ({allCustomerPhotos.length})
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 1 }}>
            {allCustomerPhotos.map((photoItem, index) => (
              <Box
                key={index}
                onClick={() => setSelectedPhotoIndex(index)}
                sx={{
                  flexShrink: 0,
                  width: 90,
                  height: 90,
                  borderRadius: "10px",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "2px solid #ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 16px rgba(99,102,241,0.25)" },
                }}
              >
                <img src={photoItem.url} alt={`Customer review photo by ${photoItem.author}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Review List */}
      {reviews && reviews.length > 0 ? (
        <div className="reviews" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      ) : (
        <Typography variant="body1" sx={{ textAlign: "center", color: "#94a3b8", py: 4, fontWeight: 500 }}>
          No Reviews Yet. Be the first to share your experience!
        </Typography>
      )}

      {/* Lightbox Slider Modal for Customer Photo Gallery */}
      <Dialog
        open={selectedPhotoIndex !== null}
        onClose={() => setSelectedPhotoIndex(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { backgroundColor: "#0f172a", borderRadius: "16px", overflow: "hidden" }
        }}
      >
        {selectedPhotoIndex !== null && allCustomerPhotos.length > 0 && (
          <Box sx={{ position: "relative", bgcolor: "#0f172a", p: 2, textAlign: "center" }}>
            <IconButton
              onClick={() => setSelectedPhotoIndex(null)}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                color: "#ffffff",
                bgcolor: "rgba(0,0,0,0.6)",
                "&:hover": { bgcolor: "#ef4444" }
              }}
            >
              <CloseIcon />
            </IconButton>

            <Carousel
              selectedItem={selectedPhotoIndex}
              onChange={(index) => setSelectedPhotoIndex(index)}
              showArrows={allCustomerPhotos.length > 1}
              showThumbs={allCustomerPhotos.length > 1}
              showStatus={allCustomerPhotos.length > 1}
              infiniteLoop={false}
              emulateTouch={true}
              useKeyboardArrows={true}
              swipeable={true}
            >
              {allCustomerPhotos.map((photoItem, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "350px" }}>
                  <img
                    src={photoItem.url}
                    alt={`Customer photo ${i + 1} by ${photoItem.author}`}
                    style={{ maxHeight: "70vh", maxWidth: "100%", objectFit: "contain", borderRadius: "8px" }}
                  />
                </div>
              ))}
            </Carousel>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default ProductReviewsSection;
