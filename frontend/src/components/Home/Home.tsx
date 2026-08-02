import React, { Fragment, useEffect } from 'react';
import '@/components/Home/Home.css';
import MetaData from '@/components/Layout/MetaData';
import Loader from '@/components/Layout/Loader/Loader';
import { toast } from 'react-toastify';
import {
  getProducts,
  clearErrors,
} from '@/features/products/productsSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import HeroBanner from '@/components/Home/Sections/HeroBanner';
import ServicesSection from '@/components/Home/Sections/ServicesSection';
import CategorySection from '@/components/Home/Sections/CategorySection';
import FlashDealsSection from '@/components/Home/Sections/FlashDealsSection';
import BestSellersSection from '@/components/Home/Sections/BestSellersSection';
import FeaturedProducts from '@/components/Home/Sections/FeaturedProducts';
import { api } from '@/services/api';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(
    (state) => state.products,
  );

  const [categories, setCategories] = React.useState<string[]>([
    'Laptop',
    'Footwear',
    'Bottom',
    'Tops',
    'Attire',
    'Camera',
    'SmartPhones',
  ]);

  const [bestSellers, setBestSellers] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchCatsAndTopSelling = async () => {
      try {
        const { data: catData } = await api.get('/categories');
        if (catData.categories && catData.categories.length > 0) {
          setCategories(catData.categories.map((c: any) => c.name));
        }
      } catch (err) {}

      try {
        const { data: topData } = await api.get('/products/top-selling');
        if (topData.products) {
          setBestSellers(topData.products);
        }
      } catch (err) {}
    };
    fetchCatsAndTopSelling();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    dispatch(getProducts({ keyword: '' }));
  }, [dispatch]);

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title="ECOMMERCE - Premium Store" />

          <HeroBanner />
          <ServicesSection />
          <CategorySection categories={categories} />
          <FlashDealsSection products={products} />
          <BestSellersSection products={bestSellers.length > 0 ? bestSellers : products} />
          <FeaturedProducts products={products} />
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
