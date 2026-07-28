import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "@/components/Admin/NewProduct.css";
import { clearErrors, createProduct, resetProductState } from "@/features/products/productSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { 
  Button, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  InputAdornment, 
  Paper,
  Grid,
  IconButton,
  Tooltip,
  FormHelperText
} from "@mui/material";
import MetaData from "@/components/Layout/MetaData";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SideBar from "@/components/Admin/Sidebar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

const newProductSchema = z.object({
  name: z.string().min(1, "Product Name is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
});

type NewProductFormValues = z.infer<typeof newProductSchema>;

const NewProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useAppSelector((state) => state.product);

  const [images, setImages] = useState<string[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  const categories = [
    "Laptop",
    "Footwear",
    "Bottom",
    "Tops",
    "Attire",
    "Camera",
    "SmartPhones",
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewProductFormValues>({
    resolver: zodResolver(newProductSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      category: "",
      stock: 0,
    }
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (success) {
      toast.success("Product Created Successfully");
      dispatch(resetProductState());
      navigate("/admin/products");
    }
  }, [dispatch, error, success, navigate]);

  const onCreateProductSubmit = (data: NewProductFormValues) => {
    if (images.length === 0) {
      toast.error("Please add at least one product image");
      return;
    }

    const myForm = new FormData();

    myForm.set("name", data.name);
    myForm.set("price", String(data.price));
    myForm.set("description", data.description);
    myForm.set("category", data.category);
    myForm.set("stock", String(data.stock));

    images.forEach((image) => {
      myForm.append("images", image);
    });

    dispatch(createProduct(myForm));
  };

  const createProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];

    setImages([]);
    setImagesPreview([]);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2 && reader.result) {
          const base64Data = reader.result as string;

          if (!base64Data.startsWith("data:image")) {
            toast.error("Invalid image format");
            return;
          }
          setImagesPreview((old) => [...old, base64Data]);
          setImages((old) => [...old, base64Data]);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagesPreview(imagesPreview.filter((_, i) => i !== index));
  };

  return (
    <Fragment>
      <MetaData title="Create Product - Admin Panel" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
          <Paper elevation={0} className="newProductCard">
            <Typography component="h1" variant="h4" className="formTitle">
              Create New Product
            </Typography>

            <form
              className="createProductForm"
              encType="multipart/form-data"
              onSubmit={handleSubmit(onCreateProductSubmit)}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    variant="outlined"
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SpellcheckIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price (INR)"
                    variant="outlined"
                    {...register("price")}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Stock Quantity"
                    variant="outlined"
                    {...register("stock")}
                    error={!!errors.stock}
                    helperText={errors.stock?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StorageIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" error={!!errors.category}>
                    <InputLabel id="category-label">Choose Category</InputLabel>
                    <Select
                      labelId="category-label"
                      label="Choose Category"
                      defaultValue=""
                      {...register("category")}
                      startAdornment={
                        <InputAdornment position="start">
                          <AccountTreeIcon />
                        </InputAdornment>
                      }
                    >
                      {categories.map((cate) => (
                        <MenuItem key={cate} value={cate}>
                          {cate}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category && <FormHelperText>{errors.category.message}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Product Description"
                    variant="outlined"
                    {...register("description")}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                          <DescriptionIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <div className="fileUploadContainer">
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      multiple
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
                        Upload Product Images
                      </Button>
                    </label>
                  </div>
                </Grid>

                {imagesPreview.length > 0 && (
                  <Grid item xs={12}>
                    <div className="imagePreviewGrid">
                      {imagesPreview.map((image, index) => (
                        <div key={index} className="previewItem">
                          <img src={image} alt={`Product Preview ${index + 1}`} />
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

                <Grid item xs={12}>
                  <Button
                    id="createProductBtn"
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    size="large"
                  >
                    {loading ? "Creating..." : "Create Product"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </div>
      </div>
    </Fragment>
  );
};

export default NewProduct;
