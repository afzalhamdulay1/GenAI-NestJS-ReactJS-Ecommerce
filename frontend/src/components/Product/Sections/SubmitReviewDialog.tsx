import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Rating, Box, Typography, IconButton, CircularProgress } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { compressMultipleImages } from "@/utils/imageCompressor";
import { toast } from "react-toastify";

interface SubmitReviewDialogProps {
  open: boolean;
  onClose: () => void;
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSubmit: (images: string[]) => void;
  isSubmitting?: boolean;
}

const SubmitReviewDialog: React.FC<SubmitReviewDialogProps> = ({
  open,
  onClose,
  rating,
  setRating,
  comment,
  setComment,
  onSubmit,
  isSubmitting = false,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setCompressing(true);
    try {
      const compressedImages = await compressMultipleImages(files);
      setImages((old) => [...old, ...compressedImages]);
    } catch (err) {
      console.error("Failed to compress images:", err);
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a star rating for your review!");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment for your review!");
      return;
    }
    onSubmit(images);
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setImages([]);
    onClose();
  };

  return (
    <Dialog
      aria-labelledby="submit-review-dialog-title"
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="submit-review-dialog-title" sx={{ fontWeight: 800 }}>
        Write a Product Review
      </DialogTitle>
      <DialogContent className="submitDialog" sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
            Overall Rating:
          </Typography>
          <Rating
            disabled={isSubmitting}
            onChange={(_e, newValue) => setRating(newValue || 0)}
            value={rating}
            size="large"
          />
          {rating === 0 && (
            <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 600, ml: 1 }}>
              * Star rating required
            </Typography>
          )}
        </Box>

        <textarea
          className="submitDialogTextArea"
          cols={30}
          rows={4}
          disabled={isSubmitting}
          placeholder="Share your experience with this product... (Quality, fit, shipping speed, etc.)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: rating === 0 || !comment.trim() ? '1px solid #cbd5e1' : '1px solid #cbd5e1',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            outline: 'none',
            resize: 'vertical',
            opacity: isSubmitting ? 0.7 : 1
          }}
        ></textarea>

        {/* Photo Upload Section */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
            Attach Product Photos (Optional):
          </Typography>

          <Button
            variant="outlined"
            component="label"
            disabled={isSubmitting || compressing}
            startIcon={compressing ? <CircularProgress size={18} color="inherit" /> : <AddPhotoAlternateIcon />}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#94a3b8',
              color: '#334155',
              '&:hover': { borderColor: '#64748b', bgcolor: '#f8fafc' }
            }}
          >
            {compressing ? "Processing Photos..." : "Upload Photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={isSubmitting || compressing}
              onChange={handleImageChange}
            />
          </Button>

          {images.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 2 }}>
              {images.map((img, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 70,
                    height: 70,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <img
                    src={img}
                    alt="Review attachment preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {!isSubmitting && (
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: '#ffffff',
                        p: 0.3,
                        '&:hover': { bgcolor: '#ef4444' }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleDialogClose} disabled={isSubmitting} color="secondary" sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting || compressing}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ fontWeight: 700, borderRadius: '8px', px: 3, bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' } }}
        >
          {isSubmitting ? "Uploading & Submitting..." : "Submit Review"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitReviewDialog;
