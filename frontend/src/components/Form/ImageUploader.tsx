import React from "react";
import { Grid, Button, IconButton, Tooltip, Typography } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from "react-toastify";

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
  const createProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    if (onUploadStart) {
      onUploadStart();
    }

    if (!multiple) {
      setImages([]);
      setImagesPreview([]);
    }

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2 && reader.result) {
          const base64Data = reader.result as string;

          if (!base64Data.startsWith("data:image")) {
            toast.error("Invalid image format");
            return;
          }
          setImagesPreview((old) => multiple ? [...old, base64Data] : [base64Data]);
          setImages((old) => multiple ? [...old, base64Data] : [base64Data]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreview((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Grid item xs={12}>
        <div className="fileUploadContainer">
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple={multiple}
            type="file"
            onChange={createProductImagesChange}
          />
          <label htmlFor="raised-button-file">
            <Button 
              variant="outlined" 
              component="span"
              fullWidth
              startIcon={<CloudUploadIcon />}
              className="uploadButton"
            >
              Upload Image{multiple ? 's' : ''}
            </Button>
          </label>
        </div>
      </Grid>

      {imagesPreview.length > 0 && (
        <Grid item xs={12}>
          {previewTitle && (
            <Typography variant="caption" sx={{ color: '#6366f1', mb: 1, display: 'block', fontWeight: 600 }}>
              {previewTitle}
            </Typography>
          )}
          <div className="imagePreviewGrid">
            {imagesPreview.map((image, index) => (
              <div key={index} className="previewItem">
                <img src={image} alt={`Preview ${index + 1}`} />
                <Tooltip title="Remove Image">
                  <IconButton 
                    className="removeImgBtn"
                    size="small"
                    onClick={() => removeImage(index)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            ))}
          </div>
        </Grid>
      )}
    </>
  );
};

export default ImageUploader;
