import React, { Fragment, useEffect, useState } from 'react';
import '@/components/Product/Products.css';
import ProductCard from '@/components/Home/ProductCard';
import MetaData from '@/components/Layout/MetaData';
import Loader from '@/components/Layout/Loader/Loader';
import Pagination from 'react-js-pagination';
import { toast } from 'react-toastify';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getProducts, clearErrors } from '@/features/products/productsSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ProductFilterSidebar from '@/components/Product/Sections/ProductFilterSidebar';
import { Drawer, Button, useMediaQuery, useTheme, IconButton, TextField, InputAdornment } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { api } from '@/services/api';

const Products: React.FC = () => {
  const dispatch = useAppDispatch();
  const { keyword } = useParams<{ keyword?: string }>();
  const mykeyword = keyword || '';

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || '';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(mykeyword);

  useEffect(() => {
    setSearchInput(mykeyword);
  }, [mykeyword]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products/${searchInput.trim()}`);
    } else {
      navigate('/products');
    }
  };

  const [categoriesList, setCategoriesList] = useState<string[]>([
    'All',
    'Laptop',
    'Footwear',
    'Bottom',
    'Tops',
    'Attire',
    'Camera',
    'SmartPhones',
  ]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.categories && data.categories.length > 0) {
          setCategoriesList(['All', ...data.categories.map((c: any) => c.name)]);
        }
      } catch (err) {}
    };
    fetchCats();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [price, setPrice] = useState<number[]>([0, 250000]);
  const [category, setCategory] = useState(initialCategory);
  const [ratings, setRatings] = useState<number>(0);

  const [filters, setFilters] = useState({
    price: [0, 250000],
    category: initialCategory,
    ratings: 0,
  });

  const { products, resultPerPage, filteredProductsCount, loading, error } =
    useAppSelector((state) => state.products);

  const setCurrentPageNo = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    setFilters({ price, category, ratings });
    if (isMobile) {
      setMobileFiltersOpen(false);
    }
  };

  const handleClearFilters = () => {
    setPrice([0, 250000]);
    setCategory('');
    setRatings(0);
    setFilters({ price: [0, 250000], category: '', ratings: 0 });
    
    if (location.search) {
      if (mykeyword) {
        navigate(`/products/${mykeyword}`);
      } else {
        navigate('/products');
      }
    }

    if (isMobile) {
      setMobileFiltersOpen(false);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    const params: Record<string, string | number> = {
      keyword: mykeyword,
      'price[lte]': filters.price[1],
      'price[gte]': filters.price[0],
      page: currentPage,
      'ratings[gte]': filters.ratings,
    };

    if (filters.category) {
      params.category = filters.category;
    }

    dispatch(getProducts(params));
  }, [dispatch, mykeyword, currentPage, filters]);

  const count = filteredProductsCount || 0;
  const perPage = resultPerPage || 0;

  return (
    <div className="ProductsPage">
      <Fragment>
        {loading ? (
          <Loader />
        ) : (
          <Fragment>
            <MetaData title="ECOMMERCE" />

            <Fragment>
              <div className="productsSearchContainer">
                <form onSubmit={handleSearchSubmit} className="productsSearchForm">
                  <SearchIcon sx={{ color: '#0284c7', fontSize: 24, ml: 0.5 }} />
                  <input
                    type="text"
                    className="productsSearchInput"
                    placeholder={isMobile ? "Search products..." : "Search products by name, category, or keyword..."}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <button
                      type="button"
                      className="clearSearchBtn"
                      onClick={() => {
                        setSearchInput('');
                        navigate('/products');
                      }}
                      title="Clear Search"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  )}
                  <button type="submit" className="searchSubmitBtn">
                    <span>Search</span>
                  </button>
                </form>
              </div>

              <div className="totalProductsText">
                Total Products: {filteredProductsCount}
              </div>

              <div className="productsLayout">
                {isMobile && (
                  <div style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '1.5rem' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<FilterListIcon />}
                      onClick={() => setMobileFiltersOpen(true)}
                      className="mobileFilterBtn"
                    >
                      Filters
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={handleClearFilters}
                      className="mobileFilterBtn"
                      style={{ color: '#ef4444', borderColor: '#ef4444' }}
                    >
                      Clear
                    </Button>
                  </div>
                )}

                {isMobile ? (
                  <Drawer
                    anchor="bottom"
                    open={mobileFiltersOpen}
                    onClose={() => setMobileFiltersOpen(false)}
                    PaperProps={{
                      sx: {
                        borderTopLeftRadius: '1.5rem',
                        borderTopRightRadius: '1.5rem',
                        padding: 0,
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                      }
                    }}
                  >
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                      <IconButton onClick={() => setMobileFiltersOpen(false)} size="small">
                        <CloseIcon />
                      </IconButton>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', paddingTop: '3rem' }}>
                      <ProductFilterSidebar
                        price={price}
                        setPrice={setPrice}
                        category={category}
                        setCategory={setCategory}
                        ratings={ratings}
                        setRatings={setRatings}
                        categories={categoriesList}
                        handleSubmit={handleSubmit}
                        handleClearFilters={handleClearFilters}
                        isMobile={true}
                      />
                    </div>
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                      <Button onClick={handleSubmit} fullWidth variant="contained" className="applyFiltersBtn">
                        Apply Filters
                      </Button>
                    </div>
                  </Drawer>
                ) : (
                  <ProductFilterSidebar
                    price={price}
                    setPrice={setPrice}
                    category={category}
                    setCategory={setCategory}
                    ratings={ratings}
                    setRatings={setRatings}
                    categories={categoriesList}
                    handleSubmit={handleSubmit}
                    handleClearFilters={handleClearFilters}
                    isMobile={false}
                  />
                )}

                <div className="ProductsContainer">
                  {products && products.length === 0 ? (
                    <div className="noProductsInside">
                      <h2>No Products Found</h2>
                      <p>
                        Try adjusting your filters to find what you're looking
                        for.
                      </p>
                    </div>
                  ) : (
                    products &&
                    products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))
                  )}
                </div>
              </div>
            </Fragment>

            {perPage < count && (
              <div className="paginationBox">
                <Pagination
                  activePage={currentPage}
                  itemsCountPerPage={perPage}
                  totalItemsCount={count}
                  onChange={setCurrentPageNo}
                  nextPageText="Next"
                  prevPageText="Prev"
                  firstPageText="1st"
                  lastPageText="Last"
                  itemClass="page-item"
                  linkClass="page-link"
                  activeClass="pageItemActive"
                  activeLinkClass="pageLinkActive"
                />
              </div>
            )}
          </Fragment>
        )}
      </Fragment>
    </div>
  );
};

export default Products;
