import React, { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { clearErrors, updateProduct, resetProductState, fetchProductDetails } from "@/features/products/productSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ProductImage } from "@/types";
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
  Divider,
  FormHelperText
} from "@mui/material";
import { toast } from "react-toastify";
import MetaData from "@/components/Layout/MetaData";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SideBar from "@/components/Admin/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

const updateProductSchema = z.object({
  name: z.string().min(1, "Product Name is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
});

type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

const UpdateProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { product, loading, error, success } = useAppSelector((state) => state.product);

  const [images, setImages] = useState<string[]>([]);
  const [oldImages, setOldImages] = useState<ProductImage[]>([]);
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
    setValue,
    formState: { errors },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      category: "",
      stock: 0,
    }
  });

  useEffect(() => {
    if (id && product && product._id !== id) {
      dispatch(fetchProductDetails(id));
    } else if (product) {
      setValue("name", product.name || "");
      setValue("description", product.description || "");
      setValue("price", product.price || 0);
      setValue("category", product.category || "");
      setValue("stock", product.stock || 0);
      setOldImages(product.images || []);
    }

    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (success) {
      toast.success("Product Updated Successfully");
      navigate("/admin/products");
      dispatch(resetProductState());
    }
  }, [dispatch, error, id, product, navigate, success, setValue]);

  const onUpdateProductSubmit = (data: UpdateProductFormValues) => {
    if (!id) return;
    const myForm = new FormData();
    myForm.set("name", data.name);
    myForm.set("price", String(data.price));
    myForm.set("description", data.description);
    myForm.set("category", data.category);
    myForm.set("stock", String(data.stock));
    
    images.forEach((image) => {
      myForm.append("images", image);
    });
    
    dispatch(updateProduct({ id, myForm }));
  };

  const updateProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setImages([]);
    setImagesPreview([]);
    setOldImages([]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2 && reader.result) {
          const resultStr = reader.result as string;
          setImagesPreview((old) => [...old, resultStr]);
          setImages((old) => [...old, resultStr]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <Fragment>
      <MetaData title="Update Product - Admin Panel" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
          <Paper elevation={0} className="newProductCard">
            <Typography component="h1" variant="h4" className="formTitle">
              Update Product
            </Typography>

            <form
              className="createProductForm"
              encType="multipart/form-data"
              onSubmit={handleSubmit(onUpdateProductSubmit)}
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
                    minRows={3}
                    maxRows={6}
                    label="Product Description"
                    variant="outlined"
                    {...register("description")}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <div className="fileUploadContainer">
                    <input
                      type="file"
                      id="updateProductImageInput"
                      accept="image/*"
                      onChange={updateProductImagesChange}
                      multiple
                      style={{ display: "none" }}
                    />
                    <label htmlFor="updateProductImageInput">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        className="uploadButton"
                        startIcon={<CloudUploadIcon />}
                      >
                        Change Product Images
                      </Button>
                    </label>
                  </div>
                </Grid>

                {oldImages && oldImages.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: '#64748b', mb: 1, display: 'block' }}>
                      Current Images:
                    </Typography>
                    <div className="imagePreviewGrid">
                      {oldImages.map((image, index) => (
                        <div key={index} className="previewItem">
                          <img src={image.url} alt={`Old ${index}`} />
                        </div>
                      ))}
                    </div>
                  </Grid>
                )}

                {imagesPreview.length > 0 && (
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" sx={{ color: '#6366f1', mb: 1, display: 'block', fontWeight: 600 }}>
                      New Selection (Will replace current images):
                    </Typography>
                    <div className="imagePreviewGrid">
                      {imagesPreview.map((image, index) => (
                        <div key={index} className="previewItem">
                          <img src={image} alt={`New Preview ${index}`} />
                          <Tooltip title="Remove">
                            <IconButton 
                              size="small" 
                              className="removeImgBtn"
                              onClick={() => {
                                setImagesPreview(imagesPreview.filter((_, i) => i !== index));
                                setImages(images.filter((_, i) => i !== index));
                              }}
                            >
                              <CloseIcon fontSize="inherit" />
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
                    {loading ? "Updating Product..." : "Update Product"}
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

export default UpdateProduct;
