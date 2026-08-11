import React, { Fragment, useEffect, useState, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Essentials,
  Autoformat,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Code,
  Highlight,
  FontColor,
  FontBackgroundColor,
  Heading,
  Link,
  List,
  Paragraph,
  Alignment,
  BlockQuote,
  Table,
  TableToolbar,
  MediaEmbed,
  HorizontalLine,
  Undo,
  Image,
  ImageToolbar,
  ImageCaption,
  ImageStyle,
  ImageResize,
  ImageUpload,
  Base64UploadAdapter,
  ImageInsert,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import '@/components/Admin/NewProduct.css';
import {
  clearErrors,
  createProduct,
  updateProduct,
  fetchProductDetails,
  resetProductState,
} from '@/features/products/productSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
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
  CircularProgress,
  Box,
} from '@mui/material';
import FormInput from '@/components/Form/FormInput';
import FormSelect from '@/components/Form/FormSelect';
import ImageUploader from '@/components/Form/ImageUploader';
import MetaData from '@/components/Layout/MetaData';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SideBar from '@/components/Admin/Sidebar';
import Loader from '@/components/Layout/Loader/Loader';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/services/api';

const productFormSchema = z.object({
  name: z.string().min(1, 'Product Name is required'),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  originalPrice: z.coerce.number().optional(),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface OptionState {
  name: string;
  valuesStr: string;
}

interface VariantState {
  attributes: Record<string, string>;
  stock: number | string;
  price?: number;
  offerPrice?: number;
}

interface ProductFormProps {
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ isEdit = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { product, loading, error, success } = useAppSelector(
    (state) => state.product,
  );

  const [images, setImages] = useState<string[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);

  // Variant states
  const [hasVariants, setHasVariants] = useState(false);
  const [options, setOptions] = useState<OptionState[]>([]);
  const [variants, setVariants] = useState<VariantState[]>([]);

  // Discount states
  const [enableDiscount, setEnableDiscount] = useState<boolean>(false);
  const [discountMode, setDiscountMode] = useState<'percentage' | 'fixed'>(
    'percentage',
  );
  const [discountPercent, setDiscountPercent] = useState<string | number>('');
  const [discountedPriceInput, setDiscountedPriceInput] = useState<
    string | number
  >('');

  const [categories, setCategories] = useState<string[]>([
    'Laptop',
    'Footwear',
    'Bottom',
    'Tops',
    'Attire',
    'Camera',
    'SmartPhones',
    'Other',
  ]);

  const formatMarkdownToHtml = (text: string) => {
    if (!text) return '';
    if (
      text.includes('<p>') ||
      text.includes('<ul>') ||
      text.includes('<div>')
    ) {
      return text;
    }
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>');

    const lines = html.split('\n').filter((l) => l.trim() !== '');
    let inList = false;
    let result = '';

    lines.forEach((line) => {
      const isBullet = /^\s*[\*\-]\s+(.*)/.test(line);
      if (isBullet) {
        if (!inList) {
          result += '<ul>';
          inList = true;
        }
        const bulletContent = line.replace(/^\s*[\*\-]\s+/, '');
        result += `<li>${bulletContent}</li>`;
      } else {
        if (inList) {
          result += '</ul>';
          inList = false;
        }
        result += `<p>${line}</p>`;
      }
    });

    if (inList) {
      result += '</ul>';
    }

    return result;
  };

  const [aiGenerating, setAiGenerating] = useState(false);

  const handleAutoGenerateDescription = async () => {
    const productName = watch('name');
    const productCategory = watch('category');

    if (!productName || !productName.trim()) {
      toast.info('Please enter a Product Name first!');
      return;
    }

    setAiGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-description', {
        name: productName,
        category: productCategory,
      });

      if (data.description) {
        const formattedHtml = formatMarkdownToHtml(data.description);
        setValue('description', formattedHtml);
        toast.success('✨ AI Description generated successfully!');
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to generate AI description',
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const [aiSeoGenerating, setAiSeoGenerating] = useState(false);

  const handleAutoGenerateSeo = async () => {
    const productName = watch('name');
    const productCategory = watch('category');
    const productDescription = watch('description');

    if (!productName || !productName.trim()) {
      toast.info('Please enter a Product Name first!');
      return;
    }

    setAiSeoGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-seo', {
        name: productName,
        category: productCategory,
        description: productDescription,
      });

      if (data.success) {
        if (data.metaTitle) setValue('metaTitle', data.metaTitle);
        if (data.metaDescription)
          setValue('metaDescription', data.metaDescription);
        if (data.tags && Array.isArray(data.tags)) {
          setValue('tags', data.tags.join(', '));
        }
        toast.success('✨ AI SEO Titles & Search Tags generated!');
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Failed to generate AI SEO metadata',
      );
    } finally {
      setAiSeoGenerating(false);
    }
  };

  // Fetch dynamic categories from backend API
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.categories && data.categories.length > 0) {
          const list = data.categories.map((c: any) => c.name);
          if (!list.some((cat: string) => cat.toLowerCase() === 'other')) {
            list.push('Other');
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
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      originalPrice: 0,
      description: '',
      category: '',
      stock: 0,
      metaTitle: '',
      metaDescription: '',
      tags: '',
    },
  });

  const basePrice = watch('price');

  // Fetch product details for edit mode
  useEffect(() => {
    if (isEdit && id && (!product || product._id !== id)) {
      dispatch(fetchProductDetails(id));
    }
  }, [dispatch, isEdit, id, product]);

  // Load existing product details into form state in edit mode
  useEffect(() => {
    if (isEdit && product && product._id === id) {
      setValue('name', product.name || '');
      setValue('description', formatMarkdownToHtml(product.description || ''));
      if (product.metaTitle) setValue('metaTitle', product.metaTitle);
      if (product.metaDescription)
        setValue('metaDescription', product.metaDescription);
      if (product.tags && product.tags.length > 0)
        setValue('tags', product.tags.join(', '));

      if (product.originalPrice && product.originalPrice > product.price) {
        setValue('price', product.originalPrice);
        setDiscountedPriceInput(product.price);
        const calculatedPct = Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        );
        setDiscountPercent(calculatedPct);
        if (
          product.discountType === 'fixed' ||
          product.discountType === 'percentage'
        ) {
          setDiscountMode(product.discountType);
        }
        setEnableDiscount(true);
      } else {
        setValue('price', product.price || 0);
        setValue('originalPrice', 0);
        setEnableDiscount(false);
      }

      setValue('category', product.category || '');
      setValue('stock', product.stock || 0);

      if (product.images && product.images.length > 0) {
        const urls = product.images.map((img) => img.url);
        setImagesPreview(urls);
        setImages(urls);
      }

      if (product.hasVariants) {
        skipRegenRef.current = true;
        setHasVariants(true);
        if (product.options && product.options.length > 0) {
          setOptions(
            product.options.map((o) => ({
              name: o.name,
              valuesStr: o.values.join(', '),
            })),
          );
        }
        if (product.variants && product.variants.length > 0) {
          const prodOriginal =
            product.originalPrice && product.originalPrice > product.price
              ? product.originalPrice
              : product.price;
          const prodSelling = product.price;

          setVariants(
            product.variants.map((v) => {
              const vOrig = v.originalPrice;
              const vPrice = v.price;
              const isFixedMode = product.discountType === 'fixed';

              const isExplicitBase = Boolean(
                vOrig
                  ? vOrig !== prodOriginal
                  : vPrice && vPrice !== prodOriginal && vPrice !== prodSelling,
              );

              const isInheritingMainOffer =
                vOrig === prodOriginal && vPrice === prodSelling;
              const hasExplicitCustomOffer =
                isFixedMode &&
                Boolean(
                  vOrig &&
                  vOrig > 0 &&
                  vPrice < vOrig &&
                  !isInheritingMainOffer,
                );

              return {
                attributes: v.attributes,
                stock: v.stock,
                price: isExplicitBase ? vOrig || vPrice : undefined,
                offerPrice: hasExplicitCustomOffer ? vPrice : undefined,
              };
            }),
          );
        }
      } else {
        setHasVariants(false);
        setOptions([]);
        setVariants([]);
      }
    }
  }, [isEdit, product, id, setValue]);

  // Handle toast notifications & navigation on success/error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }

    if (success) {
      toast.success(
        isEdit
          ? 'Product Updated Successfully'
          : 'Product Created Successfully',
      );
      navigate('/admin/products');
      dispatch(resetProductState());
    }
  }, [dispatch, error, navigate, success, isEdit]);

  const handleToggleDiscount = (enabled: boolean) => {
    setEnableDiscount(enabled);
    if (!enabled) {
      setValue('originalPrice', 0);
      setDiscountPercent('');
      setDiscountedPriceInput('');
    } else {
      setDiscountPercent('');
      setDiscountedPriceInput(Number(basePrice) || '');
    }
  };

  const skipRegenRef = useRef(false);

  // Re-generate combinations if options change
  useEffect(() => {
    if (!hasVariants) return;

    if (skipRegenRef.current) {
      skipRegenRef.current = false;
      return;
    }

    const validOptions = options.filter(
      (o) => o.name.trim() !== '' && o.valuesStr.trim() !== '',
    );

    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }

    const optionArrays = validOptions.map((o) => ({
      name: o.name.trim(),
      values: o.valuesStr
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    }));

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
        [[]],
      );
    };

    const valueCombinations = cartesian(optionArrays.map((o) => o.values));

    setVariants((prevVariants) => {
      const prevMap = new Map<
        string,
        { stock: number; price?: number; offerPrice?: number }
      >();
      const normalizeAttrKey = (attrs: Record<string, string>) =>
        Object.entries(attrs || {})
          .map(
            ([k, val]) =>
              `${k.trim().toLowerCase()}:${String(val).trim().toLowerCase()}`,
          )
          .sort()
          .join('|');

      // 1. Populate map from existing user input state
      prevVariants.forEach((v) => {
        const key = normalizeAttrKey(v.attributes);
        prevMap.set(key, {
          stock: Number(v.stock !== undefined ? v.stock : 0),
          price: v.price,
          offerPrice: v.offerPrice,
        });
      });

      // 2. Fallback to product.variants from backend if key is missing in prevMap
      if (product && Array.isArray(product.variants)) {
        product.variants.forEach((v: any) => {
          const key = normalizeAttrKey(v.attributes);
          if (!prevMap.has(key)) {
            prevMap.set(key, {
              stock: Number(v.stock || 0),
              price: v.price,
              offerPrice: v.originalPrice && v.originalPrice > v.price ? v.price : undefined,
            });
          }
        });
      }

      return valueCombinations.map((combo) => {
        const attributes: Record<string, string> = {};
        combo.forEach((val, idx) => {
          attributes[optionArrays[idx].name] = val;
        });

        const key = normalizeAttrKey(attributes);
        const existing = prevMap.get(key);

        return {
          attributes,
          stock:
            existing !== undefined && existing.stock !== undefined
              ? Number(existing.stock)
              : 0,
          price: existing ? existing.price : undefined,
          offerPrice: existing ? existing.offerPrice : undefined,
        };
      });
    });
  }, [hasVariants, options]);

  const handleAddOption = () => {
    if (options.length >= 3) {
      toast.info('Maximum 3 option types allowed (e.g. Size, Color, Material)');
      return;
    }
    setOptions((prev) => [...prev, { name: '', valuesStr: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (
    index: number,
    field: 'name' | 'valuesStr',
    val: string,
  ) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleVariantChange = (
    index: number,
    field: 'stock' | 'price' | 'offerPrice',
    val: number | string,
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const onSubmit = (data: ProductFormValues) => {
    if (images.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    const myForm = new FormData();
    myForm.set('name', data.name);

    if (enableDiscount) {
      const base = Number(data.price);
      let finalDiscountedPrice = base;

      if (discountMode === 'percentage') {
        finalDiscountedPrice = Math.round(
          base * (1 - (Number(discountPercent) || 0) / 100),
        );
      } else {
        finalDiscountedPrice = Number(discountedPriceInput) || base;
      }

      myForm.set('originalPrice', String(base));
      myForm.set('price', String(finalDiscountedPrice));
      myForm.set('discountType', discountMode);
    } else {
      myForm.set('price', String(data.price));
      myForm.set('originalPrice', '0');
      myForm.set('discountType', 'percentage');
    }

    myForm.set('description', data.description);
    myForm.set('category', data.category);

    if (hasVariants) {
      myForm.set('hasVariants', 'true');
      const formattedOptions = options
        .filter((o) => o.name.trim() !== '')
        .map((o) => ({
          name: o.name.trim(),
          values: o.valuesStr
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        }));
      myForm.set('options', JSON.stringify(formattedOptions));

      const processedVariants = variants.map((originalV) => {
        const v = { ...originalV, stock: Number(originalV.stock) || 0 };
        const vBasePrice =
          v.price !== undefined && v.price !== null && Number(v.price) > 0
            ? Number(v.price)
            : Number(data.price);

        if (!enableDiscount) {
          return {
            ...v,
            price:
              v.price !== undefined && v.price !== null && Number(v.price) > 0
                ? Number(v.price)
                : undefined,
            originalPrice: 0,
          };
        }

        if (discountMode === 'percentage') {
          const pct = Number(discountPercent) || 0;
          const discountedVPrice = Math.max(
            0,
            Math.round(vBasePrice * (1 - pct / 100)),
          );
          return {
            ...v,
            originalPrice: vBasePrice,
            price: discountedVPrice,
          };
        }

        const vOffer =
          v.offerPrice !== undefined &&
          v.offerPrice !== null &&
          Number(v.offerPrice) > 0
            ? Number(v.offerPrice)
            : undefined;
        const hasExplicitBaseOverride =
          v.price !== undefined &&
          v.price !== null &&
          Number(v.price) > 0 &&
          Number(v.price) !== Number(data.price);

        if (vOffer !== undefined && vOffer < vBasePrice) {
          return {
            ...v,
            originalPrice: vBasePrice,
            price: vOffer,
          };
        }

        if (hasExplicitBaseOverride) {
          return {
            ...v,
            price: vBasePrice,
            originalPrice: 0,
          };
        }

        const mainFixedOffer =
          Number(discountedPriceInput) || Number(data.price);
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
          price:
            v.price !== undefined && v.price !== null && Number(v.price) > 0
              ? Number(v.price)
              : undefined,
          originalPrice: 0,
        };
      });

      myForm.set('variants', JSON.stringify(processedVariants));
      const totalStock = processedVariants.reduce(
        (sum, v) => sum + Number(v.stock || 0),
        0,
      );
      myForm.set('stock', String(totalStock));
    } else {
      myForm.set('hasVariants', 'false');
      myForm.set('stock', String(data.stock));
    }

    if (data.metaTitle) myForm.set('metaTitle', data.metaTitle);
    if (data.metaDescription)
      myForm.set('metaDescription', data.metaDescription);
    if (data.tags) {
      const tagList = data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      myForm.set('tags', JSON.stringify(tagList));
    }

    images.forEach((image) => {
      myForm.append('images', image);
    });

    if (isEdit && id) {
      dispatch(updateProduct({ id, myForm }));
    } else {
      dispatch(createProduct(myForm));
    }
  };

  const pageTitle = isEdit
    ? 'Update Product - Admin Panel'
    : 'Create Product - Admin Panel';
  const formHeaderTitle = isEdit ? 'Update Product Details' : 'Create Product';

  return (
    <Fragment>
      <MetaData title={pageTitle} />
      <div className="dashboard">
        <SideBar />
        <div className="newProductContainer">
          {isEdit && loading && !product ? (
            <Loader />
          ) : (
            <Paper elevation={3} className="newProductCard">
              <Typography variant="h5" component="h1" className="formTitle">
                {formHeaderTitle}
              </Typography>

              <form
                className="createProductForm"
                encType="multipart/form-data"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormInput
                      label="Product Name"
                      register={register('name')}
                      error={errors.name}
                      icon={<SpellcheckIcon />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormInput
                      label={
                        enableDiscount
                          ? 'Base Original Price (₹)'
                          : 'Product Price (₹)'
                      }
                      type="number"
                      register={register('price')}
                      error={errors.price}
                      icon={<AttachMoneyIcon />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormSelect
                      label="Category"
                      name="category"
                      control={control}
                      options={categories}
                      error={errors.category}
                      icon={<AccountTreeIcon />}
                    />
                  </Grid>

                  {!hasVariants && (
                    <Grid item xs={12} sm={6}>
                      <FormInput
                        label="Product Stock"
                        type="number"
                        register={register('stock')}
                        error={errors.stock}
                        icon={<StorageIcon />}
                      />
                    </Grid>
                  )}

                  {/* Discount Pricing Options Toggle Section */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2.5,
                        bgcolor: enableDiscount ? '#f8fafc' : '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={enableDiscount}
                            onChange={(e) =>
                              handleToggleDiscount(e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label={
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: '#1e293b' }}
                          >
                            🔥 Enable Discount / Offer Price
                          </Typography>
                        }
                      />

                      {enableDiscount && (
                        <Box
                          sx={{
                            mt: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2.5,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: '#475569',
                                display: 'block',
                                mb: 1,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              1. Choose Discount Method
                            </Typography>
                            <Box
                              sx={{ display: 'flex', gap: 1.5, maxWidth: 360 }}
                            >
                              <Button
                                type="button"
                                variant={
                                  discountMode === 'percentage'
                                    ? 'contained'
                                    : 'outlined'
                                }
                                onClick={() => setDiscountMode('percentage')}
                                sx={{
                                  flex: 1,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  borderRadius: '10px',
                                  py: 1,
                                  bgcolor:
                                    discountMode === 'percentage'
                                      ? '#0284c7'
                                      : '#ffffff',
                                  borderColor: '#cbd5e1',
                                }}
                              >
                                Percentage (%)
                              </Button>
                              <Button
                                type="button"
                                variant={
                                  discountMode === 'fixed'
                                    ? 'contained'
                                    : 'outlined'
                                }
                                onClick={() => setDiscountMode('fixed')}
                                sx={{
                                  flex: 1,
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  borderRadius: '10px',
                                  py: 1,
                                  bgcolor:
                                    discountMode === 'fixed'
                                      ? '#0284c7'
                                      : '#ffffff',
                                  borderColor: '#cbd5e1',
                                }}
                              >
                                Fixed Price (₹)
                              </Button>
                            </Box>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: '#475569',
                                display: 'block',
                                mb: 1,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}
                            >
                              2. Enter Offer Value
                            </Typography>
                            <Box sx={{ maxWidth: 300 }}>
                              {discountMode === 'percentage' ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  label="Discount Percentage (%)"
                                  value={discountPercent}
                                  onChange={(e) =>
                                    setDiscountPercent(e.target.value)
                                  }
                                  sx={{ bgcolor: '#ffffff' }}
                                  placeholder="e.g. 20"
                                />
                              ) : (
                                <TextField
                                  fullWidth
                                  size="small"
                                  type="number"
                                  label="Fixed Discount Selling Price (₹)"
                                  value={discountedPriceInput}
                                  onChange={(e) =>
                                    setDiscountedPriceInput(e.target.value)
                                  }
                                  sx={{ bgcolor: '#ffffff' }}
                                  placeholder="e.g. 1600"
                                />
                              )}
                            </Box>

                            <Box
                              sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: '#fef2f2',
                                borderRadius: '12px',
                                border: '1px solid #fecaca',
                                maxWidth: 400,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#64748b',
                                  fontWeight: 600,
                                  display: 'block',
                                }}
                              >
                                Pricing Summary
                              </Typography>
                              {(() => {
                                const base = Number(basePrice) || 0;
                                let calculatedPrice = base;
                                let calculatedPct = 0;

                                if (discountMode === 'percentage') {
                                  const pct = Number(discountPercent) || 0;
                                  calculatedPrice = Math.max(
                                    0,
                                    Math.round(base * (1 - pct / 100)),
                                  );
                                  calculatedPct = pct;
                                } else {
                                  const fixedVal =
                                    Number(discountedPriceInput) || base;
                                  calculatedPrice = fixedVal;
                                  if (base > 0 && fixedVal < base) {
                                    calculatedPct = Math.round(
                                      ((base - fixedVal) / base) * 100,
                                    );
                                  }
                                }

                                const hasActiveDiscount =
                                  base > 0 && calculatedPrice < base;

                                return (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'baseline',
                                      gap: 1.5,
                                      mt: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        textDecoration: 'line-through',
                                        color: '#94a3b8',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                      }}
                                    >
                                      Original: ₹{base}
                                    </Typography>
                                    <Typography
                                      variant="subtitle1"
                                      sx={{
                                        fontWeight: 800,
                                        color: hasActiveDiscount
                                          ? '#ef4444'
                                          : '#0f172a',
                                      }}
                                    >
                                      Final Price: ₹{calculatedPrice}
                                    </Typography>
                                    {hasActiveDiscount && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 800,
                                          color: '#dc2626',
                                          bgcolor: '#fee2e2',
                                          px: 1,
                                          py: 0.2,
                                          borderRadius: '6px',
                                        }}
                                      >
                                        {calculatedPct}% OFF
                                      </Typography>
                                    )}
                                  </Box>
                                );
                              })()}
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Product Description
                      </Typography>
                      <Button
                        type="button"
                        size="small"
                        onClick={handleAutoGenerateDescription}
                        disabled={aiGenerating}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          borderRadius: '8px',
                          bgcolor: '#faf5ff',
                          color: '#7e22ce',
                          border: '1px solid #e9d5ff',
                          '&:hover': { bgcolor: '#f3e8ff' },
                        }}
                      >
                        {aiGenerating ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CircularProgress
                              size={14}
                              sx={{ color: '#7e22ce' }}
                            />
                            <span>AI Generating...</span>
                          </Box>
                        ) : (
                          '✨ Auto-Generate with Gemini AI'
                        )}
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        mt: 1,
                        '& .ck-editor__editable': {
                          minHeight: '220px',
                          resize: 'vertical',
                          overflow: 'auto',
                          borderRadius: '0 0 12px 12px !important',
                          fontFamily: '"Outfit", sans-serif',
                          color: '#1e293b',
                          fontSize: '0.95rem',
                          lineHeight: 1.6,
                        },
                        '& .ck-toolbar': {
                          borderRadius: '12px 12px 0 0 !important',
                          borderColor: '#cbd5e1 !important',
                          background: '#f8fafc !important',
                        },
                        '& .ck-focused': {
                          borderColor: '#6366f1 !important',
                        },
                      }}
                    >
                      <CKEditor
                        editor={ClassicEditor}
                        config={{
                          licenseKey: 'GPL',
                          plugins: [
                            Essentials,
                            Autoformat,
                            Bold,
                            Italic,
                            Underline,
                            Strikethrough,
                            Subscript,
                            Superscript,
                            Code,
                            Highlight,
                            FontColor,
                            FontBackgroundColor,
                            Heading,
                            Link,
                            List,
                            Paragraph,
                            Alignment,
                            BlockQuote,
                            Table,
                            TableToolbar,
                            MediaEmbed,
                            HorizontalLine,
                            Undo,
                            Image,
                            ImageToolbar,
                            ImageCaption,
                            ImageStyle,
                            ImageResize,
                            ImageUpload,
                            Base64UploadAdapter,
                            ImageInsert,
                          ],
                          toolbar: [
                            'heading',
                            '|',
                            'bold',
                            'italic',
                            'underline',
                            'strikethrough',
                            'highlight',
                            'fontColor',
                            'fontBackgroundColor',
                            '|',
                            'alignment',
                            'bulletedList',
                            'numberedList',
                            '|',
                            'link',
                            'insertImage',
                            'insertTable',
                            'blockQuote',
                            'mediaEmbed',
                            'horizontalLine',
                            '|',
                            'undo',
                            'redo',
                          ],
                          image: {
                            toolbar: [
                              'imageTextAlternative',
                              'toggleImageCaption',
                              'imageStyle:inline',
                              'imageStyle:block',
                              'imageStyle:side',
                              '|',
                              'resizeImage',
                            ],
                          },
                          table: {
                            contentToolbar: [
                              'tableColumn',
                              'tableRow',
                              'mergeTableCells',
                            ],
                          },
                        }}
                        data={watch('description') || ''}
                        onChange={(_, editor) => {
                          const data = editor.getData();
                          setValue('description', data, {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </Box>
                    {errors.description && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#ef4444',
                          mt: 0.5,
                          display: 'block',
                          fontWeight: 600,
                        }}
                      >
                        {errors.description.message as string}
                      </Typography>
                    )}
                  </Grid>

                  {/* ✨ AI SEO & Search Tags Panel */}
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '1.2rem',
                        background:
                          'linear-gradient(135deg, #fdf4ff 0%, #faf5ff 50%, #f3e8ff 100%)',
                        border: '1px solid #e9d5ff',
                        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.05)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                          flexWrap: 'wrap',
                          gap: 1.5,
                        }}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <AutoAwesomeIcon
                            sx={{ color: '#9333ea', fontSize: '1.4rem' }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              color: '#581c87',
                              fontSize: '1.05rem',
                            }}
                          >
                            Google SEO & Search Tags
                          </Typography>
                        </Box>
                        <Button
                          type="button"
                          onClick={handleAutoGenerateSeo}
                          disabled={aiSeoGenerating}
                          sx={{
                            background:
                              'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: '9999px',
                            px: 2.5,
                            py: 0.8,
                            fontSize: '0.85rem',
                            boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
                            '&:hover': {
                              background:
                                'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
                            },
                          }}
                        >
                          {aiSeoGenerating ? (
                            <CircularProgress
                              size={18}
                              sx={{ color: '#ffffff', mr: 1 }}
                            />
                          ) : (
                            <AutoAwesomeIcon sx={{ fontSize: 18, mr: 1 }} />
                          )}
                          <span>✨ Auto-Generate SEO & Tags</span>
                        </Button>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Google Meta Title"
                            {...register('metaTitle')}
                            placeholder="e.g. Men's Olive Green Puffer Jacket | Winter Outerwear"
                            sx={{ bgcolor: '#ffffff' }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Search Keywords & Tags (Comma Separated)"
                            {...register('tags')}
                            placeholder="e.g. puffer jacket, winter coat, green outerwear"
                            sx={{ bgcolor: '#ffffff' }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            label="Google Meta Description"
                            {...register('metaDescription')}
                            placeholder="e.g. Stay warm in style with our premium olive green puffer jacket..."
                            sx={{ bgcolor: '#ffffff' }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
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
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Enable Product Variants (Size, Color, Material, etc.)
                        </Typography>
                      }
                    />
                  </Grid>

                  {/* Variant Management Section */}
                  {hasVariants && (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          border: '1px solid #e2e8f0',
                          borderRadius: 2,
                          bgcolor: '#f8fafc',
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            mb: 2,
                            color: '#1e293b',
                          }}
                        >
                          Variant Options & Matrix
                        </Typography>

                        {/* Step 1: Define Options */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1.5, color: '#475569', fontWeight: 600 }}
                          >
                            1. Define Variant Options (e.g. Size: S, M, L)
                          </Typography>
                          {options.map((opt, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: 'flex',
                                gap: 2,
                                mb: 2,
                                alignItems: 'center',
                              }}
                            >
                              <TextField
                                size="small"
                                label="Option Name"
                                placeholder="e.g. Size"
                                value={opt.name}
                                onChange={(e) =>
                                  handleOptionChange(
                                    idx,
                                    'name',
                                    e.target.value,
                                  )
                                }
                                sx={{ width: '200px', bgcolor: '#ffffff' }}
                              />
                              <TextField
                                size="small"
                                label="Values (comma separated)"
                                placeholder="e.g. Small, Medium, Large"
                                value={opt.valuesStr}
                                onChange={(e) =>
                                  handleOptionChange(
                                    idx,
                                    'valuesStr',
                                    e.target.value,
                                  )
                                }
                                sx={{ flex: 1, bgcolor: '#ffffff' }}
                              />
                              <IconButton
                                onClick={() => handleRemoveOption(idx)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}

                          <Button
                            type="button"
                            startIcon={<AddIcon />}
                            onClick={handleAddOption}
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1, textTransform: 'none' }}
                          >
                            Add Option (Max 3)
                          </Button>
                        </Box>

                        {/* Step 2: Generated Variant Matrix */}
                        {variants.length > 0 && (
                          <div>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                mb: 1.5,
                                color: '#475569',
                                fontWeight: 600,
                              }}
                            >
                              2. Inventory Matrix Stock Table
                            </Typography>
                            <div style={{ overflowX: 'auto' }}>
                              <table className="variantTable">
                                <thead>
                                  <tr>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                      Variant Combination
                                    </th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-1/4">
                                      Stock
                                    </th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-1/4">
                                      Base Price Override
                                    </th>
                                    {enableDiscount &&
                                      discountMode === 'fixed' && (
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 w-1/4">
                                          🔥 Offer Selling Price
                                        </th>
                                      )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {variants.map((v, idx) => (
                                    <tr
                                      key={idx}
                                      className="border-t border-gray-200"
                                    >
                                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {Object.entries(v.attributes)
                                          .map(([k, val]) => `${k}: ${val}`)
                                          .join(' | ')}
                                      </td>
                                      <td className="px-4 py-3">
                                        <TextField
                                          type="number"
                                          size="small"
                                          value={v.stock === undefined || v.stock === null ? '' : v.stock}
                                          onChange={(e) =>
                                            handleVariantChange(
                                              idx,
                                              'stock',
                                              e.target.value === '' ? '' : Number(e.target.value),
                                            )
                                          }
                                          inputProps={{ min: 0 }}
                                          sx={{
                                            width: '100px',
                                            bgcolor: '#ffffff',
                                          }}
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <TextField
                                          type="number"
                                          size="small"
                                          placeholder="Original Price"
                                          value={
                                            v.price === undefined ||
                                            v.price === null
                                              ? ''
                                              : v.price
                                          }
                                          onChange={(e) =>
                                            handleVariantChange(
                                              idx,
                                              'price',
                                              e.target.value === ''
                                                ? (undefined as any)
                                                : Number(e.target.value),
                                            )
                                          }
                                          inputProps={{ min: 0 }}
                                          sx={{
                                            width: '130px',
                                            bgcolor: '#ffffff',
                                          }}
                                        />
                                      </td>
                                      {enableDiscount &&
                                        discountMode === 'fixed' && (
                                          <td className="px-4 py-3">
                                            <TextField
                                              type="number"
                                              size="small"
                                              placeholder="Offer Price"
                                              value={
                                                v.offerPrice === undefined ||
                                                v.offerPrice === null
                                                  ? ''
                                                  : v.offerPrice
                                              }
                                              onChange={(e) =>
                                                handleVariantChange(
                                                  idx,
                                                  'offerPrice',
                                                  e.target.value === ''
                                                    ? (undefined as any)
                                                    : Number(e.target.value),
                                                )
                                              }
                                              inputProps={{ min: 0 }}
                                              sx={{
                                                width: '130px',
                                                bgcolor: '#ffffff',
                                              }}
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
                    <ImageUploader
                      imagesPreview={imagesPreview}
                      setImages={setImages}
                      setImagesPreview={setImagesPreview}
                      previewTitle="Product Images (Drag & drop or use arrows to reorder. 1st image is Main Cover):"
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
                        backgroundColor: '#1e293b',
                        '&:hover': { backgroundColor: '#0f172a' },
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                      }}
                    >
                      {loading ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            justifyContent: 'center',
                          }}
                        >
                          <CircularProgress
                            size={22}
                            sx={{ color: '#ffffff' }}
                          />
                          <span>
                            {isEdit
                              ? 'Updating Product & Variants...'
                              : 'Creating Product & Variants...'}
                          </span>
                        </Box>
                      ) : isEdit ? (
                        'Update Product'
                      ) : (
                        'Create Product'
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

export default ProductForm;
