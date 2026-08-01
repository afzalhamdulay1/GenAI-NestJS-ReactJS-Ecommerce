import React, { useState } from "react";
import ReviewCard from "@/components/Product/ReviewCard";
import { Review } from "@/types";
import { Box, Typography, Dialog, IconButton, Paper } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface ProductReviewsSectionProps {
  reviews?: Review[];
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ reviews }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Aggregate all review photos for the Customer Photo Gallery
  const allCustomerPhotos = reviews
    ? reviews.flatMap((r) => (r.photos ? r.photos.map((p) => ({ url: p.url, author: r.name, rating: r.rating })) : []))
    : [];

  return (
    <Box sx={{ width: "100%", maxWidth: "1200px", margin: "3rem auto", px: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 3, textAlign: "center" }}>
        Customer Reviews & Feedback
      </Typography>

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
