import React, { useState } from "react";
import { Rating, Chip, Box, Typography, Dialog, IconButton, Avatar } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import CloseIcon from "@mui/icons-material/Close";
import { Review } from "@/types";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface ReviewCardProps {
  review: Review;
}

const getInitials = (name: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const options = {
    value: review.rating,
    readOnly: true,
    precision: 0.5,
  };

  const initials = getInitials(review.name);

  return (
    <div className="reviewCard">
      {/* Top Header: Avatar, Name, Verified Chip & Rating */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, width: "100%", mb: 1.5 }}>
        <Avatar
          sx={{
            width: 44,
            height: 44,
            bgcolor: "#4f46e5",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "#ffffff",
            boxShadow: "0 2px 8px rgba(79, 70, 229, 0.2)"
          }}
        >
          {initials}
        </Avatar>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", lineHeight: 1.2 }}>
              {review.name}
            </Typography>

            {review.isVerifiedPurchase && (
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: "14px !important", color: "#16a34a !important" }} />}
                label="Verified Purchase"
                size="small"
                sx={{
                  bgcolor: "#f0fdf4",
                  color: "#15803d",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  height: "22px",
                  border: "1px solid #bbf7d0",
                }}
              />
            )}
          </Box>

          <Box sx={{ mt: 0.5 }}>
            <Rating {...options} size="small" />
          </Box>
        </Box>
      </Box>

      {/* Review Comment Text */}
      <Typography variant="body2" className="reviewCardComment">
        {review.comment}
      </Typography>

      {/* Review Photo Attachments */}
      {review.photos && review.photos.length > 0 && (
        <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", mt: "auto", pt: 1 }}>
          {review.photos.map((photo, i) => (
            <Box
              key={photo.public_id || i}
              onClick={() => setActivePhotoIndex(i)}
              sx={{
                width: 70,
                height: 70,
                borderRadius: "10px",
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
                "&:hover": { transform: "translateY(-2px)", borderColor: "#6366f1", boxShadow: "0 6px 14px rgba(99,102,241,0.2)" },
              }}
            >
              <img src={photo.url} alt="Customer review photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          ))}
        </Box>
      )}

      {/* Full-Screen Lightbox Carousel Dialog */}
      <Dialog
        open={activePhotoIndex !== null}
        onClose={() => setActivePhotoIndex(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { backgroundColor: "#0f172a", borderRadius: "16px", overflow: "hidden" }
        }}
      >
        {activePhotoIndex !== null && review.photos && review.photos.length > 0 && (
          <Box sx={{ position: "relative", bgcolor: "#0f172a", p: 2, textAlign: "center" }}>
            <IconButton
              onClick={() => setActivePhotoIndex(null)}
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
              selectedItem={activePhotoIndex}
              onChange={(index) => setActivePhotoIndex(index)}
              showArrows={review.photos.length > 1}
              showThumbs={review.photos.length > 1}
              showStatus={review.photos.length > 1}
              infiniteLoop={false}
              emulateTouch={true}
              useKeyboardArrows={true}
              swipeable={true}
            >
              {review.photos.map((photo, i) => (
                <div key={photo.public_id || i} style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "350px" }}>
                  <img
                    src={photo.url}
                    alt={`Review photo ${i + 1}`}
                    style={{ maxHeight: "70vh", maxWidth: "100%", objectFit: "contain", borderRadius: "8px" }}
                  />
                </div>
              ))}
            </Carousel>
          </Box>
        )}
      </Dialog>
    </div>
  );
};

export default ReviewCard;
