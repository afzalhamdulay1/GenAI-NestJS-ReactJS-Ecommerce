import React, { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearErrors, updateProduct, resetProductState, fetchProductDetails } from "../../features/products/productSlice";
import { 
  Button, 
  Box, 
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
  Divider
} from "@mui/material";
import { toast } from "react-toastify";
import MetaData from "../Layout/MetaData";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SideBar from "./Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

const UpdateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { product, loading, error, success } = useSelector((state) => state.product);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState(0);
  const [images, setImages] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  const categories = [
    "Laptop",
    "Footwear",
    "Bottom",
    "Tops",
    "Attire",
    "Camera",
    "SmartPhones",
  ];

  useEffect(() => {
    if (product && product._id !== id) {
      dispatch(fetchProductDetails(id));
    } else if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setCategory(product.category);
      setStock(product.stock);
      setOldImages(product.images);
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
  }, [dispatch, error, id, product, navigate, success]);

  const updateProductSubmitHandler = (e) => {
    e.preventDefault();
    const myForm = new FormData();
    myForm.set("name", name);
    myForm.set("price", price);
    myForm.set("description", description);
    myForm.set("category", category);
    myForm.set("stock", stock);
    images.forEach((image) => {
      myForm.append("images", image);
    });
    dispatch(updateProduct({ id, myForm }));
  };

  const updateProductImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([]);
    setImagesPreview([]);
    setOldImages([]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((old) => [...old, reader.result]);
          setImages((old) => [...old, reader.result]);
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
              onSubmit={updateProductSubmitHandler}
            >
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Product Name"
                    variant="outlined"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
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
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="category-label">Choose Category</InputLabel>
                    <Select
                      labelId="category-label"
                      label="Choose Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
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
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                        variant="dashed"
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
                    disabled={loading ? true : false}
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
