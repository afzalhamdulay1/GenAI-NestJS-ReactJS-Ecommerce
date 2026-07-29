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
import FeaturedProducts from '@/components/Home/Sections/FeaturedProducts';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector(
    (state) => state.products,
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [dispatch, error]);

  useEffect(() => {
    dispatch(getProducts({ keyword: '' }));
  }, [dispatch]);

  const categories = [
    'Laptop',
    'Footwear',
    'Bottom',
    'Tops',
    'Attire',
    'Camera',
    'SmartPhones',
  ];

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
          <FeaturedProducts products={products} />
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
