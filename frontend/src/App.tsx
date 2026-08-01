import React, { useEffect, useState, Suspense } from 'react';
import '@/App.css';
import Header from '@/components/Layout/Header/Header';
import { Outlet } from 'react-router-dom';
import WebFont from 'webfontloader';
import Footer from '@/components/Layout/Footer/Footer';
import store from '@/app/store';
import { loadUser } from '@/features/user/userSlice';
import UserOptions from '@/components/Layout/Header/UserOptions';
import { useAppSelector } from '@/app/hooks';
import { api } from '@/services/api';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import Loader from '@/components/Layout/Loader/Loader';
import ScrollToTop from '@/utils/ScrollToTop';
import Maintenance from '@/components/Layout/Maintenance/Maintenance';

function App(): React.ReactElement {
  const { isAuthenticated, user, isUserLoading } = useAppSelector((state) => state.user);
  const { isOffline } = useAppSelector((state) => state.system);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  async function getStripeApiKey() {
    try {
      const { data } = await api.get('/stripeapikey');
      if (data?.stripeApiKey) {
        setStripePromise(loadStripe(data.stripeApiKey));
      }
    } catch (error) {
      console.log('Failed to fetch Stripe API Key:', error);
    }
  }

  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Roboto', 'sans-serif'],
      },
    });

    store.dispatch(loadUser());
    getStripeApiKey();
  }, []);

  useEffect(() => {
    if (!stripePromise) {
      getStripeApiKey();
    }
  }, [stripePromise]);

  if (isOffline) {
    return <Maintenance />;
  }

  if (isUserLoading) {
    return <Loader />;
  }

  return (
    <div className='min-h-screen flex flex-wrap content-between'>
      <ScrollToTop />
      <div className='w-full block h-screen'>
        <Header />
        {isAuthenticated && <UserOptions user={user} />}
        <main>
          <Elements stripe={stripePromise}>
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          </Elements>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
