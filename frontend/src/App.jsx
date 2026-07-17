import { useEffect, useState } from 'react'
import './App.css'
import Header from './components/Layout/Header/Header'
import { Outlet } from 'react-router-dom'
import WebFont from 'webfontloader'
import Footer from './components/Layout/Footer/Footer'
import store from './app/store'
import { loadUser } from './features/user/userSlice'
import UserOptions from './components/Layout/Header/UserOptions'
import { useSelector } from 'react-redux'
import { api } from './services/api'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Loader from './components/Layout/Loader/Loader'
import ScrollToTop from './utils/ScrollToTop'

function App() {

  const { isAuthenticated, user, loading, isUserLoading } = useSelector(state => state.user)
  // const [stripeApiKey, setStripeApiKey] = useState("")
  const [stripePromise, setStripePromise] = useState(null)

  async function getStripeApiKey() {
    try {
        const { data } = await api.get('/stripeapikey');
        // setStripeApiKey(data.stripeApiKey);
        setStripePromise(loadStripe(data.stripeApiKey));
    } catch (error) {
      console.log(error);
    } 
  }


  useEffect(()=>{
    WebFont.load({
      google: {
        families: ['Roboto', 'sans-serif']
      }
    })

    // store.dispatch(clearErrors())

    store.dispatch(loadUser());
    
    getStripeApiKey()   
  },[])
  
  if (isUserLoading) {
    return <Loader />;
  }

  return (
    <div className='min-h-screen flex flex-wrap content-between'>
      <ScrollToTop/>
      <div className='w-full block h-screen'>
        <Header />
        { isAuthenticated && <UserOptions user={user}/>}
        <main>
          <Elements stripe={stripePromise}>
            <Outlet />
          </Elements>
        </main>
        <Footer />
      </div>
    </div>
  ) 
}

export default App
