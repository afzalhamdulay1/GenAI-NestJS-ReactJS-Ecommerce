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
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import "@/components/Admin/NewProduct.css";
import FormInput from "@/components/Form/FormInput";
import FormSelect from "@/components/Form/FormSelect";
import ImageUploader from "@/components/Form/ImageUploader";
import Loader from "@/components/Layout/Loader/Loader";
import MetaData from "@/components/Layout/MetaData";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import SpellcheckIcon from "@mui/icons-material/Spellcheck";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SideBar from "@/components/Admin/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";

const updateProductSchema = z.object({
  name: z.string().min(1, "Product Name is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  originalPrice: z.coerce.number().optional(),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
});

type UpdateProductFormValues = z.infer<typeof updateProductSchema>;

interface OptionState {
  name: string;
  valuesStr: string;
}

interface VariantState {
  attributes: Record<string, string>;
  stock: number;
  price?: number;
  offerPrice?: number;
}

const UpdateProduct: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { product, loading, error, success } = useAppSelector((state) => state.product);

  const [images, setImages] = useState<string[]>([]);
  const [oldImages, setOldImages] = useState<ProductImage[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  // Variant states
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState<OptionState[]>([]);
  const [variants, setVariants] = useState<VariantState[]>([]);

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

  const [enableDiscount, setEnableDiscount] = useState<boolean>(false);
  const [discountMode, setDiscountMode] = useState<"percentage" | "fixed">("percentage");
  const [discountPercent, setDiscountPercent] = useState<string | number>("");
  const [discountedPriceInput, setDiscountedPriceInput] = useState<string | number>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<UpdateProductFormValues>({
    resolver: zodResolver(updateProductSchema) as any,
    defaultValues: {
      name: "",
      price: 0,
      originalPrice: 0,
      description: "",
      category: "",
      stock: 0,
    }
  });

  const basePrice = watch("price");

  const handleToggleDiscount = (enabled: boolean) => {
    setEnableDiscount(enabled);
    if (!enabled) {
      setValue("originalPrice", 0);
      setDiscountPercent("");
      setDiscountedPriceInput("");
    } else {
      setDiscountPercent("");
      setDiscountedPriceInput(Number(basePrice) || "");
    }
  };

  useEffect(() => {
    if (id && (!product || product._id !== id)) {
      dispatch(fetchProductDetails(id));
    }
  }, [dispatch, id, product]);

  useEffect(() => {
    if (product && product._id === id) {
      setValue("name", product.name || "");
      setValue("description", product.description || "");

      if (product.originalPrice && product.originalPrice > product.price) {
        // Product has an active discount
        setValue("price", product.originalPrice); // Base price is originalPrice
        setDiscountedPriceInput(product.price); // Discounted selling price
        const calculatedPct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        setDiscountPercent(calculatedPct);
        if (product.discountType === "fixed" || product.discountType === "percentage") {
          setDiscountMode(product.discountType);
        }
        setEnableDiscount(true);
      } else {
        setValue("price", product.price || 0);
        setValue("originalPrice", 0);
        setEnableDiscount(false);
      }

      setValue("category", product.category || "");
      setValue("stock", product.stock || 0);
      setOldImages(product.images || []);

      if (product.hasVariants) {
        setHasVariants(true);
        if (product.options && product.options.length > 0) {
          setOptions(
            product.options.map((o) => ({
              name: o.name,
              valuesStr: o.values.join(", "),
            }))
          );
        }
        if (product.variants && product.variants.length > 0) {
          const prodOriginal = product.originalPrice && product.originalPrice > product.price ? product.originalPrice : product.price;
          const prodSelling = product.price;

          setVariants(
            product.variants.map((v) => {
              const vOrig = v.originalPrice;
              const vPrice = v.price;
              const isFixedMode = product.discountType === "fixed";

              // Check if variant has an explicit custom base price override (e.g. 2400 or 2500)
              const isExplicitBase = Boolean(vOrig ? vOrig !== prodOriginal : (vPrice && vPrice !== prodOriginal && vPrice !== prodSelling));

              // Check if variant has an explicit custom OFFER price typed specifically for this variant (vPrice is different from both product.price AND v.originalPrice)
              const hasExplicitCustomOffer = isFixedMode && Boolean(
                vPrice &&
                vPrice !== prodSelling &&
                (!vOrig || vPrice !== vOrig)
              );

              return {
                attributes: v.attributes,
                stock: v.stock,
                price: isExplicitBase ? (vOrig || vPrice) : undefined,
                offerPrice: hasExplicitCustomOffer ? vPrice : undefined,
              };
            })
          );
        }
      } else {
        setHasVariants(false);
        setOptions([]);
        setVariants([]);
      }
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

  // Re-generate combinations if options change
  useEffect(() => {
    if (!hasVariants) return;

    const validOptions = options.filter(
      (o) => o.name.trim() !== "" && o.valuesStr.trim() !== ""
    );
    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }

    let combinations: Record<string, string>[] = [{}];

    validOptions.forEach((opt) => {
      const vals = opt.valuesStr
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      if (vals.length === 0) return;

      const next: Record<string, string>[] = [];
      combinations.forEach((c) => {
        vals.forEach((v) => {
          next.push({ ...c, [opt.name.trim()]: v });
        });
      });
      combinations = next;
    });

    setVariants((prev) =>
      combinations.map((c) => {
        const existing = prev.find((v) =>
          Object.keys(c).every((k) => v.attributes[k] === c[k])
        );
        return {
          attributes: c,
          stock: existing ? existing.stock : 10,
          price: existing?.price,
          offerPrice: existing?.offerPrice,
        };
      })
    );
  }, [hasVariants, options]);

  const addOptionField = () => {
    setOptions((prev) => [...prev, { name: "", valuesStr: "" }]);
  };

  const removeOptionField = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    index: number,
    field: keyof OptionState,
    val: string
  ) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleVariantChange = (
    index: number,
    field: "stock" | "price" | "offerPrice",
    val: number
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const onUpdateProductSubmit = (data: UpdateProductFormValues) => {
    if (!id) return;
    const myForm = new FormData();
    myForm.set("name", data.name);
    
    if (enableDiscount) {
      const base = Number(data.price);
      let finalDiscountedPrice = base;

      if (discountMode === "percentage") {
        finalDiscountedPrice = Math.round(base * (1 - (Number(discountPercent) || 0) / 100));
      } else {
        finalDiscountedPrice = Number(discountedPriceInput) || base;
      }

      myForm.set("originalPrice", String(base));
      myForm.set("price", String(finalDiscountedPrice));
      myForm.set("discountType", discountMode);
    } else {
      myForm.set("price", String(data.price));
      myForm.set("originalPrice", "0");
      myForm.set("discountType", "percentage");
    }
    myForm.set("description", data.description);
    myForm.set("category", data.category);

    if (hasVariants) {
      myForm.set("hasVariants", "true");
      const formattedOptions = options
        .filter((o) => o.name.trim() !== "")
        .map((o) => ({
          name: o.name.trim(),
          values: o.valuesStr
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        }));
      myForm.set("options", JSON.stringify(formattedOptions));

      const processedVariants = variants.map((v) => {
        const vBasePrice = v.price !== undefined && v.price !== null && Number(v.price) > 0 ? Number(v.price) : Number(data.price);

        if (!enableDiscount) {
          return {
            ...v,
            price: v.price !== undefined && v.price !== null && Number(v.price) > 0 ? Number(v.price) : undefined,
            originalPrice: 0,
          };
        }

        // Percentage Mode: Auto-calculate % discount on variant base price
        if (discountMode === "percentage") {
          const pct = Number(discountPercent) || 0;
          const discountedVPrice = Math.max(0, Math.round(vBasePrice * (1 - pct / 100)));
          return {
            ...v,
            originalPrice: vBasePrice,
            price: discountedVPrice,
          };
        }

        // Fixed Price Mode: Check if admin typed an explicit offerPrice for this variant
        const vOffer = v.offerPrice !== undefined && v.offerPrice !== null && Number(v.offerPrice) > 0 ? Number(v.offerPrice) : undefined;
        const hasExplicitBaseOverride = v.price !== undefined && v.price !== null && Number(v.price) > 0 && Number(v.price) !== Number(data.price);

        if (vOffer !== undefined && vOffer < vBasePrice) {
          return {
            ...v,
            originalPrice: vBasePrice,
            price: vOffer,
          };
        }

        // If variant has an explicit custom base price override (e.g. Size L Red 2500) and NO offerPrice was typed, do NOT apply fixed discount
        if (hasExplicitBaseOverride) {
          return {
            ...v,
            price: vBasePrice,
            originalPrice: 0,
          };
        }

        // Standard base variants get the main fixed offer price
        const mainFixedOffer = Number(discountedPriceInput) || Number(data.price);
        const baseProductPrice = Number(data.price);

        if (mainFixedOffer < baseProductPrice) {
          return {
            ...v,
            originalPrice: baseProductPrice,
            price: mainFixedOffer,
          };
        }

        return {
          ...v,
          price: v.price !== undefined && v.price !== null && Number(v.price) > 0 ? Number(v.price) : undefined,
          originalPrice: 0,
        };
      });

      myForm.set("variants", JSON.stringify(processedVariants));
      const totalStock = variants.reduce(
        (sum, v) => sum + Number(v.stock || 0),
        0
      );
      myForm.set("stock", String(totalStock));
    } else {
      myForm.set("hasVariants", "false");
      myForm.set("stock", String(data.stock));
    }

    images.forEach((image) => {
      myForm.append("images", image);
    });

    dispatch(updateProduct({ id, myForm }));
  };

  return (
    <Fragment>
      <MetaData title="Update Product - Admin Panel" />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
          {loading ? (
            <Loader />
          ) : (
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
                    <FormInput
                      label="Product Name"
                      register={register("name")}
                      error={errors.name}
                      icon={<SpellcheckIcon />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormInput
                      label="Product Price"
                      type="number"
                      register={register("price")}
                      error={errors.price}
                      icon={<AttachMoneyIcon />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormSelect
                      name="category"
                      control={control}
                      label="Category"
                      options={categories}
                      icon={<AccountTreeIcon />}
                      error={errors.category}
                    />
                  </Grid>

                  {/* Optional Promotional Discount Toggle & Settings Panel */}
                  <Grid item xs={12}>
                    <Box sx={{ p: 2.5, bgcolor: enableDiscount ? '#f0f9ff' : '#f8fafc', borderRadius: '1rem', border: enableDiscount ? '1px solid #bae6fd' : '1px solid #e2e8f0', transition: 'all 0.3s ease' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={enableDiscount}
                            onChange={(e) => handleToggleDiscount(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography style={{ fontWeight: 700, color: enableDiscount ? "#0369a1" : "#334155" }}>
                            🔥 Enable Special Promotional Offer / Discount
                          </Typography>
                        }
                      />
                    {enableDiscount && (() => {
                      const base = Number(basePrice) || 0;
                      const rawPct = Number(discountPercent) || 0;
                      const numDiscPct = Math.min(100, Math.max(0, rawPct));
                      
                      const rawCalculatedPrice = discountMode === "percentage"
                        ? Math.round(base * (1 - numDiscPct / 100))
                        : (discountedPriceInput === "" ? base : Number(discountedPriceInput) || 0);

                      const calculatedPrice = Math.max(0, rawCalculatedPrice);

                      const calculatedPct = discountMode === "fixed" && base > 0 && calculatedPrice < base
                        ? Math.round(((base - calculatedPrice) / base) * 100)
                        : numDiscPct;

                      const hasActiveDiscount = base > 0 && calculatedPrice < base && calculatedPct > 0;

                      return (
                        <Box sx={{ mt: 2.5, pt: 2.5, borderTop: '1px solid #bae6fd' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            {/* Step 1: Mode Selection */}
                            <Box>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                1. Choose Discount Method
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1.5, maxWidth: 360 }}>
                                <Button
                                  type="button"
                                  variant={discountMode === "percentage" ? "contained" : "outlined"}
                                  onClick={() => setDiscountMode("percentage")}
                                  sx={{
                                    flex: 1,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    py: 1,
                                    bgcolor: discountMode === "percentage" ? '#0284c7' : '#ffffff',
                                    borderColor: '#cbd5e1',
                                  }}
                                >
                                  Percentage (%)
                                </Button>
                                <Button
                                  type="button"
                                  variant={discountMode === "fixed" ? "contained" : "outlined"}
                                  onClick={() => setDiscountMode("fixed")}
                                  sx={{
                                    flex: 1,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    py: 1,
                                    bgcolor: discountMode === "fixed" ? '#0284c7' : '#ffffff',
                                    borderColor: '#cbd5e1',
                                  }}
                                >
                                  Fixed Price (₹)
                                </Button>
                              </Box>
                            </Box>

                            {/* Step 2: Input Field */}
                            <Box sx={{ maxWidth: 400 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                2. Enter Offer Value
                              </Typography>
                              {discountMode === "percentage" ? (
                                <TextField
                                  label="Discount Percentage (%)"
                                  type="number"
                                  fullWidth
                                  value={discountPercent}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val !== "" && Number(val) > 100) {
                                      setDiscountPercent(100);
                                    } else {
                                      setDiscountPercent(val);
                                    }
                                  }}
                                  inputProps={{ min: 0, max: 100 }}
                                  sx={{ bgcolor: '#ffffff' }}
                                  placeholder="e.g. 20"
                                />
                              ) : (
                                <TextField
                                  label="New Discounted Price (₹)"
                                  type="number"
                                  fullWidth
                                  value={discountedPriceInput}
                                  onChange={(e) => setDiscountedPriceInput(e.target.value)}
                                  sx={{ bgcolor: '#ffffff' }}
                                  placeholder="e.g. 1600"
                                />
                              )}
                            </Box>

                            {/* Step 3: Calculation Card */}
                            <Box sx={{ p: 2, bgcolor: hasActiveDiscount ? '#fef2f2' : '#ffffff', borderRadius: '12px', border: hasActiveDiscount ? '1px solid #fecaca' : '1px solid #e2e8f0', maxWidth: 400 }}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                                Pricing Summary
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 0.5 }}>
                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 600 }}>
                                  Original: ₹{base}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: hasActiveDiscount ? '#ef4444' : '#0f172a' }}>
                                  Final Price: ₹{calculatedPrice}
                                </Typography>
                                {hasActiveDiscount && (
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#dc2626', bgcolor: '#fee2e2', px: 1, py: 0.2, borderRadius: '6px' }}>
                                    {calculatedPct}% OFF
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })()}
                    </Box>
                  </Grid>



                  <Grid item xs={12}>
                    <FormInput
                      label="Product Description"
                      multiline
                      rows={4}
                      register={register("description")}
                      error={errors.description}
                      icon={<DescriptionIcon />}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={hasVariants}
                          onChange={(e) => setHasVariants(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography style={{ fontWeight: 600, color: "#1e293b" }}>
                          Enable Dynamic Product Variants (Size, Color, Storage, etc.)
                        </Typography>
                      }
                    />
                  </Grid>

                  {!hasVariants ? (
                    <Grid item xs={12} sm={6}>
                      <FormInput
                        label="Stock"
                        type="number"
                        register={register("stock")}
                        error={errors.stock}
                        icon={<StorageIcon />}
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        style={{
                          padding: "1.5rem",
                          backgroundColor: "#f8fafc",
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Typography
                          variant="h6"
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: "1rem",
                          }}
                        >
                          Variant Options (Attributes)
                        </Typography>

                        {options.map((opt, i) => (
                          <Grid
                            container
                            spacing={2}
                            key={i}
                            alignItems="center"
                            style={{ marginBottom: "1rem" }}
                          >
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Option Name (e.g. Size, Storage)"
                                value={opt.name}
                                onChange={(e) =>
                                  handleOptionChange(i, "name", e.target.value)
                                }
                              />
                            </Grid>
                            <Grid item xs={10} sm={7}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Values (comma separated, e.g. S, M, L)"
                                value={opt.valuesStr}
                                onChange={(e) =>
                                  handleOptionChange(i, "valuesStr", e.target.value)
                                }
                              />
                            </Grid>
                            <Grid item xs={2} sm={1}>
                              <IconButton
                                onClick={() => removeOptionField(i)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        ))}

                        <Button
                          startIcon={<AddIcon />}
                          onClick={addOptionField}
                          variant="outlined"
                          size="small"
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Add Option
                        </Button>

                        {variants.length > 0 && (
                          <div style={{ marginTop: "2rem" }}>
                            <Typography
                              variant="subtitle1"
                              style={{
                                fontWeight: 700,
                                color: "#0f172a",
                                marginBottom: "1rem",
                              }}
                            >
                              Inventory Matrix Stock Table
                            </Typography>

                            <div
                              style={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                overflow: "hidden",
                              }}
                            >
                              <table
                                style={{
                                  width: "100%",
                                  borderCollapse: "collapse",
                                  fontSize: "0.9rem",
                                }}
                              >
                                <thead>
                                  <tr
                                    style={{
                                      backgroundColor: "#f1f5f9",
                                      textAlign: "left",
                                    }}
                                  >
                                    <th style={{ padding: "10px 14px" }}>
                                      Variant Combination
                                    </th>
                                    <th style={{ padding: "10px 14px", width: "140px" }}>
                                      Stock
                                    </th>
                                    <th style={{ padding: "10px 14px", width: "160px" }}>
                                      Base Price Override
                                    </th>
                                    {enableDiscount && discountMode === "fixed" && (
                                      <th style={{ padding: "10px 14px", width: "160px", color: "#0284c7" }}>
                                        🔥 Offer Selling Price
                                      </th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {variants.map((v, idx) => (
                                    <tr
                                      key={idx}
                                      style={{ borderBottom: "1px solid #f1f5f9" }}
                                    >
                                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                        {Object.entries(v.attributes)
                                          .map(([k, val]) => `${k}: ${val}`)
                                          .join(" | ")}
                                      </td>
                                      <td style={{ padding: "10px 14px" }}>
                                        <TextField
                                          size="small"
                                          type="number"
                                          value={v.stock}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              idx,
                                              "stock",
                                              Number(e.target.value)
                                            )
                                          }
                                          inputProps={{ min: 0 }}
                                        />
                                      </td>
                                      <td style={{ padding: "10px 14px" }}>
                                        <TextField
                                          size="small"
                                          type="number"
                                          placeholder="Original Price"
                                          value={v.price !== undefined ? v.price : ""}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              idx,
                                              "price",
                                              e.target.value === ""
                                                ? (undefined as any)
                                                : Number(e.target.value)
                                            )
                                          }
                                        />
                                      </td>
                                      {enableDiscount && discountMode === "fixed" && (
                                        <td style={{ padding: "10px 14px" }}>
                                          <TextField
                                            size="small"
                                            type="number"
                                            placeholder="Offer Price"
                                            value={v.offerPrice !== undefined ? v.offerPrice : ""}
                                            onChange={(e) =>
                                              handleVariantChange(
                                                idx,
                                                "offerPrice",
                                                e.target.value === ""
                                                  ? (undefined as any)
                                                  : Number(e.target.value)
                                              )
                                            }
                                            sx={{ bgcolor: "#f0f9ff" }}
                                          />
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    {oldImages && oldImages.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 700 }}>
                          Current Product Images:
                        </Typography>
                        <div className="imagePreviewGrid">
                          {oldImages.map((image, index) => (
                            <div key={index} className="previewItem">
                              <img src={image.url} alt="Product Preview" />
                            </div>
                          ))}
                        </div>
                        <Divider sx={{ my: 2 }} />
                      </div>
                    )}

                    <ImageUploader
                      imagesPreview={imagesPreview}
                      setImages={setImages}
                      setImagesPreview={setImagesPreview}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      id="createProductBtn"
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      sx={{
                        backgroundColor: "#1e293b",
                        "&:hover": { backgroundColor: "#0f172a" },
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: "none",
                        borderRadius: 2,
                      }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                          <CircularProgress size={22} sx={{ color: '#ffffff' }} />
                          <span>Updating Product & Variants...</span>
                        </Box>
                      ) : (
                        "Update Product"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default UpdateProduct;
