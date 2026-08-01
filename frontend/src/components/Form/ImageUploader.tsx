import React, { useState } from "react";
import { Grid, Button, IconButton, Tooltip, Typography, Chip, Box } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { toast } from "react-toastify";
import { compressMultipleImages } from "@/utils/imageCompressor";

interface ImageUploaderProps {
  imagesPreview: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  setImagesPreview: React.Dispatch<React.SetStateAction<string[]>>;
  multiple?: boolean;
  previewTitle?: string;
  onUploadStart?: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  imagesPreview,
  setImages,
  setImagesPreview,
  multiple = true,
  previewTitle,
  onUploadStart,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const createProductImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    if (onUploadStart) {
      onUploadStart();
    }

    if (!multiple) {
      setImages([]);
      setImagesPreview([]);
    }

    try {
      const base64Results = await compressMultipleImages(files);
      const validImages = base64Results.filter((data) => data.startsWith("data:image"));

      if (validImages.length < base64Results.length) {
        toast.error("Some invalid image files were skipped");
      }

      setImagesPreview((old) => (multiple ? [...old, ...validImages] : validImages));
      setImages((old) => (multiple ? [...old, ...validImages] : validImages));
    } catch (err) {
      toast.error("Failed to process selected images");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imagesPreview.length) return;

    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });

    setImagesPreview((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // HTML5 Drag and Drop handlers for re-ordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const reordered = [...imagesPreview];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, draggedItem);

    setImages(reordered);
    setImagesPreview(reordered);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="imageUploaderContainer">
      <Button
        component="label"
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        fullWidth
        className="uploadButton"
      >
        Upload Product Images ({imagesPreview.length} Selected)
        <input
          type="file"
          name="avatar"
          accept="image/*"
          multiple={multiple}
          onChange={createProductImagesChange}
          style={{ display: "none" }}
        />
      </Button>

      {imagesPreview.length > 0 && (
        <div style={{ marginTop: "1.25rem" }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700 }}>
              {previewTitle || "Selected Images (Drag & drop or use arrows to reorder. 1st image is Main Cover):"}
            </Typography>
          </Box>

          <div className="imagePreviewGrid" style={{ gap: '1.25rem' }}>
            {imagesPreview.map((image, index) => (
              <div 
                key={index} 
                className="previewItem"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                style={{ 
                  position: 'relative', 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: index === 0 ? '2px solid #6366f1' : '1px solid #e2e8f0',
                  boxShadow: index === 0 ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none',
                  cursor: 'grab',
                  opacity: draggedIndex === index ? 0.4 : 1,
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                }}
              >
                <img src={image} alt={`Preview ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                
                {index === 0 ? (
                  <Chip
                    icon={<StarIcon style={{ color: '#fff', fontSize: '0.9rem' }} />}
                    label="Main Cover"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      backgroundColor: '#6366f1',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: '22px',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 6,
                      left: 6,
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '6px',
                      padding: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#fff',
                    }}
                  >
                    <DragIndicatorIcon sx={{ fontSize: '0.9rem' }} />
                  </Box>
                )}

                {/* Re-order & Action Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                    padding: '4px 8px',
                  }}
                >
                  <Tooltip title="Move Left">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => moveImage(index, 'left')}
                        sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
                      >
                        <ArrowBackIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Remove Image">
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{ color: '#ef4444' }}
                    >
                      <CloseIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Move Right">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === imagesPreview.length - 1}
                        onClick={() => moveImage(index, 'right')}
                        sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
                      >
                        <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
