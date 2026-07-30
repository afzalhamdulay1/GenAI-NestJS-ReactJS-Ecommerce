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
  Paper,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import FormInput from "@/components/Form/FormInput";
import FormSelect from "@/components/Form/FormSelect";
import ImageUploader from "@/components/Form/ImageUploader";
import MetaData from "@/components/Layout/MetaData";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SideBar from "@/components/Admin/Sidebar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

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

  const [categories, setCategories] = useState<string[]>([
    "Laptop",
    "Footwear",
    "Bottom",
    "Tops",
    "Attire",
    "Camera",
    "SmartPhones",
    "Other",
  ]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get("/categories");
        if (data.categories && data.categories.length > 0) {
          const list = data.categories.map((c: any) => c.name);
          if (!list.some((cat: string) => cat.toLowerCase() === "other")) {
            list.push("Other");
          }
          setCategories(list);
        }
      } catch (err) {}
    };
    fetchCats();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewProductFormValues>({
    resolver: zodResolver(newProductSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      category: "",
      stock: 1,
    },
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
                  <FormInput
                    label="Product Name"
                    register={register("name")}
                    error={errors.name}
                    icon={<SpellcheckIcon />}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormInput
                    type="number"
                    label="Price (INR)"
                    register={register("price")}
                    error={errors.price}
                    icon={<AttachMoneyIcon />}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormInput
                    type="number"
                    label="Stock Quantity"
                    register={register("stock")}
                    error={errors.stock}
                    icon={<StorageIcon />}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormSelect
                    label="Choose Category"
                    control={control}
                    name="category"
                    options={categories}
                    register={register("category")}
                    error={errors.category}
                    icon={<AccountTreeIcon />}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormInput
                    multiline
                    rows={4}
                    label="Product Description"
                    register={register("description")}
                    error={errors.description}
                    icon={<DescriptionIcon />}
                    alignIconTop
                  />
                </Grid>

                <Grid item xs={12}>
                  <ImageUploader 
                    imagesPreview={imagesPreview}
                    setImages={setImages}
                    setImagesPreview={setImagesPreview}
                    multiple={true}
                  />
                </Grid>

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
