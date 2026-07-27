import React, { Fragment, useEffect, useState } from "react";
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
  Tooltip
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

const NewProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, success } = useAppSelector((state) => state.product);

  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | string>(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [Stock, setStock] = useState<number | string>(0);
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

  const createProductSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const myForm = new FormData();

    myForm.set("name", name);
    myForm.set("price", String(price));
    myForm.set("description", description);
    myForm.set("category", category);
    myForm.set("stock", String(Stock));

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
              onSubmit={createProductSubmitHandler}
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
                    value={Stock}
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
                      onChange={(e) => setCategory(e.target.value as string)}
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
                      id="productImageInput"
                      accept="image/*"
                      onChange={createProductImagesChange}
                      multiple
                      style={{ display: "none" }}
                    />
                    <label htmlFor="productImageInput">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        className="uploadButton"
                        startIcon={<CloudUploadIcon />}
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
                          <img src={image} alt={`Preview ${index}`} />
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
                    {loading ? "Creating Product..." : "Create Product"}
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
